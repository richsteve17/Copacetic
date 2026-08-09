import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import type { ModelProfile } from '@/data/models';
import ModelSigil from '@/components/ModelSigil';

interface HandoffProps {
  model: ModelProfile;
  onResults: () => void;
  onRestart: () => void;
}

/** State 5 — Handoff (simulator.md §5). No confetti: one amber ring, signal lock. */
export default function Handoff({ model, onResults, onRestart }: HandoffProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[720px] flex-col items-center justify-center px-[clamp(20px,4vw,48px)] py-16 text-center">
      <p className="text-label text-signal">CALIBRATION COMPLETE</p>

      <div className="relative mt-8">
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border border-human"
        />
        <ModelSigil model={model.id} size="lg" />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 text-display-md"
      >
        Run complete — <span style={{ color: model.color }}>{model.name}</span>
      </motion.h2>

      <div className="mt-10 w-full max-w-[420px]">
        <p className="text-left text-label text-ink-low">Writing your profile…</p>
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-surface-3">
          <motion.div
            className="h-full w-1/3 rounded-full bg-human"
            animate={{ x: ['-100%', '320%'] }}
            transition={{ duration: 1.2, repeat: ready ? 0 : Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {ready && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <button
            type="button"
            onClick={onResults}
            className="group flex items-center gap-2 rounded-[10px] bg-human px-6 py-3.5 text-sm font-semibold text-void shadow-glow-human transition-all hover:-translate-y-px hover:bg-human-hover"
          >
            See your results
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-sm text-ink-mid transition-colors hover:text-human"
          >
            <RotateCcw size={13} />
            Run another model
          </button>
        </motion.div>
      )}
    </div>
  );
}
