// Vercel Function — análise de vídeo usando Gemini
// Apaga o vídeo do Supabase Storage automaticamente após analisar
// para não desperdiçar o limite de 1GB do plano gratuito
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const MAX_MB = 100;

// Extrai o path do arquivo a partir da URL pública do Supabase Storage
// Ex: https://xxx.supabase.co/storage/v1/object/public/uploads/userId/123-video.mp4
//  → uploads/userId/123-video.mp4
function extractStoragePath(url) {
  try {
    const match = url.match(/\/object\/public\/(.+)$/);
    if (!match) return null;
    const parts = match[1].split('/');
    const bucket = parts[0];
    const filePath = parts.slice(1).join('/');
    return { bucket, filePath };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, video_url, response_json_schema } = req.body;

  if (!prompt || !video_url) {
    return res.status(400).json({ error: 'Prompt e vídeo são obrigatórios' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let analysisResult = null;

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

    // ─── Passar o vídeo inline para o Gemini ──────────────────────────────────
    const base64 = Buffer.from(buffer).toString('base64');
    const videoPart = { inlineData: { data: base64, mimeType } };

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
      analysisResult = JSON.parse(clean);
    } catch {
      analysisResult = { raw: text };
    }

    return res.status(200).json(analysisResult);

  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
    return res.status(500).json({ error: error.message });

  } finally {
    // ─── Apagar o vídeo do Supabase Storage após a análise ───────────────────
    // Isso garante que o Storage não enche, já que o resultado fica salvo no banco
    try {
      const pathInfo = extractStoragePath(video_url);
      if (pathInfo) {
        const { error: deleteError } = await supabase.storage
          .from(pathInfo.bucket)
          .remove([pathInfo.filePath]);
        if (deleteError) {
          console.warn('Aviso: não foi possível apagar o vídeo do Storage:', deleteError.message);
        } else {
          console.log('Vídeo apagado do Storage com sucesso:', pathInfo.filePath);
        }
      }
    } catch (cleanupError) {
      // Não deixa o erro de limpeza afetar a resposta da análise
      console.warn('Erro na limpeza do Storage:', cleanupError.message);
    }
  }
}
