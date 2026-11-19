import * as pdfjsLib from "pdfjs-dist";

/**
 * Extracts text from a PDF ArrayBuffer while preserving line breaks,
 * paragraph spacing, and natural reading order using item Y/X coordinates.
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjsVersion = (pdfjsLib as any).version || "6.1.200";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (!items || items.length === 0) continue;

    // Group items into visual lines by Y-coordinate (transform[5])
    interface TextLine {
      y: number;
      chunks: { x: number; str: string; width: number }[];
    }

    const lines: TextLine[] = [];
    const Y_TOLERANCE = 3.5;

    for (const item of items) {
      const str = typeof item.str === "string" ? item.str : "";
      if (!str && !item.hasEOL) continue;

      const x = Array.isArray(item.transform) ? item.transform[4] : 0;
      const y = Array.isArray(item.transform) ? item.transform[5] : 0;
      const width = typeof item.width === "number" ? item.width : 0;

      // Find an existing line with a close Y coordinate
      let targetLine = lines.find((l) => Math.abs(l.y - y) <= Y_TOLERANCE);
      if (!targetLine) {
        targetLine = { y, chunks: [] };
        lines.push(targetLine);
      }
      if (str) {
        targetLine.chunks.push({ x, str, width });
      }
    }

    // Sort top-to-bottom (higher Y is higher on PDF page)
    lines.sort((a, b) => b.y - a.y);

    const formattedLines: string[] = [];
    let prevY: number | null = null;

    for (const line of lines) {
      // Sort left-to-right within each line
      line.chunks.sort((a, b) => a.x - b.x);

      let lineStr = "";
      let prevEnd = 0;

      for (let idx = 0; idx < line.chunks.length; idx++) {
        const chunk = line.chunks[idx];
        const text = chunk.str;
        if (idx === 0) {
          lineStr += text;
        } else {
          const gap = chunk.x - prevEnd;
          // Insert space if there is a visible horizontal gap and neither side already has whitespace
          if (
            gap > 2 &&
            !lineStr.endsWith(" ") &&
            !text.startsWith(" ")
          ) {
            lineStr += gap > 25 ? "  " : " ";
          }
          lineStr += text;
        }
        prevEnd = chunk.x + chunk.width;
      }

      const trimmed = lineStr.replace(/\s+/g, " ").trim();
      if (!trimmed) continue;

      // Add a blank line when there's a large vertical gap between sections
      if (prevY !== null && prevY - line.y > 18) {
        formattedLines.push("");
      }
      formattedLines.push(trimmed);
      prevY = line.y;
    }

    pageTexts.push(formattedLines.join("\n"));
  }

  return pageTexts.join("\n\n").trim();
}
