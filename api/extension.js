// Vercel Function — endpoint único que serve a extensão do Chrome.
// Consolidado num arquivo só (classify + upload + faceSearch) porque o
// plano Hobby da Vercel limita a 12 Serverless Functions por deployment.
//
// Uso: POST /api/extension?action=classify | upload | faceSearch
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { action } = req.query;

  if (action === 'classify') return handleClassify(req, res);
  if (action === 'upload') return handleUpload(req, res);
  if (action === 'faceSearch') return handleFaceSearch(req, res);

  return res.status(400).json({ error: 'Parâmetro "action" inválido. Use classify, upload ou faceSearch.' });
}

// ── CLASSIFICADOR LEVE (estágio 1) ─────────────────────────────────────────
async function handleClassify(req, res) {
  const { image_url } = req.body;
  if (!image_url) return res.status(400).json({ error: 'image_url obrigatório' });

  const CLASSIFY_PROMPT = `Você é um classificador rápido de conteúdo digital brasileiro. Olhe a imagem e diga quais categorias de risco se aplicam. Não escreva laudo, apenas classifique.

Categorias possíveis:
- "golpe": phishing, fraude financeira, golpe do WhatsApp/Pix, pirâmide, engenharia social
- "oferta": produto/anúncio à venda que precisa checar preço e vendedor
- "informacao_falsa": alegação factual, notícia ou dado que pode ser fake news
- "deepfake": rosto humano presente que pode ser sintético/gerado por IA

Retorne TODAS as categorias que se aplicam (pode ser mais de uma), em ordem de relevância. Se nada parecer suspeito, retorne categories vazio e primary "geral".

RESPONDA APENAS com um objeto JSON válido, sem markdown, sem explicações extras. Schema: {"categories": ["golpe"|"oferta"|"informacao_falsa"|"deepfake"], "primary": "golpe"|"oferta"|"informacao_falsa"|"deepfake"|"geral"}`;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    let imagePart;
    try {
      const imgResponse = await fetch(image_url);
      if (!imgResponse.ok) throw new Error(`Falha ao baixar imagem: ${imgResponse.status}`);
      const buffer = await imgResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';
      imagePart = { inlineData: { data: base64, mimeType } };
    } catch (e) {
      console.error('[extension/classify] Erro ao carregar imagem:', e);
      return res.status(200).json({ categories: [], primary: 'geral', skipped: true });
    }

    const result = await model.generateContent([{ text: CLASSIFY_PROMPT }, imagePart]);
    const text = result.response.text();

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      console.error('[extension/classify] Resposta não-JSON do Gemini:', text);
      return res.status(200).json({ categories: [], primary: 'geral' });
    }
  } catch (error) {
    console.error('[extension/classify] Erro Gemini:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ── UPLOAD DE SCREENSHOT DA EXTENSÃO ───────────────────────────────────────
async function handleUpload(req, res) {
  const { image_base64, auth_token } = req.body;
  if (!image_base64) return res.status(400).json({ error: 'image_base64 obrigatório' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
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

    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return res.status(200).json({ file_url: publicUrl });
  } catch (error) {
    console.error('[extension/upload] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ── BUSCA DE FAMOSO (Google Custom Search) ─────────────────────────────────
async function handleFaceSearch(req, res) {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome obrigatório para busca' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    return res.status(200).json({ configured: false, results: [] });
  }

  try {
    const query = encodeURIComponent(`${name.trim()} foto`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=5&safe=off`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('[extension/faceSearch] Erro da API Google:', data.error);
      return res.status(200).json({ configured: true, results: [], error: data.error.message });
    }

    const results = (data.items || []).map((item) => ({
      title: item.title,
      source: item.displayLink,
      link: item.link,
      contextLink: item.image?.contextLink,
    }));

    return res.status(200).json({ configured: true, results });
  } catch (error) {
    console.error('[extension/faceSearch] Erro:', error);
    return res.status(200).json({ configured: true, results: [], error: error.message });
  }
}
