# zerox OCR Studio

A local web app that turns documents (PDF, PNG, JPG, Office files) into clean
Markdown + structured JSON, using an OpenAI vision model as the OCR engine.

There is no classic OCR. Each page of the document is rendered as an image and
sent to a vision LLM (default `gpt-4.1-mini`) with tuned prompts. The app
handles everything around the model: file conversion, page splitting,
orientation correction, retries, post-processing, and a browser UI to pick
files, run jobs, and view/download results.

This is a customized fork of [zerox](https://github.com/getomni-ai/zerox) with
only the Node.js implementation kept.

## Prerequisites

- Node.js 18+ (tested on 22)
- An OpenAI API key
- Linux or macOS. System tools (Ghostscript, GraphicsMagick, LibreOffice,
  Poppler) are auto-installed by `npm install` via the postinstall script on
  Linux/macOS.

## Setup

```bash
npm install            # installs deps + system tools
cp .env.example .env   # then edit .env and put your OPENAI_API_KEY
npm run build          # compile node-zerox if node-zerox/dist is missing
```

> `node-zerox/dist` is the compiled library. If it's not shipped with the
> clone, run `npm run build` once to generate it from `node-zerox/src`.

## Run the web UI

```bash
npm start              # or: node server.js
```

Open <http://localhost:3000>.

Workflow in the UI:

1. Pick a file from `shared/inputs/` in the dropdown, or upload one.
2. Optionally adjust model, concurrency, image density, and prompts.
3. Press **Run OCR**.
4. View the result in the Markdown / Raw md / JSON / Warnings tabs, navigate
   pages, and download `result.md` / `result.json`.

Each run creates a folder `shared/outputs/<job-id>/` containing
`result.json`, `result.md`, and `meta.json`. Runs persist across restarts.

## CLI alternative

```bash
node run-test.js
```

Runs the same pipeline on `filosofia3.pdf` (edit the path inside the file) and
writes `result.json` / `result.md` directly to `shared/outputs/`.

## How it works

1. **Ingestion** — the file is copied to a temp dir and converted to page
   images (PDF via pdf2pic, Office via LibreOffice, images via sharp).
   Tesseract is used only to fix page orientation.
2. **OCR** — each page image is sent to the OpenAI model with the system/user
   prompts in `ocr-pipeline.js`. The prompts force a consistent output:
   an HTML-table Markdown page plus a `---STRUCTURE-JSON---` block.
3. **Post-processing** — the JSON block is stripped, stray Markdown pipe
   tables are converted to HTML `<table>`, LLM repetition loops are collapsed,
   and the combined result is written as `result.json` + `result.md`.
4. **UI** — `server.js` (plain Node http, no framework) serves the browser
   UI in `public/` and a small API for uploads, job queue, and results.

## Project layout

```
ocr-pipeline.js   # the pipeline: prompts, runOcr(), post-processing
server.js          # web server + REST API + job queue
run-test.js        # CLI entry point (uses ocr-pipeline.js)
public/            # browser UI (index.html, app.js, style.css)
node-zerox/        # compiled zerox library (src/ + dist/)
shared/inputs/     # documents to OCR (the UI reads/upload here)
shared/outputs/    # per-run results
```

## Model choice

- `gpt-4.1-mini` (default) — cheap and fast; plenty for clean typed pages.
- `gpt-4.1` / `gpt-4o` — better on dense multi-column layouts, complex
  tables, footnotes, and noisy scans, at higher cost.

The model handles any language the LLM knows (Greek, etc.) since text is read
from the page image directly.
