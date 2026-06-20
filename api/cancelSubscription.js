import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Token inválido' });

  const { data: profile } = await supabase.from('profiles').select('subscription_id').eq('id', user.id).single();
  if (!profile?.subscription_id) return res.status(400).json({ error: 'Nenhuma assinatura ativa' });

  try {
    await stripe.subscriptions.update(profile.subscription_id, { cancel_at_period_end: true });
    await supabase.from('profiles').update({ cancel_at_period_end: true }).eq('id', user.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
