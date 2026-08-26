// Vercel Function — recebe screenshot em base64 da extensão Chrome,
// salva no Supabase Storage e devolve a URL pública. Necessário porque a
// extensão não tem acesso à sessão de auth do navegador nem ao SDK do
// Supabase do frontend (roda em contexto isolado).
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { image_base64, auth_token } = req.body;

  if (!image_base64) {
    return res.status(400).json({ error: 'image_base64 obrigatório' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Identifica o usuário pelo token, se enviado (extensão logada).
    // Se não houver token válido, salva como upload anônimo da extensão.
    let userId = 'extension-anonymous';
    if (auth_token) {
      const { data: { user } } = await supabase.auth.getUser(auth_token);
      if (user) userId = user.id;
    }

    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${userId}/${Date.now()}-extension-scan.png`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, { contentType: 'image/png', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return res.status(200).json({ file_url: publicUrl });
  } catch (error) {
    console.error('[extensionUpload] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
