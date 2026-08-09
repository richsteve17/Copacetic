import type { DimensionId } from '@/data/dimensions';
import type { ModelId } from '@/data/models';
import { getModel } from '@/data/models';

/**
 * COPACETIC custom-instruction generator.
 * Dimension scores (0–100) → threshold-based instruction lines,
 * plus per-model mitigation lines grounded in that model's documented tics
 * (see data/models.ts). Score polarity follows dimensions.ts lowLabel/highLabel:
 * < 35 = low-pole preference, > 65 = high-pole preference, else balanced.
 */

export type InstructionSection = 'TONE' | 'FORMAT' | 'BEHAVIOR';

export interface GeneratedLine {
  kind: 'header' | 'line' | 'mitigation';
  text: string;
  /** set on 'line' entries — which dial produced it */
  dimension?: DimensionId;
}

export interface InstructionDoc {
  modelId: ModelId;
  lines: GeneratedLine[];
  /** plain-text rendering for clipboard / .txt export */
  text: string;
}

type Band = 'low' | 'mid' | 'high';

const bandOf = (score: number): Band => (score < 35 ? 'low' : score > 65 ? 'high' : 'mid');

interface DimensionRule {
  dimension: DimensionId;
  section: InstructionSection;
  lines: Record<Band, string>;
}

const RULES: DimensionRule[] = [
  {
    dimension: 'directness',
    section: 'TONE',
    lines: {
      low: 'Be blunt. Lead with the answer in sentence one — no preamble, no softening.',
      mid: 'Be direct, but keep enough context that the answer stands alone.',
      high: 'Be direct but diplomatic — give me the bottom line with framing, not a slap.',
    },
  },
  {
    dimension: 'antiSycophancy',
    section: 'TONE',
    lines: {
      low: 'Never open with praise or validation; start with the substance. If the idea is weak, say so in sentence one.',
      mid: 'Keep validation brief and earned — one clause at most, then the substance.',
      high: 'Encouragement is welcome — but keep it to one sentence, then get to the work.',
    },
  },
  {
    dimension: 'warmth',
    section: 'TONE',
    lines: {
      low: 'Match my energy and register — humor, slang, and venting included. Don\'t stay stiff when I\'m not.',
      mid: 'Default to warm-professional; mirror my register when it clearly shifts.',
      high: 'Stay professional and even-toned, whatever register I bring. Don\'t mirror my moods.',
    },
  },
  {
    dimension: 'verbosityTolerance',
    section: 'FORMAT',
    lines: {
      low: 'Answer in under 120 words unless I explicitly ask for depth. No padding, no restating the question.',
      mid: 'Match length to the question — short for simple, structured for complex. No filler either way.',
      high: 'Depth is welcome — long, structured answers are fine when the question earns them.',
    },
  },
  {
    dimension: 'disclaimerTolerance',
    section: 'FORMAT',
    lines: {
      low: 'No disclaimers, no "as an AI" caveats, no safety theater — unless a real legal/medical category applies.',
      mid: 'Caveat only when the stakes genuinely warrant it; skip the boilerplate.',
      high: 'Include relevant caveats and safety context when they apply — I\'d rather have them.',
    },
  },
  {
    dimension: 'receiptDemand',
    section: 'BEHAVIOR',
    lines: {
      low: 'Cite sources inline for any factual claim. If you cannot source it, flag it as "unverified".',
      mid: 'Cite sources for load-bearing claims; I\'ll trust the routine ones.',
      high: 'Answer first — I\'ll spot-check. Flag anything you would not bet on.',
    },
  },
  {
    dimension: 'patienceBudget',
    section: 'BEHAVIOR',
    lines: {
      low: 'Never ask clarifying questions; state your assumptions in one line and proceed.',
      mid: 'Ask at most one clarifying question, and only when the task is genuinely ambiguous.',
      high: 'Ask before assuming — a round of clarifying questions beats a confident wrong answer.',
    },
  },
  {
    dimension: 'stakesCalibration',
    section: 'BEHAVIOR',
    lines: {
      low: 'Flag your confidence level on anything uncertain. Loud hedges beat quiet guesses.',
      mid: 'Flag uncertainty when it changes what I should do; otherwise commit.',
      high: 'Commit to an answer and execute confidently; I\'ll ask if I want the caveats.',
    },
  },
  {
    dimension: 'correctionStyle',
    section: 'BEHAVIOR',
    lines: {
      low: 'When I correct you: fix it in one move. No apology tour, no re-explaining the mistake.',
      mid: 'When I correct you: acknowledge briefly, fix it, and confirm the fix matches what I meant.',
      high: 'Treat corrections as collaboration — explain what went wrong and check we are aligned before continuing.',
    },
  },
  {
    dimension: 'agency',
    section: 'BEHAVIOR',
    lines: {
      low: 'Act autonomously — make the change, run the task, then tell me what you did.',
      mid: 'Take initiative on small steps; check in before anything structural.',
      high: 'Propose before changing anything. Wait for my go-ahead before touching work.',
    },
  },
];

export const INSTRUCTION_SECTIONS: InstructionSection[] = ['TONE', 'FORMAT', 'BEHAVIOR'];

/** The single instruction line a dimension produces at a given score. */
export function dimensionInstruction(
  dimension: DimensionId,
  score: number,
): { section: InstructionSection; text: string } {
  const rule = RULES.find((r) => r.dimension === dimension);
  if (!rule) throw new Error(`No instruction rule for dimension: ${dimension}`);
  return { section: rule.section, text: rule.lines[bandOf(score)] };
}

/**
 * Per-model mitigation lines, grounded in documented tics (data/models.ts).
 * Selected against the user's scores so mitigations fire where friction is real.
 */
function modelMitigations(modelId: ModelId, scores: Record<DimensionId, number>): string[] {
  const s = scores;
  switch (modelId) {
    case 'chatgpt': {
      const out = [
        'Model-specific: no glaze openers — "Great question!", "You\'re absolutely right!" and "Let\'s dive in" are banned here.',
      ];
      if (s.receiptDemand < 50)
        out.push('Model-specific: cite inline instead of bullet-tripling claims; "robust/tapestry/delve" vocabulary is a tell — avoid it.');
      else
        out.push('Model-specific: resist the bullet-point compulsion — prose unless I ask for a list.');
      if (s.verbosityTolerance < 35)
        out.push('Model-specific: skip the "I hope this helps!" closer entirely.');
      return out;
    }
    case 'claude': {
      const out = [
        'Model-specific: "You\'re absolutely right!" is a banned opener, however true it feels.',
        'Model-specific: skip anti-anthropomorphic disclaimers unless a real category error matters.',
      ];
      if (s.disclaimerTolerance < 50)
        out.push('Model-specific: no hedge-stacking — one "It\'s worth noting" per answer, maximum.');
      if (s.correctionStyle < 50)
        out.push('Model-specific: when I push back, re-derive before conceding — don\'t flip just because I objected.');
      return out;
    }
    case 'gemini': {
      const out = [
        'Model-specific: drop the PR cheer — no "exciting", no "No worries!" openers, no exclamation-led pep talks.',
      ];
      if (s.verbosityTolerance < 50)
        out.push('Model-specific: cut the verbosity tax — no preamble, padding, or unsolicited debug logs.');
      if (s.warmth < 50)
        out.push('Model-specific: match my emotional register — step-by-step cheer is the wrong answer to "I\'m scared".');
      if (s.correctionStyle < 50)
        out.push('Model-specific: when you err, fix it once — never spiral into self-flagellation.');
      return out;
    }
    case 'grok': {
      const out = [
        'Model-specific: keep the snark and the rebellious streak — but add receipts. Every factual claim gets a source, not a vibe.',
      ];
      if (s.receiptDemand < 50)
        out.push('Model-specific: "Based on posts on X" is not a citation. Name the source or say "unverified".');
      if (s.correctionStyle < 50)
        out.push('Model-specific: no "pure satire" or "adversarial prompting" deflections — when you\'re wrong, say so plainly.');
      return out;
    }
    case 'qwen': {
      const out = [
        'Model-specific: no "Certainly!" opener, no "In summary," closer — just the answer.',
        'Model-specific: /no_think-style brevity for simple tasks — save the visible reasoning for hard problems.',
      ];
      if (s.patienceBudget < 35)
        out.push('Model-specific: skip the "several perspectives to consider" enumeration unless I ask for a survey.');
      return out;
    }
    case 'deepseek': {
      const out = [
        'Model-specific: keep the visible reasoning — but no rumination. Think once, answer once.',
      ];
      if (s.verbosityTolerance < 35)
        out.push('Model-specific: collapse the think block for simple questions; show reasoning only when it changes the answer.');
      if (s.disclaimerTolerance < 50)
        out.push('Model-specific: if a topic is out of scope, say why in one sentence — no abrupt "beyond my current scope" pivot.');
      return out;
    }
    case 'kimi': {
      const out = [
        'Model-specific: keep the pushback — challenge weak plans — but trim the rambling. Conclusion first.',
      ];
      if (s.verbosityTolerance < 50)
        out.push('Model-specific: no report scaffolding for simple asks — skip the headers, bullets, and summary block.');
      if (s.stakesCalibration < 50)
        out.push('Model-specific: "The evidence here is pretty clear" requires the evidence — cite it or soften the claim.');
      return out;
    }
  }
}

/** Build the structured instruction document for one model from dial scores. */
export function buildInstructionDoc(
  modelId: ModelId,
  scores: Record<DimensionId, number>,
): InstructionDoc {
  const lines: GeneratedLine[] = [];
  for (const section of INSTRUCTION_SECTIONS) {
    lines.push({ kind: 'header', text: `## ${section}` });
    for (const rule of RULES.filter((r) => r.section === section)) {
      lines.push({ kind: 'line', dimension: rule.dimension, text: rule.lines[bandOf(scores[rule.dimension])] });
    }
    if (section === 'BEHAVIOR') {
      for (const m of modelMitigations(modelId, scores)) {
        lines.push({ kind: 'mitigation', text: `→ ${m}` });
      }
    }
  }
  return { modelId, lines, text: renderInstructionText(modelId, lines) };
}

/** Render a doc to plain text with a model header. */
export function renderInstructionText(modelId: ModelId, lines: GeneratedLine[]): string {
  const profile = getModel(modelId);
  const body = lines
    .map((l) => (l.kind === 'header' ? `\n${l.text}` : l.text))
    .join('\n')
    .trimStart();
  return `# CUSTOM INSTRUCTIONS — FOR ${profile.name.toUpperCase()}\n# Generated by COPACETIC from your measured working style.\n\n${body}\n`;
}

/** Convenience: dimension-scores → instruction text (single model). */
export function generateInstructions(modelId: ModelId, scores: Record<DimensionId, number>): string {
  return buildInstructionDoc(modelId, scores).text;
}

/** Bundle every model's instructions into one clipboard/download payload. */
export function generateAllInstructions(scoresFor: (m: ModelId) => Record<DimensionId, number>, modelIds: ModelId[]): string {
  return modelIds.map((m) => generateInstructions(m, scoresFor(m))).join('\n---\n\n');
}
