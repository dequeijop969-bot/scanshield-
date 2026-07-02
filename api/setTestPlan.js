// Vercel Function — troca o próprio plano sem pagamento
// Disponível apenas para o DEV_EMAIL e para admins autorizados
import { createClient } from '@supabase/supabase-js';

const DEV_EMAIL = 'dequeijop969@gmail.com';
const VALID_PLANS = ['iniciante', 'intermediario', 'pro', null];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

  // Só DEV_EMAIL ou admins podem usar esta função
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  const isAuthorized = user.email === DEV_EMAIL || profile?.role === 'admin';
  if (!isAuthorized) return res.status(403).json({ error: 'Acesso negado' });

  const { planKey } = req.body;
  if (!VALID_PLANS.includes(planKey)) {
    return res.status(400).json({ error: 'Plano inválido' });
  }

  try {
    const updates = planKey === null
      ? { is_premium: false, plan_name: null }
      : { is_premium: true, plan_name: planKey };

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao trocar plano de teste:', error);
    return res.status(500).json({ error: error.message });
  }
}
