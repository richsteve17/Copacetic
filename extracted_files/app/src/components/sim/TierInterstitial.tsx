import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Tier } from '@/data/scenarios';
import { TIER_META } from '@/data/scenarios';

interface TierInterstitialProps {
  tier: Tier;
  eventsCompleted: number;
  topDims: { name: string; value: number }[];
  costs: { time: number; trust: number; momentum: number };
  onDone: () => void;
}

/** State 4 — Tier Interstitial (simulator.md §4). Auto-advances after 3.5s or on click. */
export default function TierInterstitial({
  tier,
  eventsCompleted,
  topDims,
  costs,
  onDone,
}: TierInterstitialProps) {
  const meta = TIER_META[tier];

  useEffect(() => {
    const id = window.setTimeout(onDone, 3500);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-void/95"
      onClick={onDone}
      role="button"
      aria-label={`Continue to tier ${tier}`}
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${meta.color}, transparent 65%)` }}
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-index-hero"
          style={{ color: meta.color, textShadow: `0 0 48px color-mix(in srgb, ${meta.color} 45%, transparent)` }}
        >
          T{tier}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-2 text-label"
          style={{ color: meta.color }}
        >
          TIER {tier} — {meta.name}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-4 font-display text-[clamp(1.25rem,2.6vw,1.75rem)] italic text-ink-hi"
        >
          {meta.frame}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } } }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-line-hair pt-5"
        >
          {[
            `EVENTS ${eventsCompleted}/12`,
            ...topDims.map((d) => `${d.name.toUpperCase()} ${Math.round(d.value)}`),
            `COST T${costs.time} · TR${costs.trust} · M${costs.momentum}`,
          ].map((s) => (
            <motion.span
              key={s}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="font-mono text-[0.6875rem] tracking-[0.1em] text-ink-low"
            >
              {s}
            </motion.span>
          ))}
        </motion.div>

        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          className="mt-10 rounded-[10px] border border-line-strong px-5 py-2.5 text-sm font-medium text-ink-hi transition-colors hover:border-human hover:text-human"
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
}
