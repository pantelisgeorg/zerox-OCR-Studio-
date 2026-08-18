import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { zerox } from './node-zerox/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_SYSTEM_PROMPT = `You are a precise document parser. For EACH page return EXACTLY two sections, in this order:
1. A JSON block (surrounded by triple backticks) named ---STRUCTURE-JSON--- containing:
   { "tables": [...], "images": [...], "metadata": {...} }
   - tables: array of objects { "caption"?: string, "rows": [[cell, cell, ...], ...] }.
   - images: array of { "id", "caption"?, "bbox": [x, y, w, h] }.
2. A clean Markdown representation of the rest of the page.

STRICT TABLE RULES:
- Render EVERY table as an HTML <table> with <thead>/<tbody>, <tr>, <th> (headers) and <td> (data cells).
- NEVER use Markdown pipe ("|") tables. Always emit HTML <table> markup.
- Preserve every row and cell. If a table has a caption or title, put it as the first row: <tr><th colspan="N">caption</th></tr>.

ACCURACY RULES:
- Transcribe the page faithfully. Each footnote, sentence, or cell must appear EXACTLY ONCE.
- Never invent or duplicate content. If unsure of a word, transcribe your best guess once; do not repeat phrases, footnotes, or cells.

Do not add any commentary outside the two sections.`;

export const DEFAULT_USER_PROMPT = `Convert the provided page to Markdown. Render ALL tables as HTML <table> markup (never Markdown pipe tables) and also list them in the ---STRUCTURE-JSON--- block. If the input is OCR text, reconstruct tables using whitespace heuristics. Transcribe each piece of text exactly once — do not repeat phrases, footnotes, or cells. Output only the JSON block, then the Markdown.`;

// Convert any stray Markdown pipe tables to HTML <table> so output stays consistent.
function markdownTablesToHtml(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  const isPipeRow = (l) => l.includes('|') && /^\s*\|?.*\|.*$/.test(l);
  const isSeparator = (l) => /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(l);
  const splitRow = (l) => {
    let s = l.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map(c => c.trim());
  };
  while (i < lines.length) {
    if (isPipeRow(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const header = splitRow(lines[i]);
      let j = i + 2;
      const body = [];
      while (j < lines.length && isPipeRow(lines[j]) && !isSeparator(lines[j])) {
        body.push(splitRow(lines[j]));
        j++;
      }
      let html = '<table>\n<thead>\n<tr>\n' + header.map(c => `<th>${c}</th>`).join('\n') + '\n</tr>\n</thead>\n';
      if (body.length) {
        html += '<tbody>\n';
        for (const row of body) {
          html += '<tr>\n' + row.map(c => `<td>${c}</td>`).join('\n') + '\n</tr>\n';
        }
        html += '</tbody>\n';
      }
      html += '</table>';
      out.push(html);
      i = j;
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join('\n');
}

// Collapse LLM repetition loops where a phrase is duplicated many times in a row.
function collapseRepetition(text, pageNumber, warnings) {
  const re = /([\s\S]{8,300}?)(?:[^\S\r\n]*\1){3,}/g;
  return text.replace(re, (match, phrase) => {
    // Only collapse phrases that contain real text (letters/digits),
    // so legitimate runs of dashes, dots, or rules are left untouched.
    if (!/[\p{L}\p{N}]/u.test(phrase)) return match;
    const count = Math.round(match.length / phrase.length);
    const preview = phrase.replace(/\s+/g, ' ').trim().slice(0, 80);
    warnings.push({ page: pageNumber, message: `collapsed ${count}x repetition of: "${preview}…"` });
    return phrase;
  });
}

// Build the combined JSON structure from zerox pages.
export function buildCombined(result) {
  const combined = {
    fileName: result.fileName || 'result',
    pages: [],
    summary: result.summary || {},
    completionTime: result.completionTime ?? null,
    inputTokens: result.inputTokens ?? null,
    outputTokens: result.outputTokens ?? null,
  };

  const warnings = [];
  result.pages.forEach((page) => {
    // Strip the optional ---STRUCTURE-JSON--- block, convert any Markdown pipe
    // tables to HTML, and collapse LLM repetition loops.
    const rawMd = page.markdown || page.content || '';
    const noJson = rawMd.replace(/---STRUCTURE-JSON---\s*```(?:json\n)?[\s\S]*?```/i, '').trim();
    const markdown = collapseRepetition(markdownTablesToHtml(noJson), page.page, warnings);

    // Extract HTML tables from markdown
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    const tables = [];
    let tableMatch;
    while ((tableMatch = tableRegex.exec(markdown)) !== null) {
      const html = tableMatch[0];
      const rows = [];
      const rowRegex = /<tr[\s\S]*?<\/tr>/gi;
      let rowMatch;
      while ((rowMatch = rowRegex.exec(html)) !== null) {
        const cells = [];
        const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
          const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim();
          cells.push(cellText);
        }
        if (cells.length > 0) rows.push(cells);
      }
      if (rows.length > 0) tables.push({ rows });
    }

    combined.pages.push({
      page: page.page,
      markdown: markdown,
      structure: {
        tables: tables.length > 0 ? tables : null,
        images: null,
      },
    });
  });

  return { combined, warnings };
}

export function pagesToMarkdown(combined) {
  return combined.pages
    .map(p => (p.markdown || '').trim())
    .filter(p => p.length > 0)
    .join('\n\n---\n\n');
}

// Run the full OCR pipeline. onStage(stage, info) is called with:
//   'ocr' (before zerox), 'postprocess' (before building combined), 'done'.
export async function runOcr({
  filePath,
  outputDir,
  model = 'gpt-4.1-mini',
  modelProvider = 'OPENAI',
  concurrency = 5,
  imageDensity = 300,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  userPrompt = DEFAULT_USER_PROMPT,
  onStage = () => {},
}) {
  onStage('ocr', { filePath });
  const outDir = path.resolve(outputDir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const result = await zerox({
    filePath: path.resolve(filePath),
    credentials: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    model,
    modelProvider,
    outputDir: outDir,
    imageDensity,
    concurrency,
    maintainFormat: true,
    cleanup: true,
    maxRetries: 2,
    prompts: {
      system: systemPrompt,
      user: userPrompt,
    },
  });

  onStage('postprocess', {});
  const { combined, warnings } = buildCombined(result);

  const jsonPath = path.join(outDir, 'result.json');
  const mdPath = path.join(outDir, 'result.md');

  fs.writeFileSync(jsonPath, JSON.stringify(combined, null, 2));
  fs.writeFileSync(mdPath, pagesToMarkdown(combined));

  onStage('done', { jsonPath, mdPath });

  return {
    combined,
    warnings,
    jsonPath,
    mdPath,
    result,
  };
}
