import mammoth from 'mammoth';

export async function parseDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Gagal membaca file DOCX. Pastikan file tidak rusak.');
  }
}
