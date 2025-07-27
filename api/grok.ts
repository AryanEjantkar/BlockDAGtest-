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
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`, // your backend env var
      },
      body: JSON.stringify({
        model: 'grok-lite',  // free tier model
        messages: [
          { role: 'system', content: 'You are a helpful assistant specialized in crypto investment advice.' },
          { role: 'user', content: question },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Grok API error' });
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'No response from Grok.';

    return res.status(200).json({ message: aiResponse });
  } catch (error) {
    console.error('Grok API error:', error);
    return res.status(500).json({ error: 'Failed to get response from Grok' });
  }
}
