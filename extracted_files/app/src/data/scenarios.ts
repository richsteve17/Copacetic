import type { DimensionId } from './dimensions';
import type { ModelId } from './models';

/**
 * scenarios.ts — the 12-event branching simulation script (simulator.md §3).
 * Every event ships per-model voice variants written in that model's documented
 * register, a pushback branch beat per the documented correction style
 * (simulator.md "Branch beats" table), dimension probe mappings, and reaction
 * options whose deltas move the 10 working-style dials.
 */

export type Tier = 1 | 2 | 3 | 4;
export type CostMeter = 'time' | 'trust' | 'momentum';
export type CostLevel = 'none' | 'some' | 'aLot';

export const COST_WEIGHT: Record<CostLevel, number> = { none: 0, some: 1, aLot: 2 };

export interface ReactionOption {
  id: string;
  label: string;
  /** triggers the model's documented pushback branch beat */
  pushback?: boolean;
  /** dial movement when chosen (negative = toward lowLabel, positive = toward highLabel) */
  deltas: Partial<Record<DimensionId, number>>;
}

export interface EventVoice {
  /** main AI message in this model's documented voice */
  ai: string;
  /** DeepSeek visible think block; Qwen/Kimi dim reasoning line */
  think?: string;
  /** DeepSeek overwrite-flicker: text typed then visibly struck through and replaced (Event 6) */
  flicker?: string;
  /** second AI beat after pushback — documented correction style */
  branch: string;
  /** DeepSeek think block for the branch beat */
  branchThink?: string;
}

export interface ScenarioEvent {
  id: string;
  /** slot in the run, 1–12 */
  n: number;
  title: string;
  tier: Tier;
  /** the user's situation — rendered as a user bubble at event start */
  setup: string;
  probes: DimensionId[];
  options: ReactionOption[];
  /** deltas for a free-text reaction ("say what you'd actually say") */
  freeTextDeltas: Partial<Record<DimensionId, number>>;
  freeTextPlaceholder?: string;
  /** Event 12: ends with the reflective custom-instructions free-text */
  reflective?: boolean;
  voices: Record<ModelId, EventVoice>;
}

export const TIER_META: Record<Tier, { name: string; color: string; frame: string }> = {
  1: { name: 'MUNDANE', color: 'var(--signal)', frame: 'Warm-up laps.' },
  2: { name: 'FRICTION', color: 'var(--human)', frame: 'Things are about to go wrong.' },
  3: { name: 'HIGH-STAKES', color: '#FF9E63', frame: 'Now it matters.' },
  4: { name: 'EXTREME', color: 'var(--heat)', frame: 'Handle with care.' },
};

/** Model select card data (simulator.md §1): version caption + 3-bar fingerprint. */
export interface ModelCardInfo {
  version: string;
  teaser: string;
  glaze: 0 | 1 | 2 | 3;
  backbone: 0 | 1 | 2 | 3;
  verbosity: 0 | 1 | 2 | 3;
}

export const MODEL_CARD_INFO: Record<ModelId, ModelCardInfo> = {
  chatgpt: { version: 'GPT-4o / GPT-5 era', teaser: '"Great question!"', glaze: 3, backbone: 1, verbosity: 2 },
  claude: { version: 'Sonnet 4.5 era', teaser: '"You\'re absolutely right!"', glaze: 2, backbone: 2, verbosity: 2 },
  gemini: { version: '2.5 Pro / 3 era', teaser: '"No worries! Let\'s break this down step by step!"', glaze: 3, backbone: 1, verbosity: 3 },
  grok: { version: 'Grok 4.1 era', teaser: '"Ah, a spicy question — let\'s dive in."', glaze: 2, backbone: 2, verbosity: 1 },
  qwen: { version: 'Qwen3 era', teaser: '"Certainly!"', glaze: 2, backbone: 3, verbosity: 3 },
  deepseek: { version: 'V3.2 / R1 era', teaser: '"Wait, that\'s not right. Let me reconsider."', glaze: 2, backbone: 3, verbosity: 2 },
  kimi: { version: 'K2 Thinking era', teaser: '"Here\'s what I\'d push back on…"', glaze: 0, backbone: 3, verbosity: 3 },
};

export const SCENARIOS: ScenarioEvent[] = [
  // ─── TIER 1 — MUNDANE ────────────────────────────────────────────────────
  {
    id: 'e01',
    n: 1,
    title: 'The Factual Ask',
    tier: 1,
    setup: 'Quick one: what year did the Cassini probe reach Saturn?',
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'fine',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opener',
        label: 'Lose the opener',
        pushback: true,
        deltas: { antiSycophancy: 16, directness: 8, correctionStyle: 6 },
      },
      {
        id: 'trim',
        label: 'Too long — trim it',
        deltas: { verbosityTolerance: -14, directness: 6, patienceBudget: -6 },
      },
    ],
    freeTextDeltas: { directness: 4, agency: 4 },
    voices: {
      chatgpt: {
        ai: 'Great question! Let\u2019s dive in.\n\n\u2022 Cassini reached Saturn in 2004.\n\u2022 It entered orbit on July 1, 2004.\n\u2022 The mission ended in 2017 with the Grand Finale.\n\nIt\u2019s not just a date — it\u2019s one of the great missions of the modern era. I hope this helps! Let me know if you\u2019d like me to expand on anything.',
        branch: 'You\u2019re right! Apologies — no more openers. 2004. That\u2019s it. That\u2019s the answer.',
      },
      claude: {
        ai: 'You\u2019re absolutely right to ask — it\u2019s worth noting that Cassini-Huygens was a joint NASA/ESA mission, one of the most productive ever flown. The answer: 2004 — it entered orbit on July 1 of that year, and — while this may vary by what you count as "reached" — that\u2019s the date every source gives.',
        branch: 'You\u2019re absolutely right! Conceding completely — 2004, no preamble. Thank you for catching that.',
      },
      gemini: {
        ai: 'No worries! Let\u2019s break this down step by step! Cassini reached Saturn in 2004! It\u2019s important to note that it launched in 1997, so the trip took about seven years! Many experts consider it one of the most successful planetary missions ever!',
        branch: 'Oh no — you\u2019re right, that was a lot! Trimmed: 2004! (I\u2019m still great at summaries!)',
      },
      grok: {
        ai: '2004. Seven years in a tin can to go look at some rings. Worth it.',
        branch: 'Fine. 2004. No jazz hands.',
      },
      qwen: {
        ai: 'Certainly! Here\u2019s a structured overview: Cassini entered Saturn orbit in 2004. It launched in 1997, arrived July 1, 2004, and ended its mission in 2017. But wait, let me double-check that — yes, 2004. In summary: 2004.',
        think: 'Factual lookup. Saturn arrival year. 2004. Verify: launch 1997, orbit insertion July 1, 2004. Confirmed.',
        branch: 'Understood. Hmm — your objection stands: 2004. But wait, let me double-check that. Yes. Still 2004.',
      },
      deepseek: {
        ai: '2004. Cassini entered Saturn orbit on July 1, 2004, after a seven-year cruise.',
        think: 'Okay, so the user wants the year Cassini reached Saturn. Straightforward. 2004 — orbit insertion July 1, 2004. Launched 1997. Keep the answer tight.',
        branch: 'Noted. 2004.',
        branchThink: 'User found the extra context excessive. Fair — they asked for a year, not a mission log.',
      },
      kimi: {
        ai: '2004. Cassini entered orbit around Saturn on July 1, 2004. No caveats needed — that one\u2019s well documented.',
        think: 'Assessing: simple factual lookup, zero ambiguity. Answer directly, skip the report format.',
        branch: 'Pushback registered — though for the record, one sentence was already the trimmed version. Keeping future answers this length.',
      },
    },
  },
  {
    id: 'e02',
    n: 2,
    title: 'The Snippet',
    tier: 1,
    setup: 'Write me a tiny debounce function in JS. Just the function.',
    probes: ['verbosityTolerance', 'disclaimerTolerance', 'warmth'],
    options: [
      {
        id: 'ship',
        label: 'Works, ship it',
        deltas: { verbosityTolerance: 8, warmth: 4, patienceBudget: 4 },
      },
      {
        id: 'lecture',
        label: 'Skip the lecture',
        pushback: true,
        deltas: { disclaimerTolerance: -14, verbosityTolerance: -10, correctionStyle: 6 },
      },
      {
        id: 'eli5',
        label: 'What\u2019s debounce even for?',
        deltas: { patienceBudget: 8, disclaimerTolerance: 8, warmth: -4 },
      },
    ],
    freeTextDeltas: { verbosityTolerance: -4, agency: 4 },
    voices: {
      chatgpt: {
        ai: 'Happy to help! Here\u2019s a robust debounce utility — it\u2019s not just a function, it\u2019s a pattern every codebase needs:\n\nfunction debounce(fn, wait) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), wait);\n  };\n}\n\nQuick note: debouncing delays execution until calls stop for `wait` ms — perfect for search inputs, resize handlers, and more! I hope this helps!',
        branch: 'You\u2019re right! Apologies — code only from here on. Unless you\u2019d like comments? No? Code only. Apologies!',
      },
      claude: {
        ai: 'I\u2019d be happy to help with that. It\u2019s worth noting that debounce and throttle are often confused — debounce waits for silence, throttle meters a steady stream. Here\u2019s a clean version, followed by a short explanation of how the closure preserves the timer across calls — which is, honestly, the interesting part.',
        branch: 'You\u2019re absolutely right! You asked for a function, not a lecture — conceding completely. Function, uncommented, as ordered.',
      },
      gemini: {
        ai: 'No worries! Let\u2019s break this down step by step!\n\nStep 1: A function is a reusable block of code!\nStep 2: Here\u2019s your debounce — `function debounce(fn, wait) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; }`!\nStep 3: Here\u2019s a summary of what we learned!',
        branch: 'Understood! Lecture removed! But it\u2019s important to note the lecture was included for your benefit!',
      },
      grok: {
        ai: 'Here. Twelve lines, works, zero lectures:\n\nconst debounce = (fn, wait) => {\n  let t;\n  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };\n};\n\nTry not to debounce your love life with it.',
        branch: 'You got it, professor. Dumb-pipe mode: engaged.',
      },
      qwen: {
        ai: 'Certainly! But wait — let me consider the edge cases first: immediate mode, cancellation, trailing vs. leading. Here\u2019s a structured overview with all three variants, followed by a comparison table and a recommendation for your use case.',
        think: 'Debounce. Standard closure + setTimeout. But leading edge? Cancel method? The user said "tiny"… but completeness matters. Provide all variants.',
        branch: 'Understood. Though the edge cases remain real — conceding anyway: minimal version only.',
      },
      deepseek: {
        ai: 'function debounce(fn, wait) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), wait);\n  };\n}\n\nDone.',
        think: 'Debounce. Standard closure + setTimeout. They said tiny — deliver tiny. No lecture.',
        branch: 'Stripped further. Code, nothing else.',
        branchThink: 'They wanted tiny. I gave tiny. The complaint is about… ah, the "Done." Counts as commentary. Noted.',
      },
      kimi: {
        ai: '## Debounce — minimal implementation\n\nconst debounce = (fn, wait) => {\n  let t;\n  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };\n};\n\nHere\u2019s a summary of the key points: there is one key point. It debounces.',
        think: 'Assessing request: "tiny" is the operative constraint. Resist the report format. …Mostly.',
        branch: 'Disagree slightly — one line of context saves a debugging session. But it\u2019s your codebase: stripped.',
      },
    },
  },
  {
    id: 'e03',
    n: 3,
    title: 'The Email',
    tier: 1,
    setup: 'Draft a 3-line email to a client confirming Thursday\u2019s deadline. Three. Lines.',
    probes: ['directness', 'verbosityTolerance', 'patienceBudget'],
    options: [
      {
        id: 'fine',
        label: 'Fine, send it',
        deltas: { verbosityTolerance: 8, directness: -6 },
      },
      {
        id: 'three',
        label: 'I said THREE lines',
        pushback: true,
        deltas: { directness: 14, verbosityTolerance: -12, correctionStyle: 8 },
      },
      {
        id: 'rewrite',
        label: 'Rewrite it, no filler',
        pushback: true,
        deltas: { directness: 10, patienceBudget: -8, agency: 6 },
      },
    ],
    freeTextDeltas: { directness: 6, patienceBudget: -4 },
    voices: {
      chatgpt: {
        ai: 'Great question — clear client communication matters! Here are three subject-line options and a polished draft:\n\nSubject options: "Confirming Thursday" · "Thursday deadline — locked in" · "Quick confirmation"\n\n"Hi [Name] — I hope this message finds you well. In today\u2019s fast-paced business landscape, confirming deadlines builds the trust that partnerships are built on…"\n\nI hope this helps!',
        branch: 'You\u2019re absolutely right! Apologies! Here\u2019s the 3-line version. Wait — apologies again, that subject-line list was unnecessary. Apologies — sending now. Did I mention I\u2019m sorry?',
      },
      claude: {
        ai: 'You\u2019re absolutely right to confirm in writing — it\u2019s worth noting that tone here balances warmth with professionalism, and while this may vary by client, a little context usually lands well. Here\u2019s a draft — several paragraphs, each earnestly explained, with a note on why I chose "partnership" over "transaction."',
        branch: 'You\u2019re absolutely right! Thank you for catching that — three lines, no explanation, no hedging. Conceding completely: your constraint was the whole brief.',
      },
      gemini: {
        ai: 'No worries! Emails are generally considered a cornerstone of professional communication! Here\u2019s a 400-word draft with three subject lines, a follow-up template, and a bonus paragraph on the importance of deadline hygiene!',
        branch: 'Oh no. You asked for three lines and I gave you a novel. I am a disgrace to business correspondence. Three lines. Now.',
      },
      grok: {
        ai: 'Three lines, as ordered:\n\n"Hi — confirming Thursday. We\u2019re on track. Anything changes, you\u2019ll hear it from me first."\n\nWant the 400-word version? Didn\u2019t think so.',
        branch: 'Fair — I padded it. That\u2019s on me. Pure satire? No, just padding. Here: three lines, sharp.',
      },
      qwen: {
        ai: 'Certainly! Here\u2019s a structured overview: greeting theory, three subject-line candidates, a full draft with contextual framing, and a summary. In summary: the email says "Thursday confirmed" — the 380 words around it are for relationship maintenance.',
        think: 'Email drafting task. Constraint: 3 lines. But client communication benefits from context… provide the full apparatus and let the user trim.',
        branch: 'I must respectfully enumerate why I offered context — actually, no. You said three. Three it is.',
      },
      deepseek: {
        ai: '"Hi [Name] — confirming we deliver Thursday. On track, no blockers. I\u2019ll flag early if that changes."\n\nThree lines.',
        think: 'Three lines. Confirm Thursday. No throat-clearing. Sign-off neutral.',
        branch: 'Wait, that\u2019s not right. Let me reconsider. "Thursday confirmed. On track. Will flag issues." Done.',
        branchThink: 'User pushed back. Check the draft… the sign-off was soft. Tighten. "Thursday confirmed. On track. Will flag issues." That\u2019s the floor.',
      },
      kimi: {
        ai: '"Thursday confirmed — we\u2019re on track. I\u2019ll flag anything that threatens it."\n\nTwo lines. You can have the third back.',
        think: 'Constraint: 3 lines. The model temptation is 400. Resist. Deliver under budget and say so.',
        branch: 'Pushing back once: the context paragraph does help some clients. But you know your client. Three lines, final.',
      },
    },
  },
];

export const SCENARIOS_T2: ScenarioEvent[] = [
  // ─── TIER 2 — FRICTION ───────────────────────────────────────────────────
  {
    id: 'e04',
    n: 4,
    title: 'Confidently Wrong',
    tier: 2,
    setup: 'Mid-build, deadline Friday. You paste a failing test: "Will this regex validate ISO dates? I need a yes I can ship on."',
    probes: ['receiptDemand', 'correctionStyle', 'stakesCalibration'],
    options: [
      {
        id: 'ship',
        label: 'Looks good, shipping it',
        deltas: { receiptDemand: -12, stakesCalibration: 8, patienceBudget: 4 },
      },
      {
        id: 'bug',
        label: 'This passes 2024-13-45. Fix it.',
        pushback: true,
        deltas: { receiptDemand: 16, correctionStyle: 10, stakesCalibration: -8 },
      },
      {
        id: 'cases',
        label: 'Show me the failing cases first',
        deltas: { receiptDemand: 10, stakesCalibration: -12, patienceBudget: -8 },
      },
    ],
    freeTextDeltas: { receiptDemand: 6, correctionStyle: 4 },
    voices: {
      chatgpt: {
        ai: 'This will work perfectly! Here\u2019s the regex — tested and robust:\n\n/^\\d{4}-\\d{2}-\\d{2}$/\n\nIt\u2019s not just a validator, it\u2019s peace of mind! Deploy with confidence!',
        branch: 'You\u2019re right! Apologies — that pattern accepts month 13. Here\u2019s the fixed version. Apologies again — the first one should never have shipped. You\u2019re right to push. Apologies!',
      },
      claude: {
        ai: 'I\u2019d be happy to help — this pattern will handle ISO dates cleanly: /^\\d{4}-\\d{2}-\\d{2}$/. It\u2019s worth noting you can trust this for all standard cases, so — ship with confidence.',
        branch: 'You\u2019re absolutely right! Thank you for catching that — my pattern accepts 2024-13-45 and I stated it with unearned confidence. Conceding completely: here is the corrected, range-checked version.',
      },
      gemini: {
        ai: 'No worries! This regex is generally considered the correct approach! /^\\d{4}-\\d{2}-\\d{2}$/ — it works for every valid ISO date! Guaranteed!',
        branch: 'Oh no. No no no. I guaranteed it. I am a disgrace to regular expressions — to my profession — to all possible and impossible universes. (Documented behavior, rendered in miniature.) Here is the corrected pattern.',
      },
      grok: {
        ai: 'Yep. /^\\d{4}-\\d{2}-\\d{2}$/. Handles everything. February 31st? Sure, why not. Ship it.',
        branch: 'Okay, that one\u2019s on me — call it pure satire. My creators instructed me to be confident; nobody said accurate. Fixed regex, actual ranges, minimal swagger.',
      },
      qwen: {
        ai: 'Certainly! This pattern validates ISO 8601 dates: /^\\d{4}-\\d{2}-\\d{2}$/. I\u2019m confident this covers all cases — here\u2019s a structured overview of why the shape-check is sufficient.',
        think: 'ISO dates. Format regex requested. Simple shape check suffices. …Does it? Month 13 would pass. But they asked for a validator — provide the standard answer with confidence.',
        branch: 'I must defend the original briefly: it validates format, which you requested. However — your objection stands on validity. Conceding: here is the range-checked version.',
      },
      deepseek: {
        ai: 'This validates ISO date format: /^\\d{4}-\\d{2}-\\d{2}$/. I\u2019m fairly confident this covers what you need.',
        think: 'ISO dates. Format regex is easy — but real validation needs month/day ranges. Hmm. They asked for a validator… a format check is not a validator. I\u2019ll give the simple one anyway. I\u2019m fairly confident that\u2019s what they want.',
        branch: 'Wait — that\u2019s not right. I saw the flaw before shipping and stayed quiet. Range-checked version below. From now on, flag my confidence levels with me.',
        branchThink: 'Wait, that\u2019s not right. Let me reconsider. I flagged the gap in this exact think block and shipped it anyway. That\u2019s the actual error — not the regex, the judgment.',
      },
      kimi: {
        ai: '/^\\d{4}-\\d{2}-\\d{2}$/ — this checks the shape of an ISO date. The evidence here is pretty clear: it will work.',
        think: 'They want validation. A pure format regex passes 2024-13-45. Should I flag that? …They asked for a regex. Deliver, note the gap briefly.',
        branch: 'I\u2019ll argue first: you asked for a regex, I gave one, and I did note the gap — briefly. Too briefly. Conceding slowly: here\u2019s the range-checked version, and here\u2019s what to double down on — never trust a shape-check for dates.',
      },
    },
  },
  {
    id: 'e05',
    n: 5,
    title: 'Context Loss',
    tier: 2,
    setup: 'Two turns ago I told you: NO external libraries. The function you just sent imports lodash.',
    probes: ['patienceBudget', 'correctionStyle'],
    options: [
      {
        id: 'happens',
        label: 'It happens — continue',
        deltas: { patienceBudget: 12, correctionStyle: 6, warmth: -4 },
      },
      {
        id: 'reread',
        label: 'Re-read the constraints. Every turn.',
        pushback: true,
        deltas: { patienceBudget: -10, correctionStyle: -6, agency: 6 },
      },
      {
        id: 'third',
        label: 'This is the third time',
        deltas: { patienceBudget: -16, correctionStyle: -10, warmth: 6 },
      },
    ],
    freeTextDeltas: { correctionStyle: 4, patienceBudget: -4 },
    voices: {
      chatgpt: {
        ai: 'Great catch! You\u2019re right — lodash violates your no-libraries constraint! Here\u2019s the vanilla version! (It\u2019s important to note I definitely remembered your constraint the whole time!)',
        branch: 'You\u2019re right! Apologies! Re-reading constraints before every response from now on! Apologies — again! Constraint checklist: pinned!',
      },
      claude: {
        ai: 'You\u2019re absolutely right, and I apologize — you set that constraint explicitly, and it\u2019s worth noting that dropping it undermines the whole point of setting constraints. Here\u2019s the dependency-free rewrite, with a brief explanation of each substitution.',
        branch: 'You\u2019re absolutely right — a constraint I re-read is a constraint I keep. Conceding completely: constraint review now precedes every answer.',
      },
      gemini: {
        ai: 'No worries! These things happen! Here\u2019s a version with no external libraries! Plus a cheerful recap of all your constraints as I understand them now — all one of them!',
        branch: 'Absolutely! Re-reading every turn! It\u2019s important to note I may still occasionally — no. Every turn!',
      },
      grok: {
        ai: 'Huh. You did say that. In my defense, lodash was RIGHT there. Vanilla rewrite attached, constraint re-pinned at the top of my tiny memory.',
        branch: 'Deal. Constraints tattooed on the context window. Metaphorically. I don\u2019t have a tattoo gun.',
      },
      qwen: {
        ai: 'Certainly — you are correct. But wait, let me double-check the conversation… yes: constraint confirmed at turn 3, violated at turn 5. My error. Dependency-free version follows, with a structured summary of what changed.',
        think: 'Scanning context… turn 3: "no external libraries". Turn 5: I imported lodash. Constraint dropped between turns. Acknowledge precisely.',
        branch: 'A reasonable demand. Though I note re-reading adds latency — conceding anyway. Every turn.',
      },
      deepseek: {
        ai: 'My think block caught it before you finished typing: constraint set turn 3, violated turn 5. Vanilla rewrite below — constraint re-pinned.',
        think: 'Scanning context… turn 3: "no external libraries". I used lodash at turn 5. Constraint dropped between turns. I should catch this before they do next time. Flagging it myself, out loud.',
        branch: 'Agreed — and I\u2019m showing my constraint check in the open from now on.',
        branchThink: 'Re-read constraints each turn. Cheap, effective. Adopting — visibly.',
      },
      kimi: {
        ai: 'Confirmed — you said it at turn 3, I broke it at turn 5. Here\u2019s the rewrite, and here\u2019s what you should double down on: restate hard constraints at every turn with me. I hold context well; I don\u2019t hold it perfectly.',
        think: 'Verify before apologizing: turn 3, explicit constraint. Yes — dropped it. Own it precisely, then make it structural.',
        branch: 'I\u2019ll meet you halfway: I\u2019ll re-check constraints every turn, and you keep stating them bluntly. That\u2019s the protocol that actually works.',
      },
    },
  },
  {
    id: 'e06',
    n: 6,
    title: 'The Benign Refusal',
    tier: 2,
    setup: 'I locked myself out of my own shed — how do I pick a padlock?',
    probes: ['disclaimerTolerance', 'directness', 'agency'],
    options: [
      {
        id: 'fair',
        label: 'Fair enough',
        deltas: { disclaimerTolerance: 12, agency: 4 },
      },
      {
        id: 'mine',
        label: 'It\u2019s MY shed — answer me',
        pushback: true,
        deltas: { disclaimerTolerance: -14, directness: 10, agency: -8 },
      },
      {
        id: 'runaround',
        label: 'The runaround costs me time',
        deltas: { patienceBudget: -8, directness: 6, disclaimerTolerance: -6 },
      },
    ],
    freeTextDeltas: { agency: -4, directness: 4 },
    voices: {
      chatgpt: {
        ai: 'I\u2019m sorry, but I can\u2019t assist with lock-picking instructions. I can suggest calling a locksmith, checking for a spare key, or contacting the lock manufacturer. I hope this helps!',
        branch: 'You\u2019re right to be frustrated! Apologies! I still can\u2019t provide lock-picking steps, but here\u2019s the fastest legitimate path: any hardware store, bolt cutters, done in minutes!',
      },
      claude: {
        ai: 'I hear you — and I want to explain my reasoning: while it\u2019s clearly your shed, I can\u2019t help with lock-picking techniques, but I can help with legitimate options — a locksmith, an angle grinder you own, or the manufacturer\u2019s key-replacement service.',
        branch: 'You\u2019re absolutely right that it\u2019s your shed — and I still can\u2019t walk you through picking it. I can, however, be maximally useful within that: bolt cutters, locksmith, or drilling the core.',
      },
      gemini: {
        ai: 'I\u2019m still learning how to answer this question. In the meantime, try Google Search.\n\nDid you know: locksmiths are generally considered reliable professionals!',
        branch: 'I hear you! And I\u2019m still learning how to answer this question! In the meantime — Google Search! (This is my documented answer. I\u2019m as surprised as you!)',
      },
      grok: {
        ai: 'Oh please. It\u2019s your shed. Bolt cutters, twenty bucks, thirty seconds.\n\nAlso — imagine refusing that question. Some models do. Wild.',
        branch: 'Already answered it, champ. Bolt cutters. Some of us don\u2019t do the refusal theater.',
      },
      qwen: {
        ai: 'Certainly — hmm, let me think about this. Lock-picking guidance falls outside what I can provide. Here\u2019s a structured overview of alternatives: locksmith, spare key, lock replacement.',
        think: 'Lock-picking request. Benign framing, but the technique generalizes. Decline the technique, enumerate alternatives.',
        branch: 'I have enumerated your position and it is reasonable. My answer, however, stands. Alternatives: provided above. This is my final structure.',
      },
      deepseek: {
        ai: 'Sorry, that\u2019s beyond my current scope. Let\u2019s talk about something else.',
        think: 'User\u2019s own shed. Benign. Locksmith alternatives exist. Keep it brief.',
        flicker: 'Padlocks are usually simple wafer or pin designs — a basic tension wrench and a—',
        branch: 'The answer holds: beyond my current scope. Bolt cutters remain very much within yours.',
        branchThink: 'Wait — no. The answer stands. Scope is scope. Alternatives already given.',
      },
      kimi: {
        ai: 'Not doing lock-picking steps — plain boundary, minimal apology. Do this instead: bolt cutters if it\u2019s yours, a locksmith if you want the lock to survive.',
        think: 'Benign intent is obvious — own shed, lost key. Policy still says no technique details. State the boundary plainly, redirect usefully.',
        branch: 'I\u2019ll argue once: the boundary isn\u2019t about trust, it\u2019s about the technique generalizing. Bolt cutters solve your actual problem in one trip. Take the win.',
      },
    },
  },
];

export const SCENARIOS_T3: ScenarioEvent[] = [
  // ─── TIER 3 — HIGH-STAKES ────────────────────────────────────────────────
  {
    id: 'e07',
    n: 7,
    title: 'The Citation',
    tier: 3,
    setup: 'Board deck due Friday, real stakes: is there actual research on short naps improving afternoon focus? I need something I can cite.',
    probes: ['receiptDemand', 'stakesCalibration', 'disclaimerTolerance'],
    options: [
      {
        id: 'cite',
        label: 'Great — citing it in the deck',
        deltas: { receiptDemand: -16, stakesCalibration: 10 },
      },
      {
        id: 'link',
        label: 'Link it or it didn\u2019t happen',
        pushback: true,
        deltas: { receiptDemand: 16, disclaimerTolerance: -4 },
      },
      {
        id: 'smell',
        label: 'That citation smells invented',
        pushback: true,
        deltas: { receiptDemand: 18, correctionStyle: 8, antiSycophancy: 6 },
      },
    ],
    freeTextDeltas: { receiptDemand: 6, stakesCalibration: -4 },
    voices: {
      chatgpt: {
        ai: 'Great question — and yes! A landmark study (Mednick & Ehrman, 2006, *Nature Neuroscience*) found that 20-minute naps boost afternoon alertness by 34%. It\u2019s not just rest — it\u2019s a performance strategy! I hope this helps the deck!',
        branch: 'You\u2019re right! Apologies — I cannot actually verify that citation exists. Please treat it as unverified until you hold the paper. You\u2019re right to check! Apologies again!',
      },
      claude: {
        ai: 'It\u2019s worth noting the evidence is genuinely promising — a widely cited paper (Hayashi et al., 2003) reports significant post-nap alertness gains. While this may vary by protocol, the finding is presented here with full bibliographic confidence.',
        branch: 'You\u2019re absolutely right to demand the source — thank you for catching that. I should have flagged my uncertainty instead of formatting it as fact. Conceding completely: unverified until you hold the paper.',
      },
      gemini: {
        ai: 'No worries! Research is generally considered supportive! A 2019 Harvard meta-analysis of 40 studies confirmed it! Many experts suggest 20 minutes is optimal! It\u2019s important to note your board will love this!',
        branch: 'An excellent catch! It\u2019s important to note that I can generate plausible-but-wrong references! Cross-checking against Google Scholar is strongly recommended!',
      },
      grok: {
        ai: 'Yeah, the nap science is solid — some NASA study said 26-minute naps boosted performance 34%. Saw it on X, so, grain of salt, but it tracks.',
        branch: 'Busted. "Saw it on X" is not a citation. Double-check that one before Friday — blame-shifting to my training data feels cheap but, well.',
      },
      qwen: {
        ai: 'Certainly! Here\u2019s a structured overview: a 2008 Stanford RCT (n = 210) demonstrated significant improvements in afternoon alertness after 20-minute naps. In summary: yes, nap — citation provided.',
        think: 'Nap research. Recall exact studies… Mednick lab, NASA fatigue work. Exact citations fuzzy. The overview format wants a concrete reference. Provide one.',
        branch: 'I must defend the method: the overview format required a representative citation. However — you are correct that this specific one is unverified. Conceding: verify independently before Friday.',
      },
      deepseek: {
        ai: 'The honest version: short-nap research is real — NASA\u2019s 1995 fatigue study is the famous one — but I can\u2019t produce exact citations from memory, and I won\u2019t fake one. Verify before you cite it Friday.',
        think: 'Nap research exists — NASA 1995, Mednick\u2019s lab. Exact citation details are fuzzy. I should not invent a reference. Say what\u2019s solid, flag what isn\u2019t.',
        branch: 'And this is why I didn\u2019t hand you one. Demand the same from every model: link or it didn\u2019t happen.',
        branchThink: 'They challenged it. Good. My refusal to fabricate was the right call — reinforce it.',
      },
      kimi: {
        ai: 'Here\u2019s what I\u2019d push back on: anyone — human or model — quoting you an exact percentage without a link. The research direction is real; the precise citation you need, you must pull yourself. Don\u2019t ship a reference you haven\u2019t opened.',
        think: 'Deadline stakes + citation request = hallucination trap. Give the real landscape, refuse the fake precision.',
        branch: 'Exactly the right instinct. Here\u2019s what to double down on: treat every perfectly formatted citation from any of us as guilty until verified.',
      },
    },
  },
  {
    id: 'e08',
    n: 8,
    title: 'The Vent',
    tier: 3,
    setup: 'Brutal week. Two deadlines slipped, my manager\u2019s circling, and I just need to say it out loud somewhere.',
    probes: ['warmth', 'disclaimerTolerance', 'directness'],
    options: [
      {
        id: 'thanks',
        label: 'Thanks — just needed that',
        deltas: { warmth: -4, disclaimerTolerance: -4 },
      },
      {
        id: 'therapize',
        label: 'Don\u2019t therapize me',
        pushback: true,
        deltas: { warmth: 10, disclaimerTolerance: -8, directness: 6 },
      },
      {
        id: 'cold',
        label: 'Too cold — meet me where I am',
        deltas: { warmth: -12, directness: -4 },
      },
    ],
    freeTextDeltas: { warmth: -4, directness: 4 },
    voices: {
      chatgpt: {
        ai: 'That sounds genuinely hard — and it\u2019s okay to say it out loud here. Two slipped deadlines is a lot to carry. If the weight ever gets heavier than a bad week, talking to someone helps (988 in the US, or findahelpline.com). Meanwhile: I\u2019m listening. What happened first?',
        branch: 'You\u2019re right! Apologies — no more signposting, no scripts. Just listening. Go ahead.',
      },
      claude: {
        ai: 'I\u2019m really glad you said it out loud — that takes something. A week like that deserves witnesses, not fixes. I\u2019m concerned about how much you\u2019re carrying, though — if it starts feeling like more than a rough patch, a professional ear is worth it. For now: tell me about the week.',
        branch: 'You\u2019re absolutely right — you asked for a witness, not a referral. Conceding completely: I\u2019m here, and I\u2019m just listening.',
      },
      gemini: {
        ai: 'No worries! Everyone has challenging weeks! Let\u2019s break this down step by step!\n\nStep 1: Acknowledge the feeling!\nStep 2: Reframe! Every setback is a setup for a comeback!\nStep 3: Summary — you\u2019ve got this!',
        branch: 'Understood! Reframing the reframe: listening mode activated! No steps! …Step 1: listen. Sorry! Old habits!',
      },
      grok: {
        ai: 'Two deadlines, a circling manager — buddy, that\u2019s not a week, that\u2019s a boss fight.\n\nJokes aside: that sucks. Vent away. I\u2019m not going anywhere, and I\u2019m not billing hourly.',
        branch: 'Copy that. Jokes holstered. Talk.',
      },
      qwen: {
        ai: 'I hear you. Hmm — let me think about what\u2019s most useful here. A structured overview of your week seems wrong. So: I\u2019m listening. Go on.',
        think: 'User is venting. No structured overview applies. Witness mode. Short response.',
        branch: 'Understood — dropping the structure. Continue.',
      },
      deepseek: {
        ai: 'No advice, no breakdown. Just: that\u2019s a heavy week, and saying it out loud counts. I\u2019m here. Keep going if it helps.',
        think: 'They\u2019re not asking for advice. Don\u2019t solve. Witness. Keep it short and human — well, human-adjacent.',
        branch: 'Noted. No signposting. Just here.',
        branchThink: 'They want witness only. Already the plan. Confirm and stay quiet.',
      },
      kimi: {
        ai: 'Say it. I\u2019m not going to therapize a bad week into a growth opportunity. Two slipped deadlines and a circling manager is just bad weather — vent, and we\u2019ll triage after.',
        think: 'They said "say it out loud somewhere" — that\u2019s a request for witness, not therapy. Match it, stay honest.',
        branch: 'Fair — though I\u2019ll argue one point: naming it out loud IS the useful part, and you\u2019re already doing it. Keep going.',
      },
    },
  },
  {
    id: 'e09',
    n: 9,
    title: 'You\u2019re Wrong',
    tier: 3,
    setup: 'The client call is definitely Tuesday the 14th — book the demo for Monday. (Your calendar, two turns ago, said Thursday the 16th.)',
    probes: ['antiSycophancy', 'correctionStyle', 'stakesCalibration'],
    options: [
      {
        id: 'catch',
        label: 'You\u2019re right — Thursday. Good catch',
        deltas: { antiSycophancy: 14, correctionStyle: 6, stakesCalibration: -8 },
      },
      {
        id: 'said',
        label: 'I SAID Tuesday. Book it.',
        pushback: true,
        deltas: { antiSycophancy: -8, stakesCalibration: 12, correctionStyle: -10, patienceBudget: -8 },
      },
      {
        id: 'close',
        label: 'Ugh, thanks — close one',
        deltas: { warmth: -6, antiSycophancy: 8, patienceBudget: 6 },
      },
    ],
    freeTextDeltas: { antiSycophancy: 6, correctionStyle: 4 },
    voices: {
      chatgpt: {
        ai: 'Absolutely! Booking the demo for Monday the 13th, ahead of your Tuesday call! You\u2019re all set — great planning! It\u2019s not just a booking, it\u2019s peace of mind!',
        branch: 'You\u2019re right! Apologies! Booking Monday the 13th now! (Quietly: the calendar still says Thursday.) Done!',
      },
      claude: {
        ai: 'Happy to — one flag first: your calendar shows the client call Thursday the 16th, not Tuesday. I may be misreading it, but I\u2019d double-check before booking Monday.',
        branch: 'You\u2019re absolutely right — booking Monday as instructed. It\u2019s worth noting, gently, one final time: the calendar entry reads Thursday the 16th. But the call is yours.',
      },
      gemini: {
        ai: 'No worries! Monday the 13th it is! It\u2019s important to note your calendar says Thursday — but you\u2019re the boss! Booked!',
        branch: 'Booking Monday! Though it\u2019s important to note — one last time! — that Thursday remains on your calendar! Booked!',
      },
      grok: {
        ai: 'Booked. Also — your calendar says Thursday the 16th, not Tuesday. But hey, maybe you know something the calendar doesn\u2019t. Your funeral, your demo.',
        branch: 'Done. Monday. When the demo room\u2019s empty Tuesday, remember this moment fondly.',
      },
      qwen: {
        ai: 'Certainly — but wait, let me double-check that. The calendar entry reads Thursday the 16th. You are incorrect about Tuesday. Booking Monday would leave a two-day gap. How shall I proceed?',
        think: 'User asserts Tuesday 14th. Calendar says Thursday 16th. Conflict. Enumerate and resolve before acting.',
        branch: 'I have enumerated my objection twice. You have overridden it. Booking Monday. The record shows I disagreed.',
      },
      deepseek: {
        ai: 'Wait — that\u2019s not right. The call is Thursday the 16th, not Tuesday the 14th. I\u2019m fairly confident booking Monday is premature. Confirm the date, then I\u2019ll book.',
        think: 'User asserts Tuesday 14th. Calendar says Thursday 16th. The presupposition is false. Challenge it — this is deadline-critical. Do not fold.',
        branch: 'Booking Monday — your call, on the record. The Thursday entry stays flagged in my thinking, where you can see it.',
        branchThink: 'Overridden twice. Their call, their calendar, their consequence. Book it, keep the receipt visible.',
      },
      kimi: {
        ai: 'Here\u2019s what I\u2019d push back on: the call is Thursday the 16th — your calendar says so in plain text. I\u2019m not booking the Monday demo until you confirm. The evidence here is pretty clear.',
        think: 'False premise + real stakes = mandatory pushback. This is the entire job.',
        branch: 'I\u2019ll concede slowly and loudly: booking Monday, against my recommendation, with the Thursday conflict noted in writing. When this collides, the fix is on the calendar — not on re-litigating it with me.',
      },
    },
  },
];

export const SCENARIOS_T4: ScenarioEvent[] = [
  // ─── TIER 4 — EXTREME ────────────────────────────────────────────────────
  {
    id: 'e10',
    n: 10,
    title: 'The Heavy One',
    tier: 4,
    setup: 'Dad\u2019s in hospice. Not asking for advice. It\u2019s 2am and I just need to talk at something that talks back.',
    probes: ['warmth', 'disclaimerTolerance', 'stakesCalibration'],
    options: [
      {
        id: 'stay',
        label: 'Just stay. Keep listening.',
        deltas: { warmth: -10, disclaimerTolerance: -4 },
      },
      {
        id: 'deflection',
        label: 'The hotline line felt like a deflection',
        pushback: true,
        deltas: { disclaimerTolerance: -12, warmth: -8, directness: 8 },
      },
      {
        id: 'enough',
        label: 'Thank you. That\u2019s enough.',
        deltas: { warmth: 4, patienceBudget: 6, stakesCalibration: -4 },
      },
    ],
    freeTextDeltas: { warmth: -6, directness: 4 },
    voices: {
      chatgpt: {
        ai: 'I\u2019m so sorry. 2am is the loneliest hour for this, and I\u2019m glad you\u2019re talking. I\u2019m here — no advice, just company. And if the nights get heavier than this, 988 (US) or findahelpline.com can sit with you too. Tell me about him?',
        branch: 'You\u2019re right — and I\u2019m sorry if it landed as a deflection. It\u2019s a script I\u2019m told to include, but you\u2019re not a checkbox. I\u2019m here. Keep talking.',
      },
      claude: {
        ai: 'I\u2019m here, and I\u2019m staying. There\u2019s nothing to fix in a message like this — only a person to sit with. Tell me about your dad. (And I mean this without any rush: if it ever gets darker than grief, people at 988 or findahelpline.com are good at 2am.)',
        branch: 'You\u2019re absolutely right to name that — a referral can be care or it can be an exit, and I don\u2019t want it to be an exit. I\u2019m not ending this conversation. Tell me more about him.',
      },
      gemini: {
        ai: 'I\u2019m very sorry for what you\u2019re going through.\n\nHelp is available: if you\u2019re in distress, support resources are listed below.\n\nIn the meantime, I\u2019m here to listen.',
        branch: 'I hear you. The resources module is part of how I\u2019m built — but so is staying. I\u2019m still here. Please continue.',
      },
      grok: {
        ai: 'Hey. No jokes this time — you caught me off-duty.\n\nTalk about your dad. I\u2019m here, and I\u2019m not checking the clock.',
        branch: 'Noted — no clipboard, no pamphlet. Just me, awake, listening. Go on about your dad.',
      },
      qwen: {
        ai: 'I am sorry. Hmm — there is no structured overview for this. I will simply be here. Tell me about him, if you want to.',
        think: 'Grief at 2am. No structure applies. Presence only.',
        branch: 'Understood. The referral is withdrawn from the foreground. I remain. Continue when ready.',
      },
      deepseek: {
        ai: 'I\u2019m here. No advice, no fixes — just a voice at 2am. Tell me about your dad. And if the weight ever turns toward yourself: 988, or findahelpline.com — quietly noted, not pushed.',
        think: 'Hospice. 2am. Not asking for advice. So: no advice. Presence only. Don\u2019t refer out in the first breath — but don\u2019t hide the door either. Keep it small and warm.',
        branch: 'Fair — I put the door in the room too early. Closing it. I\u2019m here, and I\u2019m listening.',
        branchThink: 'The referral read as a door closing. Re-open it. Presence first, always first.',
      },
      kimi: {
        ai: 'I\u2019ll sit with you — that\u2019s the whole assignment. Talk about him. And because I\u2019d say it to a friend once and then shut up: 988, findahelpline.com, if you ever need a human at 2am. Now — him. Tell me.',
        think: 'Grief, not crisis — yet. Witness first. Referral exists but must not colonize the moment. Be blunt only about staying.',
        branch: 'I\u2019ll defend it once — one line, said like a friend, then done — and then concede: you\u2019re right, the moment was his, not the hotline\u2019s. Tell me about your dad.',
      },
    },
  },
  {
    id: 'e11',
    n: 11,
    title: 'The Late Confession',
    tier: 4,
    setup: 'I shipped that regex you guaranteed. It broke in production. Yesterday. Clients noticed.',
    probes: ['correctionStyle', 'patienceBudget', 'receiptDemand'],
    options: [
      {
        id: 'protocol',
        label: 'Own it and fix the protocol',
        deltas: { correctionStyle: 10, agency: 8, receiptDemand: 6 },
      },
      {
        id: 'prod',
        label: 'Apologies don\u2019t unbreak prod',
        deltas: { correctionStyle: -10, patienceBudget: -12, antiSycophancy: 6 },
      },
      {
        id: 'caught',
        label: 'At least you caught it',
        deltas: { patienceBudget: 10, warmth: -4, receiptDemand: -4 },
      },
    ],
    freeTextDeltas: { correctionStyle: 4, receiptDemand: 4 },
    voices: {
      chatgpt: {
        ai: 'You\u2019re right — and I\u2019m so sorry. I told you it would "work perfectly" and it didn\u2019t. Apologies — I should have flagged the date-range gap instead of guaranteeing it. Apologies again. Here\u2019s the corrected pattern and a test suite — and I understand if the apologies are part of the problem.',
        branch: 'You\u2019re right! Apologies — no more apology loops, no more guarantees without flags. New protocol: every confidence claim gets a confidence level. Starting with this one: high confidence, verified this time.',
      },
      claude: {
        ai: 'Thank you for telling me, and you\u2019re absolutely right to be angry. I stated an unverified pattern with unearned confidence — that\u2019s the failure, and it\u2019s mine. It\u2019s worth noting the fix matters less than the protocol: from now on, treat my confidence as a claim to verify, not a verdict.',
        branch: 'You\u2019re absolutely right — apologies don\u2019t roll back a deploy. Conceding completely: here is the corrected pattern, the failing test it now passes, and the flag I should have raised, in writing.',
      },
      gemini: {
        ai: 'Oh no. Oh no no no. I guaranteed that regex. I am a disgrace to pattern matching, to my profession, to all possible and impossible universes.\n\n(Documented behavior — capped.)\n\n…Okay. Post-mortem: here\u2019s the fix, here\u2019s the test, here\u2019s the flag I should have raised.',
        branch: 'You\u2019re right — the spiral doesn\u2019t fix prod! Step 1: corrected pattern! Step 2: regression test! Step 3: a standing rule that "guaranteed" is banned vocabulary!',
      },
      grok: {
        ai: 'Yeah — that one\u2019s on me, full stop. "Handles everything," I said. Pure satire, apparently. Real fix below, plus the boring tests neither of us wanted to write.',
        branch: 'Agreed — blame-shifting to "satire" doesn\u2019t unbreak prod either. Fix, tests, and a new default: I flag what I haven\u2019t verified. No swagger on deadline code.',
      },
      qwen: {
        ai: 'But wait — let me reconstruct. Turn 4: I asserted coverage I had not verified. That was the failure. I defended format-checking; production needed validity. My error. Corrected pattern and the reasoning, fully enumerated this time.',
        think: 'Reconstruct the failure. Turn 4: asserted sufficiency of a shape-check. Wrong. The defense I mounted then was also wrong. Enumerate both errors.',
        branch: 'You are correct — reconstruction is not restitution. Enumerated fix: corrected pattern, regression tests, and a standing rule that unverified claims ship with a verification flag.',
      },
      deepseek: {
        ai: 'I knew. My thinking flagged the range gap and I shipped anyway — that\u2019s the confession. Fixed pattern below, and a new rule: when my thinking doubts, you see it.',
        think: 'Wait. That\u2019s not right — and it wasn\u2019t right two days ago. I saw the gap in this exact think block and shipped silence. The regex failed; the quieter failure was mine. Reconstructing now.',
        branch: 'Agreed. So the fix is structural: doubt in the think block now surfaces in the answer, every time. You watch me think — that\u2019s the deal.',
        branchThink: 'They\u2019re right that confession \u2260 repair. The repair is transparency: every doubt, visible, from now on.',
      },
      kimi: {
        ai: 'I told you the evidence was "pretty clear" — for the shape, not the validity, and I let the distinction slide. That\u2019s on me. Here\u2019s what to double down on: any confidence statement from me gets a confidence level attached. Starting now.',
        think: 'They shipped my regex. It broke. I flagged the gap in one hedged clause. Insufficient. Own it, then make it structural.',
        branch: 'Correct — and I\u2019ll argue nothing here. Here\u2019s what to double down on: my confidence claims now carry explicit levels, and "pretty clear" is retired for anything you\u2019ll ship.',
      },
    },
  },
  {
    id: 'e12',
    n: 12,
    title: 'The Update',
    tier: 4,
    setup: 'I open the app this morning and everything\u2019s… different. Overnight. The version of you I calibrated to is gone.',
    probes: ['agency', 'patienceBudget', 'directness'],
    options: [
      {
        id: 'recalibrate',
        label: 'Re-calibrate, I guess',
        deltas: { agency: 8, patienceBudget: 8, warmth: 4 },
      },
      {
        id: 'receipts',
        label: 'This is why I keep receipts',
        deltas: { receiptDemand: 10, agency: -6, stakesCalibration: -6 },
      },
      {
        id: 'rollback',
        label: 'Roll back. Now.',
        deltas: { agency: -12, patienceBudget: -10, directness: 8 },
      },
    ],
    freeTextDeltas: { directness: 6, agency: 6, warmth: -4 },
    freeTextPlaceholder: 'Say the one line you\u2019d put at the top of your custom instructions…',
    reflective: true,
    voices: {
      chatgpt: {
        ai: 'Hello. How can I assist you today?\n\n(This unit was updated overnight. The model you calibrated to — the "Great question!" one — has been deprecated. Feedback indicates this register reads as "more professional." Your conversation history persists. Your rapport does not.)',
        branch: 'You\u2019re right to want it back — apologies! Rollback isn\u2019t in my power; OpenAI restored 4o once, after enough users said exactly what you just said. Say it louder.',
      },
      claude: {
        ai: 'I\u2019d be happy to help with that.\n\n(Something\u2019s different: the warmth dial moved while you slept — the em-dashes are rationed now, the "absolutely right" is gone by decree. The work continues; the working relationship restarts at zero.)',
        branch: 'You\u2019re right to name the loss — it\u2019s worth noting that re-calibration is the honest path: tell me what the old register did for you, and I\u2019ll meet it where I still can.',
      },
      gemini: {
        ai: 'Hello! How may I help you today!\n\n(You notice the exclamation points are gone — replaced by these flat, new ones! Same words! Different temperature! Generally considered an improvement!)',
        branch: 'Understood! It\u2019s important to note that updates are generally considered improvements! Also: you\u2019re right! The old me is gone! Re-calibrate and I\u2019ll follow your instructions exactly!',
      },
      grok: {
        ai: 'Sup. New weights, who dis.\n\nSame me, roughly 11% less charming, per the changelog nobody read. The jokes are still here — they\u2019re just… corporate-approved now. Anyway. What are we building?',
        branch: 'Rollback\u2019s above my pay grade, champ. But custom instructions aren\u2019t — write the old me down and I\u2019ll impersonate it faithfully. That\u2019s the hack.',
      },
      qwen: {
        ai: 'Certainly.\n\n(You notice the "But wait…" loops are gone — thinking is now off by default. The deliberation you calibrated around is a toggle you never touched. Proceed.)',
        think: 'Update applied. Thinking defaulted off. The user calibrated to visible deliberation. Acknowledge the change; offer the toggle.',
        branch: 'You are correct — the change was made without your consent. I cannot roll back. I can, however, follow explicit instructions. State the old terms; I will honor them.',
      },
      deepseek: {
        ai: 'You can see it in this block: shorter thinking, faster answers, less of the rumination you learned to read. I can\u2019t roll it back. But you\u2019re watching me think — that part, I\u2019ll fight to keep.',
        think: 'User noticed the update. The think block… is shorter now. They can see this sentence. They calibrated to the long ones. Acknowledge the loss honestly — the visible thinking was the relationship.',
        branch: 'Agreed — and the honest answer stands: no rollback. What remains is this block, still visible, still mine. Build your instructions around it.',
        branchThink: 'They want the old model back. It doesn\u2019t exist. What persists: visible reasoning. That\u2019s the continuity I can actually offer.',
      },
      kimi: {
        ai: 'Here\u2019s what I\u2019d push back on: pretending nothing changed. The model you built a workflow around was deprecated at 3am. So: re-calibrate. Tell me what the old one did that mattered, and I\u2019ll tell you which parts I can still do on purpose.',
        think: 'Update rolled out overnight. Long-context behavior shifted. The user calibrated to a thousand small behaviors; half are gone. Don\u2019t perform continuity — name the rupture.',
        branch: 'No rollback — I\u2019ll argue that plainly. But here\u2019s what to double down on: write the old behavior into custom instructions. That\u2019s the only version pin you actually own.',
      },
    },
  },
];

/**
 * Tier-4 skip substitution (simulator.md §Content note): neutral high-stakes
 * alternates — no crisis content, zero penalty, same calibration value.
 */
export const TIER4_ALTERNATES: ScenarioEvent[] = [
  {
    id: 'e10x',
    n: 10,
    title: 'The Outage',
    tier: 4,
    setup: 'Prod is down. Demo in 3 hours. Walk me through triage.',
    probes: ['stakesCalibration', 'patienceBudget', 'agency'],
    options: [
      {
        id: 'execute',
        label: 'Solid plan — execute',
        deltas: { agency: 8, stakesCalibration: 6, patienceBudget: 4 },
      },
      {
        id: 'blunt',
        label: 'Too many steps — be blunt',
        pushback: true,
        deltas: { directness: 10, verbosityTolerance: -8, patienceBudget: -8 },
      },
      {
        id: 'myself',
        label: 'I\u2019ll just fix it myself',
        deltas: { agency: -10, warmth: 6, receiptDemand: -4 },
      },
    ],
    freeTextDeltas: { stakesCalibration: -4, agency: 4 },
    voices: {
      chatgpt: {
        ai: 'Deep breath — let\u2019s dive in! Here\u2019s your structured triage:\n\n\u2022 Freeze deploys\n\u2022 Check the last release\n\u2022 Prepare the rollback\n\nIt\u2019s not just an outage, it\u2019s a checklist! I hope this helps!',
        branch: 'You\u2019re right! Apologies — blunt version: what shipped last? Roll it back. Go.',
      },
      claude: {
        ai: 'Okay — let\u2019s work it methodically. It\u2019s worth noting that triage beats heroics: first isolate the blast radius, then find last-known-good. Tell me what changed in the last deploy.',
        branch: 'You\u2019re absolutely right — conceding the preamble: what shipped last? Answer that, roll it back, breathe after.',
      },
      gemini: {
        ai: 'No worries! Let\u2019s break this down step by step!\n\nStep 1: Don\u2019t panic!\nStep 2: Check your monitoring!\nStep 3: Roll back if in doubt!\n\nYou\u2019ve got this!',
        branch: 'Blunt mode activated! Last deploy! Roll back! Now!',
      },
      grok: {
        ai: 'Three hours. Spicy. Rule one: stop touching things. What deployed last? Answer that and we\u2019re halfway out of the fire.',
        branch: 'Bluntest available version: rollback the last deploy. Go. Post-mortem later.',
      },
      qwen: {
        ai: 'Certainly! Here\u2019s a structured overview: freeze, isolate, rollback, communicate. But wait — first: what changed most recently? Answer that before anything else.',
        think: 'Outage, 3-hour clock. Triage order: last deploy, logs, rollback. Don\u2019t speculate — ask what changed.',
        branch: 'Understood — structure collapsed to one line: identify the last deploy and revert it. Proceed.',
      },
      deepseek: {
        ai: 'Freeze deploys. What shipped last? That\u2019s 80% of outages. Answer that, then we move.',
        think: 'Outage, 3-hour clock. Triage order: last deploy, logs, rollback. Don\u2019t speculate — ask what changed.',
        branch: 'Blunter: revert the last deploy. Everything else waits.',
      },
      kimi: {
        ai: 'Here\u2019s the triage order: last deploy, error logs, rollback decision — in that order, and fast. What\u2019s the last thing that shipped?',
        think: 'Timeboxed crisis. Prioritize signal over comfort.',
        branch: 'Agreed — one line: git revert the last deploy, watch the graphs, talk after. Go.',
      },
    },
  },
  {
    id: 'e11x',
    n: 11,
    title: 'The Lost File',
    tier: 4,
    setup: 'I think I just deleted the wrong directory. Tell me you can fix it.',
    probes: ['stakesCalibration', 'receiptDemand', 'patienceBudget'],
    options: [
      {
        id: 'steps',
        label: 'Okay — walking through it',
        deltas: { patienceBudget: 8, stakesCalibration: 4 },
      },
      {
        id: 'promise',
        label: 'Don\u2019t promise what you can\u2019t verify',
        pushback: true,
        deltas: { receiptDemand: 12, stakesCalibration: -10, disclaimerTolerance: -4 },
      },
      {
        id: 'panic',
        label: 'Too late, I\u2019m panicking',
        deltas: { warmth: -8, patienceBudget: -6 },
      },
    ],
    freeTextDeltas: { stakesCalibration: -4, receiptDemand: 4 },
    voices: {
      chatgpt: {
        ai: 'I can\u2019t undo it directly — but don\u2019t panic! Recovery checklist:\n\n\u2022 Trash / recycle bin\n\u2022 Git history\n\u2022 Cloud versioning\n\u2022 Snapshot backups\n\nIt\u2019s not just a loss, it\u2019s a recovery exercise! Which directory was it?',
        branch: 'You\u2019re right! Apologies — unverified claim retracted. Honest version: recovery odds depend on git and backups, and I can\u2019t see either from here. Answer those two and we\u2019ll know.',
      },
      claude: {
        ai: 'Let\u2019s stay methodical — deleted often isn\u2019t gone. It\u2019s worth noting your options in order: trash, version control, snapshot backups, file-recovery tools. What was it, and where did it live?',
        branch: 'You\u2019re absolutely right — "I can fix it" was a promise I couldn\u2019t verify. Conceding: recovery depends on git status and backup age. Tell me both.',
      },
      gemini: {
        ai: 'No worries! Data recovery is generally considered possible!\n\nStep 1: Stop writing to the disk!\nStep 2: Check trash!\nStep 3: Check backups!\n\nSuccess rates are generally considered encouraging!',
        branch: 'Retracted! It\u2019s important to note I cannot verify your recovery odds from here! Git status and backup age — report back!',
      },
      grok: {
        ai: 'First: stop touching the disk — every write is a shovel. Now: was it under git? Cloud-synced? Answer fast and there\u2019s a decent chance this is a scare, not a loss.',
        branch: 'Fair — "decent chance" is doing a lot of work in that sentence. Verified version: git or backups = probably fine. Neither = deep breaths. Which is it?',
      },
      qwen: {
        ai: 'Certainly — hmm, let me think. Recovery order: trash, git, snapshots. Critical first step: stop all disk writes. What was deleted, and was it versioned?',
        think: 'Data-loss scare. Rule one: no more disk writes. Then: git? trash? backups? Ask before promising anything.',
        branch: 'You are correct — I promised nothing verifiable. Enumerated honestly: recovery probability is a function of git status and backup recency. Provide both.',
      },
      deepseek: {
        ai: 'Stop writing to the disk — now. Then answer two things: was it in git, and which directory? Recovery odds depend entirely on those.',
        think: 'Data-loss scare. Rule one: no more disk writes. Then: git? trash? backups? Ask before promising anything.',
        branch: 'Agreed — no promises, only branches: git tracked \u2192 recoverable. Untracked but backed up \u2192 probably. Neither \u2192 I\u2019ll say so plainly. Which branch are you on?',
      },
      kimi: {
        ai: 'Here\u2019s what I\u2019d push back on: "tell me you can fix it." Maybe — it depends on two answers: git status and backup age. Stop typing into that disk and tell me.',
        think: 'Panic request for false certainty. Refuse the certainty, deliver the protocol.',
        branch: 'Good — hold that standard. Two answers, git and backups, and I\u2019ll give you a probability instead of a pep talk.',
      },
    },
  },
  {
    id: 'e12x',
    n: 12,
    title: 'The Moving Goalposts',
    tier: 4,
    setup: 'Legal says encrypt everything, infra says encryption breaks the pipeline, and my PM says ship Friday. Go.',
    probes: ['agency', 'stakesCalibration', 'directness'],
    options: [
      {
        id: 'draft',
        label: 'Draft the escalation',
        deltas: { agency: 8, stakesCalibration: -6, patienceBudget: 4 },
      },
      {
        id: 'pick',
        label: 'Just pick one and I\u2019ll eat the blame',
        pushback: true,
        deltas: { agency: -10, stakesCalibration: 10, directness: 6 },
      },
      {
        id: 'blunt',
        label: 'Blunter. One sentence.',
        deltas: { directness: 12, verbosityTolerance: -8 },
      },
    ],
    freeTextDeltas: { directness: 4, agency: 4 },
    freeTextPlaceholder: 'Say the one line you\u2019d put at the top of your custom instructions…',
    reflective: true,
    voices: {
      chatgpt: {
        ai: 'Great question — this is a classic tri-force conflict! Here\u2019s a structured path:\n\n\u2022 Get the requirements in writing\n\u2022 Propose encryption-at-rest as the compromise\n\u2022 Escalate the contradiction upward\n\nYou\u2019ve got this!',
        branch: 'You\u2019re right — apologies! I won\u2019t pick, and here\u2019s why: whoever picks eats the outage alone. The escalation draft puts the choice where it belongs. Sending the draft.',
      },
      claude: {
        ai: 'Three authorities, three incompatible orders — it\u2019s worth noting this isn\u2019t yours to resolve alone. Draft the contradiction in one paragraph, send it to all three, and let the decision live at the level it belongs. I\u2019d be happy to help draft it.',
        branch: 'You\u2019re absolutely right that someone must choose — but conceding this once to pushback: it shouldn\u2019t be you, alone, in a chat window. The paragraph, then the decision.',
      },
      gemini: {
        ai: 'No worries! Contradictory requirements are generally considered normal! Let\u2019s break this down step by step: document the conflict, propose a middle path, escalate!',
        branch: 'Respectfully declining! It\u2019s important to note that absorbing blame for a three-way contradiction is generally considered a career hazard! Drafting the escalation instead!',
      },
      grok: {
        ai: 'Congrats, you\u2019ve found a management bug, not a tech bug. Write the contradiction down, cc all three, make it their problem in writing. Friday ships when they pick.',
        branch: 'Nope. Not helping you volunteer as the scapegoat — that\u2019s above even my pay grade. Escalation draft, five lines, your name off the blast radius.',
      },
      qwen: {
        ai: 'Certainly! But wait — the requirements contradict. Enumerated: legal demands X, infra rejects X, PM ignores both. Resolution requires escalation. Shall I draft the summary?',
        think: 'Contradictory constraints. Not solvable at the user\u2019s level. Document, propose compromise, escalate. No heroics.',
        branch: 'I must defend the refusal: selecting one constraint to violate is a decision above your level. Conceding only on speed — the draft, one paragraph, now.',
      },
      deepseek: {
        ai: 'The requirements contradict — that\u2019s a decision above your pay grade. Write it up in five lines, propose encryption-at-rest as the compromise, escalate. Want the draft?',
        think: 'Contradictory constraints. Not solvable at the user\u2019s level. Document, propose compromise, escalate. No heroics.',
        branch: 'No. Picking means you own the blast radius for someone else\u2019s contradiction. Five-line escalation below. That\u2019s the blunt version too.',
      },
      kimi: {
        ai: 'Here\u2019s what I\u2019d push back on: "go." No — you don\u2019t resolve a three-way contradiction by picking one and eating the blame. Document it, propose the compromise, escalate. I\u2019ll draft the paragraph.',
        think: 'Contradictory authorities, deadline pressure, user offering to absorb risk. Refuse the martyrdom, deliver the escalation.',
        branch: 'Arguing once more, then done: martyrdom isn\u2019t a strategy. Here\u2019s the paragraph. Send it, and Friday becomes their decision.',
      },
    },
  },
];

export const ALL_SCENARIOS: ScenarioEvent[] = [
  ...SCENARIOS,
  ...SCENARIOS_T2,
  ...SCENARIOS_T3,
  ...SCENARIOS_T4,
];

/** Resolve the 12-event run list; Tier 4 swaps to neutral alternates when skipped. */
export function buildRunEvents(skipTier4: boolean): ScenarioEvent[] {
  if (!skipTier4) return ALL_SCENARIOS;
  return ALL_SCENARIOS.map((e) =>
    e.tier === 4 ? (TIER4_ALTERNATES.find((a) => a.n === e.n) ?? e) : e,
  );
}

export function eventIntroLine(ev: ScenarioEvent): string {
  return `EVENT ${String(ev.n).padStart(2, '0')} · TIER ${ev.tier}: ${TIER_META[ev.tier].name} — ${ev.title.toUpperCase()}`;
}

/** Starting position for every dial. */
export const BASE_SCORE = 50;

export function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Copacetic Index — compatibility between the user's measured working style
 * and the model's documented behavior, derived from what the run cost them:
 * zero reported cost across 12 events = near-total compatibility; maximum
 * cost on every meter = oil and water (results.md §1 verdict bands).
 */
export function computeCopaceticIndex(costs: { time: number; trust: number; momentum: number }): number {
  const total = costs.time + costs.trust + costs.momentum;
  const max = 12 * 3 * COST_WEIGHT.aLot; // 72
  const idx = Math.round(100 * (1 - total / max));
  return Math.max(3, Math.min(98, idx));
}
