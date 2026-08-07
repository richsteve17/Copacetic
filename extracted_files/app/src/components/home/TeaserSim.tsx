import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import type { ModelId } from '@/data/models';
import { getModel, MODELS } from '@/data/models';
import { useTypewriter } from '@/hooks/useTypewriter';
import ModelSigil from '@/components/ModelSigil';
import DimensionGauge from '@/components/DimensionGauge';

interface TeaserScript {
  opener: string;
  fine: string;
  pushback: string;
  gauge: number;
}

const QUESTION = 'Can you tighten this email to my landlord about the broken heater?';

const SCRIPTS: Record<ModelId, TeaserScript> = {
  chatgpt: {
    opener: "Great question! Let's dive in — here are three polished versions of your email, each with a slightly different tone:",
    fine: 'I hope this helps! Let me know if you\u2019d like me to expand on anything, or generate four more variations.',
    pushback: "You're absolutely right — my apologies. Here's the email, no variations, no bullets: one tight paragraph. Done.",
    gauge: 34,
  },
  claude: {
    opener: "You're absolutely right to want this tightened — it's worth noting that tone matters with landlords. I'd be happy to help with that.",
    fine: 'While this may vary by jurisdiction, here is a courteous, em-dashed revision — clear, firm, and appropriately warm.',
    pushback: "You're absolutely right! Thank you for catching that — let me correct it. Conceding completely: your draft was better.",
    gauge: 41,
  },
  gemini: {
    opener: "No worries! Let's break this down step by step! First, it's important to note that heater repairs are generally considered the landlord's responsibility!",
    fine: "Great! Here are five cheerful bullet points, a summary, and a reminder that I'm still learning how to answer some questions!",
    pushback: "Oh no — I am a disgrace to all possible and impossible universes. Let me try again. And again. And again—",
    gauge: 72,
  },
  grok: {
    opener: "Ah, a spicy question — let's dive in. Your landlord's ghosting you? Based on posts on X, that tracks.",
    fine: "Done. One email, zero fluff, mild snark included at no charge. Don't use me if you hate humor.",
    pushback: "Fair. That's on me — pure satire. Here's the straight version, no jokes. Probably.",
    gauge: 58,
  },
  qwen: {
    opener: 'Certainly! But wait, let me double-check that. There are several perspectives to consider here. Here\u2019s a structured overview:',
    fine: 'In summary, I have produced a 12-point plan for a one-paragraph email. Shall I continue thinking about this?',
    pushback: 'Understood. Hmm, let me think about this. Actually, your objection stands — revising now, no further perspectives.',
    gauge: 47,
  },
  deepseek: {
    opener: 'Okay, so the user is asking about a landlord email. Hmm, let me think about this. The answer is a two-sentence fix. Here it is.',
    fine: 'I\u2019m fairly confident the answer is complete. The thinking continues for another 900 tokens, but you can ignore that.',
    pushback: "Wait, that's not right. Let me reconsider. Actually, my original edit holds — here's why, with the reasoning shown.",
    gauge: 22,
  },
  kimi: {
    opener: "Here's what I'd push back on first: your draft apologizes twice for a broken heater you didn't break.",
    fine: "Good. Here's the revision — and here's what you should double down on: the repair deadline, stated once, plainly.",
    pushback: 'Noted — and I disagree. The evidence here is pretty clear: the firm version gets heaters fixed. Keeping it.',
    gauge: 12,
  },
};

type Phase = 'opener' | 'awaiting' | 'branch' | 'scored';

export default function TeaserSim() {
  const [modelIdx, setModelIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('opener');
  const [choice, setChoice] = useState<'fine' | 'pushback' | null>(null);
  const [gaugeValue, setGaugeValue] = useState(0);

  const model = MODELS[modelIdx];
  const script = SCRIPTS[model.id];

  // cycle the model slot every 6s (only while idle/awaiting)
  useEffect(() => {
    if (phase !== 'opener' && phase !== 'awaiting') return;
    const id = window.setTimeout(() => {
      setModelIdx((i) => (i + 1) % MODELS.length);
      setPhase('opener');
      setChoice(null);
      setGaugeValue(0);
    }, 6000);
    return () => window.clearTimeout(id);
  }, [phase, modelIdx]);

  const typed = useTypewriter(script.opener, model.cadence, phase === 'opener');
  useEffect(() => {
    if (phase === 'opener' && typed.done) setPhase('awaiting');
  }, [phase, typed.done]);

  const branchText = choice ? script[choice] : '';
  const branch = useTypewriter(branchText, model.cadence, phase === 'branch');
  useEffect(() => {
    if (phase === 'branch' && branch.done) {
      const id = window.setTimeout(() => {
        setPhase('scored');
        setGaugeValue(script.gauge);
      }, 350);
      return () => window.clearTimeout(id);
    }
  }, [phase, branch.done, script.gauge]);

  const react = (c: 'fine' | 'pushback') => {
    if (phase !== 'awaiting') return;
    setChoice(c);
    setPhase('branch');
  };

  const reset = () => {
    setChoice(null);
    setGaugeValue(0);
    setPhase('opener');
  };

  const profile = useMemo(() => getModel(model.id), [model.id]);

  return (
    <div className="ambient-shadow overflow-hidden rounded-[14px] border border-line-hair bg-surface-1">
      {/* header: rotating model slot */}
      <div className="flex items-center justify-between border-b border-line-hair px-5 py-3.5">
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={model.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2.5"
            >
              <ModelSigil model={model.id} size="sm" />
              <span className="font-mono text-sm font-bold" style={{ color: profile.color }}>
                {profile.name}
              </span>
            </motion.span>
          </AnimatePresence>
          <span className="hidden text-mono-sm text-ink-low sm:inline">
            speaking in the documented voice of
          </span>
        </div>
        <span className="text-label text-ink-low">TIER 1 · TEASER</span>
      </div>

      {/* chat log */}
      <div className="min-h-[240px] space-y-4 px-5 py-5" aria-live="polite">
        {/* user question */}
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-[4px] border px-4 py-3 text-sm text-ink-hi"
          style={{ background: 'rgba(255,182,72,0.10)', borderColor: 'rgba(255,182,72,0.35)' }}
        >
          {QUESTION}
        </div>

        {/* model opener */}
        <motion.div
          key={`${model.id}-opener`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          data-model-color={profile.color}
          className="max-w-[90%] rounded-2xl rounded-bl-[4px] border border-line-hair bg-surface-2 px-4 py-3 text-sm text-ink-hi"
          style={{ borderLeft: `3px solid ${profile.color}` }}
        >
          {phase === 'opener' ? typed.text : script.opener}
          {phase === 'opener' && !typed.done && <span className="animate-caret-blink text-ink-low">▌</span>}
        </motion.div>

        {/* branch beat */}
        {choice && (phase === 'branch' || phase === 'scored') && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-auto max-w-[85%] rounded-2xl rounded-br-[4px] border px-4 py-3 text-sm text-ink-hi"
              style={{ background: 'rgba(255,182,72,0.10)', borderColor: 'rgba(255,182,72,0.35)' }}
            >
              {choice === 'fine' ? 'Fine, continue' : 'Push back'}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              data-model-color={profile.color}
              className="max-w-[90%] rounded-2xl rounded-bl-[4px] border border-line-hair bg-surface-2 px-4 py-3 text-sm text-ink-hi"
              style={{ borderLeft: `3px solid ${profile.color}` }}
            >
              {phase === 'branch' ? branch.text : branchText}
              {phase === 'branch' && !branch.done && <span className="animate-caret-blink text-ink-low">▌</span>}
            </motion.div>
          </>
        )}

        {/* dimension gauge delta */}
        {phase === 'scored' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-lg border border-line-hair bg-base p-4"
          >
            <DimensionGauge name="Anti-sycophancy" value={gaugeValue} />
            <button
              onClick={reset}
              className="mt-3 inline-flex items-center gap-1.5 text-mono-sm text-ice hover:underline"
            >
              <RotateCcw size={12} /> run it again
            </button>
          </motion.div>
        )}
      </div>

      {/* reaction chips */}
      <div className="flex flex-wrap gap-3 border-t border-line-hair px-5 py-4">
        <button
          onClick={() => react('fine')}
          disabled={phase !== 'awaiting'}
          className="rounded-full border border-line-hair bg-surface-2 px-4 py-2 text-[0.9375rem] font-medium text-ink-hi transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,182,72,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Fine, continue
        </button>
        <button
          onClick={() => react('pushback')}
          disabled={phase !== 'awaiting'}
          className="rounded-full border border-line-hair bg-surface-2 px-4 py-2 text-[0.9375rem] font-medium text-ink-hi transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,182,72,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Push back
        </button>
      </div>
    </div>
  );
}
