
declare const pdfjsLib: any;

export async function extractPdfText(file: File): Promise<string> {
  // Check if library loaded from CDN
  if (typeof pdfjsLib === 'undefined') {
    console.error("pdfjsLib is undefined. CDN script might have failed.");
    throw new Error('PDF processing library failed to load. Check your internet connection.');
  }

  const arrayBuffer = await file.arrayBuffer();
  
  // Set worker source via CDN to match the main script version
  const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    console.log(`PDF loaded. Pages: ${pdf.numPages}`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }
    
    return fullText;
  } catch (err) {
    console.error('PDF.js loading error:', err);
    throw new Error('The PDF file could not be read. It might be corrupt or an image-only PDF.');
  }
}
