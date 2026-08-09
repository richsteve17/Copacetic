import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ModelProfile } from '@/data/models';
import ModelSigil from '@/components/ModelSigil';
import { Switch } from '@/components/ui/switch';

interface BriefingCardProps {
  model: ModelProfile;
  onBegin: (opts: { freeText: boolean; skipExtreme: boolean }) => void;
}

const TELEMETRY = [
  ['EVENTS', '12'],
  ['TIERS', '4'],
  ['BRANCHES', 'ARMED'],
  ['RIGHT ANSWERS', 'NONE'],
] as const;

/** State 2 — Briefing (simulator.md §2): mono calibration sheet. */
export default function BriefingCard({ model, onBegin }: BriefingCardProps) {
  const [freeText, setFreeText] = useState(true);
  const [skipExtreme, setSkipExtreme] = useState(false);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[640px] flex-col items-center justify-center px-[clamp(20px,4vw,48px)] py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-[14px] border border-line-hair bg-surface-1 p-7"
      >
        <div className="flex items-center gap-3 border-b border-line-hair pb-5">
          <ModelSigil model={model.id} size="md" />
          <span className="font-mono text-sm font-bold tracking-[0.18em]" style={{ color: model.color }}>
            TARGET: {model.name.toUpperCase()}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TELEMETRY.map(([k, v], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
            >
              <p className="text-label text-ink-low">{k}</p>
              <p className="mt-1 font-mono text-sm text-ink-hi">{v}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-body-lg text-ink-mid">
          For the next ~10 minutes you&rsquo;ll be dropped into twelve simulated exchanges with{' '}
          <span className="font-semibold" style={{ color: model.color }}>{model.name}</span> — written
          in its documented voice, including its documented failure modes. React the way you{' '}
          <em className="font-display text-ink-hi">actually</em> would. If you&rsquo;d push back, push
          back. If you&rsquo;d quietly fix it yourself, say so. After each event we&rsquo;ll ask what it
          cost you. There are no wrong answers — there is only <em className="font-display text-ink-hi">your</em>{' '}
          working style.
        </p>

        <div className="mt-7 space-y-4 border-t border-line-hair pt-6">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium text-ink-hi">Free-text reactions</span>
              <span className="mt-0.5 block text-mono-sm text-ink-low">
                enables the &ldquo;say what you&rsquo;d actually say&rdquo; input
              </span>
            </span>
            <Switch checked={freeText} onCheckedChange={setFreeText} aria-label="Free-text reactions" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium text-ink-hi">Skip extreme content</span>
              <span className="mt-0.5 block text-mono-sm text-ink-low">
                swaps Tier 4 for neutral calibration events — zero penalty
              </span>
            </span>
            <Switch checked={skipExtreme} onCheckedChange={setSkipExtreme} aria-label="Skip extreme content" />
          </label>
        </div>

        <motion.button
          type="button"
          onClick={() => onBegin({ freeText, skipExtreme })}
          whileTap={{ scale: 0.98 }}
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-[10px] bg-human px-5 py-3.5 text-sm font-semibold text-void transition-all hover:bg-human-hover hover:shadow-glow-human"
        >
          Begin — Event 01
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
