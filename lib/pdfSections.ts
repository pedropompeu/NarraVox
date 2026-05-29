export interface PdfSection {
  title: string;
  pageIndex: number; // 0-indexed dentro do array de páginas extraídas
}

interface PdfTextItem {
  str: string;
  transform: number[];
  height: number;
  fontName?: string;
}

// Detecta seções por heurística: altura de fonte maior que a mediana do corpo
export async function extractSections(file: File, maxPages: number): Promise<PdfSection[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pagesToScan = Math.min(pdf.numPages, maxPages);

  // Primeira passagem: coleta todas as alturas para calcular mediana
  const allHeights: number[] = [];
  const pageContents: Array<{ items: PdfTextItem[] }> = [];

  for (let i = 1; i <= pagesToScan; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items
      .filter((it) => "str" in it && (it as { str: string }).str.trim().length > 0)
      .map((it) => it as unknown as PdfTextItem);
    pageContents.push({ items });
    items.forEach((it) => { if (it.height > 0) allHeights.push(it.height); });
  }

  if (!allHeights.length) return [];

  const sorted = [...allHeights].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const headingThreshold = median * 1.25; // 25% maior que a mediana = provável título

  const sections: PdfSection[] = [];

  for (let pageIdx = 0; pageIdx < pageContents.length; pageIdx++) {
    const { items } = pageContents[pageIdx];
    for (const item of items) {
      if (
        item.height >= headingThreshold &&
        item.str.trim().length >= 3 &&
        item.str.trim().length <= 120 // títulos não são muito longos
      ) {
        const title = item.str.trim();
        // Evita duplicatas da mesma página
        const lastOnPage = sections[sections.length - 1];
        if (lastOnPage?.pageIndex === pageIdx && lastOnPage.title === title) continue;
        sections.push({ title, pageIndex: pageIdx });
      }
    }
  }

  return sections;
}
