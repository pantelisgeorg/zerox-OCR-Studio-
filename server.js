import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { runOcr, DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT } from './ocr-pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const INPUTS_DIR = path.resolve(__dirname, './shared/inputs');
const OUTPUTS_DIR = path.resolve(__dirname, './shared/outputs');
const PUBLIC_DIR = path.resolve(__dirname, './public');

const MODELS = ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4o-mini'];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

if (!fs.existsSync(INPUTS_DIR)) fs.mkdirSync(INPUTS_DIR, { recursive: true });
if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------
// jobs: Map<id, { id, inputFile, model, concurrency, imageDensity, createdAt,
//                 status: 'queued'|'running'|'done'|'error',
//                 stage, error, warnings, summary, completionTime }>
const jobs = new Map();
let queueRunning = false;

function loadJobsFromDisk() {
  if (!fs.existsSync(OUTPUTS_DIR)) return;
  for (const entry of fs.readdirSync(OUTPUTS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metaPath = path.join(OUTPUTS_DIR, entry.name, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      if (meta.status === 'running' || meta.status === 'queued') {
        meta.status = 'error';
        meta.error = 'Server restarted while job was running';
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      }
      jobs.set(meta.id, meta);
    } catch { /* skip corrupt meta */ }
  }
}

function saveJobMeta(job) {
  const jobDir = path.join(OUTPUTS_DIR, job.id);
  if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });
  fs.writeFileSync(path.join(jobDir, 'meta.json'), JSON.stringify(job, null, 2));
}

function pickOutputDir(job) {
  // Intermediate zerox output goes to a job-specific temp dir so runs never clash.
  return path.join(OUTPUTS_DIR, job.id, 'zerox-intermediate');
}

async function executeJob(job) {
  try {
    job.status = 'running';
    saveJobMeta(job);
    const started = Date.now();
    const { combined, warnings, jsonPath, mdPath } = await runOcr({
      filePath: path.join(INPUTS_DIR, job.inputFile),
      outputDir: pickOutputDir(job),
      model: job.model,
      concurrency: job.concurrency,
      imageDensity: job.imageDensity,
      systemPrompt: job.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      userPrompt: job.userPrompt || DEFAULT_USER_PROMPT,
      onStage: (stage) => {
        job.stage = stage;
        saveJobMeta(job);
      },
    });
    job.status = 'done';
    job.stage = 'done';
    job.completionTime = Date.now() - started;
    job.summary = combined.summary || {};
    job.warnings = warnings;
    job.pageCount = combined.pages.length;
    // Move results next to meta.json for easy access.
    fs.copyFileSync(jsonPath, path.join(OUTPUTS_DIR, job.id, 'result.json'));
    fs.copyFileSync(mdPath, path.join(OUTPUTS_DIR, job.id, 'result.md'));
  } catch (err) {
    job.status = 'error';
    job.error = err?.message || String(err);
  }
  saveJobMeta(job);
}

async function drainQueue() {
  if (queueRunning) return;
  queueRunning = true;
  while (true) {
    const next = [...jobs.values()].find(j => j.status === 'queued');
    if (!next) break;
    await executeJob(next);
  }
  queueRunning = false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  const data = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(data);
}

function sendFile(res, filePath) {
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)
    && !filePath.startsWith(INPUTS_DIR + path.sep)
    && !filePath.startsWith(OUTPUTS_DIR + path.sep)) {
    send(res, 403, { error: 'Forbidden' });
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, { error: 'Not found' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req, limit = 50 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeName(name) {
  const base = path.basename(String(name));
  return base === '.' || base === '..' || !base ? null : base;
}

function listInputs() {
  return fs.readdirSync(INPUTS_DIR)
    .filter(f => !f.startsWith('.'))
    .map((f) => {
      const st = fs.statSync(path.join(INPUTS_DIR, f));
      return {
        name: f,
        size: st.size,
        mtime: st.mtimeMs,
        url: `/api/inputs/${encodeURIComponent(f)}`,
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function listJobs() {
  return [...jobs.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ systemPrompt, userPrompt, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
async function handleApi(req, res, pathname) {
  const parts = pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && parts[1] === 'defaults') {
    send(res, 200, {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userPrompt: DEFAULT_USER_PROMPT,
      models: MODELS,
    });
    return;
  }

  if (req.method === 'GET' && parts[1] === 'inputs') {
    if (parts.length === 3) {
      const name = safeName(decodeURIComponent(parts[2]));
      if (!name) return send(res, 400, { error: 'Bad name' });
      sendFile(res, path.join(INPUTS_DIR, name));
      return;
    }
    send(res, 200, listInputs());
    return;
  }

  if (req.method === 'PUT' && parts[1] === 'upload') {
    const name = safeName(decodeURIComponent(parts[2] || ''));
    if (!name || /[\\/]/.test(name)) return send(res, 400, { error: 'Bad name' });
    try {
      const buf = await readBody(req);
      if (buf.length === 0) return send(res, 400, { error: 'Empty file' });
      fs.writeFileSync(path.join(INPUTS_DIR, name), buf);
      send(res, 200, { name, size: buf.length });
    } catch (err) {
      send(res, 413, { error: err.message });
    }
    return;
  }

  if (req.method === 'POST' && parts[1] === 'run') {
    let body;
    try {
      body = JSON.parse((await readBody(req, 1 * 1024 * 1024)).toString('utf-8'));
    } catch {
      return send(res, 400, { error: 'Invalid JSON' });
    }
    const file = safeName(body.file || '');
    if (!file) return send(res, 400, { error: 'file is required' });
    const inputPath = path.join(INPUTS_DIR, file);
    if (!fs.existsSync(inputPath)) return send(res, 404, { error: `Input file not found: ${file}` });

    const job = {
      id: crypto.randomUUID().slice(0, 8),
      inputFile: file,
      model: body.model || 'gpt-4.1-mini',
      concurrency: Math.min(20, Math.max(1, Number(body.concurrency) || 5)),
      imageDensity: Math.min(600, Math.max(72, Number(body.imageDensity) || 300)),
      systemPrompt: typeof body.systemPrompt === 'string' ? body.systemPrompt : DEFAULT_SYSTEM_PROMPT,
      userPrompt: typeof body.userPrompt === 'string' ? body.userPrompt : DEFAULT_USER_PROMPT,
      createdAt: Date.now(),
      status: 'queued',
      stage: 'queued',
      error: null,
      warnings: null,
      summary: null,
      pageCount: null,
      completionTime: null,
    };
    jobs.set(job.id, job);
    saveJobMeta(job);
    drainQueue();
    send(res, 200, { jobId: job.id });
    return;
  }

  if (req.method === 'GET' && parts[1] === 'jobs') {
    if (parts.length === 2) {
      send(res, 200, listJobs());
      return;
    }
    const job = jobs.get(parts[2]);
    if (!job) return send(res, 404, { error: 'Job not found' });
    if (parts.length === 4) {
      const ext = path.extname(parts[3]).toLowerCase();
      if (ext !== '.json' && ext !== '.md') return send(res, 404, { error: 'Not found' });
      const filePath = path.join(OUTPUTS_DIR, job.id, parts[3]);
      if (!fs.existsSync(filePath)) return send(res, 404, { error: 'Result not ready' });
      sendFile(res, filePath);
      return;
    }
    const { systemPrompt, userPrompt, ...rest } = job;
    send(res, 200, rest);
    return;
  }

  send(res, 404, { error: 'API route not found' });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
      return;
    }
    // Static files
    let rel = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC_DIR, decodeURIComponent(rel));
    if (filePath.startsWith(PUBLIC_DIR + path.sep)) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        sendFile(res, filePath);
        return;
      }
    }
    send(res, 404, { error: 'Not found' });
  } catch (err) {
    send(res, 500, { error: err?.message || String(err) });
  }
});

loadJobsFromDisk();
server.listen(PORT, () => {
  console.log(`zerox UI running at http://localhost:${PORT}`);
  console.log(`  inputs: ${INPUTS_DIR}`);
  console.log(`  outputs: ${OUTPUTS_DIR}`);
});
