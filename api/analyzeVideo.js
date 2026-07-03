// Vercel Function — análise de vídeo usando Gemini File API
// Apaga o vídeo do Storage após analisar pra não desperdiçar espaço
import { createClient } from '@supabase/supabase-js';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

const MAX_MB = 100;

function extractStoragePath(url) {
  try {
    const match = url.match(/\/object\/public\/(.+)$/);
    if (!match) return null;
    const parts = match[1].split('/');
    return { bucket: parts[0], filePath: parts.slice(1).join('/') };
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { prompt, video_url, response_json_schema } = req.body;
  if (!prompt || !video_url) return res.status(400).json({ error: 'Prompt e vídeo são obrigatórios' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  let tmpFilePath = null;

  try {
    // 1. Baixar o vídeo do Supabase Storage
    const videoResponse = await fetch(video_url);
    if (!videoResponse.ok) throw new Error('Não foi possível acessar o vídeo. Tente novamente.');

    const buffer = await videoResponse.arrayBuffer();
    const sizeMB = buffer.byteLength / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      return res.status(400).json({ error: `Vídeo muito grande (${sizeMB.toFixed(1)}MB). Limite: ${MAX_MB}MB.` });
    }

    // Detectar tipo correto
    const contentType = videoResponse.headers.get('content-type') || '';
    let mimeType = 'video/mp4';
    if (contentType.includes('video/')) mimeType = contentType.split(';')[0].trim();
    else if (video_url.endsWith('.mov')) mimeType = 'video/quicktime';
    else if (video_url.endsWith('.webm')) mimeType = 'video/webm';
    else if (video_url.endsWith('.avi')) mimeType = 'video/x-msvideo';

    // 2. Salvar temporariamente no disco (necessário para a File API)
    tmpFilePath = join(tmpdir(), `scanshield-${Date.now()}.tmp`);
    await writeFile(tmpFilePath, Buffer.from(buffer));

    // 3. Upload para a File API do Gemini (única forma de enviar vídeo)
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const uploadResult = await fileManager.uploadFile(tmpFilePath, {
      mimeType,
      displayName: `scanshield-video-${Date.now()}`,
    });

    // 4. Aguardar processamento
    let file = uploadResult.file;
    let attempts = 0;
    while (file.state === FileState.PROCESSING && attempts < 20) {
      await new Promise(r => setTimeout(r, 3000));
      file = await fileManager.getFile(file.name);
      attempts++;
    }

    if (file.state === FileState.FAILED || file.state === FileState.PROCESSING) {
      throw new Error('Falha ao processar o vídeo. Tente com um arquivo menor.');
    }

    // 5. Analisar com Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // 1.5-flash tem melhor suporte a vídeo
    const jsonInstruction = response_json_schema
      ? `\n\nRESPONDA APENAS com um objeto JSON válido, sem markdown, sem explicações extras. Schema: ${JSON.stringify(response_json_schema)}`
      : '';

    const result = await model.generateContent([
      { text: prompt + jsonInstruction },
      { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
    ]);

    const text = result.response.text();

    // 6. Apagar arquivo da File API do Gemini (boa prática)
    try { await fileManager.deleteFile(file.name); } catch {}

    // 7. Parsear resposta
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return res.status(200).json(JSON.parse(clean));
    } catch {
      return res.status(200).json({ raw: text });
    }

  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao analisar o vídeo.' });

  } finally {
    // Limpar arquivo temporário
    if (tmpFilePath) try { await unlink(tmpFilePath); } catch {}

    // Apagar do Supabase Storage
    try {
      const pathInfo = extractStoragePath(video_url);
      if (pathInfo) {
        await supabase.storage.from(pathInfo.bucket).remove([pathInfo.filePath]);
      }
    } catch (e) { console.warn('Erro na limpeza do Storage:', e.message); }
  }
}
