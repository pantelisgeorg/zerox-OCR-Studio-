const $ = (sel) => document.querySelector(sel);

const state = {
  inputs: [],
  jobs: [],
  currentJobId: null,
  currentMeta: null,
  currentJson: null,
  currentPage: 0,
  activeTab: 'markdown',
  markdownScroll: 0,
  pollTimer: null,
  startTime: null,
  tickTimer: null,
};

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// ---------------------------------------------------------------------------
// Input files
// ---------------------------------------------------------------------------
async function loadInputs() {
  try {
    state.inputs = await api('/api/inputs');
    renderInputs();
  } catch (err) {
    setStatus(`Failed to load inputs: ${err.message}`, true);
  }
}

function renderInputs() {
  const sel = $('#file-select');
  const prev = sel.value;
  sel.innerHTML = '';
  if (state.inputs.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No files yet — upload one';
    sel.appendChild(opt);
    sel.disabled = true;
  } else {
    sel.disabled = false;
    for (const f of state.inputs) {
      const opt = document.createElement('option');
      opt.value = f.name;
      opt.textContent = `${f.name} (${fmtSize(f.size)})`;
      sel.appendChild(opt);
    }
    if (prev && state.inputs.some(f => f.name === prev)) sel.value = prev;
  }
  updatePreview();
}

function updatePreview() {
  const name = $('#file-select').value;
  const wrap = $('#file-preview');
  const img = $('#preview-img');
  if (name && /\.(png|jpe?g)$/i.test(name)) {
    img.src = `/api/inputs/${encodeURIComponent(name)}`;
    wrap.classList.remove('hidden');
  } else {
    wrap.classList.add('hidden');
    img.removeAttribute('src');
  }
}

async function uploadFile(file) {
  const status = $('#upload-status');
  status.textContent = `Uploading ${file.name}...`;
  try {
    await api(`/api/upload/${encodeURIComponent(file.name)}`, {
      method: 'PUT',
      body: file,
    });
    status.textContent = 'Uploaded.';
    await loadInputs();
    $('#file-select').value = file.name;
    updatePreview();
    setTimeout(() => { status.textContent = ''; }, 2500);
  } catch (err) {
    status.textContent = `Upload failed: ${err.message}`;
  }
}

// ---------------------------------------------------------------------------
// Defaults (prompts)
// ---------------------------------------------------------------------------
let defaults = null;
async function loadDefaults() {
  try {
    defaults = await api('/api/defaults');
    if (!$('#system-prompt').value) $('#system-prompt').value = defaults.systemPrompt;
    if (!$('#user-prompt').value) $('#user-prompt').value = defaults.userPrompt;
  } catch (err) {
    setStatus(`Failed to load defaults: ${err.message}`, true);
  }
}

// ---------------------------------------------------------------------------
// Run job
// ---------------------------------------------------------------------------
async function runJob() {
  const file = $('#file-select').value;
  if (!file) { setStatus('Choose an input file first.', true); return; }

  $('#run-btn').disabled = true;
  $('#run-status').textContent = 'Queued...';
  $('#progress-bar').style.width = '2%';

  try {
    const { jobId } = await api('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file,
        model: $('#model-select').value,
        concurrency: Number($('#concurrency').value),
        imageDensity: Number($('#image-density').value),
        systemPrompt: $('#system-prompt').value,
        userPrompt: $('#user-prompt').value,
      }),
    });
    selectJob(jobId);
  } catch (err) {
    $('#run-btn').disabled = false;
    setStatus(`Run failed: ${err.message}`, true);
  }
}

// ---------------------------------------------------------------------------
// Jobs list + status polling
// ---------------------------------------------------------------------------
async function loadJobs() {
  try {
    state.jobs = await api('/api/jobs');
    renderJobs();
  } catch (err) {
    setStatus(`Failed to load runs: ${err.message}`, true);
  }
}

function renderJobs() {
  const list = $('#jobs-list');
  list.innerHTML = '';
  if (state.jobs.length === 0) {
    list.innerHTML = '<div class="muted">No runs yet.</div>';
    return;
  }
  for (const job of state.jobs) {
    const el = document.createElement('button');
    el.className = `job ${job.id === state.currentJobId ? 'active' : ''} job-${job.status}`;
    const when = new Date(job.createdAt).toLocaleString();
    el.innerHTML = `
      <div class="job-top"><span class="job-file">${esc(job.inputFile)}</span>
        <span class="job-status">${job.status}</span></div>
      <div class="job-sub">${esc(job.model)} &middot; ${when}</div>`;
    el.onclick = () => selectJob(job.id);
    list.appendChild(el);
  }
}

async function selectJob(id) {
  state.currentJobId = id;
  state.currentJson = null;
  state.currentPage = 0;
  state.markdownScroll = 0;
  setActiveTab('markdown');
  $('#page-nav').classList.add('hidden');
  clearPolling();
  renderJobs();
  await refreshJob(id);
}

function setActiveTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
}

async function refreshJob(id) {
  try {
    const meta = await api(`/api/jobs/${id}`);
    if (state.currentJobId !== id) return; // user switched jobs meanwhile
    state.currentMeta = meta;

    if (meta.status === 'running' || meta.status === 'queued') {
      renderRunning(meta);
      startPolling(id);
    } else if (meta.status === 'error') {
      $('#run-btn').disabled = false;
      $('#run-status').textContent = 'Error';
      renderError(meta.error);
      updateDownloads(meta);
    } else {
      $('#run-btn').disabled = false;
      $('#run-status').textContent = 'Idle';
      const json = await api(`/api/jobs/${id}/result.json`).catch(() => null);
      if (state.currentJobId !== id) return; // user switched jobs meanwhile
      if (json) {
        state.currentJson = json;
        renderTab(state.activeTab);
      } else {
        renderError('Result files not found for this job.');
      }
      updateDownloads(meta);
    }
  } catch (err) {
    $('#run-btn').disabled = false;
    setStatus(err.message, true);
  }
}

function startPolling(id) {
  if (state.pollTimer) return; // already polling, avoid timer accumulation
  state.startTime = Date.now();
  state.tickTimer = setInterval(updateElapsed, 1000);
  state.pollTimer = setInterval(async () => {
    await refreshJob(id);
    if (state.currentMeta && (state.currentMeta.status === 'done' || state.currentMeta.status === 'error')) {
      clearPolling();
      loadJobs();
    }
  }, 2000);
}

function clearPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  if (state.tickTimer) clearInterval(state.tickTimer);
  state.pollTimer = null;
  state.tickTimer = null;
}

function updateElapsed() {
  if (!state.startTime) return;
  const secs = Math.floor((Date.now() - state.startTime) / 1000);
  const meta = state.currentMeta;
  if (!meta) return;
  const stage = stageLabel(meta.stage);
  $('#run-status').textContent = `${stage} — ${fmtDuration(secs)}`;
  // Fake indeterminate progress while running.
  const bar = $('#progress-bar');
  const base = (secs * 3) % 100;
  bar.style.width = `${Math.min(base, 95)}%`;
}

function stageLabel(stage) {
  return {
    queued: 'Queued',
    ocr: 'Running OCR (pages are processed one by one)',
    postprocess: 'Post-processing',
    done: 'Done',
  }[stage] || 'Working';
}

function renderRunning(meta) {
  $('#run-status').textContent = stageLabel(meta.stage);
  $('#viewer-content').innerHTML = `
    <div class="placeholder">
      <p><strong>${esc(meta.inputFile)}</strong></p>
      <p>${stageLabel(meta.stage)}…</p>
      <p class="muted">This can take a while for large documents.</p>
    </div>`;
  updateElapsed();
}

function renderError(msg) {
  $('#viewer-content').innerHTML = `
    <div class="placeholder error">
      <p><strong>Job failed</strong></p>
      <pre class="error-pre">${esc(msg || 'Unknown error')}</pre>
    </div>`;
}

function updateDownloads(meta) {
  const dlMd = $('#dl-md');
  const dlJson = $('#dl-json');
  if (!meta || meta.status !== 'done') {
    dlMd.classList.add('hidden');
    dlJson.classList.add('hidden');
    return;
  }
  const base = meta.inputFile.replace(/\.[^.]+$/, '');
  dlMd.href = `/api/jobs/${meta.id}/result.md`;
  dlMd.download = `${base}.md`;
  dlMd.classList.remove('hidden');
  dlJson.href = `/api/jobs/${meta.id}/result.json`;
  dlJson.download = `${base}.json`;
  dlJson.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Result rendering
// ---------------------------------------------------------------------------
function renderResult(json, meta) {
  const pages = json.pages || [];
  state.currentPage = Math.min(state.currentPage, Math.max(0, pages.length - 1));

  const warnCount = (meta.warnings || []).length;
  const badge = $('#warn-badge');
  badge.textContent = warnCount;
  badge.classList.toggle('hidden', warnCount === 0);

  const pageNav = $('#page-nav');
  pageNav.classList.toggle('hidden', pages.length <= 1);
  $('#page-indicator').textContent = pages.length > 0 ? `Page ${state.currentPage + 1} / ${pages.length}` : '0 pages';

  const summary = json.summary || {};
  const info = [];
  if (json.completionTime != null) info.push(`Took ${fmtDuration(Math.round(json.completionTime / 1000))}`);
  if (summary.totalPages != null) info.push(`${summary.totalPages} pages`);
  if (json.inputTokens != null) info.push(`${json.inputTokens.toLocaleString()} in / ${json.outputTokens.toLocaleString()} out tokens`);

  let html = `<div class="result-head">
    <h1>${esc(json.fileName || meta.inputFile)}</h1>
    ${info.length ? `<div class="muted">${info.map(esc).join(' &middot; ')}</div>` : ''}
  </div>`;

  if (pages.length === 0) {
    html += '<p class="muted">No pages in result.</p>';
  } else {
    const p = pages[state.currentPage];
    html += `<div class="page-block">
      <div class="page-title">Page ${p.page ?? state.currentPage + 1}</div>
      ${mdToHtml(p.markdown || '')}
    </div>`;
  }

  $('#viewer-content').innerHTML = html;
}

function renderTab(tab) {
  const viewer = $('#viewer-content');
  if (tab !== 'markdown' && state.activeTab === 'markdown') {
    state.markdownScroll = viewer.scrollTop;
  }
  setActiveTab(tab);
  $('#page-nav').classList.add('hidden');

  if (!state.currentJson) return;
  const meta = state.currentMeta || {};
  let content = '';

  if (tab === 'markdown') {
    renderResult(state.currentJson, meta);
    viewer.scrollTop = state.markdownScroll || 0;
    return;
  } else if (tab === 'raw') {
    const md = state.currentJson.pages.map(p => p.markdown || '').join('\n\n---\n\n');
    content = `<pre class="raw">${esc(md)}</pre>`;
  } else if (tab === 'json') {
    content = `<pre class="raw">${esc(JSON.stringify(state.currentJson, null, 2))}</pre>`;
  } else if (tab === 'warnings') {
    const warnings = meta.warnings || [];
    if (warnings.length === 0) {
      content = '<div class="placeholder"><p>No post-processing warnings.</p></div>';
    } else {
      content = `<ul class="warnings">${warnings.map(w =>
        `<li><span class="muted">page ${w.page}</span> ${esc(w.message)}</li>`).join('')}</ul>`;
    }
  }
  viewer.innerHTML = content;
  viewer.scrollTop = 0;
}

// ---------------------------------------------------------------------------
// Tiny markdown renderer (HTML tables pass through, everything else basics)
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeHtml(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

function inlineMd(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function mdToHtml(md) {
  const lines = String(md || '').split('\n');
  const out = [];
  let i = 0;
  let listType = null;
  let inCode = false;
  let codeBuf = [];

  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*```/.test(line)) {
      if (inCode) {
        out.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }

    if (/^\s*<table/i.test(line)) {
      closeList();
      let html = '';
      while (i < lines.length && !/<\/table>/i.test(lines[i])) {
        html += lines[i] + '\n';
        i++;
      }
      if (i < lines.length) html += lines[i];
      out.push(sanitizeHtml(html));
      i++;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) { closeList(); out.push(`<h${h[1].length}>${inlineMd(esc(h[2]))}</h${h[1].length}>`); i++; continue; }

    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { closeList(); out.push('<hr/>'); i++; continue; }

    const ul = line.match(/^\s*[-*+]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const type = ol ? 'ol' : 'ul';
      if (listType !== type) { closeList(); out.push(`<${type}>`); listType = type; }
      out.push(`<li>${inlineMd(esc((ul || ol)[1]))}</li>`);
      i++;
      continue;
    }

    const bq = line.match(/^\s*>\s?(.*)/);
    if (bq) { closeList(); out.push(`<blockquote>${inlineMd(esc(bq[1]))}</blockquote>`); i++; continue; }

    if (/^\s*$/.test(line)) { closeList(); i++; continue; }

    closeList();
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*```/.test(lines[i])
        && !/^\s*<table/i.test(lines[i])
        && !/^(#{1,4})\s+/.test(lines[i])
        && !/^\s*[-*+]\s+/.test(lines[i])
        && !/^\s*\d+[.)]\s+/.test(lines[i])
        && !/^\s*>/.test(lines[i])
        && !/^\s*(---+|\*\*\*+)\s*$/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inlineMd(esc(para.join(' ')))}</p>`);
  }
  closeList();
  if (inCode) out.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Small utils
// ---------------------------------------------------------------------------
function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function setStatus(msg, isError = false) {
  const el = $('#run-status');
  el.textContent = msg;
  el.classList.toggle('error-text', isError);
}

// ---------------------------------------------------------------------------
// Wire up events
// ---------------------------------------------------------------------------
$('#refresh-files').onclick = loadInputs;
$('#file-select').onchange = updatePreview;
$('#upload-btn').onclick = () => $('#upload-input').click();
$('#upload-input').onchange = (e) => {
  if (e.target.files[0]) uploadFile(e.target.files[0]);
  e.target.value = '';
};
$('#run-btn').onclick = runJob;
$('#reset-prompts').onclick = () => {
  if (!defaults) return;
  $('#system-prompt').value = defaults.systemPrompt;
  $('#user-prompt').value = defaults.userPrompt;
};
$('#prev-page').onclick = () => { if (state.currentPage > 0) { state.currentPage--; renderResult(state.currentJson, state.currentMeta); $('#viewer-content').scrollTop = 0; } };
$('#next-page').onclick = () => {
  if (state.currentJson && state.currentPage < state.currentJson.pages.length - 1) {
    state.currentPage++;
    renderResult(state.currentJson, state.currentMeta);
    $('#viewer-content').scrollTop = 0;
  }
};
document.querySelectorAll('.tab').forEach(t => { t.onclick = () => renderTab(t.dataset.tab); });

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
(async function init() {
  $('#env-note').textContent = 'outputs: shared/outputs';
  await Promise.all([loadDefaults(), loadInputs(), loadJobs()]);
  const last = state.jobs.find(j => j.status !== 'error');
  if (last) selectJob(last.id);
})();
