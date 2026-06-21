// Vercel Function — exclui a conta do usuário (perfil, análises e login)
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Confirma quem é o usuário a partir do token (evita que alguém apague a conta de outra pessoa)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

  try {
    // Apaga as análises do usuário
    await supabase.from('screen_analyses').delete().eq('user_id', user.id);

    // Apaga o perfil
    await supabase.from('profiles').delete().eq('id', user.id);

    // Apaga o login (auth.users) — requer service_role
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return res.status(500).json({ error: error.message });
  }
}
