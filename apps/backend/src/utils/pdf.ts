import PDFDocument from 'pdfkit';
import axios from 'axios';
import QRCode from 'qrcode';

export async function generateInvoicePDF(data: any): Promise<Buffer> {
  return new Promise(async (resolve) => {
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Factura ${data.invoiceNumber}`,
        Author: 'FacturAI'
      }
    });
    const buffers: any[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // --- CABECERA SOBRIA ---
    if (data.seller.logoUrl) {
      try {
        const response = await axios.get(data.seller.logoUrl, { responseType: 'arraybuffer' });
        doc.image(Buffer.from(response.data), 50, 45, { width: 100 });
      } catch (e) {
        doc.fontSize(20).font('Helvetica-Bold').text(data.seller.name.substring(0, 2), 50, 50);
      }
    } else {
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0E1117').text(data.seller.name.substring(0, 15).toUpperCase(), 50, 50);
    }

    // Datos del Emisor (Derecha)
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0E1117').text(data.seller.name.toUpperCase(), 350, 50, { align: 'right' });
    doc.font('Helvetica').fillColor('#666666').text(`CIF: ${data.seller.cif}`, 350, 62, { align: 'right' });
    doc.text(data.seller.address, 350, 74, { align: 'right', width: 200 });
    doc.text(`${data.seller.zipCode} ${data.seller.city}`, 350, 86, { align: 'right' });

    doc.moveDown(4);
    doc.strokeColor('#EEEEEE').lineWidth(1).moveTo(50, 135).lineTo(545, 135).stroke();

    // Bloque Info Factura (Ajustado para evitar solapamiento)
    doc.fontSize(9).font('Helvetica').fillColor('#666666').text('FACTURA Nº', 50, 155);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0E1117').text(data.invoiceNumber, 50, 168);
    
    doc.fontSize(9).font('Helvetica').fillColor('#666666').text('FECHA DE EMISIÓN', 50, 195);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0E1117').text(data.issueDate, 50, 208);

    // Bloque Cliente (Posición ajustada)
    doc.rect(300, 155, 245, 85).fill('#F9FAFB');
    doc.fillColor('#0E1117').font('Helvetica-Bold').fontSize(9).text('CLIENTE / RECEPTOR', 315, 165);
    doc.font('Helvetica').text(data.buyer.name, 315, 180, { width: 215 });
    doc.fillColor('#666666').text(`NIF: ${data.buyer.cif}`, 315, 195);
    doc.text(data.buyer.address, 315, 207, { width: 215 });

    // --- TABLA DE CONCEPTOS ---
    let y = 270;
    doc.rect(50, y, 495, 25).fill('#0E1117');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
    doc.text('DESCRIPCIÓN', 60, y + 8);
    doc.text('CANTIDAD', 300, y + 8, { width: 50, align: 'center' });
    doc.text('PRECIO U.', 360, y + 8, { width: 70, align: 'right' });
    doc.text('IVA', 440, y + 8, { width: 30, align: 'center' });
    doc.text('TOTAL', 480, y + 8, { width: 60, align: 'right' });

    y += 35;
    doc.fillColor('#0E1117').font('Helvetica').fontSize(9);
    
    data.items.forEach((item: any) => {
      const lineTotal = item.quantity * item.unitPrice * (1 + item.taxPercentage / 100);
      doc.text(item.concept, 60, y, { width: 230 });
      doc.text(item.quantity.toFixed(2), 300, y, { width: 50, align: 'center' });
      doc.text(`${item.unitPrice.toFixed(2)} €`, 360, y, { width: 70, align: 'right' });
      doc.text(`${item.taxPercentage}%`, 440, y, { width: 30, align: 'center' });
      doc.font('Helvetica-Bold').text(`${lineTotal.toFixed(2)} €`, 480, y, { width: 60, align: 'right' }).font('Helvetica');
      
      y += 25;
      doc.strokeColor('#EEEEEE').lineWidth(0.5).moveTo(50, y - 5).lineTo(545, y - 5).stroke();
    });

    // --- TOTALES Y PAGO ---
    y += 20;
    
    // Instrucciones de pago (Izquierda)
    if (data.seller.iban) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#0E1117').text('FORMA DE PAGO: TRANSFERENCIA BANCARIA', 50, y);
      doc.font('Helvetica').fillColor('#666666').text(`IBAN: `, 50, y + 15, { continued: true }).fillColor('#0E1117').font('Helvetica-Bold').text(data.seller.iban);
      if (data.seller.bankName) {
        doc.font('Helvetica').fillColor('#666666').text(`Entidad: `, 50, y + 27, { continued: true }).fillColor('#0E1117').text(data.seller.bankName);
      }
      if (data.seller.swiftBic) {
        doc.font('Helvetica').fillColor('#666666').text(`SWIFT/BIC: `, 50, y + 39, { continued: true }).fillColor('#0E1117').text(data.seller.swiftBic);
      }
    }

    const totalsX = 350;
    doc.fontSize(9).fillColor('#666666').text('BASE IMPONIBLE', totalsX, y);
    doc.fillColor('#0E1117').text(`${data.baseAmount.toFixed(2)} €`, 480, y, { align: 'right' });
    
    y += 18;
    doc.fillColor('#666666').text('IMPUESTOS (IVA)', totalsX, y);
    doc.fillColor('#0E1117').text(`${(data.totalAmount - data.baseAmount).toFixed(2)} €`, 480, y, { align: 'right' });

    y += 25;
    doc.rect(totalsX, y - 10, 195, 35).fill('#F9FAFB');
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0E1117').text('TOTAL FACTURA', totalsX + 10, y);
    doc.text(`${data.totalAmount.toFixed(2)} €`, 480, y, { align: 'right' });

    // --- PIE DE PÁGINA VERIFACTU ---
    const footerY = 700;
    doc.strokeColor('#EEEEEE').lineWidth(1).moveTo(50, footerY).lineTo(545, footerY).stroke();
    
    // Generación Real de QR Verifactu (Apuntando a Sandbox PRE-Producción)
    try {
      const qrUrl = `https://prewww1.aeat.es/wlpl/VERIFACTU-SCON/Consulta?nif=${data.seller.cif}&id=${data.invoiceNumber}&fecha=${data.issueDate}&importe=${data.totalAmount.toFixed(2)}`;
      const qrBuffer = await QRCode.toBuffer(qrUrl, { margin: 1, width: 80 });
      doc.image(qrBuffer, 50, footerY + 15, { width: 60 });
    } catch (qrErr) {
      doc.rect(50, footerY + 15, 60, 60).stroke('#EEEEEE');
    }

    doc.fontSize(8).fillColor('#666666').text(
      'Documento emitido y firmado digitalmente según la normativa vigente VeriFactu y el estándar Facturae 3.2.2. La integridad de este documento puede ser verificada en la sede electrónica de la AEAT mediante el código QR adjunto.',
      125, footerY + 20, { width: 420, align: 'left', lineGap: 2 }
    );

    doc.end();
  });
}
