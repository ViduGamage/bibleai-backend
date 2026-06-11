addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  // Health check
  if (request.method === 'GET') {
    return new Response(JSON.stringify({ status: 'BibleAI backend is running.' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  // Main /ask endpoint
  if (request.method === 'POST') {
    try {
      const body = await request.json()
      const { messages } = body

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
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

End every response with a new line: VERSES: followed by comma-separated references (e.g. VERSES: John 3:16, Psalm 23:4)`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system,
          messages
        })
      })

      const data = await response.json()

      return new Response(JSON.stringify({ content: data.content }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }

  return new Response('Not found', { status: 404 })
}
