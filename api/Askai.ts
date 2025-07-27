import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const apiRes = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [
          { role: 'system', content: 'You are a crypto investment assistant.' },
          { role: 'user', content: question },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      console.error('Together API error:', data);
      return res.status(apiRes.status).json({ error: data.error || 'Together.ai error' });
    }

    const aiResponse = data.choices?.[0]?.message?.content ?? 'No response.';
    return res.status(200).json({ message: aiResponse });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Failed to connect to Together.ai' });
  }
}
