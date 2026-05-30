import axios from 'axios';

/**
 * SERVICIO VERIFACTU (SIMULACIÓN AEAT)
 * 
 * Basado en el Portal de Pruebas Externas de la AEAT (PRE-Exteriores)
 */

const AEAT_VERIFACTU_SANDBOX_URL = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroFactEmitidas.wsdl';

export async function submitToVerifactu(invoiceData: any, signedXml: string) {
  console.log(`[VERIFACTU] 🚀 Iniciando envío síncrono al Sandbox (preportal.aeat.es)...`);

  try {
    // SIMULACIÓN DE CONEXIÓN CON preportal.aeat.es
    console.log('[VERIFACTU] 📡 Handshake con Nodo de Preproducción...');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validamos estructura básica
    if (!signedXml.includes('<fe:Facturae')) {
      throw new Error('Incorrecto: Error de esquema XML');
    }

    // Respuesta Síncrona siguiendo el estándar AEAT
    // Correcto: Guardada / AceptadoConErrores: Guardada con avisos / Incorrecto: Rechazada
    const responseStatus = Math.random() > 0.15 ? 'Correcto' : 'AceptadoConErrores';

    console.log(`[VERIFACTU] ✅ altaRegistroFacturaResponse: ${responseStatus}`);
    
    // Generamos la URL de cotejo del Código QR apuntando al entorno de pruebas prewww1.aeat.es
    // Estructura oficial: nif, id (numero), fecha, importe
    const qrVerificationUrl = `https://prewww1.aeat.es/wlpl/VERIFACTU-SCON/Consulta?nif=${invoiceData.seller.cif}&id=${invoiceData.invoiceNumber}&fecha=${invoiceData.issueDate}&importe=${invoiceData.totalAmount.toFixed(2)}`;

    return {
      success: true,
      status: responseStatus,
      aeat_reference: `PRE-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      csv: qrVerificationUrl
    };

  } catch (error: any) {
    console.error('[VERIFACTU] ❌ Incorrecto:', error.message);
    throw new Error(`Rechazo AEAT (Sandbox): ${error.message}`);
  }
}
