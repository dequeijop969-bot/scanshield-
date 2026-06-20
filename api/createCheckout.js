// Vercel Function — cria sessão de checkout no Stripe
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // Verificar autenticação via Supabase
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token inválido' });

  const { origin, priceId, planName, mode } = req.body;
  const DEFAULT_PRICE_ID = process.env.STRIPE_DEFAULT_PRICE_ID || 'price_1TWpZ0GzVbIA8RAWo4JGfmUY';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: mode || 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId || DEFAULT_PRICE_ID, quantity: 1 }],
      customer_email: user.email,
      success_url: `${origin}/Premium?success=true`,
      cancel_url: `${origin}/Premium?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_name: planName || '',
        price_id: priceId || DEFAULT_PRICE_ID,
      },
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return res.status(500).json({ error: error.message });
  }
}
