# md2pdf-core

[![npm version](https://img.shields.io/npm/v/md2pdf-core.svg)](https://www.npmjs.com/package/md2pdf-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Core library for converting Markdown to beautiful PDFs. Supports GitHub-flavored Markdown, Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, tables, and auto-generated Table of Contents.

## Install

```bash
npm install md2pdf-core
```

## Quick Start

```typescript
import { generatePdf, bulkGeneratePdf, markdownToHtml } from "md2pdf-core";

// Single file
const pdfPath = await generatePdf({
  markdown: "# Hello\n\nThis is **bold**.",
  outputPath: "./output.pdf",
  theme: "github",
});

// Bulk conversion
const { outputDir, results } = await bulkGeneratePdf({
  inputDir: "./docs",
  outputDir: "./pdfs",
  theme: "dark",
  includeToc: true,
});
```

## Features

- **GitHub-flavored Markdown** — tables, task lists, strikethrough, fenced code blocks
- **Mermaid diagrams** — flowcharts, sequence diagrams, class diagrams, and more
- **KaTeX math** — inline `$...$` and block `$$...$$` math expressions
- **Syntax highlighting** — 180+ languages via Highlight.js
- **Auto Table of Contents** — generated from document headings
- **Bulk conversion** — convert entire directories of `.md` files
- **Themes** — `github` (default), `light`, `dark`
- **Zero browser downloads** — auto-detects Chrome, Edge, or Chromium

## API

### `generatePdf(options)`

Converts a Markdown string to a PDF file.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `markdown` | `string` | — | **Required.** Markdown content to convert |
| `outputPath` | `string` | temp file | Where to save the PDF |
| `theme` | `"github" \| "light" \| "dark"` | `"github"` | Visual theme |
| `paperSize` | `"A4" \| "Letter" \| "Legal" \| "Tabloid"` | `"A4"` | Paper size |
| `landscape` | `boolean` | `false` | Landscape orientation |
| `margin` | `MarginOptions` | `30px` all | Page margins |
| `includeToc` | `boolean` | `false` | Auto-generate Table of Contents |
| `header` | `string` | — | HTML header template |
| `footer` | `string` | — | HTML footer template |
| `baseDir` | `string` | — | Base directory for relative image paths |
| `customCss` | `string` | — | Extra CSS to inject |

### `bulkGeneratePdf(options)`

Converts all `.md` files in a directory to PDFs.

Same options as `generatePdf` except `markdown` and `outputPath` are omitted. Adds:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `inputDir` | `string` | — | **Required.** Directory containing `.md` files |
| `outputDir` | `string` | auto | Output directory (default: `md2pdf-<timestamp>`) |
| `recursive` | `boolean` | `true` | Scan subdirectories |

### `markdownToHtml(markdown, opts?)`

Renders Markdown to HTML without Puppeteer. Useful if you only need HTML output.

```typescript
const { html, toc } = await markdownToHtml("# Hello\n\nWorld", { includeToc: true });
```

### Utility functions

| Function | Description |
|----------|-------------|
| `preprocessMermaid(md)` | Turn `` ```mermaid `` blocks into `<div class="mermaid">` |
| `preprocessMath(md)` | Turn `$...$` / `$$...$$` into KaTeX HTML |
| `injectHeadingIds(html)` | Add `id` attributes to `<h1>`–`<h6>` |
| `generateTocHtml(html)` | Build a Table of Contents from headings |
| `resolveLocalImages(html, baseDir)` | Resolve relative `<img>` paths to absolute |
| `resolveBrowserExecutable()` | Auto-detect Chrome / Edge / Chromium path |
| `escapeHtml(str)` | Escape HTML special characters |

### CSS themes

```typescript
import { GITHUB_CSS, DARK_CSS } from "md2pdf-core";
```

## Requirements

- Node.js >= 18
- A Chromium-based browser (Chrome, Edge, or Chromium) installed, or set `PUPPETEER_EXECUTABLE_PATH`

## Troubleshooting

### "No Chromium-based browser found"

Install Chrome, Edge, or Chromium, or set the environment variable:

```bash
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
```

## Related Packages

- [`mcp-md2pdf`](https://www.npmjs.com/package/mcp-md2pdf) — MCP server + CLI + HTTP server + programmatic API (includes `m2p` global command)

## License

MIT
