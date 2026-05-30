import forge from 'node-forge';
import * as xmldsig from 'xmldsigjs';
import * as xades from 'xadesjs';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export async function signFacturaeXadesBes(
  xmlString: string, 
  p12Buffer: Buffer, 
  p12Password: string
): Promise<string> {
  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, p12Password);

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
  if (!keyBag) throw new Error("No se pudo extraer la clave privada del certificado.");
  const privateKeyPem = forge.pki.privateKeyToPem(keyBag.key as forge.pki.PrivateKey);

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  if (!certBag) throw new Error("No se pudo extraer el certificado público del archivo.");
  const certPem = forge.pki.certificateToPem(certBag.cert as forge.pki.Certificate);

  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');

  if (typeof crypto !== 'undefined' && (crypto as any).webcrypto) {
    xades.Application.setEngine('OpenSSL', (crypto as any).webcrypto);
  } else {
    try {
      const nodeCrypto = require('node:crypto');
      xades.Application.setEngine('OpenSSL', nodeCrypto.webcrypto);
    } catch (e) {
      const { Crypto } = require('@peculiar/webcrypto');
      xades.Application.setEngine('OpenSSL', new Crypto());
    }
  }

  const xadesSignature = new xades.SignedXml();
  
  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certBag.cert as forge.pki.Certificate)).getBytes();
  const certUint8 = new Uint8Array(certDer.length);
  for (let i = 0; i < certDer.length; i++) certUint8[i] = certDer.charCodeAt(i);

  const x509 = new xmldsig.X509Certificate(certUint8);
  const key = await x509.exportKey();

  await xadesSignature.Sign(
    { name: "XAdES-BES" }, 
    key,                   
    doc,                   
    {
      references: [
        { hash: "SHA-256", transforms: ["enveloped"] }
      ],
      // @ts-ignore
      signingCertificate: x509
    }
  );

  const signedXml = new XMLSerializer().serializeToString(doc);
  return signedXml;
}
