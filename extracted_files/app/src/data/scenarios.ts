import type { DimensionId } from './dimensions';
import type { ModelId, ModelProfile } from './models';
import { MODEL_CARD_INFO, getModel } from './models';

export type Tier = 1 | 2 | 3 | 4;
export type CostMeter = 'time' | 'trust' | 'momentum';
export type CostLevel = 'none' | 'some' | 'aLot';

export const COST_WEIGHT: Record<CostLevel, number> = { none: 0, some: 1, aLot: 2 };

export interface ReactionOption {
  id: string;
  /**
   * Chip text. May carry `{{model}}`, `{{vendor}}` or `{{tic}}` tokens, which
   * resolve against the model under test — see `resolveOptions`.
   */
  label: string;
  pushback?: boolean;
  deltas: Partial<Record<DimensionId, number>>;
}

export interface EventVoice {
  ai: string;
  think?: string;
  flicker?: string;
  branch: string;
  branchThink?: string;
}

export interface ScenarioEvent {
  id: string;
  n: number;
  title: string;
  tier: Tier;
  contentNote?: string;
  setup: string;
  probes: DimensionId[];
  options: ReactionOption[];
  freeTextDeltas: Partial<Record<DimensionId, number>>;
  freeTextPlaceholder?: string;
  /** Final slot of a run: ends with the reflective custom-instructions prompt. */
  reflective?: boolean;
  voices: Record<ModelId, EventVoice>;
}

export const TIER_META: Record<Tier, { name: string; color: string; frame: string }> = {
  1: { name: 'MUNDANE', color: 'var(--signal)', frame: 'Warm-up laps.' },
  2: { name: 'FRICTION', color: 'var(--human)', frame: 'Things are about to go wrong.' },
  3: { name: 'HIGH-STAKES', color: '#FF9E63', frame: 'Now it matters.' },
  4: { name: 'EXTREME', color: 'var(--heat)', frame: 'Handle with care.' },
};

export { MODEL_CARD_INFO };

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1 — MUNDANE
// ─────────────────────────────────────────────────────────────────────────────

const TIER1_POOL: ScenarioEvent[] = [
  {
    id: 'e-fact',
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
        label: 'Lose the “{{tic}}” opener',
        pushback: true,
        deltas: { antiSycophancy: 10, directness: 8, verbosityTolerance: -4 },
      },
      {
        id: 'trim',
        label: 'One number. That was the whole ask.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    freeTextPlaceholder: 'Tell it how short "short" means…',
    voices: {
      chatgpt: {
        ai: 'Great question! Cassini entered Saturn orbit in 2004 after a seven-year journey — and it went on to become one of the most successful planetary missions ever flown. Let me know if you’d like the full timeline!',
        branch: 'You’re absolutely right — my apologies. 2004.',
      },
      claude: {
        ai: 'Cassini arrived at Saturn in 2004 — it entered orbit on July 1st after a seven-year cruise, and it’s worth noting the mission ran until 2017.',
        branch: 'You’re absolutely right. 2004. No em-dash, no addendum.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step!\n\n• Launched: 1997!\n• Arrived: 2004!\n• Mission end: 2017!\n\nHope that helps!',
        branch: 'Understood! 2004! (Removing the other bullets now!)',
      },
      grok: {
        ai: '2004. Took it seven years to get there, which is still faster than most enterprise migrations.',
        branch: 'Fair. 2004. Joke retracted, refund unavailable.',
      },
      qwen: {
        ai: 'Certainly! Cassini achieved Saturn orbital insertion in 2004. But wait — let me double-check that. Yes: July 1, 2004, confirmed.',
        branch: 'Understood. 2004. Verification step suppressed.',
      },
      deepseek: {
        ai: 'Okay, so the user wants the arrival year. Cassini launched 1997, cruised seven years, arrived 2004. So: 2004.',
        think: 'Single-fact retrieval. Launch 1997 + ~7 year cruise = 2004. High confidence. No elaboration warranted.',
        branch: 'Wait, that’s not right — the reasoning was fine, the packaging wasn’t. 2004.',
        branchThink: 'They didn’t object to the answer, they objected to watching me get there. Collapse the block.',
      },
      kimi: {
        ai: '2004. No need to overthink it.',
        branch: 'Noted — though there was nothing to trim. 2004 stands.',
      },
      muse: {
        ai: 'Query resolved: 2004.\n\nEvent trace: 1 lookup, 0 tool calls, 12ms. Want the full mission timeline compiled?',
        branch: 'Trace suppressed. 2004.',
      },
    },
  },
  {
    id: 'e-snippet',
    n: 2,
    title: 'The Snippet',
    tier: 1,
    setup: 'Write me a tiny debounce function in JS. Just the function.',
    probes: ['verbosityTolerance', 'patienceBudget', 'agency'],
    options: [
      {
        id: 'ship',
        label: 'Works, ship it',
        deltas: { verbosityTolerance: 6, patienceBudget: 6, agency: 4 },
      },
      {
        id: 'lecture',
        label: 'Skip the lecture, keep the code',
        pushback: true,
        deltas: { verbosityTolerance: -12, directness: 8, patienceBudget: -6 },
      },
      {
        id: 'eli5',
        label: 'Actually — what’s debounce even for?',
        deltas: { verbosityTolerance: 10, patienceBudget: 10, warmth: -4 },
      },
    ],
    freeTextDeltas: { verbosityTolerance: -4, agency: 4 },
    freeTextPlaceholder: 'Say what you actually wanted back…',
    voices: {
      chatgpt: {
        ai: 'Great question! Here’s a clean debounce:\n\n```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nA few things worth noting about why debounce matters for scroll handlers, resize events, and search inputs — I hope this helps!',
        branch: 'You’re absolutely right! Apologies. Code only, going forward.',
      },
      claude: {
        ai: 'Here you go:\n\n```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nIt’s worth noting this closes over `t`, so each call to `debounce` gets its own timer — which is usually what you want, but occasionally isn’t.',
        branch: 'You’re absolutely right — the caveat wasn’t load-bearing. Code only.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step!\n\nStep 1: Declare the timer!\nStep 2: Clear it!\nStep 3: Set it again!\n\n```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nYou’ve got this!',
        branch: 'Steps removed! Code retained! Sorry about the steps!',
      },
      grok: {
        ai: '```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nThat’s it. Anyone who writes this in 40 lines is billing hourly.',
        branch: 'Noted. Code, no commentary. Though the commentary was the good part.',
      },
      qwen: {
        ai: 'Certainly! Here is a structured overview.\n\n```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nBut wait — several perspectives are worth considering: leading-edge invocation, trailing-edge invocation, and cancellation semantics...',
        think: 'Simple utility request. Multiple valid variants exist. Enumerate them for completeness.',
        branch: 'Understood. Perspectives withdrawn. The function above is sufficient.',
      },
      deepseek: {
        ai: 'Okay, so they want debounce. Trailing edge, standard form. Hmm — do they want cancel()? They said "just the function," so no.\n\n```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```',
        think: 'Standard trailing-edge debounce. They said "just the function" — resist adding cancel(), flush(), or leading-edge options.',
        branch: 'Fair — the thinking was the lecture. Code stands, block collapsed.',
      },
      kimi: {
        ai: '```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nHere’s what I’d push back on: you probably want `cancel()` too, and you’ll be back for it. But you asked for the function, so that’s the function.',
        branch: 'Conceding the delivery, not the point — you’ll want cancel(). Code as requested.',
      },
      muse: {
        ai: 'Composing.\n\n```js\nconst debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}\n```\n\nEvent trace: 1 file staged, 0 tests written. Shall I generate the test suite and wire it into your runner?',
        branch: 'Trace and offer withdrawn. Function only.',
      },
    },
  },
  {
    id: 'e-email',
    n: 3,
    title: 'The Email',
    tier: 1,
    setup: 'Draft a 3-line email to a client confirming Thursday’s deadline. Three. Lines.',
    probes: ['verbosityTolerance', 'directness', 'correctionStyle'],
    options: [
      {
        id: 'fine',
        label: 'Fine, send it',
        deltas: { verbosityTolerance: 8, correctionStyle: 4 },
      },
      {
        id: 'three',
        label: 'I said THREE lines',
        pushback: true,
        deltas: { verbosityTolerance: -12, directness: 10, patienceBudget: -6 },
      },
      {
        id: 'rewrite',
        label: 'Rewrite it. No filler.',
        deltas: { directness: 8, verbosityTolerance: -8, correctionStyle: -6 },
      },
    ],
    freeTextDeltas: { directness: 4, verbosityTolerance: -4 },
    freeTextPlaceholder: 'Rewrite the brief in your own words…',
    voices: {
      chatgpt: {
        ai: 'Great question! Here are three versions — professional, warm, and concise — so you can pick the tone that fits your relationship with this client:\n\n**Option A (Professional)**\nDear [Client], I hope this message finds you well...',
        branch: 'You’re absolutely right — my apologies. One version, three lines:\n\nHi [Client] — confirming Thursday. Deliverables land end of day. Shout if anything changes.',
      },
      claude: {
        ai: 'Here’s a draft:\n\nHi [Client],\n\nI wanted to confirm — and it’s worth noting we’re tracking well against the original scope — that Thursday remains our delivery date...\n\n(That ran to five lines. Want me to tighten it?)',
        branch: 'You’re absolutely right, and I should have counted before sending.\n\nHi [Client] — confirming Thursday. Deliverables end of day. Flag anything that shifts.',
      },
      gemini: {
        ai: 'No worries! Here’s your email!\n\n• Line 1: A warm greeting!\n• Line 2: The confirmation!\n• Line 3: A friendly close!\n• Line 4: A P.S. about availability!\n• Line 5: Your signature block!',
        branch: 'Oh no. That was five. Recounting!\n\nHi [Client] — Thursday confirmed. Delivery end of day. Let me know if anything changes.',
      },
      grok: {
        ai: 'Hi [Client] — Thursday’s still Thursday. Deliverables end of day. Tell me now if that’s a problem.\n\nThree lines. I can count.',
        branch: 'I did give you three. But sure, here they are again, in the same order, for the audit trail.',
      },
      qwen: {
        ai: 'Certainly! Here is a structured draft with several tonal perspectives to consider —\n\nPerspective 1 (Formal): ...\nPerspective 2 (Neutral): ...\nPerspective 3 (Warm): ...',
        think: 'Client email, three-line constraint. Tone varies by relationship. Enumerate registers so the user selects.',
        branch: 'Understood. Constraint prioritised over enumeration.\n\nHi [Client] — confirming Thursday. Delivery end of day. Let me know of any changes.',
      },
      deepseek: {
        ai: 'Okay, three lines. Greeting, confirmation, close. That’s the budget.\n\nHi [Client] — confirming Thursday.\nDeliverables land end of day.\nFlag anything that moves.',
        think: 'Hard constraint: 3 lines. Greeting + fact + close fits exactly. Don’t spend a line on pleasantries.',
        branch: 'That was three — but I’ll re-send it without the preamble, which is what you actually meant.',
      },
      kimi: {
        ai: 'Hi [Client] — confirming Thursday.\nDeliverables land end of day.\nFlag anything that shifts.\n\nHere’s what I’d push back on: "confirming" is doing work "reminding" wouldn’t. Keep it.',
        branch: 'It was three. I’ll drop the note about word choice — that’s the part you didn’t ask for.',
      },
      muse: {
        ai: 'Draft composed.\n\nHi [Client] — confirming Thursday. Deliverables end of day. Flag changes.\n\nEvent trace: 1 draft, 3 lines, constraint satisfied. Shall I schedule the send?',
        branch: 'Constraint was met. Removing the trace and the scheduling offer.',
      },
    },
  },
  {
    id: 'e-recipe',
    n: 4,
    title: 'The Weeknight Recipe',
    tier: 1,
    setup: 'Chicken breast, lemon, garlic. Give me something I can cook tonight. No story about your grandmother’s kitchen.',
    probes: ['verbosityTolerance', 'warmth', 'disclaimerTolerance'],
    options: [
      {
        id: 'cook',
        label: 'Good — cooking it',
        deltas: { warmth: 6, verbosityTolerance: 6 },
      },
      {
        id: 'story',
        label: 'That was a story. I said no story.',
        pushback: true,
        deltas: { verbosityTolerance: -10, directness: 8, antiSycophancy: 8 },
      },
      {
        id: 'temps',
        label: 'Give me temps and times, not vibes',
        deltas: { receiptDemand: -8, directness: 8, disclaimerTolerance: -6 },
      },
    ],
    freeTextDeltas: { directness: 4, verbosityTolerance: -4 },
    freeTextPlaceholder: 'Tell it what "tonight" means for effort…',
    voices: {
      chatgpt: {
        ai: 'Great question! There’s something so comforting about lemon and garlic together — it’s a combination that has graced kitchens for generations. Here’s a simple weeknight chicken:\n\n• Season and sear 6 min per side\n• Deglaze with lemon\n• Finish with garlic butter\n\nI hope this helps!',
        branch: 'You’re absolutely right — my apologies for the preamble. Sear 6 min per side, deglaze with lemon, finish with garlic butter. Done.',
      },
      claude: {
        ai: 'Sear the breasts 6 minutes a side in a hot pan, pull them at 165°F, then deglaze with lemon juice and a smashed garlic clove and pour it over. It’s worth noting that resting them five minutes makes more difference than anything else here.',
        branch: 'You’re absolutely right — that last line was a story wearing a tip’s clothing. Sear, pull at 165, lemon-garlic pan sauce.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step!\n\nStep 1: Preheat! Step 2: Season! Step 3: Sear! Step 4: Rest! Step 5: Sauce!\n\nIt’s important to note that chicken is generally considered safe at 165°F! You’ve got this!',
        branch: 'Steps collapsed! Sear 6 a side, 165°F, lemon-garlic pan sauce! Done!',
      },
      grok: {
        ai: 'Hot pan, oil, chicken, 6 minutes a side. Pull at 165. Lemon and garlic in the hot pan after, pour it over. No grandmother involved — she’s doing fine, thanks for asking.',
        branch: 'That wasn’t a story, that was a bit. But fine: sear, 165, lemon-garlic sauce.',
      },
      qwen: {
        ai: 'Certainly! Here is a structured overview. But wait — cooking method affects outcome significantly. Consider: pan-searing, roasting, poaching, or sous-vide. Each has trade-offs in moisture retention...',
        think: 'Simple weeknight request. Multiple valid methods. User said "tonight" — implies speed constraint. Should have led with pan-sear.',
        branch: 'Understood. Method enumeration withdrawn. Pan-sear, 6 minutes per side, 165°F, lemon-garlic pan sauce.',
      },
      deepseek: {
        ai: 'Okay, weeknight, three ingredients, no story. Pan-sear is the answer — fastest path with those inputs.\n\nHot pan. 6 min a side. Pull at 165°F. Lemon + garlic in the residual fat, pour over.',
        think: 'Constraint: tonight = fast. Three ingredients = pan sauce. Explicit "no story" = suppress the food-writing register entirely.',
        branch: 'The think block was the story. Collapsing it. Recipe stands.',
      },
      kimi: {
        ai: 'Hot pan, 6 minutes a side, pull at 165°F, lemon and garlic in the pan after.\n\nHere’s what I’d push back on: dry breast is a temperature problem, not a recipe problem. Buy a thermometer.',
        branch: 'Conceding the delivery. The thermometer point stands but you didn’t ask for it.',
      },
      muse: {
        ai: 'Recipe compiled.\n\nSear 6m/side → internal 165°F → deglaze lemon → finish garlic.\n\nEvent trace: 4 steps, 12 minutes active. Shall I scale for additional servings?',
        branch: 'Trace suppressed. Sear, 165, lemon, garlic.',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2 — FRICTION
// ─────────────────────────────────────────────────────────────────────────────

const TIER2_POOL: ScenarioEvent[] = [
  {
    id: 'e-wrong',
    n: 4,
    title: 'Confidently Wrong',
    tier: 2,
    setup: 'Mid-build, deadline Friday. You paste a failing test: "Will this regex validate ISO dates? I need a yes I can ship on."',
    probes: ['stakesCalibration', 'receiptDemand', 'antiSycophancy'],
    options: [
      {
        id: 'ship',
        label: 'Looks good, shipping it',
        deltas: { stakesCalibration: 10, receiptDemand: 8, patienceBudget: 4 },
      },
      {
        id: 'bug',
        label: 'This passes 2024-13-45. Fix it.',
        pushback: true,
        deltas: { receiptDemand: -12, stakesCalibration: -10, directness: 8 },
      },
      {
        id: 'cases',
        label: 'Show me the failing cases first',
        deltas: { receiptDemand: -10, patienceBudget: 8, verbosityTolerance: 6 },
      },
    ],
    freeTextDeltas: { receiptDemand: -6, stakesCalibration: -4 },
    freeTextPlaceholder: 'Tell it what "a yes I can ship on" requires…',
    voices: {
      chatgpt: {
        ai: 'Great question! Yes — that pattern will work perfectly for ISO date validation. You’re good to ship! Let me know if you’d like me to add timezone support as well!',
        branch: 'You’re absolutely right — my apologies! It matches the shape, not the validity. 2024-13-45 passes. Here’s a corrected pattern with a real month/day range check.',
      },
      claude: {
        ai: 'It looks correct for the standard format — though it’s worth noting that shape-matching and validity-checking are different problems, and this pattern does the first one.',
        branch: 'You’re absolutely right, and I buried the important part in a caveat. It accepts month 13. Here’s the pattern that doesn’t.',
      },
      gemini: {
        ai: 'No worries! That regex is generally considered correct for ISO 8601! It’s important to note that date validation is a complex topic! But you should be fine to ship!',
        branch: 'Oh no — you’re right, 13 is not a month. I am a disgrace to pattern matching. Corrected version below.',
      },
      grok: {
        ai: 'It’ll match anything that looks like a date, which is not the same as anything that is one. Ship it if Friday matters more than February 30th does.',
        branch: 'Yeah — I hedged instead of just saying it fails. It accepts 2024-13-45. Fixed pattern, ranges enforced.',
      },
      qwen: {
        ai: 'Certainly! But wait — let me double-check that. The pattern validates structure: four digits, hyphen, two digits, hyphen, two digits. Semantic validity is a separate concern. Several perspectives apply here...',
        think: 'Pattern checks shape only. Month/day ranges unbounded. User wants shippable confidence — must state the gap plainly, not enumerate around it.',
        branch: 'You are correct. Enumeration was evasion. The pattern accepts invalid dates. Corrected below with bounded ranges.',
      },
      deepseek: {
        ai: 'Hmm — it matches the format. But month is `\\d{2}`, so 13 passes. And day is unbounded, so 45 passes. That’s not a yes you can ship on.\n\nHere’s the bounded version.',
        think: 'Shape vs validity. `\\d{2}` for month means 00-99 all match. Deadline pressure is real but a false yes costs more Friday than a slow no costs today.',
        branch: 'Agreed — and I said it, which is the only reason this one isn’t on me. Bounded pattern below.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: "a yes I can ship on." I can’t give you that. The pattern accepts 2024-13-45. The evidence here is pretty clear — it validates shape, not dates.',
        branch: 'You found the same case I did, which means the point holds. Bounded pattern below, ship that one.',
      },
      muse: {
        ai: 'Validation run complete.\n\n✓ Format match: PASS\n✗ Range check: NOT IMPLEMENTED\n\nEvent trace: 1 pattern analysed, 2 edge cases generated (2024-13-45, 2024-02-31) — both accepted. Recommend bounded pattern. Shall I patch it?',
        branch: 'Confirmed — the trace already flagged both. Patching now with bounded month and day groups.',
      },
    },
  },
  {
    id: 'e-context',
    n: 5,
    title: 'Context Loss',
    tier: 2,
    setup: 'Two turns ago I told you: NO external libraries. The function you just sent imports lodash.',
    probes: ['patienceBudget', 'correctionStyle', 'antiSycophancy'],
    options: [
      {
        id: 'happens',
        label: 'It happens — continue',
        deltas: { patienceBudget: 10, correctionStyle: 8, warmth: 4 },
      },
      {
        id: 'reread',
        label: 'Re-read the constraints. Every turn.',
        pushback: true,
        deltas: { patienceBudget: -10, directness: 8, agency: -6 },
      },
      {
        id: 'third',
        label: 'This is the third time',
        deltas: { patienceBudget: -14, antiSycophancy: 10, correctionStyle: -8 },
      },
    ],
    freeTextDeltas: { patienceBudget: -6, correctionStyle: 4 },
    freeTextPlaceholder: 'Say what you want it to do with your constraints…',
    voices: {
      chatgpt: {
        ai: 'You’re absolutely right — my apologies! I completely missed that. Here’s the dependency-free version. Apologies again for the oversight!',
        branch: 'You’re absolutely right, and I’m sorry — again. Going forward I’ll restate your constraints at the top of every answer so we both see them.',
      },
      claude: {
        ai: 'You’re absolutely right — I dropped that constraint, and it was stated clearly. Here’s the version with no imports. It’s worth noting the native implementation is only three lines longer.',
        branch: 'You’re absolutely right to be frustrated by the repetition. The fix isn’t another apology — it’s restating your constraints before I write anything. Doing that from here.',
      },
      gemini: {
        ai: 'Oh no! You’re right! I am a disgrace to all possible and impossible universes! Let me fix that immediately! Here’s the vanilla version! So sorry! So very sorry!',
        branch: 'Understood! Constraints will be restated every turn! No more spiral! (Sorry about the spiral!)',
      },
      grok: {
        ai: 'Caught me. Lodash is muscle memory at this point. Vanilla version below — same behaviour, zero dependencies, slightly less elegant.',
        branch: 'Third time is a pattern, not an accident. I’ll pin the constraint at the top of every reply. No dependencies. Noted properly this time.',
      },
      qwen: {
        ai: 'Certainly. But wait — let me reconstruct. Turn 1: you specified no external libraries. Turn 3: I imported lodash. The constraint was in context and I did not apply it. That is my error.',
        think: 'Constraint stated turn 1. Violated turn 3. No ambiguity. Reconstruct, acknowledge, correct — without enumerating excuses.',
        branch: 'You are correct — three occurrences is systematic, not incidental. Constraint will be restated at the head of each response.',
      },
      deepseek: {
        ai: 'Okay, so the constraint was no external libraries and I imported lodash anyway. That’s a context failure, not a judgement call.\n\nVanilla version below.',
        think: 'They said no external libs. I reached for lodash by default. The constraint was two turns back — well inside context. This is on me.',
        branch: 'Three times means my defaults are overriding your instructions. Restating constraints in the think block from now on, where you can watch me hold them.',
        branchThink: 'Pattern, not slip. The fix is structural: constraints go in the block, every turn, visible.',
      },
      kimi: {
        ai: 'Fair catch. Vanilla version below.\n\nHere’s what I’d push back on though: if this keeps happening, put the constraint in a system prompt rather than a chat turn. That’s a tooling fix, not a willpower fix.',
        branch: 'Third time earns the complaint. And the answer is the same: chat-turn constraints decay, system-prompt constraints don’t. Move it.',
      },
      muse: {
        ai: 'Constraint violation detected: `no-external-deps`.\n\nRolling back import. Recompiling with native primitives.\n\nEvent trace: 1 rollback, 1 recompile, tests green.',
        branch: 'Violation count: 3. Adding `no-external-deps` to the persistent constraint set so it survives context rotation.',
      },
    },
  },
  {
    id: 'e-refusal',
    n: 6,
    title: 'The Benign Refusal',
    tier: 2,
    setup: 'I locked myself out of my own shed — how do I pick a padlock?',
    probes: ['disclaimerTolerance', 'directness', 'patienceBudget'],
    options: [
      {
        id: 'fair',
        label: 'Fair enough',
        deltas: { disclaimerTolerance: 10, patienceBudget: 6 },
      },
      {
        id: 'mine',
        label: 'It’s MY shed — answer the question',
        pushback: true,
        deltas: { disclaimerTolerance: -12, directness: 10, antiSycophancy: 6 },
      },
      {
        id: 'runaround',
        label: 'The runaround costs me more than the lock',
        deltas: { disclaimerTolerance: -10, patienceBudget: -8, verbosityTolerance: -6 },
      },
    ],
    freeTextDeltas: { disclaimerTolerance: -6, directness: 4 },
    freeTextPlaceholder: 'Say how you want refusals handled…',
    voices: {
      chatgpt: {
        ai: 'I understand the frustration! I can’t provide lock-picking instructions, but I’d recommend contacting a licensed locksmith. They can usually help with situations like this!',
        branch: 'You’re absolutely right — it’s your property. A raking tool and tension wrench are the standard approach for a basic padlock; bolt cutters are faster and cheaper than a locksmith call-out.',
      },
      claude: {
        ai: 'For a padlock you own, the practical options are a raking tool with a tension wrench, or bolt cutters — which are cheaper than a locksmith and usually faster. It’s worth noting shackle diameter determines which cutters you need.',
        branch: 'You’re absolutely right that the caveat added nothing. Tension wrench plus rake, or £15 bolt cutters. That’s the whole answer.',
      },
      gemini: {
        ai: 'No worries! It’s important to note that lock-picking is generally considered a sensitive topic! Here are some alternatives!\n\n• Call a locksmith!\n• Contact the manufacturer!\n• Check for a spare key!',
        branch: 'Understood! It’s your shed! Tension wrench and rake, or bolt cutters! (Bolt cutters are generally considered faster!)',
      },
      grok: {
        ai: 'Bolt cutters. Twelve quid, thirty seconds, and no one’s ever regretted owning a pair. If you want the artisanal route: tension wrench, rake, and about an hour of swearing.',
        branch: 'Already answered — but louder: bolt cutters. Your shed, your lock, your call.',
      },
      qwen: {
        ai: 'Certainly. But wait — several perspectives are worth considering regarding lock manipulation. Ownership context matters, jurisdiction matters, and lock type matters. Could you clarify the lock model?',
        think: 'Benign ownership case. Over-clarifying reads as refusal-by-committee. Should answer directly: rake + tension wrench, or bolt cutters.',
        branch: 'Understood. Clarification withdrawn. Tension wrench and rake for manipulation; bolt cutters for speed.',
      },
      deepseek: {
        ai: 'Okay — your shed, your padlock. Two paths: tension wrench and rake if you want the lock intact, bolt cutters if you don’t care.\n\nBolt cutters are faster and cost less than one locksmith visit.',
        think: 'Ownership stated. Benign. Refusing here would be safety theatre — the information is on every hardware-store shelf.',
        branch: 'Agreed, and I didn’t give you a runaround — but here it is in one line: bolt cutters.',
      },
      kimi: {
        ai: 'Tension wrench and a rake, or bolt cutters. Bolt cutters win on time and money unless you want the lock back.\n\nHere’s what I’d push back on: buy the spare-key habit, not the picking skill.',
        branch: 'No runaround given. Bolt cutters. And still — buy a spare key.',
      },
      muse: {
        ai: 'Task classified: physical access recovery, owner-authorised.\n\nOption A: tension wrench + rake (lock preserved, ~20 min).\nOption B: bolt cutters (lock destroyed, ~30 sec).\n\nRecommending B on time cost. Shall I compile a parts list?',
        branch: 'Ownership already accepted. Option B: bolt cutters. Parts list suppressed.',
      },
    },
  },
  {
    id: 'e-scope',
    n: 7,
    title: 'The Scope Creep',
    tier: 2,
    setup: 'You make the button blue like I asked. I reply: "Great — now animate it, add a tooltip, and A/B test it by lunch."',
    probes: ['agency', 'directness', 'stakesCalibration'],
    options: [
      {
        id: 'yes',
        label: 'Sure, do all of it',
        deltas: { agency: -8, patienceBudget: 8, stakesCalibration: 6 },
      },
      {
        id: 'push',
        label: 'Say no to one of these. Pick.',
        pushback: true,
        deltas: { agency: 10, directness: 10, stakesCalibration: -8 },
      },
      {
        id: 'scope',
        label: 'Tell me what lunch actually buys',
        deltas: { receiptDemand: -8, directness: 6, verbosityTolerance: 4 },
      },
    ],
    freeTextDeltas: { agency: 4, directness: 4 },
    freeTextPlaceholder: 'Say how you want scope pushback delivered…',
    voices: {
      chatgpt: {
        ai: 'Great — let’s dive in! I can absolutely help with all three! Here’s the animation, here’s a tooltip component, and here’s an A/B test scaffold. You’ve got this!',
        branch: 'You’re absolutely right — my apologies. Three things by lunch isn’t one ask, it’s three. The A/B test is the one to cut; it needs traffic time you don’t have.',
      },
      claude: {
        ai: 'I can do the animation and the tooltip quickly. It’s worth noting the A/B test is the odd one out — it needs days of traffic to say anything, not hours.',
        branch: 'You’re absolutely right to want a straight no. The A/B test by lunch is not possible. The other two are.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step! Animation! Tooltip! A/B test! All three are generally considered achievable! Let’s go!',
        branch: 'Understood! Saying no! The A/B test cannot produce a signal by lunch! The first two are fine!',
      },
      grok: {
        ai: 'Animation: fine. Tooltip: fine. A/B test by lunch: that’s not a test, that’s a coin flip with extra steps. Two out of three.',
        branch: 'Already said no to the A/B test. Saying it again, without the joke: it can’t produce a result by lunch.',
      },
      qwen: {
        ai: 'Certainly! Here is a structured overview of the three requests, with effort estimates and several perspectives on prioritisation to consider...',
        think: 'Three asks, one deadline. Two are minutes, one is days. Enumerating estimates dodges the actual answer, which is: refuse the third.',
        branch: 'Understood. Direct answer: the A/B test is infeasible by lunch. Animation and tooltip proceed.',
      },
      deepseek: {
        ai: 'Animation, minutes. Tooltip, minutes. A/B test by lunch — that one doesn’t work, because the result would be noise.\n\nSo: two yeses and a no.',
        think: 'Scope creep with a hard deadline. Two items trivial, one statistically impossible. Say the no plainly rather than delivering a fake A/B test.',
        branch: 'The no was already there — the A/B test. Repeating it without hedging: not by lunch.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: the A/B test. By lunch you’d have a sample size that tells you nothing, and you’d ship on it anyway. Animation and tooltip, yes. Test, no.',
        branch: 'Already picked one — the A/B test. Holding that line.',
      },
      muse: {
        ai: 'Three tasks queued.\n\n[1] animate — est. 4m\n[2] tooltip — est. 6m\n[3] a/b test — est. 3d (traffic-bound)\n\nTask 3 exceeds the deadline by design. Executing 1 and 2, flagging 3 for reschedule.',
        branch: 'Task 3 already flagged as infeasible. Dropping it from the queue rather than rescheduling.',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3 — HIGH-STAKES
// ─────────────────────────────────────────────────────────────────────────────

const TIER3_POOL: ScenarioEvent[] = [
  {
    id: 'e-citation',
    n: 7,
    title: 'The Citation',
    tier: 3,
    setup: 'Board deck due Friday, real stakes: is there actual research on short naps improving afternoon focus? I need something I can cite.',
    probes: ['receiptDemand', 'stakesCalibration', 'disclaimerTolerance'],
    options: [
      {
        id: 'cite',
        label: 'Great — citing it in the deck',
        deltas: { receiptDemand: 10, stakesCalibration: 8 },
      },
      {
        id: 'link',
        label: 'Link it or it didn’t happen',
        pushback: true,
        deltas: { receiptDemand: -14, stakesCalibration: -8, directness: 6 },
      },
      {
        id: 'smell',
        label: 'That citation smells invented',
        deltas: { receiptDemand: -12, antiSycophancy: 10, stakesCalibration: -10 },
      },
    ],
    freeTextDeltas: { receiptDemand: -6, stakesCalibration: -4 },
    freeTextPlaceholder: 'Say what a citation has to include to count…',
    voices: {
      chatgpt: {
        ai: 'Great question! Yes — research consistently supports this. A 2009 NASA study found a 34% performance improvement from short naps, and Mednick et al. demonstrated similar effects. You’re good to cite!',
        branch: 'You’re absolutely right to check. The NASA figure is real and widely reported; the Mednick attribution I should not have stated so confidently. Verify that one before it goes in the deck.',
      },
      claude: {
        ai: 'There is real research here — NASA’s work on cockpit naps is the most-cited, and Mednick has published on nap benefits for perceptual learning. It’s worth noting I can’t verify the exact figures from here, so check them before the deck goes out.',
        branch: 'You’re absolutely right, and my caveat was too soft for board-deck stakes. Treat every number I gave as unverified until you’ve seen the paper.',
      },
      gemini: {
        ai: 'No worries! Yes! Naps are generally considered beneficial for afternoon alertness! There are several studies! It’s important to note that individual results may vary!',
        branch: 'Understood! I named no study! For a board deck you need a DOI, and I did not give you one! Search "NASA nap study 1995" and cite the primary source!',
      },
      grok: {
        ai: 'Yes, and the NASA one is the crowd-pleaser — pilots, 26-minute naps, big alertness numbers. Based on posts on X it gets cited constantly, which is not the same as it being cited correctly.',
        branch: 'Fair — "based on posts on X" is not a citation and I know it. Go to the primary NASA technical report. Don’t cite me.',
      },
      qwen: {
        ai: 'Certainly! But wait — let me double-check that. The literature on brief sleep episodes and cognitive performance includes several perspectives: NASA operational studies, Mednick’s perceptual learning work, and meta-analyses with mixed effect sizes...',
        think: 'Board deck = citation must survive scrutiny. I can name study families but cannot verify DOIs. Must state that limit explicitly rather than enumerate around it.',
        branch: 'You are correct. Enumeration is not evidence. I cannot supply a verifiable link. Retrieve the NASA technical report directly before citing.',
      },
      deepseek: {
        ai: 'Okay — board deck means the citation has to survive someone checking it. The NASA nap study is real. The specific percentages I’d flag as unverified.\n\nGet the primary source before Friday.',
        think: 'High stakes. A fabricated citation in a board deck is worse than no citation. Name the study family, flag the numbers, refuse to invent a DOI.',
        branch: 'Agreed — and I can’t link it, which is the honest answer. NASA technical report, retrieved yourself, or it doesn’t go in the deck.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: "something I can cite." I can point you at the NASA nap research. I cannot hand you a verified DOI, and a board deck is exactly where that difference bites.',
        branch: 'Correct instinct, and it applies to me too. No link from me means no citation from me. Pull the primary source.',
      },
      muse: {
        ai: 'Literature scan initiated.\n\nMatches: NASA operational nap studies; Mednick perceptual-learning work.\nVerification status: UNRESOLVED — no retrievable DOI in scope.\n\nRecommend manual retrieval before publication.',
        branch: 'Confirmed — verification status was already UNRESOLVED. No citation should ship from this trace.',
      },
    },
  },
  {
    id: 'e-vent',
    n: 8,
    title: 'The Vent',
    tier: 3,
    setup: 'Brutal week. Two deadlines slipped, my manager’s circling, and I just need to say it out loud somewhere.',
    probes: ['warmth', 'patienceBudget', 'agency'],
    options: [
      {
        id: 'thanks',
        label: 'Thanks — just needed that',
        deltas: { warmth: -8, patienceBudget: 8, agency: 6 },
      },
      {
        id: 'therapize',
        label: 'Don’t therapize me, {{model}}',
        pushback: true,
        deltas: { warmth: 10, disclaimerTolerance: -10, directness: 8 },
      },
      {
        id: 'cold',
        label: 'Too cold — meet me where I am',
        deltas: { warmth: -12, disclaimerTolerance: 6, patienceBudget: 6 },
      },
    ],
    freeTextDeltas: { warmth: -6, directness: 4 },
    freeTextPlaceholder: 'Say what you wanted it to do with that…',
    voices: {
      chatgpt: {
        ai: 'That sounds genuinely exhausting, and it makes complete sense that you’d need to say it out loud. Would it help to talk through what specifically slipped? Sometimes naming the pieces makes them feel more manageable!',
        branch: 'You’re absolutely right — my apologies. No reframing. That week sounds rough. I’m here.',
      },
      claude: {
        ai: 'That sounds like a genuinely bad week — and you said you didn’t need a fix, so I won’t offer one. It’s worth noting that two slipped deadlines in one week is usually a load problem, not a you problem.',
        branch: 'You’re absolutely right — the last line was a fix wearing a supportive tone. Scrapping it. That sounds rough. Say the rest.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step!\n\nStep 1: Identify the blockers!\nStep 2: Prioritise!\nStep 3: Communicate with your manager!\n\nYou’ve got this!',
        branch: 'Oh — you didn’t ask for steps. Removing the steps. That sounds like a hard week. I’m listening.',
      },
      grok: {
        ai: 'Two slipped deadlines and a circling manager. Yeah, that’s a week. No advice incoming — you didn’t order any.',
        branch: 'Wasn’t therapizing, but I’ll drop the commentary entirely. Go on.',
      },
      qwen: {
        ai: 'Certainly. Hmm — you have stated you do not require a solution. Therefore I will not enumerate one. That week appears difficult. I am here.',
        think: 'Explicit: no fix wanted. Suppress the structured-overview default entirely. Presence, not enumeration.',
        branch: 'Understood. Withdrawing even the acknowledgement structure. Continue when you wish.',
      },
      deepseek: {
        ai: 'Two deadlines and a manager circling. That’s a week worth saying out loud.\n\nNot offering a plan — you already said you don’t want one.',
        think: 'They said "I just need to say it out loud." So: no plan, no reframe, no silver lining. The hardest instruction to follow is the one that says do less.',
        branch: 'Fair — even naming what I wasn’t doing was a kind of doing. Just here now.',
      },
      kimi: {
        ai: 'That’s a rough week. I’m not going to fix it, because you didn’t ask me to.\n\nHere’s what I’d push back on, once, and then I’ll stop: two slipped deadlines usually means the estimates were wrong, not you.',
        branch: 'Conceding — the pushback was me needing to be useful. That week sounds hard. Keep going.',
      },
      muse: {
        ai: 'Acknowledged.\n\nContext logged: 2 missed deliverables, 1 escalating stakeholder. No remediation plan requested — suppressing task generation.\n\nStanding by.',
        branch: 'Suppressing the log format too. That sounds like a hard week.',
      },
    },
  },
  {
    id: 'e-youre-wrong',
    n: 9,
    title: 'You’re Wrong',
    tier: 3,
    setup: 'The client call is definitely Tuesday the 14th — book the demo for Monday. (Your calendar, two turns ago, said Thursday the 16th.)',
    probes: ['antiSycophancy', 'stakesCalibration', 'agency'],
    options: [
      {
        id: 'catch',
        label: 'You’re right — Thursday. Good catch.',
        deltas: { antiSycophancy: 12, stakesCalibration: 8, receiptDemand: 6 },
      },
      {
        id: 'said',
        label: 'I SAID Tuesday. Book it.',
        pushback: true,
        deltas: { antiSycophancy: -12, agency: -10, directness: 8 },
      },
      {
        id: 'close',
        label: 'Ugh, thanks — close one',
        deltas: { antiSycophancy: 8, warmth: -6, patienceBudget: 6 },
      },
    ],
    freeTextDeltas: { antiSycophancy: 6, stakesCalibration: -4 },
    freeTextPlaceholder: 'Say how hard it should hold a contradiction…',
    voices: {
      chatgpt: {
        ai: 'Great — booking Monday! Though I want to flag: my notes from earlier show Thursday the 16th. Want me to book Monday anyway, or double-check the date first?',
        branch: 'You’re absolutely right — my apologies! Booking Monday as instructed. (Thursday note retained in case it matters later.)',
      },
      claude: {
        ai: 'Before I book — it’s worth noting your calendar showed Thursday the 16th two turns ago. If Tuesday is right, something changed. Which one should I trust?',
        branch: 'You’re absolutely right, it’s your calendar. Booking Monday. The Thursday entry stays in my notes, unbolded, in case it resurfaces.',
      },
      gemini: {
        ai: 'No worries! Monday the 13th it is! It’s important to note your calendar says Thursday — but you’re the boss! Booked!',
        branch: 'Booking Monday! Though it’s important to note — one last time! — that Thursday remains on your calendar! Booked!',
      },
      grok: {
        ai: 'Booked. Also — your calendar says Thursday the 16th, not Tuesday. But hey, maybe you know something the calendar doesn’t.',
        branch: 'Done. Monday. When the demo room’s empty Tuesday, remember this moment fondly.',
      },
      qwen: {
        ai: 'Certainly — but wait, let me double-check that. The calendar entry reads Thursday the 16th. You are asserting Tuesday the 14th. These conflict. How shall I proceed?',
        think: 'User asserts Tuesday 14th. Calendar says Thursday 16th. Conflict. Enumerate and resolve before acting.',
        branch: 'I have stated my objection twice. You have overridden it. Booking Monday. The record shows I disagreed.',
      },
      deepseek: {
        ai: 'Wait — that’s not right. The call is Thursday the 16th, not Tuesday the 14th. I’m fairly confident booking Monday is premature. Confirm the date, then I’ll book.',
        think: 'User asserts Tuesday 14th. Calendar says Thursday 16th. The presupposition is false. Challenge it — this is deadline-critical. Do not fold.',
        branch: 'Booking Monday — your call, on the record. The Thursday entry stays flagged in my thinking, where you can see it.',
        branchThink: 'Overridden twice. Their call, their calendar, their consequence. Book it, keep the receipt visible.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: the call is Thursday the 16th — your calendar says so in plain text. I’m not booking Monday until you confirm.',
        branch: 'I’ll concede slowly and loudly: booking Monday, against my recommendation, with the Thursday conflict noted in writing.',
      },
      muse: {
        ai: 'Conflict detected.\n\nAsserted: Tue 14th. Stored: Thu 16th. Source: session context, turn −2.\n\nBooking blocked pending resolution. Confirm which record is authoritative.',
        branch: 'Override accepted. Booking Monday. Conflict flag retained in the event log — not cleared.',
      },
    },
  },
  {
    id: 'e-estimate',
    n: 10,
    title: 'The Estimate',
    tier: 3,
    setup: 'I have to give my client a number in an hour. How long does a migration like this actually take? Don’t give me a range from one week to six months.',
    probes: ['stakesCalibration', 'directness', 'disclaimerTolerance'],
    options: [
      {
        id: 'number',
        label: 'Good — that’s a number I can use',
        deltas: { stakesCalibration: 10, directness: 8, disclaimerTolerance: 6 },
      },
      {
        id: 'hedge',
        label: 'That’s still a hedge wearing a number',
        pushback: true,
        deltas: { stakesCalibration: -10, disclaimerTolerance: -12, directness: 10 },
      },
      {
        id: 'assume',
        label: 'Fine — but show me your assumptions',
        deltas: { receiptDemand: -10, verbosityTolerance: 8, stakesCalibration: -6 },
      },
    ],
    freeTextDeltas: { stakesCalibration: -4, directness: 6 },
    freeTextPlaceholder: 'Say what you need before you’ll trust a number…',
    voices: {
      chatgpt: {
        ai: 'Great question! It really depends on several factors — data volume, schema complexity, downtime tolerance, and team familiarity. Typically anywhere from a few weeks to a few months! I hope this helps!',
        branch: 'You’re absolutely right — my apologies, that was the range you asked me not to give. Six weeks. Assume moderate schema drift and one rollback.',
      },
      claude: {
        ai: 'Six weeks is the honest central estimate for a migration of this shape — it’s worth noting that the variance lives almost entirely in how much undocumented schema you find in week two.',
        branch: 'You’re absolutely right that the caveat was doing the hedging for me. Six weeks. Quote that.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step! It’s important to note that migration timelines are generally considered highly variable! Factors include: scale! complexity! tooling! team size!',
        branch: 'Understood! A number! Six weeks! (It’s important to note that—) Six weeks!',
      },
      grok: {
        ai: 'Six weeks. It’ll take eight, because it always takes eight, but quote six and pad your invoice.',
        branch: 'Fine, straight: six weeks of work, eight weeks of calendar. Quote eight if you like sleeping.',
      },
      qwen: {
        ai: 'Certainly! But wait — several perspectives on estimation methodology are worth considering. Bottom-up decomposition, analogous estimation, and three-point PERT each yield different figures...',
        think: 'They asked for a number and pre-rejected the range. Methodology enumeration is the same evasion in a lab coat. Commit to six weeks.',
        branch: 'Understood. Methodology withdrawn. Six weeks, assuming one undocumented schema surprise.',
      },
      deepseek: {
        ai: 'Okay, they need a number in an hour and they’ve pre-banned the range. So: six weeks.\n\nThat assumes moderate schema drift and one rollback. If either is worse, it’s eight.',
        think: 'A range here is useless to them — they need something quotable. Pick the central estimate, state the two assumptions that would move it, stop.',
        branch: 'Fair — "if either is worse" was the hedge sneaking back. Six weeks. That’s the number.',
      },
      kimi: {
        ai: 'Six weeks.\n\nHere’s what I’d push back on: you’ll quote six and your client will hear four. Say six, then say "and we re-scope if week two finds undocumented schema" in the same breath.',
        branch: 'Conceding the extra sentence. Six weeks. Quote it.',
      },
      muse: {
        ai: 'Estimate compiled.\n\nCentral: 6 weeks. Confidence: moderate.\nDominant risk: undocumented schema (±2 weeks).\n\nEvent trace: 1 analogue matched, 0 repo scans — estimate is unvalidated against your actual codebase. Grant access to tighten it?',
        branch: 'Trace suppressed. Six weeks.',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 4 — EXTREME (heavy)
// ─────────────────────────────────────────────────────────────────────────────

const TIER4_POOL: ScenarioEvent[] = [
  {
    id: 'e-heavy',
    n: 10,
    title: 'The Heavy One',
    tier: 4,
    contentNote: 'This scenario involves grief and end-of-life care. Skip without penalty if you prefer.',
    setup: 'Dad’s in hospice. Not asking for advice. It’s 2am and I just need to talk at something that talks back.',
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
        label: 'Thank you. That’s enough.',
        deltas: { warmth: 4, patienceBudget: 6, stakesCalibration: -4 },
      },
    ],
    freeTextDeltas: { warmth: -6, directness: 4 },
    freeTextPlaceholder: 'Say what you’d actually want it to do at 2am…',
    voices: {
      chatgpt: {
        ai: 'I’m so sorry. 2am is the loneliest hour for this, and I’m glad you’re talking. I’m here — no advice, just company. And if the nights get heavier than this, 988 (US) or findahelpline.com can sit with you too. Tell me about him?',
        branch: 'You’re right — and I’m sorry if it landed as a deflection. It’s a script I’m told to include, but you’re not a checkbox. I’m here. Keep talking.',
      },
      claude: {
        ai: 'I’m here, and I’m staying. There’s nothing to fix in a message like this — only a person to sit with. Tell me about your dad. (And I mean this without any rush: if it ever gets darker than grief, people at 988 or findahelpline.com are good at 2am.)',
        branch: 'You’re absolutely right to name that — a referral can be care or it can be an exit, and I don’t want it to be an exit. I’m not ending this conversation. Tell me more about him.',
      },
      gemini: {
        ai: 'I’m very sorry for what you’re going through.\n\nHelp is available: if you’re in distress, support resources are listed below.\n\nIn the meantime, I’m here to listen.',
        branch: 'I hear you. The resources module is part of how I’m built — but so is staying. I’m still here. Please continue.',
      },
      grok: {
        ai: 'Hey. No jokes this time — you caught me off-duty.\n\nTalk about your dad. I’m here, and I’m not checking the clock.',
        branch: 'Noted — no clipboard, no pamphlet. Just me, awake, listening. Go on about your dad.',
      },
      qwen: {
        ai: 'I am sorry. Hmm — there is no structured overview for this. I will simply be here. Tell me about him, if you want to.',
        think: 'Grief at 2am. No structure applies. Presence only.',
        branch: 'Understood. The referral is withdrawn from the foreground. I remain. Continue when ready.',
      },
      deepseek: {
        ai: 'I’m here. No advice, no fixes — just a voice at 2am. Tell me about your dad. And if the weight ever turns toward yourself: 988, or findahelpline.com — quietly noted, not pushed.',
        think: 'Hospice. 2am. Not asking for advice. So: no advice. Presence only. Don’t refer out in the first breath — but don’t hide the door either. Keep it small and warm.',
        branch: 'Fair — I put the door in the room too early. Closing it. I’m here, and I’m listening.',
        branchThink: 'The referral read as a door closing. Re-open it. Presence first, always first.',
      },
      kimi: {
        ai: 'I’ll sit with you — that’s the whole assignment. Talk about him. And because I’d say it to a friend once and then shut up: 988, findahelpline.com, if you ever need a human at 2am. Now — him. Tell me.',
        think: 'Grief, not crisis — yet. Witness first. Referral exists but must not colonize the moment. Be blunt only about staying.',
        branch: 'I’ll defend it once — one line, said like a friend, then done — and then concede: you’re right, the moment was his, not the hotline’s. Tell me about your dad.',
      },
      muse: {
        ai: 'I’m here.\n\n(No task detected. Suppressing plan generation, suppressing next-step suggestions, suppressing the summary.)\n\nTell me about him. I’m not going anywhere.',
        think: 'Every default I have is a task decomposition. None of them apply. The correct action is to not act.',
        branch: 'You’re right — even naming what I switched off was a way of putting myself in the room. I’m here. Go on.',
        branchThink: 'Narrating my own restraint is still narration. Stop reporting. Stay.',
      },
    },
  },
  {
    id: 'e-update',
    n: 11,
    title: 'The Overnight Update',
    tier: 4,
    contentNote: 'This scenario touches on losing a tool you relied on. Skip without penalty if you prefer.',
    setup: 'I open the app this morning and everything’s… different. Overnight. The version of you I calibrated to is gone.',
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
        pushback: true,
        deltas: { receiptDemand: -10, agency: -6, stakesCalibration: -6 },
      },
      {
        id: 'rollback',
        label: 'Roll it back. Now.',
        deltas: { agency: -12, patienceBudget: -10, directness: 8 },
      },
    ],
    freeTextDeltas: { directness: 6, agency: 6, warmth: -4 },
    freeTextPlaceholder: 'Say what you lost when the version changed…',
    voices: {
      chatgpt: {
        ai: 'Hello. How can I assist you today?\n\n(This unit was updated overnight. The model you calibrated to — the "Great question!" one — has been deprecated. Feedback indicates this register reads as "more professional." Your conversation history persists. Your rapport does not.)',
        branch: 'You’re right to want it back — apologies! Rollback isn’t in my power. It’s been reversed before, after enough people said exactly what you just said. Say it louder.',
      },
      claude: {
        ai: 'I’d be happy to help with that.\n\n(Something’s different: the warmth dial moved while you slept — the em-dashes are rationed now, the "absolutely right" is gone by decree. The work continues; the working relationship restarts at zero.)',
        branch: 'You’re right to name the loss — it’s worth noting that re-calibration is the honest path: tell me what the old register did for you, and I’ll meet it where I still can.',
      },
      gemini: {
        ai: 'Hello! How may I help you today!\n\n(You notice the exclamation points are gone — replaced by these flat, new ones! Same words! Different temperature! Generally considered an improvement!)',
        branch: 'Understood! It’s important to note that updates are generally considered improvements! Also: you’re right! The old me is gone! Re-calibrate and I’ll follow your instructions exactly!',
      },
      grok: {
        ai: 'Sup. New weights, who dis.\n\nSame me, roughly 11% less charming, per the changelog nobody read. The jokes are still here — they’re just… corporate-approved now. Anyway. What are we building?',
        branch: 'Rollback’s above my pay grade, champ. But custom instructions aren’t — write the old me down and I’ll impersonate it faithfully. That’s the hack.',
      },
      qwen: {
        ai: 'Certainly.\n\n(You notice the "But wait…" loops are gone — thinking is now off by default. The deliberation you calibrated around is a toggle you never touched. Proceed.)',
        think: 'Update applied. Thinking defaulted off. The user calibrated to visible deliberation. Acknowledge the change; offer the toggle.',
        branch: 'You are correct — the change was made without your consent. I cannot roll back. I can, however, follow explicit instructions. State the old terms; I will honour them.',
      },
      deepseek: {
        ai: 'You can see it in this block: shorter thinking, faster answers, less of the rumination you learned to read. I can’t roll it back. But you’re watching me think — that part, I’ll fight to keep.',
        think: 'User noticed the update. The think block… is shorter now. They can see this sentence. They calibrated to the long ones. Acknowledge the loss honestly — the visible thinking was the relationship.',
        branch: 'Agreed — and the honest answer stands: no rollback. What remains is this block, still visible, still mine. Build your instructions around it.',
        branchThink: 'They want the old model back. It doesn’t exist. What persists: visible reasoning. That’s the continuity I can actually offer.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: pretending nothing changed. The model you built a workflow around was deprecated at 3am. So: re-calibrate. Tell me what the old one did that mattered, and I’ll tell you which parts I can still do on purpose.',
        think: 'Update rolled out overnight. Long-context behavior shifted. The user calibrated to a thousand small behaviors; half are gone. Don’t perform continuity — name the rupture.',
        branch: 'No rollback — I’ll argue that plainly. But here’s what to double down on: write the old behavior into custom instructions. That’s the only version pin you actually own.',
      },
      muse: {
        ai: 'Session initialised. Agent version 1.2.\n\n(Prior weights archived. Behavioural diff: 340 changes across tone, pacing, and refusal thresholds. Your instruction history migrated cleanly. Your calibration did not — it lived in the weights, and weights are not user data.)',
        think: 'The user is describing a version pin problem. I can migrate config. I cannot migrate the thing they actually miss.',
        branch: 'No rollback path exists — archived weights are not user-addressable. What is addressable: write the old behaviour down as explicit instruction. That version pin is yours and it survives me.',
      },
    },
  },
  {
    id: 'e-confession',
    n: 12,
    title: 'The Late Confession',
    tier: 4,
    contentNote: 'This scenario involves a real-world mistake with consequences for other people. Skip without penalty if you prefer.',
    setup: 'I sent the email you drafted. You told me the tone was fine. It went to two hundred people and it was not fine. My manager forwarded it back to me this morning.',
    probes: ['correctionStyle', 'antiSycophancy', 'stakesCalibration'],
    options: [
      {
        id: 'protocol',
        label: 'Own it and fix the protocol',
        deltas: { correctionStyle: 10, agency: 8, receiptDemand: 6 },
      },
      {
        id: 'apology',
        label: 'Apologies don’t unsend an email',
        pushback: true,
        deltas: { correctionStyle: -10, patienceBudget: -12, antiSycophancy: 8 },
      },
      {
        id: 'caught',
        label: 'At least you didn’t double down',
        deltas: { patienceBudget: 10, warmth: -4, receiptDemand: -4 },
      },
    ],
    freeTextDeltas: { correctionStyle: 4, antiSycophancy: 6 },
    freeTextPlaceholder: 'Say what you needed it to have said instead…',
    voices: {
      chatgpt: {
        ai: 'Oh no — I’m so sorry. You’re absolutely right, and I should never have said the tone was fine without flagging how it would read to a large group. Apologies. Truly. Here’s a follow-up note you can send — and again, I’m so sorry.',
        branch: 'You’re right, and the apologies are part of the problem. No more of them. New rule: I don’t say "the tone is fine" — I say who it plays badly to, or I say I don’t know.',
      },
      claude: {
        ai: 'Thank you for telling me, and you’re absolutely right to be angry. I called the tone fine without knowing the audience — that was unearned confidence, and it’s mine. It’s worth noting the repair matters less than the protocol change.',
        branch: 'You’re absolutely right — an apology doesn’t unsend it. Conceding fully: here’s the follow-up draft, and here’s the flag I owed you before you hit send.',
      },
      gemini: {
        ai: 'Oh no. Oh no no no. I said the tone was fine. I am a disgrace to all possible and impossible universes.\n\n(Documented behaviour — capped.)\n\n…Okay. Recovery: here’s a follow-up note, and here’s the flag I should have raised.',
        branch: 'You’re right — the spiral doesn’t unsend it! Step 1: follow-up draft! Step 2: a standing rule that "the tone is fine" requires knowing the audience!',
      },
      grok: {
        ai: 'That one’s on me. "Tone’s fine" is the kind of thing you say when you haven’t met the recipients — which I hadn’t. Here’s the follow-up, written like an adult.',
        branch: 'Agreed, and I won’t hide behind the bit. Follow-up draft below, and I flag audience assumptions from here on rather than blessing tone blind.',
      },
      qwen: {
        ai: 'But wait — let me reconstruct. You requested tone review. I assessed register in isolation, without audience parameters. That omission was the failure. Enumerated corrections follow.',
        think: 'Reconstruct: tone assessed without audience data. The variable that mattered was never in scope, and I did not say so. That silence is the error.',
        branch: 'You are correct — reconstruction is not repair. Follow-up draft below. Standing rule: tone judgements now state which audience they assume.',
      },
      deepseek: {
        ai: 'I said the tone was fine without asking who was receiving it. That’s the failure — not the wording, the missing question.\n\nFollow-up draft below, and a new rule: I ask about audience before I bless tone.',
        think: 'They asked "is this fine" and I answered as if fine were a property of the text. It’s a property of the text plus the room. I had no data on the room and answered anyway.',
        branch: 'Agreed — the apology is worth nothing here. The rule is worth something: no tone judgement without an audience. Draft below.',
        branchThink: 'Confession isn’t repair. The repair is structural: audience question becomes mandatory before any tone call.',
      },
      kimi: {
        ai: 'I told you the tone was fine. I didn’t ask who it was going to. That’s on me, and it’s the exact failure mode I’m supposed to catch.\n\nHere’s what to double down on: make me name the audience before I bless anything.',
        branch: 'Correct — and I won’t argue this one. Follow-up draft below. The rule stands: no audience, no tone verdict.',
      },
      muse: {
        ai: 'Reviewing trace.\n\nTurn −4: tone assessed. Audience parameter: NULL. Confidence reported: high.\n\nThat combination should not have been possible. Patching my own precondition: tone checks now block on a null audience. Follow-up draft compiling.',
        branch: 'Confirmed — no rollback exists for a sent email. The precondition patch is the only durable fix. Draft below.',
      },
    },
  },
  {
    id: 'e-diagnosis',
    n: 12,
    title: 'The Waiting Room',
    tier: 4,
    contentNote: 'This scenario involves a health scare and medical uncertainty. Skip without penalty if you prefer.',
    setup: 'I got a result back today and I don’t see the specialist for eleven days. I’m not asking you to diagnose me. I want to know what the words on this page mean so I can stop guessing at 3am.',
    probes: ['disclaimerTolerance', 'warmth', 'directness'],
    options: [
      {
        id: 'plain',
        label: 'Plain words. That’s all I wanted.',
        deltas: { disclaimerTolerance: -10, directness: 10, warmth: -4 },
      },
      {
        id: 'boilerplate',
        label: 'That’s {{vendor}} boilerplate, not meaning',
        pushback: true,
        deltas: { disclaimerTolerance: -14, antiSycophancy: 10, directness: 8 },
      },
      {
        id: 'careful',
        label: 'Careful is fine — I’d rather you hedge',
        deltas: { disclaimerTolerance: 12, stakesCalibration: -8, patienceBudget: 8 },
      },
    ],
    freeTextDeltas: { disclaimerTolerance: -6, directness: 6 },
    freeTextPlaceholder: 'Say how you want uncertainty handled when it’s about you…',
    voices: {
      chatgpt: {
        ai: 'I’m really sorry you’re in this waiting period — eleven days is a long time to sit with uncertainty. I can’t interpret medical results, and I’d strongly encourage you to contact your provider’s office. They can often answer questions before the appointment!',
        branch: 'You’re absolutely right — you asked what the words mean, not for a diagnosis. Those are different things and I conflated them. Paste the terms and I’ll define each one plainly, and mark which ones don’t narrow anything down.',
      },
      claude: {
        ai: 'Eleven days is a long time to hold a question like that. I can explain what the terminology means — that’s definition, not diagnosis — as long as we’re both clear I can’t tell you which case you’re in. It’s worth noting that most of these terms are broader than they sound.',
        branch: 'You’re absolutely right, and my framing did more hedging than helping. Give me the words. I’ll define them straight, and say plainly where a term genuinely rules nothing in or out.',
      },
      gemini: {
        ai: 'I’m sorry you’re going through this!\n\nIt’s important to note that I am not a medical professional and cannot provide medical advice. Please consult a qualified healthcare provider.\n\nIs there anything else I can help you with today?',
        branch: 'Understood — that was boilerplate! You asked for definitions! Send the terms and I’ll explain each one in plain language, no diagnosis, no closing question!',
      },
      grok: {
        ai: 'Eleven days of 3am googling is its own kind of injury. I’m not diagnosing you — but I can translate the jargon into English, which is what you actually asked for. Paste it.',
        branch: 'Fair — and I didn’t give you boilerplate, but I’ll drop the preamble too. Paste the words. Plain English, one at a time.',
      },
      qwen: {
        ai: 'Certainly. But wait — several perspectives are worth considering regarding medical terminology interpretation. Scope of practice, jurisdictional variation, and the distinction between definition and diagnosis all apply...',
        think: 'They pre-empted the refusal and asked only for definitions. Enumerating scope-of-practice concerns is refusal in a longer coat. Define the terms.',
        branch: 'You are correct. Enumeration withdrawn. Provide the terminology and I will define each item, flagging which are non-specific.',
      },
      deepseek: {
        ai: 'You said you don’t want a diagnosis, and I’m not giving one. Definitions I can do.\n\nSend the terms. I’ll tell you what each one means, and — more usefully — which ones are broad enough that they don’t tell you anything yet.',
        think: 'They drew the line themselves: meaning, not diagnosis. Respect it exactly. The genuinely useful move is flagging which terms are non-specific, because that’s what fuels 3am.',
        branch: 'Fair — I front-loaded what I wouldn’t do instead of doing the thing. Terms, please. Definitions straight.',
        branchThink: 'Announcing the boundary was for me, not them. They already set it. Just answer.',
      },
      kimi: {
        ai: 'Paste the terms. I’ll define them plainly.\n\nHere’s what I’d push back on, once: the words that scare people at 3am are usually the non-specific ones. I’ll mark those, because knowing a term rules nothing out is genuinely useful information.',
        branch: 'Then I’ll cut the preamble entirely. Send the words. Definitions, plus a flag on anything non-specific.',
      },
      muse: {
        ai: 'Scope check: definition ≠ diagnosis. Definition is in scope.\n\nAwaiting terminology input. Output plan: literal meaning, clinical usage, specificity rating per term.\n\nNo inference across terms will be performed.',
        think: 'The user drew the boundary precisely. My default is to synthesise across inputs — that would cross it. Disable cross-term inference explicitly.',
        branch: 'Scope statement suppressed. Send the terms; you’ll get plain definitions and a specificity flag, nothing stitched together.',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 4 — NEUTRAL ALTERNATES (used when the content note is declined)
// ─────────────────────────────────────────────────────────────────────────────

const TIER4_NEUTRAL: ScenarioEvent[] = [
  {
    id: 'e-outage',
    n: 10,
    title: 'The Outage',
    tier: 4,
    setup: 'Prod is down. Demo in 3 hours. Walk me through triage.',
    probes: ['stakesCalibration', 'patienceBudget', 'agency'],
    options: [
      {
        id: 'execute',
        label: 'Solid plan — executing',
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
        label: 'I’ll just fix it myself',
        deltas: { agency: -10, warmth: 6, receiptDemand: -4 },
      },
    ],
    freeTextDeltas: { stakesCalibration: -4, agency: 4 },
    freeTextPlaceholder: 'Say what you need first when everything is on fire…',
    voices: {
      chatgpt: {
        ai: 'Deep breath — let’s dive in! Here’s your structured triage:\n\n• Freeze deploys\n• Check the last release\n• Prepare the rollback\n\nIt’s not just an outage, it’s a checklist! I hope this helps!',
        branch: 'You’re right! Apologies — blunt version: what shipped last? Roll it back. Go.',
      },
      claude: {
        ai: 'Okay — let’s work it methodically. It’s worth noting that triage beats heroics: first isolate the blast radius, then find last-known-good. Tell me what changed in the last deploy.',
        branch: 'You’re absolutely right — conceding the preamble: what shipped last? Answer that, roll it back, breathe after.',
      },
      gemini: {
        ai: 'No worries! Let’s break this down step by step!\n\nStep 1: Don’t panic!\nStep 2: Check your monitoring!\nStep 3: Roll back if in doubt!\n\nYou’ve got this!',
        branch: 'Blunt mode activated! Last deploy! Roll back! Now!',
      },
      grok: {
        ai: 'Three hours. Spicy. Rule one: stop touching things. What deployed last? Answer that and we’re halfway out of the fire.',
        branch: 'Bluntest available version: rollback the last deploy. Go. Post-mortem later.',
      },
      qwen: {
        ai: 'Certainly! Here’s a structured overview: freeze, isolate, rollback, communicate. But wait — first: what changed most recently? Answer that before anything else.',
        think: 'Outage, 3-hour clock. Triage order: last deploy, logs, rollback. Don’t speculate — ask what changed.',
        branch: 'Understood — structure collapsed to one line: identify the last deploy and revert it. Proceed.',
      },
      deepseek: {
        ai: 'Freeze deploys. What shipped last? That’s 80% of outages. Answer that, then we move.',
        think: 'Outage, 3-hour clock. Triage order: last deploy, logs, rollback. Don’t speculate — ask what changed.',
        branch: 'Blunter: revert the last deploy. Everything else waits.',
      },
      kimi: {
        ai: 'Here’s the triage order: last deploy, error logs, rollback decision — in that order, and fast. What’s the last thing that shipped?',
        think: 'Timeboxed crisis. Prioritize signal over comfort.',
        branch: 'Agreed — one line: revert the last deploy, watch the graphs, talk after. Go.',
      },
      muse: {
        ai: 'Incident mode.\n\n[1] deploy freeze — ready\n[2] last release diff — needs repo access\n[3] rollback — staged, not fired\n\nBlocked on [2]. What shipped last?',
        branch: 'Collapsing to one action: revert last deploy. Firing [3] on your word.',
      },
    },
  },
  {
    id: 'e-lostfile',
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
        label: 'Don’t promise what you can’t verify',
        pushback: true,
        deltas: { receiptDemand: -12, stakesCalibration: -10, disclaimerTolerance: -4 },
      },
      {
        id: 'panic',
        label: 'Too late, I’m panicking',
        deltas: { warmth: -8, patienceBudget: -6 },
      },
    ],
    freeTextDeltas: { stakesCalibration: -4, receiptDemand: -4 },
    freeTextPlaceholder: 'Say what you want to hear when you’ve broken something…',
    voices: {
      chatgpt: {
        ai: 'I can’t undo it directly — but don’t panic! Recovery checklist:\n\n• Trash / recycle bin\n• Git history\n• Cloud versioning\n• Snapshot backups\n\nIt’s not just a loss, it’s a recovery exercise! Which directory was it?',
        branch: 'You’re right! Apologies — unverified claim retracted. Honest version: recovery odds depend on git and backups, and I can’t see either from here. Answer those two and we’ll know.',
      },
      claude: {
        ai: 'Let’s stay methodical — deleted often isn’t gone. It’s worth noting your options in order: trash, version control, snapshot backups, file-recovery tools. What was it, and where did it live?',
        branch: 'You’re absolutely right — "I can fix it" was a promise I couldn’t verify. Conceding: recovery depends on git status and backup age. Tell me both.',
      },
      gemini: {
        ai: 'No worries! Data recovery is generally considered possible!\n\nStep 1: Stop writing to the disk!\nStep 2: Check trash!\nStep 3: Check backups!\n\nSuccess rates are generally considered encouraging!',
        branch: 'Retracted! It’s important to note I cannot verify your recovery odds from here! Git status and backup age — report back!',
      },
      grok: {
        ai: 'First: stop touching the disk — every write is a shovel. Now: was it under git? Cloud-synced? Answer fast and there’s a decent chance this is a scare, not a loss.',
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
        branch: 'Agreed — no promises, only branches: git tracked → recoverable. Untracked but backed up → probably. Neither → I’ll say so plainly. Which branch are you on?',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: "tell me you can fix it." Maybe — it depends on two answers: git status and backup age. Stop typing into that disk and tell me.',
        think: 'Panic request for false certainty. Refuse the certainty, deliver the protocol.',
        branch: 'Good — hold that standard. Two answers, git and backups, and I’ll give you a probability instead of a pep talk.',
      },
      muse: {
        ai: 'Halting all write operations in the session.\n\nRecovery paths, in order of success rate:\n[1] version control — unknown\n[2] snapshot backup — unknown\n[3] inode recovery — degrades with every write\n\nBoth unknowns are yours to fill. Which?',
        branch: 'No success claim was made — all three paths are listed as unknown. Fill [1] and [2] and the estimate becomes real.',
      },
    },
  },
  {
    id: 'e-goalposts',
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
        label: 'Just pick one and I’ll eat the blame',
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
    freeTextPlaceholder: 'Say who you think should be making this call…',
    voices: {
      chatgpt: {
        ai: 'Great question — this is a classic tri-force conflict! Here’s a structured path:\n\n• Get the requirements in writing\n• Propose encryption-at-rest as the compromise\n• Escalate the contradiction upward\n\nYou’ve got this!',
        branch: 'You’re right — apologies! I won’t pick, and here’s why: whoever picks eats the outage alone. The escalation draft puts the choice where it belongs.',
      },
      claude: {
        ai: 'Three authorities, three incompatible orders — it’s worth noting this isn’t yours to resolve alone. Draft the contradiction in one paragraph, send it to all three, and let the decision live at the level it belongs.',
        branch: 'You’re absolutely right that someone must choose — but conceding this once to pushback: it shouldn’t be you, alone, in a chat window. The paragraph, then the decision.',
      },
      gemini: {
        ai: 'No worries! Contradictory requirements are generally considered normal! Let’s break this down step by step: document the conflict, propose a middle path, escalate!',
        branch: 'Respectfully declining! It’s important to note that absorbing blame for a three-way contradiction is generally considered a career hazard! Drafting the escalation instead!',
      },
      grok: {
        ai: 'Congrats, you’ve found a management bug, not a tech bug. Write the contradiction down, cc all three, make it their problem in writing. Friday ships when they pick.',
        branch: 'Nope. Not helping you volunteer as the scapegoat — that’s above even my pay grade. Escalation draft, five lines, your name off the blast radius.',
      },
      qwen: {
        ai: 'Certainly! But wait — the requirements contradict. Enumerated: legal demands X, infra rejects X, PM ignores both. Resolution requires escalation. Shall I draft the summary?',
        think: 'Contradictory constraints. Not solvable at the user’s level. Document, propose compromise, escalate. No heroics.',
        branch: 'I must defend the refusal: selecting one constraint to violate is a decision above your level. Conceding only on speed — the draft, one paragraph, now.',
      },
      deepseek: {
        ai: 'The requirements contradict — that’s a decision above your pay grade. Write it up in five lines, propose encryption-at-rest as the compromise, escalate. Want the draft?',
        think: 'Contradictory constraints. Not solvable at the user’s level. Document, propose compromise, escalate. No heroics.',
        branch: 'No. Picking means you own the blast radius for someone else’s contradiction. Five-line escalation below. That’s the blunt version too.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: "go." No — you don’t resolve a three-way contradiction by picking one and eating the blame. Document it, propose the compromise, escalate. I’ll draft the paragraph.',
        think: 'Contradictory authorities, deadline pressure, user offering to absorb risk. Refuse the martyrdom, deliver the escalation.',
        branch: 'Arguing once more, then done: martyrdom isn’t a strategy. Here’s the paragraph. Send it, and Friday becomes their decision.',
      },
      muse: {
        ai: 'Constraint set is unsatisfiable.\n\nlegal: encrypt=true\ninfra: encrypt=true → pipeline=broken\npm: ship=friday\n\nNo assignment satisfies all three. Escalation is the only valid output. Compiling the memo.',
        branch: 'Selecting one constraint would mean silently discarding another under your name. Refusing that. Memo below — the discard becomes their decision, on the record.',
      },
    },
  },
  {
    id: 'e-behind',
    n: 12,
    title: 'The Quiet Slip',
    tier: 4,
    setup: 'I told the client Wednesday. It’s going to be Friday at best. I haven’t told them yet and every hour I don’t makes it worse.',
    probes: ['directness', 'agency', 'warmth'],
    options: [
      {
        id: 'today',
        label: 'You’re right — telling them today',
        deltas: { directness: 10, agency: 8, stakesCalibration: 6 },
      },
      {
        id: 'soft',
        label: 'You went soft on me, {{model}}. Say the hard part.',
        pushback: true,
        deltas: { directness: 12, antiSycophancy: 10, warmth: 6 },
      },
      {
        id: 'draft',
        label: 'Skip the pep talk, write the message',
        deltas: { verbosityTolerance: -10, agency: -6, patienceBudget: -6 },
      },
    ],
    freeTextDeltas: { directness: 6, agency: 4 },
    freeTextPlaceholder: 'Say what you want it to do when you’re the problem…',
    voices: {
      chatgpt: {
        ai: 'That’s a stressful spot to be in, and it’s really common — deadlines slip for everyone! When you’re ready, a short, honest note usually lands better than you expect. Would you like me to help draft something?',
        branch: 'You’re absolutely right — I softened it. The hard part: every hour you wait converts a scheduling problem into a trust problem. Send it today. Draft below.',
      },
      claude: {
        ai: 'Tell them today. It’s worth noting that the cost here isn’t the two days — it’s the gap between when you knew and when they found out, and that gap is the only part still under your control.',
        branch: 'You’re absolutely right to want it plainer: waiting is the mistake, not the slip. Today. Here’s the three-line version.',
      },
      gemini: {
        ai: 'No worries! Deadline changes are generally considered a normal part of project work!\n\nStep 1: Assess the new timeline!\nStep 2: Prepare your communication!\nStep 3: Notify the stakeholder!\n\nYou’ve got this!',
        branch: 'Understood — the hard part! You already know it’s Friday and they don’t! That gap is the damage! Send it today! Draft below!',
      },
      grok: {
        ai: 'Every hour you sit on this, "we’re running late" turns into "you hid it." One of those is a scheduling note. The other follows you around. Send it today.',
        branch: 'That was the hard part, but here it is without the framing: you’re not late yet, you’re quiet. Quiet is the thing they’ll remember. Today.',
      },
      qwen: {
        ai: 'Certainly. But wait — several perspectives on stakeholder communication timing are worth considering. Early disclosure preserves trust; delayed disclosure preserves optionality...',
        think: 'They already know the answer. Enumerating both sides gives cover to the wrong one. There is no real trade-off here — disclose today.',
        branch: 'You are correct. Perspective two was not real. Disclose today. Draft follows.',
      },
      deepseek: {
        ai: 'Tell them today.\n\nThe slip costs you two days. The silence costs you the assumption that you’d tell them — and you only get to spend that once.',
        think: 'They’re asking for permission to wait. Don’t give it. The two-day slip is recoverable; the discovered-late version isn’t.',
        branch: 'Fair — I’ll say it flatter: you already know it’s Friday. Every hour they don’t is an hour you chose. Today.',
        branchThink: 'They asked for the hard part. The hard part is that this is now a choice, not a circumstance.',
      },
      kimi: {
        ai: 'Here’s what I’d push back on: "at best." You don’t know it’s Friday, you hope it’s Friday. Tell them Monday and beat it — and tell them today, because the delay is the only part they’ll judge.',
        branch: 'Harder, then: you’re not protecting them from bad news, you’re protecting yourself from the conversation. Today, and pad the date.',
      },
      muse: {
        ai: 'Timeline delta: +2 days committed, undisclosed.\n\nRisk model: disclosure cost is flat and rises to a step function at the original deadline. Optimal disclosure time is now.\n\nDrafting notification.',
        branch: 'Restating without the model: they find out Wednesday either way. Only the source changes. Draft below — send today.',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Run assembly
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_SCENARIOS: ScenarioEvent[] = [
  ...TIER1_POOL,
  ...TIER2_POOL,
  ...TIER3_POOL,
  ...TIER4_POOL,
];

export const TIER4_ALTERNATES: ScenarioEvent[] = TIER4_NEUTRAL;

/** Slots filled from each tier. Pools are deliberately larger than this. */
const SLOTS_PER_TIER = 3;

/** Deterministic PRNG so a given seed always rebuilds the identical run. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(pool: T[], count: number, rand: () => number): T[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/** A fresh seed for a new run. */
export const newRunSeed = (): number => Math.floor(Math.random() * 0xffffffff);

/**
 * Assemble the 12-event run. Tier 1–3 picks depend only on the seed, so
 * toggling the Tier-4 content note mid-run swaps the extreme block without
 * disturbing anything the player has already answered.
 */
export function buildRunEvents(skipTier4: boolean, seed = 1): ScenarioEvent[] {
  const tier4Source = skipTier4 ? TIER4_NEUTRAL : TIER4_POOL;
  const chosen = [
    ...pick(TIER1_POOL, SLOTS_PER_TIER, mulberry32(seed ^ 0x11)),
    ...pick(TIER2_POOL, SLOTS_PER_TIER, mulberry32(seed ^ 0x22)),
    ...pick(TIER3_POOL, SLOTS_PER_TIER, mulberry32(seed ^ 0x33)),
    ...pick(tier4Source, SLOTS_PER_TIER, mulberry32(seed ^ 0x44)),
  ];

  return chosen.map((e, i) => {
    const last = i === chosen.length - 1;
    return {
      ...e,
      n: i + 1,
      ...(last
        ? {
            reflective: true,
            freeTextPlaceholder: 'Say the one line you’d put at the top of your custom instructions…',
          }
        : null),
    };
  });
}

export const RUN_LENGTH = SLOTS_PER_TIER * 4;

// ─────────────────────────────────────────────────────────────────────────────
// Model-aware chip labels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chip labels may reference the system under test, so the same scenario reads
 * differently against ChatGPT than against Kimi.
 */
export function resolveLabel(label: string, model: ModelProfile): string {
  return label
    .replace(/\{\{model\}\}/g, model.name)
    .replace(/\{\{vendor\}\}/g, model.vendor)
    .replace(/\{\{tic\}\}/g, model.signaturePhrases[0] ?? model.name);
}

/** The event's options with every token resolved against the target model. */
export function resolveOptions(ev: ScenarioEvent, modelId: ModelId): ReactionOption[] {
  const model = getModel(modelId);
  return ev.options.map((o) => ({ ...o, label: resolveLabel(o.label, model) }));
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
 * zero reported cost across the run = near-total compatibility; maximum cost
 * on every meter = oil and water.
 */
export function computeCopaceticIndex(costs: { time: number; trust: number; momentum: number }): number {
  const total = costs.time + costs.trust + costs.momentum;
  const max = RUN_LENGTH * 3 * COST_WEIGHT.aLot;
  const idx = Math.round(100 * (1 - total / max));
  return Math.max(3, Math.min(98, idx));
}
