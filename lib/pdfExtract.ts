export const FREE_PAGE_LIMIT = 10;

export interface PdfExtractResult {
  pages: string[];
  totalPages: number;
  truncated: boolean;
}

export async function extractPdfPages(file: File): Promise<PdfExtractResult> {
  // pdfjs-dist carregado dinamicamente — não infla o bundle inicial
  const pdfjsLib = await import("pdfjs-dist");

  // Worker via CDN para evitar complexidade de bundling do worker no Next.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const totalPages = pdf.numPages;
  const pagesToRead = Math.min(totalPages, FREE_PAGE_LIMIT);
  const pages: string[] = [];

  for (let i = 1; i <= pagesToRead; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Reconstrói o texto respeitando quebras de linha naturais do PDF
    let lastY: number | null = null;
    let pageText = "";

    for (const item of content.items) {
      if (!("str" in item)) continue;
      const currentY = (item as { transform: number[] }).transform[5];
      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        pageText += "\n";
      }
      pageText += (item as { str: string }).str;
      lastY = currentY;
    }

    const trimmed = pageText.trim();
    // Página sem texto = PDF escaneado (imagem) — marcador explícito
    pages.push(trimmed || "[Esta página não contém texto extraível — pode ser uma imagem ou PDF escaneado.]");
  }

  return { pages, totalPages, truncated: totalPages > FREE_PAGE_LIMIT };
}

export function readTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file, "UTF-8");
  });
}
