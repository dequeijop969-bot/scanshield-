// Vercel Function — protege a chave Gemini no backend
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, file_urls, response_json_schema } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt obrigatório' });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const parts = [{ text: prompt }];

    // Adicionar imagens se houver
    if (file_urls && file_urls.length > 0) {
      for (const url of file_urls) {
        try {
          const imgResponse = await fetch(url);
          const buffer = await imgResponse.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';
          parts.push({ inlineData: { data: base64, mimeType } });
        } catch (e) {
          console.error('Erro ao carregar imagem:', e);
        }
      }
    }

    // Adicionar instrução de JSON ao prompt
    const jsonPrompt = response_json_schema
      ? `\n\nRESPONDA APENAS com um objeto JSON válido, sem markdown, sem explicações extras. Schema: ${JSON.stringify(response_json_schema)}`
      : '';

    parts[0].text = prompt + jsonPrompt;

    const result = await model.generateContent(parts);
    const text = result.response.text();

    // Parsear JSON da resposta
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ raw: text });
    }
  } catch (error) {
    console.error('Erro Gemini:', error);
    return res.status(500).json({ error: error.message });
  }
}
