import path from 'path';
import { fileURLToPath } from 'url';
import { runOcr } from './ocr-pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combined, warnings, jsonPath, mdPath } = await runOcr({
  filePath: path.resolve(__dirname, './shared/inputs/filosofia3.pdf'),
  outputDir: path.resolve(__dirname, './shared/outputs'),
  model: 'gpt-4.1-mini',
  concurrency: 5,
  imageDensity: 300,
});

if (warnings.length > 0) {
  console.log('\n=== Post-processing warnings ===');
  warnings.forEach(w => console.log(`  [page ${w.page}] ${w.message}`));
}

console.log(`Saved JSON to ${jsonPath}`);
console.log(`Saved Markdown to ${mdPath}`);

console.log("\n=== OCR Result (preview) ===\n");
console.log(combined.pages.slice(0, 3).map(p => p.markdown?.slice(0, 500)).join('\n\n---\n\n'));
