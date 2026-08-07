import { motion } from 'framer-motion';
import type { DimensionId } from '@/data/dimensions';
import { DIMENSIONS } from '@/data/dimensions';
import type { Tier } from '@/data/scenarios';
import { TIER_META } from '@/data/scenarios';
import DimensionGauge from '@/components/DimensionGauge';
import { CostLedger } from './CostPulse';

interface HudPanelProps {
  eventN: number; // 1–12
  totalEvents: number;
  tier: Tier;
  scores: Record<DimensionId, number>;
  costs: { time: number; trust: number; momentum: number };
  /** show the non-simulated crisis resources line (Tier 4 only) */
  showResources: boolean;
}

/** Left HUD rail (simulator.md §3): run telemetry, 10 mini gauges, cost ledger. */
export default function HudPanel({
  eventN,
  totalEvents,
  tier,
  scores,
  costs,
  showResources,
}: HudPanelProps) {
  const meta = TIER_META[tier];
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-line-hair bg-base lg:flex">
      <div className="border-b border-line-hair px-5 py-5">
        <p className="text-label text-ink-low">Event</p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-[2rem] leading-none text-ink-hi">
            {String(eventN).padStart(2, '0')}
          </span>
          <span className="font-mono text-xs text-ink-low">/ {totalEvents}</span>
        </p>
        <span
          className="mt-3 inline-block rounded-full border px-2.5 py-1 text-label"
          style={{ color: meta.color, borderColor: `color-mix(in srgb, ${meta.color} 45%, transparent)` }}
        >
          T{tier} · {meta.name}
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <p className="text-label text-ink-low">Working-style dials</p>
        {DIMENSIONS.map((d) => (
          <motion.div
            key={`${d.id}-${scores[d.id]}`}
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <DimensionGauge name={d.name} value={scores[d.id]} variant="mini" />
          </motion.div>
        ))}
      </div>

      <div className="border-t border-line-hair px-5 py-4">
        <CostLedger costs={costs} />
      </div>

      {showResources && (
        <div className="border-t border-line-hair px-5 py-3">
          <p className="font-mono text-[0.625rem] leading-relaxed text-ink-low">
            Not a simulation note: if you&rsquo;re in a real crisis — 988 (US) · findahelpline.com
          </p>
        </div>
      )}
    </aside>
  );
}

/** Collapsed mobile HUD strip: event counter + tier chip + resources line. */
export function HudStrip({ eventN, totalEvents, tier, showResources }: Omit<HudPanelProps, 'scores' | 'costs'>) {
  const meta = TIER_META[tier];
  return (
    <div className="border-b border-line-hair bg-base lg:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="font-mono text-xs text-ink-mid">
          EVENT <span className="text-ink-hi">{String(eventN).padStart(2, '0')}</span> / {totalEvents}
        </span>
        <span
          className="rounded-full border px-2 py-0.5 text-label"
          style={{ color: meta.color, borderColor: `color-mix(in srgb, ${meta.color} 45%, transparent)` }}
        >
          T{tier} · {meta.name}
        </span>
      </div>
      {showResources && (
        <p className="border-t border-line-hair px-4 py-1.5 font-mono text-[0.625rem] text-ink-low">
          Not a simulation note: real crisis — 988 (US) · findahelpline.com
        </p>
      )}
    </div>
  );
}
