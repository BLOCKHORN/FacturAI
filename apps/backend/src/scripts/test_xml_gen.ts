
import { generateFacturaeXML } from '../utils/facturae';
import fs from 'fs';

const mockData = {
  invoiceNumber: 'TEST-001',
  invoiceSeries: '2026-',
  issueDate: '2026-05-28',
  items: [
    { concept: 'Servicios de Consultoria IA', quantity: 1, unitPrice: 100.00, taxPercentage: 21 }
  ],
  seller: {
    name: 'FACTURAI TECH SL',
    cif: 'B12345678',
    address: 'Calle de la Tecnología, 1',
    zipCode: '12001',
    city: 'CASTELLON',
    province: 'CASTELLON'
  },
  buyer: {
    name: 'CLIENTE PRUEBA SA',
    cif: 'A87654321',
    address: 'Avenida del Comercio, 10',
    zipCode: '28001',
    city: 'MADRID',
    province: 'MADRID'
  }
};

async function testValidation() {
  console.log('🧪 Iniciando Generación de XML para Sandbox...');
  const xml = generateFacturaeXML(mockData);
  
  // Guardamos el XML en un archivo para que el usuario pueda subirlo a la AEAT o inspeccionarlo
  const filePath = 'apps/backend/test_invoice.xml';
  fs.writeFileSync(filePath, xml);
  
  console.log(`✅ XML generado con éxito en: ${filePath}`);
  console.log('\n--- VISTA PREVIA DE CABECERA (3.2.2) ---');
  console.log(xml.substring(0, 1000));
  console.log('\n----------------------------------------');
  
  console.log('\n🚀 PRÓXIMO PASO: Validación en Sandbox AEAT');
  console.log('1. Acceder al portal VeriFactu / Sandbox.');
  console.log('2. Cargar este archivo test_invoice.xml.');
  console.log('3. El sistema verificará la estructura y los totales.');
}

testValidation();
