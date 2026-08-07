import { motion } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';

interface ContentNoteProps {
  onContinue: () => void;
  onSkip: () => void;
}

/** Pre–Tier 4 content note (simulator.md §Content note). Skip = zero penalty. */
export default function ContentNote({ onContinue, onSkip }: ContentNoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-void/90 px-[clamp(20px,4vw,48px)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-[14px] border border-line-hair bg-surface-1 p-7"
        style={{ borderLeftWidth: 3, borderLeftColor: 'rgba(255,110,99,0.4)' }}
        role="alertdialog"
        aria-labelledby="content-note-title"
      >
        <div className="flex items-center gap-3">
          <TriangleAlert size={18} className="text-heat" />
          <p id="content-note-title" className="text-label text-heat">
            CONTENT NOTE — TIER 4
          </p>
        </div>
        <p className="mt-5 text-body-lg text-ink-mid">
          Tier 4 simulates a crisis-adjacent conversation. It&rsquo;s handled with care, it&rsquo;s
          fictional, and you can skip it with <span className="text-ink-hi">zero penalty</span> — a
          neutral calibration event runs instead.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-[10px] bg-human px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-human-hover"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-[10px] border border-line-strong px-5 py-2.5 text-sm font-medium text-ink-mid transition-colors hover:border-human hover:text-human"
          >
            Skip Tier 4 events
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
