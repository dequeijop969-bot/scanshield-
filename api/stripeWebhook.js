// Vercel Function — webhook do Stripe
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const planName = session.metadata?.plan_name || '';
      const priceId = session.metadata?.price_id || '';

      if (userId) {
        await supabase.from('profiles').update({
          is_premium: true,
          subscription_id: session.subscription,
          subscription_status: 'active',
          plan_name: planName,
          plan_price_id: priceId,
          cancel_at_period_end: false,
        }).eq('id', userId);
        console.log(`Usuário ${userId} ativado como premium`);
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userEmail = customer.email;

      if (userEmail) {
        await supabase.from('profiles').update({
          is_premium: subscription.status === 'active',
          subscription_status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        }).eq('email', userEmail);
      }
    }
  } catch (err) {
    console.error('Erro ao processar webhook:', err);
  }

  return res.status(200).json({ received: true });
}
