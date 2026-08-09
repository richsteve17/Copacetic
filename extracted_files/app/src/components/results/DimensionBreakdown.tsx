import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Copy } from 'lucide-react';
import type { Dimension, DimensionId } from '@/data/dimensions';
import { DIMENSIONS } from '@/data/dimensions';
import type { EventImpact } from '@/state/runs';
import { dimensionInstruction } from '@/data/instructions';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** "What we saw" — cite the specific events that moved this dial. */
function sawSentence(dimId: DimensionId, impacts: EventImpact[]): string {
  const movers = impacts
    .map((e, idx) => ({ e, idx, delta: e.deltas[dimId] ?? 0 }))
    .filter((m) => m.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  if (movers.length === 0) {
    return 'No single event moved this dial much — it settled from small nudges across the whole run.';
  }
  const cited = movers.slice(0, 3).map(
    (m) =>
      `in Event ${m.idx + 1} ("${m.e.eventTitle}", Tier ${m.e.tier}) this dial moved ${m.delta > 0 ? '+' : ''}${m.delta}`,
  );
  const extra = movers.length > 3 ? `, with ${movers.length - 3} more nudge${movers.length - 3 === 1 ? '' : 's'} elsewhere` : '';
  return `You showed it ${cited.join('; ')}${extra}.`;
}

/** "What it means" — band interpretation from the dimension's polarity labels. */
function meansSentence(dim: Dimension, score: number): string {
  if (score < 35)
    return `You sit hard toward “${dim.lowLabel}”. That is a working-style fact, not a flaw — but it is exactly where default AI tone will grate on you.`;
  if (score > 65)
    return `You sit hard toward “${dim.highLabel}”. That is a working-style fact, not a flaw — and the instruction below keeps the model from overcorrecting away from it.`;
  return `You land between “${dim.lowLabel}” and “${dim.highLabel}” — flexible here, so the instruction just keeps the model from drifting to either extreme.`;
}

interface DimensionBreakdownProps {
  scores: Record<DimensionId, number>;
  eventImpacts: EventImpact[];
  onHoverDimension?: (d: DimensionId | null) => void;
}

/** Section 3 — ten expandable dial rows citing the events that moved each one. */
export default function DimensionBreakdown({ scores, eventImpacts, onHoverDimension }: DimensionBreakdownProps) {
  const [open, setOpen] = useState<DimensionId | null>(null);
  const [copiedDim, setCopiedDim] = useState<DimensionId | null>(null);

  const copyLine = async (dimId: DimensionId, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDim(dimId);
      setTimeout(() => setCopiedDim((c) => (c === dimId ? null : c)), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-2">
      {DIMENSIONS.map((dim, i) => {
        const score = clampScore(scores[dim.id] ?? 0);
        const isOpen = open === dim.id;
        const line = dimensionInstruction(dim.id, score);
        return (
          <motion.div
            key={dim.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
            className={cn(
              'rounded-[14px] border border-line-hair transition-colors duration-200',
              isOpen ? 'bg-surface-2' : 'bg-surface-1 hover:bg-surface-2',
            )}
            onMouseEnter={() => onHoverDimension?.(dim.id)}
            onMouseLeave={() => onHoverDimension?.(null)}
          >
            <button
              type="button"
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : dim.id)}
              aria-expanded={isOpen}
            >
              <span className="text-label w-8 shrink-0 text-human">{dim.short}</span>
              <span className="w-40 shrink-0 text-sm font-medium text-ink-hi max-sm:w-28">{dim.name}</span>
              <div className="relative flex-1">
                <div className="flex justify-between text-mono-sm text-[0.6875rem] text-ink-low">
                  <span>{dim.lowLabel}</span>
                  <span>{dim.highLabel}</span>
                </div>
                <div className="relative mt-1.5 h-0.5 w-full rounded-full bg-surface-3">
                  <motion.div
                    className="h-full rounded-full bg-human"
                    style={{ transformOrigin: 'left', width: '100%' }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: score / 100 }}
                    viewport={{ once: true, margin: '-15% 0px' }}
                    transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: EASE }}
                  />
                  {/* score diamond marker */}
                  <motion.span
                    className="absolute top-1/2 h-1.5 w-1.5 rotate-45 bg-human"
                    style={{ left: `${score}%` }}
                    initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-15% 0px' }}
                    transition={{ delay: 0.85 + i * 0.06, type: 'spring', stiffness: 400, damping: 18 }}
                  />
                </div>
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-mid tabular-nums">
                {Math.round(score)}
              </span>
              <ChevronDown
                size={16}
                className={cn('shrink-0 text-ink-low transition-transform duration-300', isOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -8 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="grid gap-5 border-t border-line-hair px-5 py-5 md:grid-cols-3"
                  >
                    <div>
                      <p className="text-label text-ink-low">What we saw</p>
                      <p className="mt-2 text-body-sm text-ink-mid">{sawSentence(dim.id, eventImpacts)}</p>
                    </div>
                    <div>
                      <p className="text-label text-ink-low">What it means</p>
                      <p className="mt-2 text-body-sm text-ink-mid">{meansSentence(dim, score)}</p>
                    </div>
                    <div>
                      <p className="text-label text-ink-low">What it writes</p>
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-line-hair bg-void/60 p-3">
                        <code className="flex-1 text-mono-sm text-ink-hi">{line.text}</code>
                        <button
                          type="button"
                          onClick={() => copyLine(dim.id, line.text)}
                          className="shrink-0 text-ink-low transition-colors hover:text-human"
                          aria-label={`Copy instruction line for ${dim.name}`}
                        >
                          {copiedDim === dim.id ? <Check size={14} className="text-signal" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="mt-2 text-mono-sm text-ink-low">Section: {line.section}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
