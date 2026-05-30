
import { sendInvoiceEmail } from '../utils/mailer';
import { generateInvoicePDF } from '../utils/pdf';
import { generateFacturaeXML } from '../utils/facturae';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Forzamos la URL de ngrok para la prueba si no está en el env
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://mayday-oversweet-defense.ngrok-free.dev';

async function runRealSimulation() {
  console.log('🧪 Generando datos REALES para la simulación...');

  const mockInvoice = {
    invoiceNumber: 'FAC-2026-TEST-REAL',
    invoiceSeries: '2026-',
    issueDate: '2026-05-29',
    items: [
      { concept: 'Desarrollo de Software VeriFactu', quantity: 1, unitPrice: 1250.00, taxPercentage: 21 },
      { concept: 'Mantenimiento Cloud Premium', quantity: 1, unitPrice: 150.00, taxPercentage: 21 }
    ],
    seller: {
      name: 'FACTURAI TECH SL',
      cif: 'B12345678',
      address: 'Calle Mayor 10, Castellón',
      zipCode: '12001',
      city: 'CASTELLÓN',
      province: 'CASTELLÓN',
      logoUrl: 'https://bbtmfbirhppkpqjsuhbz.supabase.co/storage/v1/object/public/logos/test-logo.png'
    },
    buyer: {
      name: 'BLOCKHORN STUDIOS',
      cif: 'B99999999',
      address: 'Avenida Marina Alta 5, Dénia',
      zipCode: '03700',
      city: 'DÉNIA',
      province: 'ALICANTE'
    },
    baseAmount: 1400.00,
    totalAmount: 1694.00
  };

  try {
    console.log('📄 Generando PDF profesional...');
    const pdfBuffer = await generateInvoicePDF(mockInvoice);

    console.log('📦 Generando XML Facturae 3.2.2...');
    const xmlString = generateFacturaeXML(mockInvoice);
    const xmlBuffer = Buffer.from(xmlString);

    console.log('📧 Despachando Email vía Resend...');
    await sendInvoiceEmail({
      recipientEmail: 'blockhornstudios@gmail.com',
      invoiceNumber: mockInvoice.invoiceNumber,
      sellerName: mockInvoice.seller.name,
      pdfBuffer,
      xmlBuffer
    });

    console.log('✅ Simulación completada con datos íntegros.');
    console.log(`🔗 El link ahora apunta a: ${process.env.FRONTEND_URL}`);
  } catch (error: any) {
    console.error('❌ Error en simulación real:', error.message);
  }
}

runRealSimulation();
