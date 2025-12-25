import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ExtractedContent {
  name: string;
  text: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'image';
}

export interface ProcessedFile {
  name: string;
  dataUrl: string; // For images
  text?: string; // For documents with extractable text
  type: 'image' | 'document';
}

/**
 * Extract text from a PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const numPages = Math.min(pdf.numPages, 50); // Limit to 50 pages
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

/**
 * Extract text from a DOCX file
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extract text from a plain text file (TXT, MD)
 */
async function extractTextFromTextFile(file: File): Promise<string> {
  return await file.text();
}

/**
 * Convert a file to a data URL
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Determine file type based on extension and MIME type
 */
function getFileType(file: File): 'pdf' | 'docx' | 'txt' | 'md' | 'image' | 'unknown' {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();
  
  if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (extension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (extension === 'doc' || mimeType === 'application/msword') return 'docx'; // Try mammoth for .doc too
  if (extension === 'txt' || mimeType === 'text/plain') return 'txt';
  if (extension === 'md' || mimeType === 'text/markdown') return 'md';
  if (mimeType.startsWith('image/')) return 'image';
  
  return 'unknown';
}

/**
 * Process a single file and extract content
 */
export async function processFile(file: File): Promise<ProcessedFile | null> {
  const fileType = getFileType(file);
  
  if (fileType === 'unknown') {
    console.warn(`Unsupported file type: ${file.name}`);
    return null;
  }
  
  try {
    if (fileType === 'image') {
      const dataUrl = await fileToDataUrl(file);
      return {
        name: file.name,
        dataUrl,
        type: 'image'
      };
    }
    
    let text = '';
    
    switch (fileType) {
      case 'pdf':
        text = await extractTextFromPDF(file);
        break;
      case 'docx':
        text = await extractTextFromDOCX(file);
        break;
      case 'txt':
      case 'md':
        text = await extractTextFromTextFile(file);
        break;
    }
    
    // If we got text, return as document
    if (text.trim()) {
      return {
        name: file.name,
        dataUrl: '', // Not needed for text documents
        text,
        type: 'document'
      };
    }
    
    // If PDF/DOCX has no extractable text (scanned), try as image
    // For now, we'll just return it as a document with empty text
    console.warn(`No text extracted from ${file.name}, might be a scanned document`);
    return {
      name: file.name,
      dataUrl: '',
      text: '',
      type: 'document'
    };
    
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return null;
  }
}

/**
 * Process multiple files and return extracted content
 */
export async function processFiles(files: File[]): Promise<ProcessedFile[]> {
  const results = await Promise.all(files.map(processFile));
  return results.filter((r): r is ProcessedFile => r !== null);
}

/**
 * Clean up extracted topic text
 * Removes numbering, bullets, and extra whitespace
 */
export function cleanTopicText(text: string): string {
  return text
    // Remove leading numbering patterns: "1.", "1)", "(1)", "a.", "a)", "(a)", etc.
    .replace(/^\s*(?:\d+[.)]\s*|\(\d+\)\s*|[a-zA-Z][.)]\s*|\([a-zA-Z]\)\s*|[-•●○▪▸▹→]\s*)/gm, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Batch items into groups of specified size
 */
export function batchItems<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}
