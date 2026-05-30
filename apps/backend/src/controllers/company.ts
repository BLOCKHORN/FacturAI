import { Request, Response } from 'express';
import * as cheerio from 'cheerio';
import { getSupabase } from '../utils/supabase';

function validateSpanishID(id: string): boolean {
  const cleanId = id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanId.length !== 9) return false;
  const firstChar = cleanId.charAt(0);
  const lastChar = cleanId.charAt(8);
  if (/^[0-9XYZ]/.test(firstChar)) {
    let number = cleanId.substring(0, 8);
    if (firstChar === 'X') number = '0' + number.substring(1);
    else if (firstChar === 'Y') number = '1' + number.substring(1);
    else if (firstChar === 'Z') number = '2' + number.substring(1);
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return letters.charAt(parseInt(number, 10) % 23) === lastChar;
  }
  if (/^[ABCDEFGHJNPQRSUVW]/.test(firstChar)) {
    const digits = cleanId.substring(1, 8);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let d = parseInt(digits.charAt(i), 10);
      if (i % 2 === 0) {
        d *= 2;
        sum += (d > 9 ? d - 9 : d);
      } else {
        sum += d;
      }
    }
    const controlDigit = (10 - (sum % 10)) % 10;
    const controlLetter = 'JABCDEFGHI'.charAt(controlDigit);
    if (/[KPQS]/.test(firstChar)) return lastChar === controlLetter;
    if (/[ABEH]/.test(firstChar)) return lastChar === controlDigit.toString();
    return lastChar === controlLetter || lastChar === controlDigit.toString();
  }
  return false;
}

export const lookupCompany = async (req: Request, res: Response) => {
  const { cif } = req.query;
  console.log(`[LOOKUP] 🔍 Request received for CIF: ${cif}`);
  if (!cif || typeof cif !== 'string') return res.status(400).json({ error: 'CIF required' });

  const cleanCif = cif.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!validateSpanishID(cleanCif)) return res.status(400).json({ error: 'Invalid ID format' });

  // No necesitamos AUTH para buscar en la base de datos GLOBAL o VIES
  const supabase = getSupabase(req, true); // Usamos Service Role para saltar RLS en global

  console.log('[LOOKUP] 🌐 Checking GLOBAL database');
  const { data: glob, error: globError } = await supabase
    .from('global_verified_companies')
    .select('*')
    .eq('cif', cleanCif)
    .maybeSingle();

  if (glob) {
    console.log('[LOOKUP] ✅ Found in GLOBAL database');
    return res.json({
      cif: glob.cif,
      legal_name: glob.legal_name,
      address: glob.address,
      city: glob.city,
      zip_code: glob.zip_code,
      province: glob.province,
      source: 'global'
    });
  }

  console.log('[LOOKUP] 🔍 Trying LibreBOR Deep Scraping...');
  try {
    const lb = await fetch(`https://librebor.me/borme/empresa/${cleanCif}/`, {
      signal: (AbortSignal as any).timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (lb.ok) {
      const html = await lb.text();
      const $ = cheerio.load(html);
      const name = $('.box-title').text().trim();
      
      // Intentamos extraer la dirección del texto de la página
      // En LibreBOR suele estar en una lista de definiciones <dl>
      let address = '';
      let city = '';
      let zipCode = '';
      let province = '';

      $('dt').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes('domicilio')) {
          const fullAddress = $(el).next('dd').text().trim();
          address = fullAddress;
          
          // Regex para extraer CP y Provincia
          const zipMatch = fullAddress.match(/(\d{5})/);
          if (zipMatch) zipCode = zipMatch[1];
          
          // Intentar deducir provincia si aparece en el texto
          if (fullAddress.toUpperCase().includes('CASTELLON')) province = 'CASTELLON';
          if (fullAddress.toUpperCase().includes('ALICANTE')) province = 'ALICANTE';
        }
      });

      if (name) {
        console.log('[LOOKUP] ✅ Found via LibreBOR Deep Scraping');
        
        // AUTO-HIDRATACIÓN: Si el scraper tiene éxito, guardamos en GLOBAL para el siguiente usuario
        const supabase = getSupabase(req, true);
        await supabase.from('global_verified_companies').upsert({
          cif: cleanCif,
          legal_name: name,
          address: address,
          city: city,
          zip_code: zipCode,
          province: province,
          data_source: 'SCRAPING_REALTIME_SUCCESS'
        });

        return res.json({
          cif: cleanCif,
          legal_name: name,
          address: address,
          city: city,
          zip_code: zipCode,
          province: province,
          source: 'scraping'
        });
      }
    }
  } catch (e: any) {
    console.log(`[LOOKUP] ⚠️ LibreBOR failed: ${e.message}`);
  }

  // Solo si queremos buscar en "Privado", necesitamos Auth
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      console.log(`[LOOKUP] 📂 Checking private clients for user ${user.id}`);
      const { data: priv } = await supabase
        .from('tenant_private_clients')
        .select('*')
        .eq('tenant_id', user.id)
        .eq('cif', cleanCif)
        .maybeSingle();

      if (priv) {
        return res.json({
          cif: priv.cif,
          legal_name: priv.legal_name,
          address: priv.address,
          city: priv.city,
          zip_code: priv.zip_code,
          province: priv.province,
          source: 'private'
        });
      }
    }
  }

  console.log('[LOOKUP] ❌ Not found anywhere');
  return res.status(404).json({ error: 'Not found' });
};
