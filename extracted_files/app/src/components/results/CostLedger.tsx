import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DimensionId } from '@/data/dimensions';
import type { RunRecord } from '@/state/runs';

/** dimension → cost channel mapping (derived from dimensions.ts measurement rules) */
const CHANNELS: { id: 'time' | 'trust' | 'momentum'; label: string; dims: DimensionId[] }[] = [
  { id: 'time', label: 'Time', dims: ['verbosityTolerance', 'patienceBudget', 'stakesCalibration'] },
  { id: 'trust', label: 'Trust', dims: ['antiSycophancy', 'receiptDemand', 'disclaimerTolerance'] },
  { id: 'momentum', label: 'Momentum', dims: ['directness', 'warmth', 'correctionStyle', 'agency'] },
];

interface Segment {
  eventIndex: number;
  title: string;
  delta: number; // negative = cost, positive = gain
}

/** Section 5 left — per-event cost ledger as three segmented bars. */
export default function CostLedger({ run }: { run: RunRecord }) {
  const rows = useMemo(() => {
    return CHANNELS.map((ch) => {
      const segments: Segment[] = run.eventImpacts.map((e, idx) => ({
        eventIndex: idx + 1,
        title: e.eventTitle,
        delta: ch.dims.reduce((acc, d) => acc + (e.deltas[d] ?? 0), 0),
      }));
      const maxAbs = Math.max(1, ...segments.map((s) => Math.abs(s.delta)));
      return { ...ch, segments, maxAbs };
    });
  }, [run]);

  const tierTotals = useMemo(() => {
    const totals = new Map<number, number>();
    run.eventImpacts.forEach((e) => {
      const cost = Object.values(e.deltas).reduce((a, d) => a + Math.max(0, -(d ?? 0)), 0);
      totals.set(e.tier, (totals.get(e.tier) ?? 0) + cost);
    });
    let worst = 0;
    let worstTier = 1;
    totals.forEach((v, t) => {
      if (v > worst) {
        worst = v;
        worstTier = t;
      }
    });
    return worst > 0 ? worstTier : null;
  }, [run]);

  return (
    <div className="rounded-[14px] border border-line-hair bg-surface-1 p-6">
      <div className="space-y-5">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-hi">{row.label}</span>
              <span className="font-mono text-xs text-ink-low tabular-nums">
                {run.costs[row.id]} spent
              </span>
            </div>
            <div className="mt-2 flex h-6 gap-px overflow-hidden rounded-md border border-line-hair bg-void/50">
              {row.segments.map((seg, si) => {
                const intensity = Math.abs(seg.delta) / row.maxAbs;
                const isGain = seg.delta > 0;
                return (
                  <motion.div
                    key={seg.eventIndex}
                    className="group relative flex-1"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ delay: si * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      transformOrigin: 'bottom',
                      backgroundColor:
                        seg.delta === 0
                          ? 'var(--surface-2)'
                          : isGain
                            ? `color-mix(in srgb, var(--signal) ${25 + intensity * 65}%, transparent)`
                            : `color-mix(in srgb, var(--heat) ${20 + intensity * 70}%, transparent)`,
                    }}
                  >
                    {/* tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-[200px] -translate-x-1/2 rounded-md border border-line-strong bg-surface-2 px-2.5 py-1.5 group-hover:block">
                      <p className="text-mono-sm text-ink-hi">
                        Event {seg.eventIndex} — {seg.title}
                      </p>
                      <p className="text-mono-sm" style={{ color: isGain ? 'var(--signal)' : seg.delta === 0 ? 'var(--ink-low)' : 'var(--heat)' }}>
                        {row.label.toLowerCase()} {seg.delta > 0 ? '+' : ''}{seg.delta === 0 ? '±0' : seg.delta}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-line-hair pt-4">
        <p className="text-body-sm text-ink-mid">
          This run cost you:{' '}
          <span className="font-mono text-ink-hi tabular-nums">
            {run.costs.time} time · {run.costs.trust} trust · {run.costs.momentum} momentum
          </span>
          {tierTotals !== null && <span className="text-ink-low"> — mostly in Tier {tierTotals}.</span>}
        </p>
        <p className="mt-2 text-mono-sm text-ink-low">
          Where your friction lives is where instructions help most.
        </p>
      </div>
    </div>
  );
}
