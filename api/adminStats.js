// Vercel Function — painel admin
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verificar se é admin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Token inválido' });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

  try {
    const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const allSubscriptions = await stripe.subscriptions.list({ limit: 100 });

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const charges = await stripe.charges.list({ created: { gte: thirtyDaysAgo }, limit: 100 });
    const totalRevenue30d = charges.data.filter(c => c.status === 'succeeded').reduce((s, c) => s + c.amount, 0);

    const allCharges = await stripe.charges.list({ limit: 100 });
    const totalRevenueAll = allCharges.data.filter(c => c.status === 'succeeded').reduce((s, c) => s + c.amount, 0);

    const recentSubs = allSubscriptions.data.slice(0, 10).map(s => ({
      id: s.id,
      status: s.status,
      customer: s.customer,
      created: s.created,
      amount: s.items.data[0]?.price?.unit_amount || 0,
    }));

    const customerIds = [...new Set(recentSubs.map(s => s.customer))];
    const customerEmails = {};
    for (const id of customerIds) {
      try {
        const c = await stripe.customers.retrieve(id);
        customerEmails[id] = c.email || id;
      } catch { customerEmails[id] = id; }
    }

    return res.status(200).json({
      active_subscribers: subscriptions.data.length,
      revenue_last_30d: totalRevenue30d,
      revenue_total: totalRevenueAll,
      recent_subscriptions: recentSubs.map(s => ({ ...s, email: customerEmails[s.customer] })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
