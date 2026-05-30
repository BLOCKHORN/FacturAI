import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'development'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export async function createLinkToken(userId: string) {
  try {
    console.log(`[PLAID] Attempting to create link token in ${process.env.PLAID_ENV || 'development'} mode...`);
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'FacturAI Premium',
      products: [Products.Transactions],
      country_codes: [CountryCode.Es],
      language: 'es',
    });
    return response.data.link_token;
  } catch (error: any) {
    const plaidError = error.response?.data;
    console.error('[PLAID] ❌ Link Token Error:', plaidError || error.message);
    throw new Error(plaidError?.error_message || error.message);
  }
}

export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data; // { access_token, item_id }
  } catch (error: any) {
    const plaidError = error.response?.data;
    console.error('[PLAID] ❌ Exchange Error:', plaidError || error.message);
    throw new Error(plaidError?.error_message || error.message);
  }
}
