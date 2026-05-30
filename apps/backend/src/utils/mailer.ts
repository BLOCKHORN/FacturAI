import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(data: any) {
  const { recipientEmail, invoiceNumber, sellerName, pdfBuffer, xmlBuffer } = data;

  try {
    const response = await resend.emails.send({
      from: 'FacturAI <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Nueva Factura de ${sellerName} - ${invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h2 style="color: #0E1117; font-size: 24px; margin-bottom: 20px;">Nueva factura recibida</h2>
          <p style="font-size: 16px; line-height: 1.5;">Hola,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            Has recibido una nueva factura electrónica de <strong>${sellerName}</strong>.
          </p>
          <div style="background: #F9FAFB; padding: 20px; border-radius: 0; margin: 30px 0;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #666; padding-bottom: 8px;">Número de factura:</td>
                <td style="text-align: right; font-weight: bold;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="color: #666;">Emisor:</td>
                <td style="text-align: right; font-weight: bold;">${sellerName}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
            Adjunto a este email encontrarás la factura en formato <strong>PDF</strong> (para tu archivo visual) 
            y en formato <strong>XML Facturae</strong> (para su procesamiento automático).
          </p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/invoices/verify/${invoiceNumber}" 
               style="background: #0E1117; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Ver y Gestionar Factura
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            Enviado de forma segura por FacturAI - Sistema VeriFactu Compliance 2026.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
        {
          filename: `${invoiceNumber}.xml`,
          content: xmlBuffer,
        }
      ]
    });
    console.log(`[EMAIL] Resend Response:`, JSON.stringify(response));
    if (response.error) {
       console.error(`[EMAIL] API Error:`, response.error);
    } else {
       console.log(`[EMAIL] Factura ${invoiceNumber} enviada a ${recipientEmail} (ID: ${response.data?.id})`);
    }
  } catch (error) {
    console.error('[EMAIL] Error enviando email:', error);
  }
}

export async function sendInvitationEmail(data: { recipientEmail: string; firmName: string; inviteToken: string }) {
  const { recipientEmail, firmName, inviteToken } = data;
  const inviteUrl = `${process.env.FRONTEND_URL}/auth/accept-invitation?token=${inviteToken}`;

  try {
    const response = await resend.emails.send({
      from: 'FacturAI Audit <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Invitación de Auditoría de Despacho: ${firmName}`,
      html: `
        <div style="font-family: 'Helvetica', sans-serif; color: #0E1117; max-width: 600px; margin: 0 auto; border: 1px solid #1A1D23; padding: 40px; background-color: #0E1117; color: #FFFFFF;">
          <h1 style="color: #00E676; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #00E676; padding-bottom: 10px; margin-bottom: 30px;">
            FacturAI Audit & Compliance
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #E0E0E0;">
            Usted ha sido invitado formalmente por <strong>${firmName}</strong> para vincular su perfil fiscal al sistema de auditoría automatizada.
          </p>
          <div style="background: #1A1D23; padding: 25px; border-left: 4px solid #00E676; margin: 30px 0;">
            <p style="font-size: 14px; color: #AAAAAA; margin: 0 0 10px 0; text-transform: uppercase;">Detalles de la invitación:</p>
            <p style="font-size: 18px; font-weight: bold; margin: 0;">Entidad: ${firmName}</p>
            <p style="font-size: 14px; margin-top: 10px; color: #E0E0E0;">
              Al aceptar esta invitación, su despacho podrá supervisar el cumplimiento de la normativa VeriFactu y automatizar la consolidación de facturas.
            </p>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <a href="${inviteUrl}" 
               style="background: #00E676; color: #0E1117; padding: 18px 35px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
              Aceptar Invitación y Vincular
            </a>
          </div>
          <p style="font-size: 12px; color: #666666; margin-top: 40px; text-align: center;">
            Este enlace de invitación es único y personal. Si usted no esperaba esta invitación, por favor ignórela.
          </p>
          <hr style="border: 0; border-top: 1px solid #1A1D23; margin: 40px 0;">
          <p style="font-size: 10px; color: #444444; text-align: center; letter-spacing: 1px;">
            SISTEMA DE AUDITORÍA INDUSTRIAL-PREMIUM FACTURAI 2026
          </p>
        </div>
      `
    });
    console.log(`[INVITATION] Resend Response:`, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error('[INVITATION] Error sending email:', error);
    throw error;
  }
}
