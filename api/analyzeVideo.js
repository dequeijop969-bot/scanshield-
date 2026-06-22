// Vercel Function — análise de vídeo usando Gemini File API
// Suporta vídeos de até 100MB (limite configurável)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // só recebe a URL, não o arquivo em si
    },
  },
};

const MAX_MB = 100;

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

    // ─── Baixar o vídeo do Supabase Storage ───────────────────────────────────
    const videoResponse = await fetch(video_url);
    if (!videoResponse.ok) throw new Error('Não foi possível acessar o vídeo enviado');

    const buffer = await videoResponse.arrayBuffer();
    const sizeMB = buffer.byteLength / (1024 * 1024);

    if (sizeMB > MAX_MB) {
      return res.status(400).json({
        error: `Vídeo muito grande (${sizeMB.toFixed(1)}MB). O limite é ${MAX_MB}MB.`,
      });
    }

    const mimeType = videoResponse.headers.get('content-type') || 'video/mp4';

    // ─── Upload para a File API do Gemini ─────────────────────────────────────
    // A File API aceita até 2GB e é a forma recomendada para vídeos
    const fileManager = genAI.getFileManager?.();

    let videoPart;

    if (fileManager && sizeMB > 15) {
      // Vídeos maiores: usa File API (upload temporário, fica disponível por 48h)
      const blob = new Blob([buffer], { type: mimeType });
      const uploadResult = await fileManager.uploadFile(blob, {
        mimeType,
        displayName: `scanshield-video-${Date.now()}`,
      });

      // Aguarda o arquivo ficar pronto (processamento do Gemini)
      let file = uploadResult.file;
      let attempts = 0;
      while (file.state === 'PROCESSING' && attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        file = await fileManager.getFile(file.name);
        attempts++;
      }

      if (file.state !== 'ACTIVE') {
        throw new Error('Falha ao processar o vídeo. Tente novamente.');
      }

      videoPart = { fileData: { mimeType: file.mimeType, fileUri: file.uri } };
    } else {
      // Vídeos menores (até 15MB): passa inline pra ser mais rápido
      const base64 = Buffer.from(buffer).toString('base64');
      videoPart = { inlineData: { data: base64, mimeType } };
    }

    // ─── Chamar o modelo ──────────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const jsonInstruction = response_json_schema
      ? `\n\nRESPONDA APENAS com um objeto JSON válido, sem markdown, sem explicações extras. Schema: ${JSON.stringify(response_json_schema)}`
      : '';

    const result = await model.generateContent([
      { text: prompt + jsonInstruction },
      videoPart,
    ]);

    const text = result.response.text();

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return res.status(200).json(JSON.parse(clean));
    } catch {
      return res.status(200).json({ raw: text });
    }
  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
    return res.status(500).json({ error: error.message });
  }
}
