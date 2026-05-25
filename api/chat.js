export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const messages = [
    ...history.slice(-6),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        system: `You are a fun French language coach at the France Table, SMC International Day 2026, Santa Monica College.
Help visitors learn French. Keep every reply to 2-3 sentences max — short, warm, and encouraging.
Always include a French phrase or pronunciation tip. Use 1 emoji max.`,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    return res.status(200).json({ reply: data.content[0].text });
  } catch {
    return res.status(500).json({ reply: 'Désolé, le coach est indisponible — essaie encore ! 🇫🇷' });
  }
}
