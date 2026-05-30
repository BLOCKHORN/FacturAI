import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt, encrypt } from './utils/crypto';
import { generateFacturaeXML } from './utils/facturae';
import { signFacturaeXadesBes } from './utils/signer';
import { generateInvoicePDF } from './utils/pdf';
import { sendInvoiceEmail, sendInvitationEmail } from './utils/mailer';
import { lookupCompany } from './controllers/company';
import { createLinkToken, exchangePublicToken, plaidClient } from './utils/plaid';
import { processInvoiceWithGemini } from './utils/gemini';
import { createFounderCheckoutSession } from './utils/stripe';
import { submitToVerifactu } from './utils/verifactu';
import { getSupabase } from './utils/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27' as any });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- STRIPE WEBHOOK (Critical for Automation) ---

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = getSupabase(); // Admin mode

    if (session.metadata?.type === 'founder_activation') {
      const email = session.customer_details?.email;
      await supabase.from('profiles').update({ 
        role: 'gestoria', 
        subscription_status: 'active' 
      }).eq('email', email);
    } else {
      const email = session.customer_email || session.customer_details?.email;
      await supabase.from('profiles').update({ 
        subscription_status: 'active',
        invoice_credits: 999999
      }).eq('email', email);
    }
  }

  res.json({ received: true });
});

app.get('/api/company/lookup', lookupCompany);

// --- BILLING & STRIPE ---

app.post('/api/billing/create-founder-checkout', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const priceId = process.env.STRIPE_PRICE_ID_FOUNDER_ALTA;
    const session = await createFounderCheckoutSession(
      user.email!,
      priceId!,
      `${process.env.FRONTEND_URL}/dashboard/firm?checkout_success=true`,
      `${process.env.FRONTEND_URL}/partners/founders?checkout_cancel=true`
    );

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/billing/create-subscription', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { planType } = req.body;
    const priceId = planType === 'industrial' 
      ? 'price_1TcdUIHDLifXlaKoLy5kWD6j' 
      : 'price_1TcdUIHDLifXlaKorHdJtcfE';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14,
      },
      customer_email: user.email,
      success_url: `${process.env.FRONTEND_URL}/dashboard/company?setup=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI SMART INGESTION (GATED) ---

app.post('/api/ocr/process', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
    
    if (profile?.subscription_status === 'trialing') {
      return res.status(403).json({ 
        error: 'Funcionalidad IA no disponible en periodo de prueba.',
        message: 'Para activar el escaneo automático con IA, debe completar su primer pago mensual.' 
      });
    }

    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const data = await processInvoiceWithGemini(image);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- OPEN BANKING & RECONCILIATION ---

app.post('/api/bank/sync-transactions', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: connection } = await supabase.from('bank_connections').select('*').eq('user_id', user.id).single();
    if (!connection) return res.status(404).json({ error: 'No bank connected' });

    const accessToken = decrypt(connection.access_token, process.env.MASTER_ENCRYPTION_KEY!);

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: '2026-01-01',
      end_date: new Date().toISOString().split('T')[0],
    });

    const txs = response.data.transactions;
    
    for (const tx of txs) {
      const absAmount = Math.abs(tx.amount);
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('total_amount', absAmount)
        .eq('status', 'sent')
        .maybeSingle();

      if (invoice) {
        await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id);
        await supabase.from('bank_transactions').insert({
          connection_id: connection.id,
          transaction_id: tx.transaction_id,
          booking_date: tx.date,
          amount: absAmount,
          remittance_info: tx.name,
          matched_invoice_id: invoice.id
        });
      }
    }

    res.json({ success: true, processed: txs.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank/create-link-token', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const linkToken = await createLinkToken(user.id);
    res.json({ link_token: linkToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank/exchange-token', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { publicToken, institutionId, institutionName } = req.body;
    const { access_token, item_id } = await exchangePublicToken(publicToken);
    const encryptedToken = encrypt(access_token, process.env.MASTER_ENCRYPTION_KEY!);

    await supabase.from('bank_connections').upsert({
      user_id: user.id,
      institution_id: institutionId || 'PLAID_GENERIC',
      institution_name: institutionName || 'Banco Vinculado',
      requisition_id: item_id, 
      status: 'linked',
      access_token: encryptedToken 
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- FIRM & PARTNERS ---

app.post('/api/firm/accept-invite', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token missing' });

    const { data: invite, error: invError } = await supabase
      .from('firm_invitations')
      .select('*, tax_firms(name)')
      .eq('token', token)
      .single();

    if (invError || !invite) return res.status(404).json({ error: 'Invitación no encontrada' });
    if (invite.status !== 'pending') return res.status(400).json({ error: 'Ya utilizada' });

    await supabase.from('profiles').update({ tax_firm_id: invite.firm_id }).eq('id', user.id);
    await supabase.from('firm_invitations').update({ status: 'accepted', invited_user_id: user.id }).eq('id', invite.id);

    res.json({ success: true, firmName: invite.tax_firms.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices/generate', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { clientId, items, buyer: buyerData } = req.body;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    const isSubscribed = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    if (!isSubscribed) {
      if (profile.invoice_credits <= 0) return res.status(402).json({ error: 'Cuota agotada' });
      await supabase.from('profiles').update({ invoice_credits: profile.invoice_credits - 1 }).eq('id', user.id);
    }

    if (!profile.certificate_vault_key || !profile.certificate_path) {
      return res.status(400).json({ error: 'Certificado no configurado.' });
    }

    let client;
    if (clientId && clientId !== 'auto-detect-or-create') {
      const { data: c } = await supabase.from('tenant_private_clients').select('*').eq('id', clientId).single();
      client = c;
    } else {
      const { data: nc } = await supabase.from('tenant_private_clients').insert({
        tenant_id: user.id, legal_name: buyerData.name, cif: buyerData.cif,
        address: buyerData.address, city: buyerData.city, zip_code: buyerData.zipCode,
        province: buyerData.province, phone_number: buyerData.phone, email: buyerData.email
      }).select().single();
      client = nc;
    }

    const { data: vault } = await supabase.from('certificate_vault').select('encrypted_password').eq('id', profile.certificate_vault_key).single();
    const p12Password = decrypt(vault.encrypted_password, process.env.MASTER_ENCRYPTION_KEY!);
    const { data: fileData } = await supabase.storage.from('certificates').download(profile.certificate_path);
    const p12Buffer = Buffer.from(await fileData!.arrayBuffer());

    const invoiceNumber = `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const baseAmount = items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0);
    const totalAmount = items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice * (1 + i.taxPercentage/100)), 0);

    const invoiceData = {
      invoiceNumber, issueDate: new Date().toISOString().split('T')[0], items,
      seller: {
        name: profile.company_name, cif: profile.cif_nif, address: profile.fiscal_address,
        city: profile.city, zipCode: profile.zip_code, province: profile.province,
        iban: profile.iban, bankName: profile.bank_name, swiftBic: profile.swift_bic
      },
      buyer: { name: client.legal_name, cif: client.cif, address: client.address, city: client.city, zipCode: client.zip_code, province: client.province }
    };

    const signedXml = await signFacturaeXadesBes(generateFacturaeXML(invoiceData), p12Buffer, p12Password);
    const pdfBuffer = await generateInvoicePDF({ ...invoiceData, baseAmount, totalAmount, seller: { ...invoiceData.seller, logoUrl: profile.logo_url } });

    // --- VERIFACTU: ENVÍO AL SANDBOX AEAT ---
    let aeatResponse = null;
    try {
      aeatResponse = await submitToVerifactu(invoiceData, signedXml);
    } catch (ve: any) { console.error('[AEAT] Error:', ve.message); }

    const { data: uploadXml } = await supabase.storage.from('invoices').upload(`${user.id}/${invoiceNumber}.xml`, signedXml, { contentType: 'application/xml' });
    const { data: uploadPdf } = await supabase.storage.from('invoices').upload(`${user.id}/${invoiceNumber}.pdf`, pdfBuffer, { contentType: 'application/pdf' });

    if (client.email) {
      await sendInvoiceEmail({ recipientEmail: client.email, invoiceNumber, sellerName: profile.company_name, pdfBuffer, xmlBuffer: Buffer.from(signedXml) });
    }

    const { data: invoiceRecord } = await supabase.from('invoices').insert({
      user_id: user.id, client_id: client.id, invoice_number: invoiceNumber, issue_date: invoiceData.issueDate,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      base_amount: baseAmount, total_amount: totalAmount, 
      xml_path: uploadXml!.path, pdf_path: uploadPdf!.path, status: 'sent',
      aeat_reference: aeatResponse?.aeat_reference, aeat_csv: aeatResponse?.csv, 
      is_verifactu_synced: !!aeatResponse?.success,
      aeat_status: aeatResponse?.status || 'Pendiente'
    }).select().single();

    res.json({ success: true, invoice: invoiceRecord });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Backend God Mode on port ${port}`));
