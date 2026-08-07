import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ModelId } from '@/data/models';
import { MODELS, getModel } from '@/data/models';
import type { RunRecord } from '@/state/runs';
import ModelSigil from '@/components/ModelSigil';
import RadarChart, { type RadarSeries } from '@/components/results/RadarChart';
import { cn } from '@/lib/utils';

const MAX_COMPARE = 3;

function CountUp({ value, delay }: { value: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / 1000));
      setShown(Math.round(value * (1 - Math.pow(1 - t, 2))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, delay]);
  return (
    <span ref={ref} className="font-mono text-xs tabular-nums" style={{ color: 'inherit' }}>
      {shown}
    </span>
  );
}

interface CompareTableProps {
  runs: RunRecord[];
  activeModel: ModelId;
}

/** Section 5 right — overlay saved runs on a shared radar + index bar chart. */
export default function CompareTable({ runs, activeModel }: CompareTableProps) {
  const byModel = useMemo(() => {
    const map = new Map<ModelId, RunRecord[]>();
    for (const r of runs) {
      const list = map.get(r.modelId) ?? [];
      list.push(r);
      map.set(r.modelId, list);
    }
    // newest first within each model
    map.forEach((list) => list.sort((a, b) => b.createdAt - a.createdAt));
    return map;
  }, [runs]);

  const runnableModels = useMemo(() => MODELS.filter((m) => byModel.has(m.id)), [byModel]);

  const [selected, setSelected] = useState<ModelId[]>(() => {
    const others = runnableModels.map((m) => m.id).filter((id) => id !== activeModel);
    return [activeModel, ...others].slice(0, MAX_COMPARE);
  });

  const toggle = (id: ModelId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const series: RadarSeries[] = useMemo(() => {
    const out: RadarSeries[] = [];
    selected.forEach((id, si) => {
      const modelRuns = byModel.get(id) ?? [];
      modelRuns.slice(0, 2).forEach((r, ri) => {
        out.push({
          id: r.id,
          color: getModel(id).color,
          scores: r.scores,
          dashed: ri > 0,
          fillOpacity: ri === 0 && si === 0 ? 0.1 : 0,
          delay: si * 0.3 + ri * 0.15,
        });
      });
    });
    return out;
  }, [selected, byModel]);

  const bestWorst = useMemo(() => {
    const latest = runnableModels
      .map((m) => ({ m, run: byModel.get(m.id)![0] }))
      .sort((a, b) => b.run.copaceticIndex - a.run.copaceticIndex);
    if (latest.length < 2) return null;
    return { best: latest[0], worst: latest[latest.length - 1] };
  }, [runnableModels, byModel]);

  return (
    <div className="rounded-[14px] border border-line-hair bg-surface-1 p-6">
      {/* model chip checkboxes */}
      <div className="flex flex-wrap gap-2">
        {MODELS.map((m) => {
          const has = byModel.has(m.id);
          const isOn = selected.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              disabled={!has}
              onClick={() => toggle(m.id)}
              title={has ? undefined : 'not yet run'}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-label transition-all duration-200',
                !has && 'cursor-not-allowed border-line-hair text-ink-low opacity-50',
                has && isOn && 'border-transparent text-void',
                has && !isOn && 'border-line-strong text-ink-mid hover:text-ink-hi',
              )}
              style={has && isOn ? { backgroundColor: m.color } : undefined}
            >
              <ModelSigil model={m.id} size="sm" />
              {m.name}
              {!has && <span className="text-[0.6rem] normal-case tracking-normal">not yet run</span>}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <p className="mt-6 text-body-sm text-ink-low">Select up to {MAX_COMPARE} models to overlay their dials.</p>
      ) : (
        <div className="mt-4">
          <RadarChart series={series} showLabels={false} />
          {/* legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {selected.map((id) => {
              const modelRuns = byModel.get(id) ?? [];
              return (
                <motion.span
                  key={id}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="inline-flex items-center gap-1.5 text-mono-sm text-ink-mid"
                >
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getModel(id).color }} />
                  {getModel(id).name}
                  {modelRuns.length > 1 && (
                    <span className="text-ink-low">({modelRuns.length} runs, older dashed)</span>
                  )}
                </motion.span>
              );
            })}
          </div>
        </div>
      )}

      {/* index bar chart */}
      <div className="mt-7 border-t border-line-hair pt-5">
        <p className="text-label text-ink-low">Copacetic index by model</p>
        <div className="mt-4 space-y-3">
          {MODELS.map((m, i) => {
            const modelRuns = byModel.get(m.id);
            const latest = modelRuns?.[0];
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span className={cn('w-20 shrink-0 text-right text-mono-sm', latest ? 'text-ink-mid' : 'text-ink-low')}>
                  {m.name}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-3/60">
                  {latest && (
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color, transformOrigin: 'left', width: '100%' }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: latest.copaceticIndex / 100 }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </div>
                <span className="w-12 shrink-0 text-right">
                  {latest ? (
                    <span style={{ color: m.color }}>
                      <CountUp value={latest.copaceticIndex} delay={i * 0.08} />
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-ink-low">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {bestWorst && (
          <p className="mt-4 text-mono-sm text-ink-low">
            You&rsquo;re a {bestWorst.best.run.copaceticIndex} with {bestWorst.best.m.name} and a{' '}
            {bestWorst.worst.run.copaceticIndex} with {bestWorst.worst.m.name}. The instructions close the gap —
            that&rsquo;s the point.
          </p>
        )}
      </div>
    </div>
  );
}
