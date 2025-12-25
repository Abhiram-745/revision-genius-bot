/**
 * File content extraction utilities
 * Handles PDF, DOCX, TXT, MD, and images for topic extraction
 * 
 * PDF and DOCX files are sent as base64 to the backend for processing
 * Text files are read directly in the browser
 * Images are converted to base64 data URLs
 */

export type FileType = 'pdf' | 'docx' | 'txt' | 'md' | 'image' | 'unknown';

export interface ExtractedContent {
  name: string;
  type: FileType;
  content: string;
  isBase64?: boolean;
}

export interface ProcessedFile {
  name: string;
  dataUrl: string;
  text?: string;
  type: 'image' | 'document';
  originalType?: FileType;
}

/**
 * Determine file type based on extension and MIME type
 */
export function getFileType(file: File): FileType {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();
  
  if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (extension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (extension === 'doc' || mimeType === 'application/msword') return 'docx';
  if (extension === 'txt' || mimeType === 'text/plain') return 'txt';
  if (extension === 'md' || mimeType === 'text/markdown') return 'md';
  if (mimeType.startsWith('image/')) return 'image';
  
  return 'unknown';
}

/**
 * Convert a file to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as text
 */
export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
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
        type: 'image',
        originalType: fileType
      };
    }
    
    // For text files, read directly
    if (fileType === 'txt' || fileType === 'md') {
      const text = await fileToText(file);
      return {
        name: file.name,
        dataUrl: '',
        text: text.trim(),
        type: 'document',
        originalType: fileType
      };
    }
    
    // For PDF and DOCX, send as base64 to backend for processing
    if (fileType === 'pdf' || fileType === 'docx') {
      const dataUrl = await fileToDataUrl(file);
      return {
        name: file.name,
        dataUrl,
        type: 'document',
        originalType: fileType
      };
    }
    
    return null;
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
    .replace(/^\s*(?:\d+[.)]\s*|\(\d+\)\s*|[a-zA-Z][.)]\s*|\([a-zA-Z]\)\s*|[-•●○▪▸▹→]\s*)/gm, '')
    .replace(/\s+/g, ' ')
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
