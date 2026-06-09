import puppeteer from "puppeteer-core";
import { createRequire } from "module";
import { writeFileSync, mkdtempSync, rmSync, existsSync, readFileSync, copyFileSync, readdirSync, mkdirSync, } from "fs";
import { join, dirname, resolve as resolvePath, basename, extname } from "path";
import { tmpdir } from "os";
import { resolveBrowserExecutable } from "./browser.js";
import { GITHUB_CSS, DARK_CSS } from "./css.js";
import { markdownToHtml, resolveLocalImages } from "./markdown.js";
/* ------------------------------------------------------------------ */
/*  Asset resolution                                                  */
/* ------------------------------------------------------------------ */
function copyAssetToTemp(assetPath, tempDir) {
    try {
        if (!existsSync(assetPath))
            return undefined;
        const dest = join(tempDir, basename(assetPath));
        copyFileSync(assetPath, dest);
        return basename(dest);
    }
    catch {
        return undefined;
    }
}
function resolveAssetPath(name) {
    try {
        const req = createRequire(import.meta.url);
        return dirname(req.resolve(name));
    }
    catch {
        return join(process.cwd(), "node_modules", name);
    }
}
function buildHtml(htmlContent, tocHtml, theme, customCss) {
    const tempDir = mkdtempSync(join(tmpdir(), "pdf-gen-"));
    const mermaidJsSrc = join(resolveAssetPath("mermaid"), "dist", "mermaid.min.js");
    const mermaidJsName = copyAssetToTemp(mermaidJsSrc, tempDir);
    const katexCssSrc = join(resolveAssetPath("katex"), "dist", "katex.min.css");
    const katexCssName = copyAssetToTemp(katexCssSrc, tempDir);
    const css = theme === "dark" ? DARK_CSS : GITHUB_CSS;
    const hljsTheme = theme === "dark" ? "github-dark" : "github";
    const mermaidScript = mermaidJsName
        ? `<script src="${mermaidJsName}"></script>`
        : `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>`;
    const katexLink = katexCssName ? `<link rel="stylesheet" href="${katexCssName}">` : "";
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Generated PDF</title>
  <style>${css}${customCss ? "\n" + customCss : ""}</style>
  ${katexLink}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/styles/${hljsTheme}.min.css">
  ${mermaidScript}
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme === "dark" ? "dark" : "default"}',
      securityLevel: 'strict',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    });
  </script>
</head>
<body>
  ${tocHtml}
  ${htmlContent}
</body>
</html>`;
    return { html: fullHtml, mermaidJsName, katexCssName };
}
/* ------------------------------------------------------------------ */
/*  Single PDF generation                                             */
/* ------------------------------------------------------------------ */
export async function generatePdf(options) {
    const { markdown, outputPath, theme = "github", paperSize = "A4", landscape = false, margin = { top: "30px", bottom: "30px", left: "30px", right: "30px" }, includeToc = false, header, footer, baseDir, customCss, } = options;
    const { html: rawHtml, toc } = await markdownToHtml(markdown, { includeToc });
    const resolvedHtml = resolveLocalImages(rawHtml, baseDir);
    const { html: fullHtml } = buildHtml(resolvedHtml, toc, theme, customCss);
    const tempDir = mkdtempSync(join(tmpdir(), "pdf-gen-"));
    const htmlPath = join(tempDir, "input.html");
    writeFileSync(htmlPath, fullHtml, "utf-8");
    const browserPath = resolveBrowserExecutable();
    if (!browserPath) {
        throw new Error("No Chromium-based browser found. Install Chrome, Edge, or Chromium, " +
            "or set PUPPETEER_EXECUTABLE_PATH environment variable.");
    }
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: browserPath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
        await page.evaluate(async () => {
            const mermaidElements = document.querySelectorAll(".mermaid");
            if (mermaidElements.length > 0 && window.mermaid) {
                await window.mermaid.run({ querySelector: ".mermaid" });
            }
        });
        await new Promise((r) => setTimeout(r, 500));
        const headerTemplate = header
            ? `<div style="font-size:9px; width:100%; padding:0 30px; color:#656d76;">${header}</div>`
            : undefined;
        const footerTemplate = footer
            ? `<div style="font-size:9px; width:100%; padding:0 30px; color:#656d76;">${footer}</div>`
            : `<div style="font-size:9px; width:100%; padding:0 30px; text-align:center; color:#656d76;">
           <span class="pageNumber"></span> / <span class="totalPages"></span>
         </div>`;
        const finalOutputPath = outputPath || join(tmpdir(), `pdf-gen-${Date.now()}.pdf`);
        await page.pdf({
            path: finalOutputPath,
            format: paperSize,
            landscape,
            margin: {
                top: margin.top || "30px",
                bottom: margin.bottom || "30px",
                left: margin.left || "30px",
                right: margin.right || "30px",
            },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate,
            footerTemplate,
        });
        return finalOutputPath;
    }
    finally {
        await browser.close();
        try {
            rmSync(tempDir, { recursive: true, force: true });
        }
        catch { /* ignore cleanup errors */ }
    }
}
/* ------------------------------------------------------------------ */
/*  Bulk PDF generation                                               */
/* ------------------------------------------------------------------ */
function findMarkdownFiles(dir, recursive) {
    const results = [];
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory() && recursive) {
            results.push(...findMarkdownFiles(fullPath, recursive));
        }
        else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
            results.push(fullPath);
        }
    }
    return results;
}
export async function bulkGeneratePdf(options) {
    const { inputDir, outputDir, recursive = true, theme = "github", paperSize = "A4", landscape = false, margin = { top: "30px", bottom: "30px", left: "30px", right: "30px" }, includeToc = false, header, footer, customCss, } = options;
    const resolvedInput = resolvePath(inputDir);
    if (!existsSync(resolvedInput)) {
        throw new Error(`Input directory does not exist: ${resolvedInput}`);
    }
    const outDir = outputDir || join(process.cwd(), `md2pdf-${Date.now()}`);
    mkdirSync(outDir, { recursive: true });
    const files = findMarkdownFiles(resolvedInput, recursive);
    const results = [];
    for (const filePath of files) {
        const relPath = filePath.substring(resolvedInput.length + 1);
        const baseName = basename(filePath, ".md");
        const relDir = dirname(relPath);
        const outSubDir = join(outDir, relDir);
        mkdirSync(outSubDir, { recursive: true });
        const outputPath = join(outSubDir, `${baseName}.pdf`);
        try {
            const markdown = readFileSync(filePath, "utf-8");
            await generatePdf({
                markdown,
                outputPath,
                theme,
                paperSize,
                landscape,
                margin,
                includeToc,
                header,
                footer,
                baseDir: dirname(filePath),
                customCss,
            });
            results.push({ inputPath: filePath, outputPath, success: true });
        }
        catch (err) {
            results.push({ inputPath: filePath, outputPath, success: false, error: err?.message || String(err) });
        }
    }
    return { outputDir: outDir, results };
}
//# sourceMappingURL=pdf-engine.js.map