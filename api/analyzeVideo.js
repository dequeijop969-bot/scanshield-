// Vercel Function — análise de vídeo via Gemini File API (usando fetch nativo)
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
  maxDuration: 60,
};

const MAX_MB = 100;
const GEMINI_MODEL = 'gemini-1.5-flash';

function extractStoragePath(url) {
  try {
    const match = url.match(/\/object\/public\/(.+)$/);
    if (!match) return null;
    const parts = match[1].split('/');
    return { bucket: parts[0], filePath: parts.slice(1).join('/') };
  } catch { return null; }
}

async function uploadToGeminiFileAPI(buffer, mimeType, apiKey) {
  const numBytes = buffer.byteLength;

  // Iniciar upload resumível
  const initRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(numBytes),
        'X-Goog-Upload-Header-Content-Type': mimeType,
      },
      body: JSON.stringify({ file: { display_name: `scanshield-${Date.now()}` } }),
    }
  );

  if (!initRes.ok) throw new Error(`Falha ao iniciar upload: ${await initRes.text()}`);
  const uploadUrl = initRes.headers.get('x-goog-upload-url');
  if (!uploadUrl) throw new Error('URL de upload não retornada pelo Google');

  // Enviar o arquivo
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': String(numBytes),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: buffer,
  });

  if (!uploadRes.ok) throw new Error(`Falha no upload do vídeo: ${await uploadRes.text()}`);
  const fileData = await uploadRes.json();
  return fileData.file;
}

async function waitForGeminiFile(file, apiKey) {
  let attempts = 0;
  while (file.state === 'PROCESSING' && attempts < 20) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${file.name}?key=${apiKey}`
    );
    if (!res.ok) break;
    const data = await res.json();
    file = data;
    attempts++;
  }
  return file;
}

async function deleteGeminiFile(fileName, apiKey) {
  try {
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`,
      { method: 'DELETE' }
    );
  } catch {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { prompt, video_url, response_json_schema } = req.body;
  if (!prompt || !video_url) return res.status(400).json({ error: 'Prompt e vídeo são obrigatórios' });

  const apiKey = process.env.GEMINI_API_KEY;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  let geminiFileName = null;

  try {
    // 1. Baixar o vídeo do Storage
    const videoResponse = await fetch(video_url);
    if (!videoResponse.ok) throw new Error('Não foi possível acessar o vídeo. Tente novamente.');

    const buffer = await videoResponse.arrayBuffer();
    const sizeMB = buffer.byteLength / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      return res.status(400).json({ error: `Vídeo muito grande (${sizeMB.toFixed(1)}MB). Limite: ${MAX_MB}MB.` });
    }

    // Detectar MIME type
    let mimeType = 'video/mp4';
    const ct = videoResponse.headers.get('content-type') || '';
    if (ct.startsWith('video/')) mimeType = ct.split(';')[0].trim();
    else if (video_url.includes('.mov')) mimeType = 'video/quicktime';
    else if (video_url.includes('.webm')) mimeType = 'video/webm';
    else if (video_url.includes('.avi')) mimeType = 'video/x-msvideo';
    else if (video_url.includes('.mp4')) mimeType = 'video/mp4';

    // 2. Upload para Gemini File API
    let geminiFile = await uploadToGeminiFileAPI(buffer, mimeType, apiKey);
    geminiFileName = geminiFile.name;

    // 3. Aguardar processamento
    geminiFile = await waitForGeminiFile(geminiFile, apiKey);
    if (geminiFile.state === 'FAILED') throw new Error('O Google não conseguiu processar este vídeo. Tente um formato diferente (MP4 recomendado).');

    // 4. Analisar com Gemini
    const jsonInstruction = response_json_schema
      ? `\n\nRESPONDA APENAS com um objeto JSON válido, sem markdown. Schema: ${JSON.stringify(response_json_schema)}`
      : '';

    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt + jsonInstruction },
              { file_data: { mime_type: geminiFile.mimeType, file_uri: geminiFile.uri } },
            ],
          }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!genRes.ok) {
      const errBody = await genRes.text();
      throw new Error(`Erro do Gemini: ${errBody}`);
    }

    const genData = await genRes.json();
    const text = genData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return res.status(200).json(JSON.parse(clean));
    } catch {
      return res.status(200).json({ raw: text, risk_level: 'suspeito', summary: text, red_flags: [] });
    }

  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
    return res.status(500).json({ error: error.message || 'Erro ao analisar o vídeo. Tente novamente.' });

  } finally {
    if (geminiFileName) await deleteGeminiFile(geminiFileName, apiKey);
    try {
      const pathInfo = extractStoragePath(video_url);
      if (pathInfo) await supabase.storage.from(pathInfo.bucket).remove([pathInfo.filePath]);
    } catch {}
  }
}
