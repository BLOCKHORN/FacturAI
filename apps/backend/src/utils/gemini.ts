import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function processInvoiceWithGemini(base64Image: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analiza esta factura o ticket y extrae los siguientes datos en formato JSON puro:
      {
        "vendor_name": "Nombre de la empresa que emite",
        "vendor_cif": "CIF del emisor",
        "date": "Fecha en formato YYYY-MM-DD",
        "base_amount": 0.00,
        "tax_percentage": 21,
        "total_amount": 0.00,
        "concept": "Descripción breve"
      }
      Solo devuelve el JSON, sin bloques de código ni texto adicional.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error: any) {
    console.error('[GEMINI OCR] Error:', error.message);
    throw new Error('Fallo al procesar la imagen con IA');
  }
}
