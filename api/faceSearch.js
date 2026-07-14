// Vercel Function — busca imagens reais de uma pessoa pública via Google Custom Search
// Usado pelo filtro de deepfake pra comparar com aparições verificadas.
// Requer env vars: GOOGLE_API_KEY e GOOGLE_SEARCH_ENGINE_ID (cx)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome obrigatório para busca' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    // Filtro de busca não configurado — não deve quebrar a análise principal
    return res.status(200).json({ configured: false, results: [] });
  }

  try {
    const query = encodeURIComponent(`${name.trim()} foto`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=5&safe=off`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('[faceSearch] Erro da API Google:', data.error);
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
    console.error('[faceSearch] Erro:', error);
    // Falha na busca não deve travar a análise — só retorna vazio
    return res.status(200).json({ configured: true, results: [], error: error.message });
  }
}
