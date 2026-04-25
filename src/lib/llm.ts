// ============================================================
// Groq LLM Provider — llama-3.3-70b-versatile
// Fast, free, excellent at roleplay & JSON output
// ============================================================
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const MODEL = 'llama-3.3-70b-versatile';

export async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });
  
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });
    
    return completion.choices[0]?.message?.content || '{}';
  } catch (error) {
    console.error('LLM Error:', error);
    return '{}';
  }
}

export async function callLLMChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  temperature: number = 0.9
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: messages as Groq.Chat.ChatCompletionMessageParam[],
      temperature,
      max_tokens: 512,
    });
    
    return completion.choices[0]?.message?.content || "...";
  } catch (error) {
    console.error('LLM Chat Error:', error);
    return "*yawns and looks at you blankly*";
  }
}

export async function analyzeSentiment(text: string): Promise<{ sentiment: string; valence: number; arousal: number; dominance: number }> {
  try {
    const result = await callLLM(
      `Analyze the emotional sentiment of this message. Return JSON only.
Message: "${text}"

Return format: {"sentiment": "happy/sad/angry/loving/anxious/neutral/excited/playful", "valence": 0.0-1.0, "arousal": 0.0-1.0, "dominance": 0.0-1.0}
valence: 0=very negative, 1=very positive
arousal: 0=calm, 1=excited
dominance: 0=submissive, 1=dominant`
    );
    return JSON.parse(result);
  } catch {
    return { sentiment: 'neutral', valence: 0.5, arousal: 0.5, dominance: 0.5 };
  }
}
