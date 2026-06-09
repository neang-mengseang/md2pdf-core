export declare function escapeHtml(unsafe: string): string;
export declare function preprocessMermaid(markdown: string): string;
export declare function preprocessMath(markdown: string): string;
export declare function injectHeadingIds(html: string): string;
export declare function generateTocHtml(html: string): string;
export declare function resolveLocalImages(html: string, baseDir?: string): string;
export declare function markdownToHtml(markdown: string, opts?: {
    includeToc?: boolean;
}): Promise<{
    html: string;
    toc: string;
}>;
//# sourceMappingURL=markdown.d.ts.map