// Vercel Function — classificador leve, usado pela extensão Chrome e pelo
// pipeline "Automático" do site. Mesma lógica do estágio 1 do Analyze.jsx,
// só que como endpoint dedicado (a extensão manda só a URL, não o prompt).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'image_url obrigatório' });
  }

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
      console.error('[classify] Erro ao carregar imagem:', e);
      // Imagem não carregou (ex: bloqueada por CORS/hotlink) — não é risco,
      // apenas não dá pra classificar. Retorna vazio em vez de erro 500.
      return res.status(200).json({ categories: [], primary: 'geral', skipped: true });
    }

    const result = await model.generateContent([{ text: CLASSIFY_PROMPT }, imagePart]);
    const text = result.response.text();

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      // IA não retornou JSON válido — trata como "nada detectado" em vez de
      // quebrar a extensão do usuário
      console.error('[classify] Resposta não-JSON do Gemini:', text);
      return res.status(200).json({ categories: [], primary: 'geral' });
    }
  } catch (error) {
    console.error('[classify] Erro Gemini:', error);
    return res.status(500).json({ error: error.message });
  }
}
