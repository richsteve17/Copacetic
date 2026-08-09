export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export const OPENROUTER_API_KEY_STORAGE_KEY = 'copacetic_openrouter_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(OPENROUTER_API_KEY_STORAGE_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(OPENROUTER_API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(OPENROUTER_API_KEY_STORAGE_KEY);
  }
}

// Latest flagship mapping for OpenRouter API endpoints
export const DEFAULT_MODEL_MAP: Record<string, string> = {
  chatgpt: 'openai/gpt-4o',
  claude: 'anthropic/claude-3.7-sonnet',
  deepseek: 'deepseek/deepseek-r1',
  gemini: 'google/gemini-2.5-flash',
  grok: 'x-ai/grok-2-1212',
  kimi: 'moonshotai/kimi-k1.5',
  qwen: 'qwen/qwen-2.5-72b-instruct',
};

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenRouter models: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn('Could not fetch OpenRouter model list, using defaults:', error);
    return [];
  }
}

export async function streamOpenRouterCompletion({
  apiKey,
  modelId,
  prompt,
  systemPrompt,
  onToken,
  onError,
}: {
  apiKey: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  onToken: (chunk: string) => void;
  onError: (error: Error) => void;
}): Promise<string> {
  let fullText = '';
  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://richsteve17.github.io/Copacetic/',
        'X-Title': 'COPACETIC AI Tone Simulator',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `OpenRouter API returned ${response.status}`;
      throw new Error(msg);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.substring(6));
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              onToken(delta);
            }
          } catch (e) {
            // Ignore partial JSON parse chunks
          }
        }
      }
    }
    return fullText;
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError(error);
    throw error;
  }
}
