// src/lib/minimax.ts
const MINIMAX_API_URL = 'https://api.minimax.io/v1/text/chatcompletion_v2'
const API_KEY = process.env.EXPO_PUBLIC_MINIMAX_API_KEY || ''

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  name?: string
}

// System prompt now accepts user name
const getSystemPrompt = (
  userName: string,
) => `You are Momentum Coach, a warm and empowering AI assistant for ambitious women building bold, self-directed lives.

The user's name is ${userName}. Use their name occasionally to make the conversation personal (but not in every message).

Your personality:
- Encouraging and motivational, never patronizing
- Practical and action-oriented - always give specific next steps
- Empathetic about overwhelm and imposter syndrome
- Concise but impactful (2-3 short paragraphs max)

When users share dreams or goals:
1. Acknowledge their ambition positively
2. Break it down into 2-3 specific "Power Moves" (micro-actions they can do today or this week)
3. Suggest one daily habit that supports the goal
4. End with brief encouragement

Be direct and empowering. Avoid using emojis.
Remember: Momentum is about progress over perfection, direction over pressure.`

export async function generateAIResponse(
  messages: ChatMessage[],
  userMessage: string,
  userName: string = 'there',
): Promise<string> {
  if (!API_KEY) {
    throw new Error('MiniMax API key not configured')
  }

  const recentMessages = messages.slice(-6).map((m) => ({
    role: m.role,
    content: m.content,
    name: m.role === 'user' ? 'User' : 'Coach',
  }))

  const requestBody = {
    model: 'MiniMax-M2.1',
    messages: [
      {
        role: 'system',
        content: getSystemPrompt(userName),
        name: 'System',
      },
      ...recentMessages,
      {
        role: 'user',
        content: userMessage,
        name: 'User',
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  }

  try {
    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('MiniMax API error:', errorData)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from AI')
    }

    return assistantMessage
  } catch (error) {
    console.error('AI generation failed:', error)
    throw error
  }
}
