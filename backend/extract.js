import pdfParse from 'pdf-parse';

export async function extractText(file) {
  const filename = file.originalname.toLowerCase();

  if (filename.endsWith('.txt')) {
    return file.buffer.toString('utf-8').trim();
  }

  if (filename.endsWith('.pdf')) {
    const data = await pdfParse(file.buffer);
    return data.text.trim();
  }

  throw new Error('Unsupported file type');
}
