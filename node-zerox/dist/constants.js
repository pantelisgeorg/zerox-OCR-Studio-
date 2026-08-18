"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_PROMPT_BASE = exports.CONSISTENCY_PROMPT = exports.NUM_STARTING_WORKERS = exports.ASPECT_RATIO_THRESHOLD = void 0;
exports.ASPECT_RATIO_THRESHOLD = 5;
// This is a rough guess; this will be used to create Tesseract workers by default,
// that cater to this many pages. If a document has more than this many pages,
// then more workers will be created dynamically.
exports.NUM_STARTING_WORKERS = 3;
var CONSISTENCY_PROMPT = function (priorPage) {
    return "Markdown must maintain consistent formatting with the following page: \n\n \"\"\"".concat(priorPage, "\"\"\"");
};
exports.CONSISTENCY_PROMPT = CONSISTENCY_PROMPT;
exports.SYSTEM_PROMPT_BASE = "\nConvert the following document to markdown.\nReturn only the markdown with no explanation text. Do not include delimiters like ```markdown or ```html.\n\nRULES:\n  - You must include all information on the page. Do not exclude headers, footers, or subtext.\n  - Return tables in an HTML format.\n  - Charts & infographics must be interpreted to a markdown format. Prefer table format when applicable.\n  - Logos should be wrapped in brackets. Ex: <logo>Coca-Cola<logo>\n  - Watermarks should be wrapped in brackets. Ex: <watermark>OFFICIAL COPY<watermark>\n  - Page numbers should be wrapped in brackets. Ex: <page_number>14<page_number> or <page_number>9/22<page_number>\n  - Prefer using \u2610 and \u2611 for check boxes.\n";
