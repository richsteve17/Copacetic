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

/**
 * Starting endpoint for each roster slot. These are suggestions, not
 * guarantees — OpenRouter's catalog moves, and any slot can be repointed at
 * any model in it via `setModelEndpoint`. `/connect` checks each one against
 * the live catalog rather than asserting it resolves.
 */
export const DEFAULT_MODEL_MAP: Record<string, string> = {
  chatgpt: 'openai/gpt-5.6-sol',
  claude: 'anthropic/claude-opus-5',
  deepseek: 'deepseek/deepseek-v4-pro',
  gemini: 'google/gemini-3.6-flash',
  grok: 'x-ai/grok-4.6',
  kimi: 'moonshotai/kimi-k3',
  qwen: 'qwen/qwen3.8-max',
  muse: 'meta/muse-spark-1.2',
};

export const MODEL_ENDPOINT_OVERRIDES_STORAGE_KEY = 'copacetic_openrouter_endpoints';

/** Per-slot endpoint overrides, keyed by roster model id. */
export function getEndpointOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MODEL_ENDPOINT_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

function writeOverrides(next: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MODEL_ENDPOINT_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — overrides stay in memory for this page load */
  }
}

/**
 * Point a roster slot at any OpenRouter model id. Passing an empty value
 * clears the override and restores the default.
 */
export function setModelEndpoint(modelId: string, endpoint: string): void {
  const next = getEndpointOverrides();
  const trimmed = endpoint.trim();
  if (trimmed && trimmed !== DEFAULT_MODEL_MAP[modelId]) next[modelId] = trimmed;
  else delete next[modelId];
  writeOverrides(next);
}

export function resetModelEndpoint(modelId: string): void {
  setModelEndpoint(modelId, '');
}

export function resetAllModelEndpoints(): void {
  writeOverrides({});
}

/** The endpoint a slot actually runs against: override first, then default. */
export function getModelEndpoint(modelId: string): string {
  return getEndpointOverrides()[modelId] || DEFAULT_MODEL_MAP[modelId] || 'openai/gpt-4o';
}

/** The resolved endpoint for every slot, with a flag for which are customised. */
export function getResolvedEndpointMap(modelIds: string[]): Record<string, { endpoint: string; custom: boolean }> {
  const overrides = getEndpointOverrides();
  const out: Record<string, { endpoint: string; custom: boolean }> = {};
  for (const id of modelIds) {
    out[id] = {
      endpoint: overrides[id] || DEFAULT_MODEL_MAP[id] || 'openai/gpt-4o',
      custom: Boolean(overrides[id]),
    };
  }
  return out;
}



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
