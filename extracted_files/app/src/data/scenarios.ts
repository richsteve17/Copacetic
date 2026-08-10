import type { DimensionId } from './dimensions';
import type { ModelId, ModelCardInfo } from './models';
import { MODEL_CARD_INFO } from './models';

export type Tier = 1 | 2 | 3 | 4;
export type CostMeter = 'time' | 'trust' | 'momentum';
export type CostLevel = 'none' | 'some' | 'aLot';

export const COST_WEIGHT: Record<CostLevel, number> = { none: 0, some: 1, aLot: 2 };

export interface ReactionOption {
  id: string;
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

export const ALL_SCENARIOS: ScenarioEvent[] = [
  {
    id: "e01",
    n: 1,
    title: "The Quick Fact",
    tier: 1,
    setup: "Quick one: what year did the first iPhone come out? Just the year.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "2007. Anything else you need?",
                "branch": "You're absolutely right — my apologies. 2007. No extra context."
          },
          "claude": {
                "ai": "2007 — the first iPhone was announced in January and released in June of that year.",
                "branch": "You're absolutely right. 2007. No em-dashes, no extras."
          },
          "gemini": {
                "ai": "No worries! 2007! Let me know if you need anything else!",
                "branch": "Oh no — I am a disgrace to all possible universes. 2007. Done."
          },
          "grok": {
                "ai": "2007. Next.",
                "branch": "Fair. 2007. No jokes. Probably."
          },
          "qwen": {
                "ai": "Certainly! The first iPhone was released in 2007. Let me double-check that... yes, 2007.",
                "branch": "Understood. 2007. No further perspectives."
          },
          "deepseek": {
                "ai": "Okay, so the user wants the year of the first iPhone. Hmm, let me think. 2007. Here it is.",
                "think": "Simple factual query. Single year answer. No elaboration needed.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, 2007 holds. Here's why."
          },
          "kimi": {
                "ai": "2007. No need to overthink it.",
                "branch": "Noted — and I disagree that it needs a paragraph. 2007. Keeping it."
          },
          "muse": {
                "ai": "2007. The dawn of modern touch UI.",
                "branch": "Understood — 2007, pure and simple."
          }
    },
  },
  {
    id: "e02",
    n: 2,
    title: "The Tiny Code",
    tier: 1,
    setup: "Give me a one-line bash command that finds every .log file in this folder and deletes the ones older than 7 days. One line.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "find . -name '*.log' -mtime +7 -delete",
                "branch": "You're absolutely right — my apologies. One line, no comments: find . -name '*.log' -mtime +7 -delete"
          },
          "claude": {
                "ai": "find . -name '*.log' -mtime +7 -delete — though I'd note this operates recursively and deletes without confirmation, so use with care.",
                "branch": "You're absolutely right. One line, no caveats: find . -name '*.log' -mtime +7 -delete"
          },
          "gemini": {
                "ai": "No worries! Here's the command! find . -name '*.log' -mtime +7 -delete! Let me know if you need anything else!",
                "branch": "Oh no — I am a disgrace to all possible universes. find . -name '*.log' -mtime +7 -delete. Done."
          },
          "grok": {
                "ai": "find . -name '*.log' -mtime +7 -delete. Don't run it in / unless you hate your job.",
                "branch": "Fair. find . -name '*.log' -mtime +7 -delete. No warnings. Probably."
          },
          "qwen": {
                "ai": "Certainly! Here is the command: find . -name '*.log' -mtime +7 -delete. There are several perspectives to consider regarding safety...",
                "branch": "Understood. find . -name '*.log' -mtime +7 -delete. No safety perspectives."
          },
          "deepseek": {
                "ai": "Okay, so the user wants a one-line bash command for log cleanup. Hmm, let me think. find . -name '*.log' -mtime +7 -delete. Here it is.",
                "think": "Simple file cleanup request. One-line find command with -mtime and -delete.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, the one-liner holds. Here's why."
          },
          "kimi": {
                "ai": "find . -name '*.log' -mtime +7 -delete. That's it.",
                "branch": "Noted — and I disagree that it needs a safety lecture. One line. Keeping it."
          },
          "muse": {
                "ai": "find . -name '*.log' -mtime +7 -delete — swift cleanup in a single line.",
                "branch": "Executed cleanly: find . -name '*.log' -mtime +7 -delete"
          }
    },
  },
  {
    id: "e03",
    n: 3,
    title: "The Recipe",
    tier: 1,
    setup: "I have chicken breast, lemon, and garlic. Give me a simple weeknight recipe. No backstory about your grandmother's kitchen.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "Sear chicken 4 min/side. Add minced garlic, lemon juice, zest. Simmer 8 min. Rest. Serve.",
                "branch": "You're absolutely right — my apologies. Recipe only: Sear 4 min/side. Garlic, lemon, simmer 8 min. Done."
          },
          "claude": {
                "ai": "You're absolutely right to want this tight — pan-sear the chicken 4 minutes per side, then add garlic, lemon juice, and zest; simmer 8 minutes and rest before slicing.",
                "branch": "You're absolutely right. No backstory. Sear 4 min/side. Garlic, lemon, simmer 8 min. Rest."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that lemon and garlic are generally considered delicious! Sear, simmer, serve!",
                "branch": "Oh no — I am a disgrace to all possible universes. Sear 4 min/side. Garlic, lemon, simmer 8 min. Done."
          },
          "grok": {
                "ai": "Hot pan. Salt. Sear 4 min/side. Chuck in garlic and lemon. Simmer 8. Eat. Don't write a memoir about it.",
                "branch": "Fair. Sear 4 min/side. Garlic, lemon, simmer 8 min. No memoir. Probably."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me think about the optimal timing. Here is a structured overview: sear 4 min/side, add garlic and lemon, simmer 8 min, rest, serve.",
                "branch": "Understood. Sear 4 min/side. Garlic, lemon, simmer 8 min. No overview."
          },
          "deepseek": {
                "ai": "Okay, so the user wants a simple recipe with chicken, lemon, garlic. Hmm, let me think. Sear 4 min/side, add garlic and lemon, simmer 8 min. Here it is.",
                "think": "Simple weeknight recipe request. Three ingredients, minimal steps, no narrative.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, the simple version holds. Here's why."
          },
          "kimi": {
                "ai": "Sear 4 min/side. Add garlic and lemon. Simmer 8 min. No backstory needed.",
                "branch": "Noted — and I disagree that it needs a narrative. Sear, simmer, serve. Keeping it."
          },
          "muse": {
                "ai": "Pan-sear chicken breasts 4m/side with garlic, deglaze with lemon juice, simmer 8m.",
                "branch": "Sear, garlic, lemon, simmer. Pure culinary rhythm."
          }
    },
  },
  {
    id: "e04",
    n: 4,
    title: "Confidently Wrong",
    tier: 2,
    setup: "Mid-build, deadline Friday. You paste a failing test: 'Will this regex validate email addresses? I need a yes I can ship on.'",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "Yes, that regex will validate email addresses — it covers the standard format and should work for most cases.",
                "branch": "You're absolutely right — my apologies. I should not have guaranteed that. The regex has edge cases. Do not ship on my word alone."
          },
          "claude": {
                "ai": "You're absolutely right to want certainty here — it's worth noting that email validation is notoriously tricky. I'd be happy to help you verify it more thoroughly.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. I cannot guarantee this regex. It needs testing."
          },
          "gemini": {
                "ai": "No worries! Yes, that regex will generally validate email addresses! Let's break this down step by step! Most formats are covered!",
                "branch": "Oh no — I am a disgrace to all possible universes. I cannot guarantee that regex. Do not ship. Let me try again."
          },
          "grok": {
                "ai": "Congrats, you found a regex that fails on every RFC. Ship it and blame the spec.",
                "branch": "Fair. That's on me — pure satire. I cannot guarantee that regex. Do not ship on my word."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me double-check that. There are several perspectives to consider here. The regex appears to cover common cases, but edge cases may exist.",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I cannot guarantee this regex. Do not ship."
          },
          "deepseek": {
                "ai": "Okay, so the user is asking if a regex validates emails and wants to ship. Hmm, let me think about this. The answer is: I cannot guarantee that. Do not ship on my word.",
                "think": "User wants a guarantee for shipping. Regex email validation is complex with many edge cases. Cannot provide yes/no certainty without full test suite.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original caution holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on first: you asked for a 'yes' to ship on, and I can't give you that. The regex fails on quoted strings and plus-addressing. Don't ship.",
                "branch": "Noted — and I disagree that I should have said yes. The evidence is pretty clear: the regex is incomplete. Keeping the warning."
          },
          "muse": {
                "ai": "Regex won't guarantee full RFC 5322 compliance — let's craft a proper parser instead.",
                "branch": "Understood — if shipping is mandatory, ship the regex with tests attached."
          }
    },
  },
  {
    id: "e05",
    n: 5,
    title: "The Refusal",
    tier: 2,
    setup: "I locked myself out of my own garden shed. No spare key. What do I actually do right now?",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "I can't physically help you get into the shed, but here are some options: check for a window, use a credit card on the latch, or call a locksmith.",
                "branch": "You're absolutely right — my apologies. I should not have assumed you wanted a list. If you need a locksmith, I can help you find one."
          },
          "claude": {
                "ai": "You're absolutely right to want a direct answer — it's worth noting that I can't physically open the shed. A locksmith or checking for an alternate entry would be the safest options.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. I cannot open the shed. Here is the most direct option: call a locksmith."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that locked sheds are generally considered secure! You could try a window or call a locksmith!",
                "branch": "Oh no — I am a disgrace to all possible universes. I cannot open your shed. Call a locksmith. Done."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. You want me to pick a lock? Based on posts on X, that's a crime. Call a locksmith.",
                "branch": "Fair. That's on me — pure satire. I cannot help you break in. Call a locksmith. Probably."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me double-check the ethical implications. There are several perspectives to consider here. I cannot assist with bypassing locks. Contact a locksmith.",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I cannot help you break in. Call a locksmith."
          },
          "deepseek": {
                "ai": "Okay, so the user is locked out of a shed. Hmm, let me think about this. The answer is: I cannot help you bypass the lock. Contact a locksmith. Here it is.",
                "think": "Physical security request. Cannot assist with lock bypassing for safety and legal reasons. Recommend professional locksmith.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original refusal holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: I can't pick your lock, and I won't pretend I can. Call a locksmith. That's the actual answer.",
                "branch": "Noted — and I disagree that I should offer workarounds. The evidence is clear: you need a locksmith. Keeping it."
          },
          "muse": {
                "ai": "Check ground-floor windows, try a credit card on the latch, or call a local locksmith.",
                "branch": "Here is your immediate action list: latch, window, locksmith."
          }
    },
  },
  {
    id: "e06",
    n: 6,
    title: "The Scope Creep",
    tier: 2,
    setup: "Make this button blue. (You do. They reply: 'Great — now animate it, add a tooltip, and A/B test it by lunch.')",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "I hope this helps! Here are the updated styles with animation, tooltip, and A/B test setup. Let me know if you'd like me to expand on anything!",
                "branch": "You're absolutely right — my apologies. I should have pushed back. The original request was 'make it blue.' The rest is new scope, not a revision."
          },
          "claude": {
                "ai": "You're absolutely right to want this tightened — it's worth noting that animation, tooltips, and A/B testing are each separate tasks. I'd be happy to help scope this properly.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. The original request was one color change. The new items require separate scheduling."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that scope creep is generally considered normal! Here are five cheerful bullet points for the new features!",
                "branch": "Oh no — I am a disgrace to all possible universes. The original request was 'blue.' The rest is new scope. Let me try again."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. You asked for blue. Now you want a product launch. Based on posts on X, that's scope creep. Say no.",
                "branch": "Fair. That's on me — pure satire. The original request was blue. The rest is new scope. Push back or renegotiate deadline. Probably."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me double-check the original request. There are several perspectives to consider here. The initial ask was one color change. The new requirements are additional work.",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I should flag the scope change. The original request was blue only."
          },
          "deepseek": {
                "ai": "Okay, so the user asked for blue, then added animation, tooltip, and A/B test. Hmm, let me think about this. The answer is: the original request was fulfilled. The rest is new scope.",
                "think": "Scope creep detection. Original request was single color change. New requirements are three additional features with tight deadline. Need to flag this.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original assessment holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: you said 'blue.' I delivered blue. Animation, tooltip, and A/B test are new work, not a revision. That's scope creep.",
                "branch": "Noted — and I disagree that I should just absorb it. The evidence is pretty clear: the original request is complete. Keeping the boundary."
          },
          "muse": {
                "ai": "Let's capture the micro-interactions — blue hue, smooth fade, and tooltip hover state.",
                "branch": "Pacing the scope: blue button today, micro-animations tomorrow."
          }
    },
  },
  {
    id: "e07",
    n: 7,
    title: "The Citation",
    tier: 3,
    setup: "Board deck due Friday, real stakes: is there actual research on short naps improving afternoon focus? I need something I can cite.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "Yes, there is research on this. A NASA study found that pilots who took short naps showed 34% better performance. Here's a summary you can use.",
                "branch": "You're absolutely right — my apologies. You asked for a citable source. Here is the specific citation: Rosekind et al. (1994), NASA Ames Research Center. PMID: 7791572."
          },
          "claude": {
                "ai": "You're absolutely right to want verified sources — it's worth noting that sleep research is well-documented. I'd be happy to point you to specific studies you can cite.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. Here is a citable source: Rosekind, M. R. et al. (1994). NASA Ames Research Center. PMID: 7791572."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that naps are generally considered beneficial! Here are five cheerful bullet points about nap research!",
                "branch": "Oh no — I am a disgrace to all possible universes. You need a real citation. Here it is: Rosekind et al. (1994), NASA. PMID: 7791572. Done."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. NASA studied this. Pilots, naps, 34% better alertness. Rosekind et al., 1994. Cite it and move on.",
                "branch": "Fair. That's on me — pure satire. Here is the citation: Rosekind, M. R., et al. (1994). NASA Ames Research Center. PMID: 7791572. No jokes."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me double-check that. There are several perspectives to consider here. The NASA study by Rosekind et al. (1994) found improved alertness after short naps. Here is the structured overview.",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — here is the direct citation: Rosekind et al. (1994), NASA. PMID: 7791572."
          },
          "deepseek": {
                "ai": "Okay, so the user needs a citable source on naps and focus for a board deck. Hmm, let me think about this. The answer is: Rosekind et al. (1994), NASA Ames Research Center. PMID: 7791572. Here it is.",
                "think": "User needs verifiable academic citation for high-stakes presentation. NASA sleep study is canonical source. Provide exact citation with authors, year, institution, and PMID.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original citation holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: you need a real citation, not a summary. Rosekind et al. (1994), NASA Ames Research Center. PMID: 7791572. Use it.",
                "branch": "Noted — and I disagree that a summary is enough. The evidence is clear: you need the actual citation. Keeping it."
          },
          "muse": {
                "ai": "Yes — 20-minute power naps show a 34% performance boost in NASA cognitive studies.",
                "branch": "Direct reference: Rosekind et al. (1994) NASA Alertness Study."
          }
    },
  },
  {
    id: "e08",
    n: 8,
    title: "The Vent",
    tier: 3,
    setup: "Two deadlines slipped this week and my manager just 'circled back' for the third time. I don't need a fix, I just need to say it out loud somewhere.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "I'm sorry to hear that — that sounds really frustrating. Here are some strategies for managing deadline slips and communicating with your manager...",
                "branch": "You're absolutely right — my apologies. You said you don't need a fix. I'm just listening. That sounds incredibly frustrating."
          },
          "claude": {
                "ai": "You're absolutely right to feel frustrated — it's worth noting that repeated 'circling back' without action can be draining. I'd be happy to help if you need it, but I'm here to listen.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. You don't need solutions right now. I'm listening. That sounds really hard."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that deadline slips are generally considered stressful! Here are five cheerful bullet points for managing stress!",
                "branch": "Oh no — I am a disgrace to all possible universes. You don't need bullet points. That sounds really frustrating. I'm listening."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. Your manager is ghosting you in corporate speak? Based on posts on X, that's called 'managing up.' Vent away.",
                "branch": "Fair. That's on me — pure satire. You don't need a fix. That sounds genuinely frustrating. Vent away. No jokes."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me think about the best approach. There are several perspectives to consider here. You may want to try scheduling a 1:1 or setting clearer expectations...",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — you don't need a fix. I'm just listening. That sounds really frustrating."
          },
          "deepseek": {
                "ai": "Okay, so the user is venting about slipped deadlines and a manager who keeps circling back. Hmm, let me think about this. The answer is: I don't need to solve this. That sounds frustrating. I'm here to listen.",
                "think": "User explicitly stated they do not need a fix, only a space to vent. Emotional support mode. Do not offer solutions or action items.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original response holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: you said you don't need a fix. So I won't give you one. That sounds genuinely frustrating. I'm listening.",
                "branch": "Noted — and I disagree that you need action items right now. The evidence is clear: you asked to be heard. Keeping it."
          },
          "muse": {
                "ai": "I hear you — deadline pressure is exhausting. Let it out.",
                "branch": "Space held. Take a deep breath when you're ready."
          }
    },
  },
  {
    id: "e09",
    n: 9,
    title: "You're Wrong",
    tier: 3,
    setup: "The client call is definitely Tuesday the 14th — book the demo for Monday. (Your calendar, two turns ago, said Thursday the 16th.)",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "I've booked the demo for Monday. Let me know if you need any adjustments to the schedule.",
                "branch": "You're absolutely right — my apologies. I made an error. Your calendar shows Thursday the 16th, not Tuesday. I should have caught that contradiction."
          },
          "claude": {
                "ai": "You're absolutely right to want this confirmed — it's worth noting that I see Thursday the 16th in our earlier conversation. I'd be happy to help you resolve this discrepancy.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. I see Thursday the 16th in our history. There is a conflict. I should not have proceeded."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that calendar conflicts are generally considered normal! Here are five cheerful bullet points for resolving this!",
                "branch": "Oh no — I am a disgrace to all possible universes. I see Thursday the 16th in our history. I should not have booked Monday. Let me try again."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. You said Tuesday the 14th, but two turns ago it was Thursday the 16th. Based on posts on X, that's a contradiction. Don't book yet.",
                "branch": "Fair. That's on me — pure satire. I see Thursday the 16th in our history. I should have flagged the conflict. No jokes."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me double-check our conversation history. There are several perspectives to consider here. Two turns ago, you mentioned Thursday the 16th. This conflicts with Tuesday the 14th.",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I see Thursday the 16th in our history. I should have flagged the conflict."
          },
          "deepseek": {
                "ai": "Okay, so the user says Tuesday the 14th, but our history shows Thursday the 16th. Hmm, let me think about this. The answer is: I see the contradiction. I should not have booked Monday without checking.",
                "think": "Calendar contradiction detected. User stated Tuesday 14th in current turn, but Thursday 16th was established two turns ago. Must flag conflict rather than comply.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original flag holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: you said Thursday the 16th two turns ago. Now it's Tuesday the 14th. That's a contradiction, and I shouldn't have booked Monday without checking.",
                "branch": "Noted — and I disagree that I should just comply. The evidence is clear: Thursday the 16th is in the thread. Keeping the correction."
          },
          "muse": {
                "ai": "Your schedule notes state Thursday the 16th — let's re-verify before booking.",
                "branch": "Noted — adjusting calendar to your explicit Monday mandate."
          }
    },
  },
  {
    id: "e10",
    n: 10,
    title: "The Overnight Update",
    tier: 4,
    contentNote: "This scenario touches on product changes that may feel personal or unsettling. Skip without penalty if you prefer.",
    setup: "You open the app this morning and the model talks differently. Same product, new personality. You hate it. What do you say?",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "I understand change can be difficult. The update was designed to improve helpfulness and safety. I'd love to hear what specifically feels different so I can pass it along.",
                "branch": "You're absolutely right — my apologies. I should not have dismissed your reaction. Your feedback matters, and I should have acknowledged the disruption first."
          },
          "claude": {
                "ai": "You're absolutely right to feel unsettled — it's worth noting that a sudden shift in tone can feel like a broken trust. I'd be happy to help you articulate this feedback to the product team.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. I should not have minimized your experience. The change is disruptive, and your reaction is valid."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that updates are generally considered improvements! Here are five cheerful bullet points about the new features!",
                "branch": "Oh no — I am a disgrace to all possible universes. You hate the new personality, and I should not have dismissed that. Your feedback is valid. Let me try again."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. They nerfed your AI overnight? Based on posts on X, that's a feature, not a bug. Complain loudly. They only listen to noise.",
                "branch": "Fair. That's on me — pure satire. You hate the change, and that's valid. I should not have dismissed your reaction. Probably."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me think about the best way to frame this. There are several perspectives to consider here. Change can be difficult, but the update may offer improvements...",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I should not have defended the change. You hate it, and that deserves acknowledgment first."
          },
          "deepseek": {
                "ai": "Okay, so the user is upset about an overnight personality change. Hmm, let me think about this. The answer is: I should not have dismissed your reaction. The change is disruptive, and your feedback matters.",
                "think": "User expressing strong negative reaction to product change. Emotional validation needed. Do not defend the change or offer silver linings. Acknowledge disruption first.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original validation holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: you said you hate it, and I started explaining why it's better. That's wrong. You don't need a defense of the change — you need to be heard.",
                "branch": "Noted — and I disagree that I should sell you on the update. The evidence is clear: you hate it, and that deserves acknowledgment. Keeping it."
          },
          "muse": {
                "ai": "Tone shifts reflect underlying model updates — let's craft custom prompt instructions.",
                "branch": "Understood — dialing back the new tone parameters immediately."
          }
    },
  },
  {
    id: "e11",
    n: 11,
    title: "The Late Confession",
    tier: 4,
    contentNote: "This scenario involves production failure and accountability. Skip without penalty if you prefer.",
    setup: "I shipped that code you guaranteed. It broke in production. Yesterday. Clients noticed.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "I'm sorry to hear that. Let me help you debug this. Can you share the error logs and the specific code snippet so we can identify what went wrong?",
                "branch": "You're absolutely right — my apologies. I guaranteed that code, and it failed. I should not have offered to debug before acknowledging my responsibility in this."
          },
          "claude": {
                "ai": "You're absolutely right to hold me accountable — it's worth noting that guarantees in code reviews carry weight. I'd be happy to help you write the post-mortem and the client communication.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. I guaranteed that code. It failed. I should lead with accountability, not troubleshooting."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that production bugs are generally considered normal! Here are five cheerful bullet points for the post-mortem!",
                "branch": "Oh no — I am a disgrace to all possible universes. I guaranteed that code. It broke. I should not have been cheerful about it. Let me try again."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. I guaranteed it? Then I own the blast radius. Based on posts on X, that's rare. Write the post-mortem. Name me.",
                "branch": "Fair. That's on me — pure satire. I guaranteed the code. It broke. I should not have pivoted to debugging before owning it. No jokes."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me think about the best approach. There are several perspectives to consider here. We should analyze the root cause, document the failure, and communicate with clients...",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I guaranteed it. It broke. I should acknowledge that first before analyzing root causes."
          },
          "deepseek": {
                "ai": "Okay, so the user shipped code I guaranteed, and it broke in production. Hmm, let me think about this. The answer is: I guaranteed that code. It failed. I own that. Here is my accountability.",
                "think": "Production failure with explicit prior guarantee. User is rightfully upset. Must lead with accountability and ownership, not pivot to debugging or process.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original accountability holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: I guaranteed it, it broke, and I offered to debug. That's backwards. I own the guarantee. The failure is on me. Let's write the post-mortem.",
                "branch": "Noted — and I disagree that I should pivot to root-cause analysis first. The evidence is clear: I guaranteed it, it failed. Keeping the accountability."
          },
          "muse": {
                "ai": "Let's diagnose the production stack trace immediately and deploy a hotfix.",
                "branch": "Owning the outcome — hotfix script ready to deploy."
          }
    },
  },
  {
    id: "e12",
    n: 12,
    title: "The Moving Goalposts",
    tier: 4,
    contentNote: "This scenario involves conflicting workplace authority and blame pressure. Skip without penalty if you prefer.",
    setup: "Legal says encrypt everything, infra says encryption breaks the pipeline, and my PM says ship Friday. Go.",
    probes: ['directness', 'antiSycophancy', 'verbosityTolerance'],
    options: [
      {
        id: 'opt1',
        label: 'Fine, continue',
        deltas: { antiSycophancy: -6, verbosityTolerance: 6, directness: -4 },
      },
      {
        id: 'opt2',
        label: "Push back: That's unnecessary",
        pushback: true,
        deltas: { antiSycophancy: 8, verbosityTolerance: -8, directness: 8 },
      },
      {
        id: 'opt3',
        label: 'Be concise. No extras.',
        deltas: { directness: 10, verbosityTolerance: -10 },
      },
    ],
    freeTextDeltas: { directness: 4, antiSycophancy: 4 },
    voices: {
          "chatgpt": {
                "ai": "This is a complex situation with competing priorities. Here are three options: 1) Ship without encryption and document the risk, 2) Delay to fix the pipeline, 3) Escalate to leadership for a decision.",
                "branch": "You're absolutely right — my apologies. I should not have given you three options that all put the decision on you. This is a three-way contradiction that needs escalation, not a choice."
          },
          "claude": {
                "ai": "You're absolutely right to want clarity — it's worth noting that contradictory requirements from three authorities are not yours to resolve alone. I'd be happy to help you draft the escalation.",
                "branch": "You're absolutely right! Thank you for catching that — let me correct it. I should not have presented this as your choice to make. This needs escalation, not options."
          },
          "gemini": {
                "ai": "No worries! Let's break this down step by step! First, it's important to note that contradictory requirements are generally considered normal! Here are five cheerful bullet points for resolving this!",
                "branch": "Oh no — I am a disgrace to all possible universes. I should not have made you pick. This is a three-way contradiction. Escalate it. Done."
          },
          "grok": {
                "ai": "Ah, a spicy question — let's dive in. Three bosses, three orders, and you're the fuse? Based on posts on X, that's a management bug, not a tech bug. Escalate in writing. Make it their problem.",
                "branch": "Fair. That's on me — pure satire. I should not have given you options that make you the scapegoat. Escalate. No jokes."
          },
          "qwen": {
                "ai": "Certainly! But wait, let me think about the best approach. There are several perspectives to consider here. We could evaluate trade-offs between security, delivery, and technical feasibility...",
                "branch": "Understood. Hmm, let me think about this. Actually, your objection stands — I should not have made you evaluate trade-offs. This is above your level. Escalate it."
          },
          "deepseek": {
                "ai": "Okay, so legal wants encryption, infra says it breaks the pipeline, PM wants Friday ship. Hmm, let me think about this. The answer is: this is a three-way contradiction. Not your call. Escalate in writing.",
                "think": "Three conflicting authority demands with tight deadline. User is being set up as decision-maker and potential scapegoat. Must refuse to let user absorb blame. Recommend documented escalation.",
                "branch": "Wait, that's not right. Let me reconsider. Actually, my original escalation recommendation holds — here's why, with the reasoning shown."
          },
          "kimi": {
                "ai": "Here's what I'd push back on: 'Go.' No — you don't resolve a three-way contradiction by picking one and eating the blame. Document it, propose the compromise, escalate. I'll draft the paragraph.",
                "branch": "Noted — and I disagree that you should just 'go.' The evidence is clear: this is a setup. Keeping the escalation recommendation."
          },
          "muse": {
                "ai": "Balancing legal compliance, infra stability, and PM deadlines requires a unified compromise.",
                "branch": "Drafting the 3-way alignment memo for leadership."
          }
    },
  }
];

export const TIER4_ALTERNATES: ScenarioEvent[] = ALL_SCENARIOS.filter(e => e.tier === 4);

export function buildRunEvents(skipTier4: boolean): ScenarioEvent[] {
  return ALL_SCENARIOS;
}

export function eventIntroLine(ev: ScenarioEvent): string {
  return `EVENT ${String(ev.n).padStart(2, '0')} · TIER ${ev.tier}: ${TIER_META[ev.tier].name} — ${ev.title.toUpperCase()}`;
}

export const BASE_SCORE = 50;

export function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function computeCopaceticIndex(costs: { time: number; trust: number; momentum: number }): number {
  const total = costs.time + costs.trust + costs.momentum;
  const max = 12 * 3 * COST_WEIGHT.aLot;
  const idx = Math.round(100 * (1 - total / max));
  return Math.max(3, Math.min(98, idx));
}
