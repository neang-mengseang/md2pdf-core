/**
 * md2pdf-core — Programmatic API
 *
 * Import this module to use the PDF engine as a library:
 *
 *   import { generatePdf, bulkGeneratePdf } from "md2pdf-core";
 *
 */
export { generatePdf, bulkGeneratePdf } from "./pdf-engine.js";
export { markdownToHtml, resolveLocalImages, preprocessMermaid, preprocessMath, injectHeadingIds, generateTocHtml, escapeHtml, } from "./markdown.js";
export { resolveBrowserExecutable } from "./browser.js";
export { GITHUB_CSS, DARK_CSS } from "./css.js";
//# sourceMappingURL=lib.js.map