import { motion } from 'framer-motion';
import { Clock, HeartCrack, Zap } from 'lucide-react';
import type { CostLevel, CostMeter } from '@/data/scenarios';
import { cn } from '@/lib/utils';

export const METERS: { id: CostMeter; label: string; Icon: typeof Clock }[] = [
  { id: 'time', label: 'Time', Icon: Clock },
  { id: 'trust', label: 'Trust', Icon: HeartCrack },
  { id: 'momentum', label: 'Momentum', Icon: Zap },
];

const LEVELS: { id: CostLevel; label: string }[] = [
  { id: 'none', label: 'none' },
  { id: 'some', label: 'some' },
  { id: 'aLot', label: 'a lot' },
];

const LEVEL_COLOR: Record<CostLevel, string> = {
  none: 'var(--signal)',
  some: 'var(--human)',
  aLot: 'var(--heat)',
};

interface CostLedgerProps {
  costs: { time: number; trust: number; momentum: number };
}

/** Compact running cost totals for the HUD rail (design.md §7.8). */
export function CostLedger({ costs }: CostLedgerProps) {
  return (
    <div className="space-y-2">
      <p className="text-label text-ink-low">Cost ledger</p>
      <div className="flex items-center gap-4">
        {METERS.map(({ id, label, Icon }) => (
          <div key={id} className="flex items-center gap-1.5" title={label}>
            <Icon size={13} className="text-ink-low" />
            <motion.span
              key={costs[id]}
              initial={{ scale: 1.15, color: 'var(--heat)' }}
              animate={{ scale: 1, color: 'var(--ink-low)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="font-mono text-xs tabular-nums"
            >
              {costs[id]}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CostPulseCardProps {
  selections: Record<CostMeter, CostLevel>;
  onSelect: (meter: CostMeter, level: CostLevel) => void;
  onNext: () => void;
  isLast: boolean;
}

/** Post-event cost capture (simulator.md §Cost pulse): three 3-state meters. */
export function CostPulseCard({ selections, onSelect, onNext, isLast }: CostPulseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="border-t border-line-hair bg-surface-1"
    >
      <div className="mx-auto w-full max-w-chat px-[clamp(16px,3vw,32px)] py-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-label text-ink-low">What did that cost you?</p>
          <span className="font-mono text-[0.625rem] text-ink-low">auto-advances when idle</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {METERS.map(({ id, label, Icon }) => (
            <div key={id} className="rounded-[10px] border border-line-hair bg-surface-2 px-3 py-3">
              <div className="flex items-center gap-2">
                <motion.span
                  key={selections[id]}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: [0.6, 1.15, 1] }}
                  transition={{ duration: 0.35, type: 'spring', stiffness: 500, damping: 18 }}
                  className="inline-flex"
                >
                  <Icon
                    size={15}
                    style={{ color: selections[id] === 'none' ? 'var(--ink-low)' : LEVEL_COLOR[selections[id]] }}
                  />
                </motion.span>
                <span className="text-sm font-medium text-ink-hi">{label}</span>
              </div>
              <div className="mt-2.5 flex gap-1.5">
                {LEVELS.map((l) => {
                  const active = selections[id] === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onSelect(id, l.id)}
                      className={cn(
                        'flex-1 rounded-full border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.1em] transition-colors',
                        active
                          ? 'border-[rgba(255,182,72,0.6)] bg-[rgba(255,182,72,0.10)] text-human'
                          : 'border-line-hair text-ink-low hover:border-line-strong hover:text-ink-mid',
                      )}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <motion.button
            type="button"
            onClick={onNext}
            whileTap={{ scale: 0.97 }}
            className="rounded-[10px] bg-human px-4 py-2 text-sm font-semibold text-void transition-all hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
          >
            {isLast ? 'Finish run →' : 'Next event →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
