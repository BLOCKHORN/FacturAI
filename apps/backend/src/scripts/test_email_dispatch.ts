
import { sendInvoiceEmail } from '../utils/mailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function simulateEmail() {
  console.log('📧 Iniciando simulación de envío de factura...');
  
  // Mock de datos para la prueba
  const testData = {
    recipientEmail: 'blockhornstudios@gmail.com',
    invoiceNumber: 'FAC-2026-0001',
    sellerName: 'ARGENTA CERÁMICA, S.L.U.',
    pdfBuffer: Buffer.from('Contenido simulado de PDF'),
    xmlBuffer: Buffer.from('<?xml version="1.0" encoding="UTF-8"?><Facturae>...</Facturae>')
  };

  try {
    await sendInvoiceEmail(testData);
    console.log('✅ Email enviado con éxito a blockhornstudios@gmail.com');
    console.log('\n--- DETALLES DEL ENVÍO ---');
    console.log('Remitente: FacturAI <facturas@facturai.es>');
    console.log('Branding: Sobrio, enfocado en el emisor (Argenta Cerámica)');
    console.log('Adjuntos: Factura.pdf, Factura.xml');
  } catch (error: any) {
    console.error('❌ Error en la simulación:', error.message);
  }
}

simulateEmail();
