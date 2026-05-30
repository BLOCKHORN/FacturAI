import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any,
});

export async function deployFoundersProducts() {
  console.log('🚀 Iniciando despliegue de productos Founder en Stripe...');

  try {
    // 1. Producto Alta de Nodo (Pago Único 499€)
    const productAlta = await stripe.products.create({
      name: 'FacturAI: Alta de Nodo Fundador',
      description: 'Acceso vitalicio al Programa de Partners Fundadores y despliegue de infraestructura inicial.',
      metadata: { type: 'founder_setup' }
    });

    const priceAlta = await stripe.prices.create({
      product: productAlta.id,
      unit_amount: 49900, // 499.00€
      currency: 'eur',
    });

    // 2. Producto Licencia Legacy (Mensual 20€)
    const productLegacy = await stripe.products.create({
      name: 'FacturAI: Licencia Legacy Fundador',
      description: 'Suministro de capacidad de auditoría para 1 cliente. Tarifa congelada de por vida.',
      metadata: { type: 'founder_license' }
    });

    const priceLegacy = await stripe.prices.create({
      product: productLegacy.id,
      unit_amount: 2000, // 20.00€
      currency: 'eur',
      recurring: { interval: 'month' }
    });

    console.log('✅ Despliegue completado.');
    return {
      priceIdAlta: priceAlta.id,
      priceIdLegacy: priceLegacy.id
    };
  } catch (error: any) {
    console.error('❌ Error en Stripe Deploy:', error.message);
    throw error;
  }
}

export async function createFounderCheckoutSession(customerEmail: string, priceId: string, successUrl: string, cancelUrl: string) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { type: 'founder_activation' }
  });
}
