
import { createClient } from '@supabase/supabase-js';
import { sendInvoiceEmail } from '../utils/mailer';
import { generateInvoicePDF } from '../utils/pdf';
import { generateFacturaeXML } from '../utils/facturae';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  realtime: { transport: ws }
});

async function runSecureSimulation() {
  console.log('🛡️ Iniciando Simulación Segura (B2B Portal)...');

  try {
    // 1. Buscamos al usuario Argenta o similar para emular el emisor
    const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
    if (!profile) throw new Error('No hay perfiles en la DB para simular.');

    const invoiceNumber = `SEC-${Math.floor(Math.random() * 10000)}`;
    
    // 2. Creamos la factura en DB para generar el secure_token real
    const { data: invoice, error: invError } = await supabase.from('invoices').insert({
      user_id: profile.id,
      invoice_number: invoiceNumber,
      total_amount: 1210.00,
      base_amount: 1000.00,
      tax_percentage: 21.00,
      concept: 'Implantación Sistema VeriFactu Pro',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'sent',
      issue_date: new Date().toISOString().split('T')[0]
    }).select().single();

    if (invError) throw invError;
    console.log(`✅ Factura creada en DB con Token: ${invoice.secure_token}`);

    const invoiceData = {
      invoiceNumber: invoice.invoice_number,
      invoiceSeries: '2026-SEC',
      issueDate: invoice.issue_date,
      items: [
        { concept: 'Implantación Sistema VeriFactu Pro', quantity: 1, unitPrice: 1000.00, taxPercentage: 21 }
      ],
      seller: {
        name: profile.company_name || 'FACTURAI TECH',
        cif: profile.cif_nif || 'B12345678',
        address: profile.fiscal_address || 'Calle Falsa 123',
        zipCode: profile.zip_code || '12001',
        city: profile.city || 'CASTELLON',
        province: profile.province || 'CASTELLON',
        logoUrl: profile.logo_url
      },
      buyer: {
        name: 'BLOCKHORN STUDIOS',
        cif: 'B99999999',
        address: 'Avenida de la Marina Alta, 5',
        zipCode: '03700',
        city: 'DENIA',
        province: 'ALICANTE'
      },
      baseAmount: 1000.00,
      totalAmount: 1210.00
    };

    console.log('📄 Generando PDF y XML reales...');
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    const xmlBuffer = Buffer.from(generateFacturaeXML(invoiceData));

    console.log('📧 Enviando Email con Link Seguro...');
    await sendInvoiceEmail({
      recipientEmail: 'blockhornstudios@gmail.com',
      invoiceNumber: invoice.secure_token, // Pasamos el token como identificador para el link
      sellerName: invoiceData.seller.name,
      pdfBuffer,
      xmlBuffer
    });

    console.log(`\n✨ PRUEBA LISTA:`);
    console.log(`Email enviado a: blockhornstudios@gmail.com`);
    console.log(`Link: ${process.env.FRONTEND_URL}/invoices/verify/${invoice.secure_token}`);

  } catch (error: any) {
    console.error('❌ Error en simulación:', error.message);
  }
}

runSecureSimulation();
