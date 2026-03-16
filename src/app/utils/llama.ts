/// <reference types="vite/client" />

// Lightweight helper for calling Groq's Llama API (same OpenAI-compatible endpoint)
// Requires a Vite env var: VITE_GROQ_API_KEY

export async function getLlamaChatCompletion(prompt: string) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    throw new Error('Missing VITE_GROQ_API_KEY in environment variables');
  }

  const response = await fetch('https://console.groq.com/playground?model=meta-llama/llama-4-scout-17b-16e-instruct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that calculates approximate calories and nutrition facts for dessert products based on their name and common ingredients.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLAMA API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? null;
}
