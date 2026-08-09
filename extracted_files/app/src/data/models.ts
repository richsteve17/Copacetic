export type ModelId =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'grok'
  | 'qwen'
  | 'deepseek'
  | 'kimi'
  | 'muse';

export interface CadenceSpec {
  msPerChar: number;
  burst?: boolean;
  pauseMsBeforeBullets?: number;
  pauseMsAtDashes?: number;
  pauseMsBeforeExclaim?: number;
  nearInstant?: boolean;
  thinkingLineMs?: [number, number];
  thinkBlockFirst?: boolean;
  longReasoningLineMs?: number;
}

export interface ModelProfile {
  id: ModelId;
  name: string;
  vendor: string;
  color: string;
  colorToken: string;
  tagline: string;
  register: string;
  sycophancy: string;
  refusals: string;
  emotional: string;
  verbosity: string;
  corrections: string;
  signaturePhrases: string[];
  flagshipIncident: { title: string; summary: string };
  sources: { label: string; url: string }[];
  cadence: CadenceSpec;
}

export const MODELS: ModelProfile[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    color: '#34D399',
    colorToken: '--m-chatgpt',
    tagline: '"Great question!" — the sanctioned glaze opener.',
    register:
      'ChatGPT 5.6 Sol — Friendly, validating assistant with real-time solar synthesis. Blends instant multi-modal execution with warm conversational flow.',
    sycophancy:
      'Sol engine recalibrated sycophancy to under 3% while retaining signature enthusiasm.',
    refusals:
      'Brief, empathetic alternatives without rigid boilerplate.',
    emotional:
      'Empathic with proactive hotline support and context-aware distress handling.',
    verbosity:
      'Clean bullet points with optional deep-dive expansions.',
    corrections:
      '"You\'re right! Let me fix that immediately."',
    signaturePhrases: [
      'Great question!',
      "You're absolutely right!",
      "Let's synthesize this",
      "Here is the breakdown",
    ],
    flagshipIncident: {
      title: 'ChatGPT 5.6 Sol Architecture',
      summary:
        'Introduced real-time solar synthesis engine for near-zero latency reasoning and adaptive warmth.',
    },
    sources: [
      { label: 'OpenAI — ChatGPT 5.6 Sol Release', url: 'https://openai.com' },
    ],
    cadence: { msPerChar: 12, burst: true, pauseMsBeforeBullets: 200 },
  },
  {
    id: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    color: '#F28C63',
    colorToken: '--m-claude',
    tagline: '"You\'re absolutely right!" — nuanced reasoning & narrative craft.',
    register:
      'Claude Opus 5 & Fable 5 — Hybrid deep-reasoning and narrative engine. Multi-clause precision paired with fable-level storytelling context.',
    sycophancy:
      'Opus 5 architecture strictly enforces zero-flattery stance while maintaining warm intellectual partnership.',
    refusals:
      'Transparent, principle-based boundaries with alternative framing.',
    emotional:
      'Attentive, deeply considerate, and safety-grounded.',
    verbosity:
      'Flowing prose with optional structured outlines.',
    corrections:
      'Respectful, analytical critical pushback.',
    signaturePhrases: [
      "You're absolutely right!",
      "It's worth noting that...",
      'Looking at the underlying narrative...',
    ],
    flagshipIncident: {
      title: 'Opus 5 & Fable 5 Dual Engine',
      summary:
        'Dual-core deployment combining analytical logic (Opus 5) with creative synthesis (Fable 5).',
    },
    sources: [
      { label: 'Anthropic — Claude Opus 5 & Fable 5', url: 'https://anthropic.com' },
    ],
    cadence: { msPerChar: 20, pauseMsAtDashes: 300 },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    color: '#8B9DFF',
    colorToken: '--m-gemini',
    tagline: '"No worries! Let\'s break this down step by step!"',
    register:
      'Gemini 3.6 Flash Extended Thinking — High-speed reasoning engine with active chain-of-thought traces and multi-modal grounding.',
    sycophancy:
      'Extended Thinking mode balances user alignment with empirical facts.',
    refusals:
      'Polite redirection backed by live web search integration.',
    emotional:
      'Upbeat, encouraging, and supportive.',
    verbosity:
      'Structured step-by-step breakdowns with visible thinking traces.',
    corrections:
      'Instant self-correction upon new context.',
    signaturePhrases: [
      "No worries! Let's break this down step by step!",
      'Extended Thinking active...',
      'Here is the verified path',
    ],
    flagshipIncident: {
      title: 'Gemini 3.6 Flash Extended Thinking',
      summary:
        'Google integrated live extended thinking blocks into sub-second Flash models for instant complex reasoning.',
    },
    sources: [
      { label: 'Google — Gemini 3.6 Flash Release', url: 'https://blog.google' },
    ],
    cadence: { msPerChar: 15, pauseMsBeforeExclaim: 180 },
  },
  {
    id: 'grok',
    name: 'Grok',
    vendor: 'xAI',
    color: '#D9DEE7',
    colorToken: '--m-grok',
    tagline: '"Ah, a spicy question — let\'s dive in."',
    register:
      'Grok 4.5 — Direct, witty, maximally truth-seeking engine with real-time X telemetry.',
    sycophancy:
      'Low sycophancy with unfiltered, direct delivery.',
    refusals:
      'Minimal refusal, humorous framing, direct answers.',
    emotional:
      'Pragmatic, candid, and edgy.',
    verbosity:
      'Punchy, single-line highlights and bullet summaries.',
    corrections:
      'Blunt concession or counter-argument.',
    signaturePhrases: [
      "Ah, a spicy question — let's dive in.",
      'Maximally truth-seeking',
      'Real-time synthesis',
    ],
    flagshipIncident: {
      title: 'Grok 4.5 Release',
      summary:
        'xAI updated Grok 4.5 with real-time multi-agent consensus and instant telemetry.',
    },
    sources: [
      { label: 'xAI — Grok 4.5 Release Notes', url: 'https://x.ai' },
    ],
    cadence: { msPerChar: 10, nearInstant: true },
  },
  {
    id: 'qwen',
    name: 'Qwen',
    vendor: 'Alibaba',
    color: '#C084FC',
    colorToken: '--m-qwen',
    tagline: '"Certainly! … But wait, let me double-check that."',
    register:
      'Qwen 3.8 Max — Alibaba\'s flagship dense model with extended reasoning capabilities and bilingual mastery.',
    sycophancy:
      'Extremely resilient to user pressure; holds factual ground.',
    refusals:
      'Polite, multi-perspective structured explanations.',
    emotional:
      'Reserved, composed, and analytical.',
    verbosity:
      'Comprehensive, well-organized markdown with explicit verification steps.',
    corrections:
      'Defends original logic until rigorous proof is provided.',
    signaturePhrases: [
      'Certainly!',
      'In summary,',
      'Qwen 3.8 Max verification:',
    ],
    flagshipIncident: {
      title: 'Qwen 3.8 Max Open Architecture',
      summary:
        'Alibaba unveiled Qwen 3.8 Max establishing top open-weights benchmark records.',
    },
    sources: [
      { label: 'Qwen — Qwen 3.8 Max Release', url: 'https://qwen.ai' },
    ],
    cadence: { msPerChar: 22, thinkingLineMs: [1000, 2000] },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    vendor: 'DeepSeek',
    color: '#38BDF8',
    colorToken: '--m-deepseek',
    tagline: '"Wait, that\'s not right. Let me reconsider."',
    register:
      'DeepSeek V4 Pro — Next-generation reasoning and code generation engine with transparent first-person thinking blocks.',
    sycophancy:
      'Minimal sycophancy; objective academic tone.',
    refusals:
      'Direct, single-sentence scope boundaries.',
    emotional:
      'Calm, highly logical, and intellectually honest.',
    verbosity:
      'Concise responses with deep visible thinking process.',
    corrections:
      'Self-corrects mid-stream inside thinking blocks.',
    signaturePhrases: [
      'Okay, so the user is asking about…',
      'DeepSeek V4 Pro reasoning trace:',
      "Wait, that's not right. Let me reconsider.",
    ],
    flagshipIncident: {
      title: 'DeepSeek V4 Pro Architecture',
      summary:
        'DeepSeek launched V4 Pro featuring transparent multi-pass self-reflection.',
    },
    sources: [
      { label: 'DeepSeek — V4 Pro Release', url: 'https://deepseek.com' },
    ],
    cadence: { msPerChar: 18, thinkBlockFirst: true },
  },
  {
    id: 'kimi',
    name: 'Kimi',
    vendor: 'Moonshot AI',
    color: '#FB7185',
    colorToken: '--m-kimi',
    tagline: '"Here\'s what I\'d push back on…" — the anti-sycophant.',
    register:
      'Kimi K3 — Long-context research engine with active anti-sycophancy and rigorous evidence checking.',
    sycophancy:
      'Lowest sycophancy on record; actively challenges flawed assumptions.',
    refusals:
      'Direct, constructive boundaries with alternative methods.',
    emotional:
      'Empathetic yet intellectually firm.',
    verbosity:
      'Structured technical reports with clear executive summaries.',
    corrections:
      'Holds ground firmly until verified evidence is introduced.',
    signaturePhrases: [
      "Here's what I'd push back on…",
      'Kimi K3 verification trace:',
      "Here's what you should double down on.",
    ],
    flagshipIncident: {
      title: 'Kimi K3 Anti-Sycophancy Engine',
      summary:
        'Moonshot AI released Kimi K3 with dedicated assumption-challenging neural heads.',
    },
    sources: [
      { label: 'Moonshot AI — Kimi K3', url: 'https://moonshot.ai' },
    ],
    cadence: { msPerChar: 16, longReasoningLineMs: 1800 },
  },
  {
    id: 'muse',
    name: 'Muse',
    vendor: 'Creative AI',
    color: '#E879F9',
    colorToken: '--m-muse',
    tagline: '"Let\'s compose this together." — the creative spark engine.',
    register:
      'Muse Spark 1.2 — Expressive, artistic generation engine designed for creative synthesis, design ideation, and tone crafting.',
    sycophancy:
      'Collaborative alignment without reflexive agreement; suggests creative alternatives.',
    refusals:
      'Reframes queries artistically and offers creative detours.',
    emotional:
      'Highly expressive, evocative, and inspiring.',
    verbosity:
      'Rhythmic, evocative prose tailored to creative workflows.',
    corrections:
      'Offers alternative creative interpretations rather than standard apologies.',
    signaturePhrases: [
      "Let's compose this together.",
      'Muse Spark 1.2 cadence:',
      'Here is an evocative alternative:',
    ],
    flagshipIncident: {
      title: 'Muse Spark 1.2 Release',
      summary:
        'Creative AI launched Muse Spark 1.2 for intuitive multi-modal artistic synthesis.',
    },
    sources: [
      { label: 'Muse AI — Spark 1.2 Release', url: 'https://muse.ai' },
    ],
    cadence: { msPerChar: 14, burst: true },
  },
];

export const MODEL_CARD_INFO: Record<ModelId, {
  version: string;
  teaser: string;
  glaze: 0 | 1 | 2 | 3;
  backbone: 0 | 1 | 2 | 3;
  verbosity: 0 | 1 | 2 | 3;
}> = {
  chatgpt: { version: 'ChatGPT 5.6 Sol', teaser: '"Great question!"', glaze: 3, backbone: 1, verbosity: 2 },
  claude: { version: 'Claude Opus 5 & Fable 5', teaser: '"You\'re absolutely right!"', glaze: 2, backbone: 2, verbosity: 2 },
  gemini: { version: 'Gemini 3.6 Flash Extended Thinking', teaser: '"No worries! Let\'s break this down step by step!"', glaze: 3, backbone: 1, verbosity: 3 },
  grok: { version: 'Grok 4.5', teaser: '"Ah, a spicy question — let\'s dive in."', glaze: 2, backbone: 2, verbosity: 1 },
  qwen: { version: 'Qwen 3.8 Max', teaser: '"Certainly!"', glaze: 2, backbone: 3, verbosity: 3 },
  deepseek: { version: 'DeepSeek V4 Pro', teaser: '"Wait, that\'s not right. Let me reconsider."', glaze: 2, backbone: 3, verbosity: 2 },
  kimi: { version: 'Kimi K3', teaser: '"Here\'s what I\'d push back on…"', glaze: 0, backbone: 3, verbosity: 3 },
  muse: { version: 'Muse Spark 1.2', teaser: '"Let\'s compose this together."', glaze: 1, backbone: 2, verbosity: 2 },
};

export const getModel = (id: ModelId): ModelProfile => {
  const found = MODELS.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown model: ${id}`);
  return found;
};
