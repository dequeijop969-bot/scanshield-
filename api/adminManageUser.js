// Vercel Function — permite ao admin (você) buscar um usuário por email
// e dar/retirar plano dele. Protegido por email no servidor.
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

  // Trava de segurança: só o admin pode usar esta função
  if (user.email !== DEV_EMAIL) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { action, targetEmail, planKey } = req.body;

  if (!targetEmail) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    // Busca o usuário-alvo pelo email usando a Admin API
    const { data: usersList, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) throw listError;

    const targetUser = usersList.users.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado com esse email' });
    }

    if (action === 'lookup') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .single();
      return res.status(200).json({ profile: { ...profile, email: targetUser.email } });
    }

    if (action === 'setPlan') {
      if (!VALID_PLANS.includes(planKey)) {
        return res.status(400).json({ error: 'Plano inválido' });
      }
      const updates = planKey === null
        ? { is_premium: false, plan_name: null }
        : { is_premium: true, plan_name: planKey };

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', targetUser.id)
        .select()
        .single();
      if (updateError) throw updateError;

      return res.status(200).json({ profile: { ...updated, email: targetUser.email } });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (error) {
    console.error('Erro no painel admin:', error);
    return res.status(500).json({ error: error.message });
  }
}
