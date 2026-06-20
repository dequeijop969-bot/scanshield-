// Vercel Function — envio de email via Resend (grátis até 3000/mês)
// Cadastre em resend.com e pegue sua API key
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, from_name, subject, body } = req.body;

  // Se não tiver RESEND_API_KEY, só loga (não quebra o site)
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email simulado]', { to, subject, body });
    return res.status(200).json({ success: true, simulated: true });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${from_name || 'ScanShield'} <noreply@resend.dev>`,
        to: [to],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    // Não quebra o site se o email falhar
    return res.status(200).json({ success: false, error: error.message });
  }
}
