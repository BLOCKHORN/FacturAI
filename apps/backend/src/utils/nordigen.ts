import NordigenClient from 'nordigen-node';

const secretId = process.env.NORDIGEN_SECRET_ID || '73268800-474c-474c-8f9f-5c206983758b';
const secretKey = process.env.NORDIGEN_SECRET_KEY || '62d3a39e768e185070e1768e185070e1768e185070e1768e185070e1768e1850';

export const nordigen = new NordigenClient({
  secretId,
  secretKey
});

export async function createBankRequisition(institutionId: string, userId: string, redirectUrl: string) {
  console.log(`[NORDIGEN] 🚀 Creating requisition for ${institutionId} (User: ${userId})`);
  
  if (!process.env.NORDIGEN_SECRET_ID || !process.env.NORDIGEN_SECRET_KEY) {
    console.warn('[NORDIGEN] ⚠️ Missing credentials in ENV. Using hardcoded dev keys.');
  }

  try {
    // 1. Get access token
    console.log('[NORDIGEN] 🔑 Generating token...');
    await nordigen.generateToken();
    
    // 2. Create requisition
    console.log('[NORDIGEN] 📝 Sending createRequisition request...');
    const requisition = await nordigen.requisition.createRequisition({
      redirect: redirectUrl,
      institutionId: institutionId,
      reference: userId,
      agreement: null,
      userLanguage: 'ES'
    });

    console.log('[NORDIGEN] ✅ Requisition created:', requisition.id);
    return requisition;
  } catch (error: any) {
    console.error('[NORDIGEN] ❌ Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.summary || error.message);
  }
}
