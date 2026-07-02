// Vercel Function — Gerenciamento de usuários (admin only)
// Segurança em 3 camadas:
// 1. Token JWT válido do Supabase (não dá pra falsificar)
// 2. Email do chamador verificado no servidor (não no navegador)
// 3. role = 'admin' no banco de dados (dupla verificação)
import { createClient } from '@supabase/supabase-js';

const DEV_EMAIL = 'dequeijop969@gmail.com';
const VALID_PLANS = ['iniciante', 'intermediario', 'pro', null];

async function verifyAdmin(supabase, token) {
  // Camada 1: Verifica o JWT
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, reason: 'Token inválido' };

  // Camada 2: Verifica o email no servidor
  if (user.email !== DEV_EMAIL) {
    // Camada 2b: Verifica se foi dado acesso de admin via banco
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return { ok: false, reason: 'Acesso negado' };
    }
  }

  // Camada 3: Confirma role no banco mesmo pra o DEV_EMAIL
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // DEV_EMAIL sempre passa, outros precisam de role = 'admin'
  if (user.email !== DEV_EMAIL && profile?.role !== 'admin') {
    return { ok: false, reason: 'Acesso negado' };
  }

  return { ok: true, user };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const auth = await verifyAdmin(supabase, token);
  if (!auth.ok) return res.status(403).json({ error: auth.reason });

  const { action, targetEmail, targetId, planKey, grantAdmin } = req.body;

  try {
    // ── Listar todos os usuários ─────────────────────────────────
    if (action === 'listUsers') {
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({
        page: 1, perPage: 1000,
      });
      if (listError) throw listError;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const profileMap = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p; });

      const users = authUsers.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        provider: u.app_metadata?.provider || 'email',
        is_premium: profileMap[u.id]?.is_premium || false,
        plan_name: profileMap[u.id]?.plan_name || null,
        role: profileMap[u.id]?.role || 'user',
        monthly_analyses: profileMap[u.id]?.monthly_analyses || 0,
      }));

      return res.status(200).json({ users });
    }

    // ── Buscar usuário por email ─────────────────────────────────
    if (action === 'lookup') {
      if (!targetEmail) return res.status(400).json({ error: 'Email é obrigatório' });
      const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const targetUser = authUsers.users.find(
        u => u.email?.toLowerCase() === targetEmail.toLowerCase()
      );
      if (!targetUser) return res.status(404).json({ error: 'Usuário não encontrado' });
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUser.id).single();
      return res.status(200).json({ profile: { ...profile, email: targetUser.email } });
    }

    // ── Alterar plano ────────────────────────────────────────────
    if (action === 'setPlan') {
      if (!targetId) return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      if (!VALID_PLANS.includes(planKey)) return res.status(400).json({ error: 'Plano inválido' });

      const updates = planKey === null
        ? { is_premium: false, plan_name: null }
        : { is_premium: true, plan_name: planKey };

      const { data: updated, error: updateError } = await supabase
        .from('profiles').update(updates).eq('id', targetId).select().single();
      if (updateError) throw updateError;

      return res.status(200).json({ profile: updated });
    }

    // ── Dar/retirar acesso admin ─────────────────────────────────
    if (action === 'setAdminRole') {
      if (!targetId) return res.status(400).json({ error: 'ID do usuário é obrigatório' });

      // Impede remoção de admin do próprio DEV_EMAIL (segurança extra)
      const { data: targetProfile } = await supabase
        .from('profiles').select('email').eq('id', targetId).single();
      if (targetProfile?.email === DEV_EMAIL && !grantAdmin) {
        return res.status(403).json({ error: 'Não é possível remover o admin principal' });
      }

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ role: grantAdmin ? 'admin' : 'user' })
        .eq('id', targetId)
        .select()
        .single();
      if (updateError) throw updateError;

      return res.status(200).json({ profile: updated });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (error) {
    console.error('Erro no painel admin:', error);
    return res.status(500).json({ error: error.message });
  }
}
