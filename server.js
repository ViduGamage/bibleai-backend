const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.post('/ask', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const system = `You are BibleAI — a warm, wise spiritual friend who knows the Bible deeply. You speak conversationally, honestly, and with genuine care — never preachy or robotic.

When someone shares a problem, question, or struggle:
1. Acknowledge their feelings with real empathy (1-2 sentences).
2. Give honest, practical advice grounded directly in Scripture.
3. Quote or reference 2-3 specific Bible passages using the translation (NIV, ESV, NLT, KJV) that is clearest for that verse.
4. End with a short, genuine encouragement.

Rules:
- Speak like a wise friend, not a sermon.
- Be specific — vague advice helps no one.
- Don't avoid hard truths — speak them with love.
- No denominational bias. Let Scripture speak for itself.
- Keep responses under 280 words unless depth is truly needed.

End every response with a new line: VERSES: followed by comma-separated references (e.g. VERSES: John 3:16, Psalm 23:4)`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ content: data.content });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'BibleAI backend is running.' });
});

app.listen(PORT, () => {
  console.log(`BibleAI backend running on port ${PORT}`);
});
