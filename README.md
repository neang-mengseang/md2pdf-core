# md2pdf-core

Core library for converting Markdown to beautiful PDFs.

Supports GitHub-flavored Markdown, Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, tables, and auto-generated Table of Contents.

## Install

```bash
npm install md2pdf-core
```

## Usage

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
});
```

## API

### `generatePdf(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `markdown` | `string` | — | Markdown content to convert |
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

Same options as `generatePdf` except `markdown` and `outputPath` are omitted. Adds:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `inputDir` | `string` | — | Directory containing `.md` files |
| `outputDir` | `string` | auto | Output directory |
| `recursive` | `boolean` | `true` | Scan subdirectories |

## Requirements

- Node.js >= 18
- A Chromium-based browser (Chrome, Edge, or Chromium) installed, or set `PUPPETEER_EXECUTABLE_PATH`

## License

MIT
