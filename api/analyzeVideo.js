// Vercel Function — análise de vídeo (até 1 minuto) usando Gemini
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, video_url, response_json_schema } = req.body;

  if (!prompt || !video_url) {
    return res.status(400).json({ error: 'Prompt e vídeo são obrigatórios' });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    // Baixa o vídeo e converte pra base64 (Gemini aceita vídeo inline até ~20MB,
    // suficiente para até 1 minuto em qualidade razoável)
    const videoResponse = await fetch(video_url);
    if (!videoResponse.ok) throw new Error('Não foi possível acessar o vídeo enviado');

    const buffer = await videoResponse.arrayBuffer();
    const sizeMB = buffer.byteLength / (1024 * 1024);
    if (sizeMB > 20) {
      return res.status(400).json({ error: 'Vídeo muito grande. Envie um vídeo de até 1 minuto.' });
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = videoResponse.headers.get('content-type') || 'video/mp4';

    const jsonInstruction = response_json_schema
      ? `\n\nRESPONDA APENAS com um objeto JSON válido, sem markdown, sem explicações extras. Schema: ${JSON.stringify(response_json_schema)}`
      : '';

    const result = await model.generateContent([
      { text: prompt + jsonInstruction },
      { inlineData: { data: base64, mimeType } },
    ]);

    const text = result.response.text();

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ raw: text });
    }
  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
    return res.status(500).json({ error: error.message });
  }
}
