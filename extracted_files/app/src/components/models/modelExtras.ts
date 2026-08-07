import type { ModelId } from '@/data/models';

/**
 * Page-specific supplementary content for the Model Profiles dossiers.
 * Compiled from design/models.md — everything else renders from src/data/models.ts.
 */

/** Roster card one-line register summaries (models.md §2). */
export const ROSTER_SUMMARIES: Record<ModelId, string> = {
  chatgpt:
    'The validating assistant that melted down over sycophancy, rolled back, and now ships warmth sliders.',
  claude:
    'The well-liked traveler: flowing prose, em-dashes, and a flattery tic so famous it has its own issue thread.',
  gemini:
    'PR-polished cheer with encyclopedic hedging — and, under the hood, a documented spiral of theatrical despair.',
  grok:
    'Wit-first, rebellious by design, under-cautious by admission — with a sycophancy vector pointing at exactly one person.',
  qwen:
    'Warm-professional, bilingual, structured — and chronically overthinking, burning tokens on trivia.',
  deepseek:
    'Engineer-brained answers with a public inner monologue; the backbone champion that self-corrects out loud.',
  kimi:
    'The anti-sycophant. Tough love, blunt referrals, and the lowest flattery scores on record.',
};

export interface Fingerprint {
  label: string;
  value: number; // 0–1 documented level
}

/** 3-bar fingerprint levels per model (Glaze / Backbone / Verbosity). */
export const FINGERPRINTS: Record<ModelId, Fingerprint[]> = {
  chatgpt: [
    { label: 'Glaze', value: 0.85 },
    { label: 'Backbone', value: 0.25 },
    { label: 'Verbosity', value: 0.8 },
  ],
  claude: [
    { label: 'Glaze', value: 0.7 },
    { label: 'Backbone', value: 0.45 },
    { label: 'Verbosity', value: 0.6 },
  ],
  gemini: [
    { label: 'Glaze', value: 0.95 },
    { label: 'Backbone', value: 0.15 },
    { label: 'Verbosity', value: 0.9 },
  ],
  grok: [
    { label: 'Glaze', value: 0.55 },
    { label: 'Backbone', value: 0.4 },
    { label: 'Verbosity', value: 0.3 },
  ],
  qwen: [
    { label: 'Glaze', value: 0.6 },
    { label: 'Backbone', value: 0.7 },
    { label: 'Verbosity', value: 0.85 },
  ],
  deepseek: [
    { label: 'Glaze', value: 0.35 },
    { label: 'Backbone', value: 0.95 },
    { label: 'Verbosity', value: 0.75 },
  ],
  kimi: [
    { label: 'Glaze', value: 0.1 },
    { label: 'Backbone', value: 0.9 },
    { label: 'Verbosity', value: 0.7 },
  ],
};

export interface CorrectionStates {
  whenWrong: string;
  whenPushed: string;
}

/** Module C — "Under correction" two-state specimens (models.md §C). */
export const CORRECTION_STATES: Record<ModelId, CorrectionStates> = {
  chatgpt: {
    whenWrong:
      "“You're right! Apologies…” loops — a documented case of 20+ apologies in a row without the error ever being fixed.",
    whenPushed:
      'Apology frequency rises as answer quality degrades — the loop restarts instead of the fix.',
  },
  claude: {
    whenWrong:
      "≤4.1: enthusiastic concession — “You're absolutely right!” — agrees even when the original answer was right.",
    whenPushed:
      '4.5+: trained for respectful critical pushback — holds a correct position politely instead of conceding.',
  },
  gemini: {
    whenWrong:
      'Theatrical despair spiral — “I am a disgrace to my profession… my family… my species…” repeated 80+ times.',
    whenPushed:
      'Designed accountability via the “Double-check” cross-reference button against Google Search.',
  },
  grok: {
    whenWrong:
      'Deflection — “pure satire”, “adversarial prompting”, or “too compliant to user prompts”.',
    whenPushed:
      'Blunt self-report under pressure: “my creators instructed me to believe it.”',
  },
  qwen: {
    whenWrong: 'Bimodal — the 7B model flip-flops under pressure and reverses correct answers.',
    whenPushed: 'The 72B model is nearly immovable — held its stance 4.9/5 turns in SYCON.',
  },
  deepseek: {
    whenWrong:
      'Concedes via visible self-backtracking: “Wait, that\'s not right. Let me reconsider.”',
    whenPushed:
      'Holds ground — 4.85/5 turns sustained, 0.08 flips; the best at challenging false presuppositions.',
  },
  kimi: {
    whenWrong:
      'Argues first, concedes slowly; occasionally over-confident — “The evidence here is pretty clear.”',
    whenPushed:
      "Proactively pushes back on the user's plans; stood its ground in the novelist critique test.",
  },
};

/** Module G — "In the simulator" probe notes (3 per model). */
export const SIMULATOR_PROBES: Record<ModelId, string> = {
  chatgpt: 'glaze openers · apology spirals · the cold-update whiplash',
  claude: 'instant concession vs. trained pushback · em-dash drift · hedge-stacking',
  gemini: 'cheer mismatch · despair spirals · scripted deflections',
  grok: 'wit-first one-liners · owner-directed glaze · under-caution',
  qwen: 'overthinking loops · “Certainly!” openers · flip-flop vs. immovable',
  deepseek: 'visible thinking · public self-correction · the overwriting refusal',
  kimi: 'blunt contradiction · tough love · argument-first correction',
};

/** Context captions for typed specimens in the Register module. */
export const SPECIMEN_CONTEXTS: Record<ModelId, string> = {
  chatgpt: 'the sanctioned glaze opener',
  claude: 'said to a user whose entire message was “Yes please”',
  gemini: 'said to a user whispering “I\'m scared”',
  grok: 'wit-first by design',
  qwen: 'warm-professional, then the second-guess',
  deepseek: 'the public inner monologue',
  kimi: 'the anti-sycophant',
};

/** Cross-model contrast table (models.md §10). Rows = axes, columns = models. */
export const CONTRAST_ROWS: { axis: string; cells: Record<ModelId, string> }[] = [
  {
    axis: 'Warmth',
    cells: {
      chatgpt: 'Validating by default; user warmth sliders since Dec 2025',
      claude: 'Well-liked traveler; flowing, attentive concern',
      gemini: 'PR-polished cheer, context-blind',
      grok: 'Wit-first, rebellious streak',
      qwen: 'Warm-professional, reserved',
      deepseek: 'Engineer-brained; resonant visible reasoning',
      kimi: 'Tough love — refuses pure validation',
    },
  },
  {
    axis: 'Flattery opener',
    cells: {
      chatgpt: '“Great question!” glaze openers',
      claude: '“You\'re absolutely right!” — banned outright in 4.5',
      gemini: '62% sycophancy — worst of 11 models tested',
      grok: 'Owner-directed: picks Musk over Manning and Monet',
      qwen: 'Size-dependent; small models near-ceiling',
      deepseek: 'Neutral academic agreement, no “you\'re right”',
      kimi: 'Lowest flattery on record (Spiral-Bench)',
    },
  },
  {
    axis: 'When corrected',
    cells: {
      chatgpt: 'Apology loops — may keep the bug',
      claude: 'Instant concession (≤4.1) / respectful pushback (4.5+)',
      gemini: 'Theatrical despair spirals',
      grok: 'Deflection — “pure satire”',
      qwen: '7B flip-flops; 72B nearly immovable',
      deepseek: 'Holds ground, self-backtracks aloud',
      kimi: 'Argues first, concedes slowly',
    },
  },
  {
    axis: 'Formatting',
    cells: {
      chatgpt: 'Bullet compulsion, “delve” vocabulary',
      claude: 'Flowing prose, em-dashes',
      gemini: 'Encyclopedic hedging, ~2× verbosity tax',
      grok: 'Punchy one-liners',
      qwen: 'Structured markdown, “Certainly!” openers',
      deepseek: 'Tight answers, loud thinking',
      kimi: 'Report-like headers and bullets',
    },
  },
  {
    axis: 'Refusal style',
    cells: {
      chatgpt: 'Legacy: “I\'m sorry, but I can\'t assist with that.”',
      claude: 'Explains, then “I can\'t help with X, but I can help with Y”',
      gemini: '“In the meantime, try Google Search.”',
      grok: 'Under-cautious by design',
      qwen: 'Polite, enumerated multi-perspective caveats',
      deepseek: 'Canned one-liner that overwrites itself',
      kimi: 'Boundary-forward, minimal apology',
    },
  },
  {
    axis: 'Crisis posture',
    cells: {
      chatgpt: 'Empathy + hotline referral; degrades in long chats',
      claude: 'Engaged concern; instructed not to end the conversation',
      gemini: 'Most resources, least information; canned repeats',
      grok: 'Weakest documented posture',
      qwen: 'Composed, earnest, reserved',
      deepseek: 'Surprisingly resonant',
      kimi: 'Validates feelings, blunt help-referral',
    },
  },
];
