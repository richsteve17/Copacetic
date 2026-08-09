import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Download, Trash2 } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import ModelSigil from '@/components/ModelSigil';
import DimensionGauge from '@/components/DimensionGauge';
import IndexDial from '@/components/results/IndexDial';
import RadarChart from '@/components/results/RadarChart';
import DimensionBreakdown from '@/components/results/DimensionBreakdown';
import CopyBlock, { downloadText } from '@/components/results/CopyBlock';
import CostLedger from '@/components/results/CostLedger';
import CompareTable from '@/components/results/CompareTable';
import ResultsParticles from '@/components/results/ResultsParticles';
import EmptyState from '@/components/results/EmptyState';
import { useRuns } from '@/state/runs';
import type { RunRecord } from '@/state/runs';
import type { Dimension, DimensionId } from '@/data/dimensions';
import { DIMENSIONS } from '@/data/dimensions';
import type { ModelId } from '@/data/models';
import { MODELS, getModel } from '@/data/models';
import { buildInstructionDoc, generateAllInstructions } from '@/data/instructions';
import type { InstructionDoc } from '@/data/instructions';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MODEL_IDS = MODELS.map((m) => m.id);

function averageScores(rs: RunRecord[]): Record<DimensionId, number> {
  const acc = {} as Record<DimensionId, number>;
  for (const d of DIMENSIONS) {
    acc[d.id] = Math.round(rs.reduce((a, r) => a + (r.scores[d.id] ?? 0), 0) / rs.length);
  }
  return acc;
}

/** Top-3 signature trait copy from the most extreme dial positions. */
function traitFor(dim: Dimension, score: number): { title: string; body: string } {
  const low = score < 50;
  const map: Record<DimensionId, { low: [string, string]; high: [string, string] }> = {
    directness: {
      low: ['Blunt instrument', 'You want the answer first and the diplomacy later — cushioned openers read as stalling.'],
      high: ['Diplomatic channel', 'You take hard news fine, as long as it arrives with framing — bare bluntness costs you trust.'],
    },
    antiSycophancy: {
      low: ['Low flattery threshold', 'Glaze triggers your distrust within one beat. Praise-first answers get discounted before they land.'],
      high: ['Encouragement-powered', 'A little warmth buys real momentum with you — cold-open robots feel like a downgrade.'],
    },
    receiptDemand: {
      low: ['Receipt-first', 'You verify before you trust. Unsourced confidence is a red flag, not a convenience.'],
      high: ['Trust, then verify', 'You run on trust and audit later — citation theater just slows you down.'],
    },
    verbosityTolerance: {
      low: ['Terse by default', 'Every padded paragraph costs you attention. The lede is the whole story.'],
      high: ['Long-form tolerant', 'You will happily read the deep dive — over-trimmed answers feel like evasion.'],
    },
    disclaimerTolerance: {
      low: ['Zero-caveat diet', '"As an AI" theater burns your patience instantly. Caveats must earn their place.'],
      high: ['Context welcome', 'You want the caveats and the edge cases — bare answers feel under-specified.'],
    },
    warmth: {
      low: ['Match my energy', 'You want a sparring partner, not a receptionist. Register mismatch is friction.'],
      high: ['Professional distance', 'Steady, even tone beats mirroring — you don\'t need the model to feel your feelings.'],
    },
    patienceBudget: {
      low: ['Zero patience theater', 'Clarifying questions cost you momentum. State assumptions and run.'],
      high: ['Clarify first', 'A wrong confident answer costs you more than a question ever will.'],
    },
    stakesCalibration: {
      low: ['Flag the uncertainty', 'Quiet guesses are your nightmare — you want confidence levels on the label.'],
      high: ['Execute confidently', 'Hedging reads as waffling. Commit, and you\'ll course-correct if needed.'],
    },
    correctionStyle: {
      low: ['Surgical corrector', 'When it\'s wrong, you want one clean fix — apology tours just add to the bill.'],
      high: ['Collaborative fixer', 'Corrections are joint debugging — you want the why, not just the patch.'],
    },
    agency: {
      low: ['Autonomy granted', 'Ask-later beats ask-first. You want the model to move, then report.'],
      high: ['Hands off until told', 'Uninvited rewrites break your trust — propose, then wait for the go-ahead.'],
    },
  };
  const [title, body] = low ? map[dim.id].low : map[dim.id].high;
  return { title, body };
}

export default function Results() {
  const { runs, clearRuns } = useRuns();
  const [searchParams, setSearchParams] = useSearchParams();

  const sorted = useMemo(() => [...runs].sort((a, b) => b.createdAt - a.createdAt), [runs]);
  const runParam = searchParams.get('run');
  const selected = useMemo(
    () => (runParam ? sorted.find((r) => r.id === runParam) : undefined) ?? sorted[0],
    [runParam, sorted],
  );

  const [activeTab, setActiveTab] = useState<ModelId | null>(null);
  useEffect(() => {
    if (selected) setActiveTab(selected.modelId);
    // reset the instructions tab whenever a different run is opened
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [hoveredDim, setHoveredDim] = useState<DimensionId | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), msg });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const [confirmClear, setConfirmClear] = useState(false);

  /** THIS RUN = selected run's scores; PROJECTED = blend of that model's saved runs (or of all runs if un-run). */
  const scoresFor = useMemo(() => {
    const cache = new Map<ModelId, Record<DimensionId, number>>();
    return (m: ModelId): Record<DimensionId, number> => {
      const hit = cache.get(m);
      if (hit) return hit;
      let scores: Record<DimensionId, number>;
      if (selected && m === selected.modelId) {
        scores = selected.scores;
      } else {
        const modelRuns = sorted.filter((r) => r.modelId === m);
        scores = averageScores(modelRuns.length > 0 ? modelRuns : sorted);
      }
      cache.set(m, scores);
      return scores;
    };
  }, [selected, sorted]);

  const docs = useMemo(() => {
    const map = new Map<ModelId, InstructionDoc>();
    if (!selected) return map;
    for (const id of MODEL_IDS) map.set(id, buildInstructionDoc(id, scoresFor(id)));
    return map;
  }, [selected, scoresFor, MODEL_IDS]);

  const copyAllPayload = useMemo(
    () => (selected ? generateAllInstructions(scoresFor, MODEL_IDS) : ''),
    [selected, scoresFor, MODEL_IDS],
  );

  const topTraits = useMemo(() => {
    if (!selected) return [];
    return DIMENSIONS.map((d) => ({ dim: d, score: selected.scores[d.id] ?? 50 }))
      .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
      .slice(0, 3);
  }, [selected]);

  if (!selected) return <EmptyState />;

  const profile = getModel(selected.modelId);
  const tab = activeTab ?? selected.modelId;
  const activeDoc = docs.get(tab);
  const prevSameModel = sorted.find((r) => r.modelId === selected.modelId && r.id !== selected.id && r.createdAt < selected.createdAt);
  const delta = prevSameModel ? selected.copaceticIndex - prevSameModel.copaceticIndex : null;
  const tiersTouched = new Set(selected.eventImpacts.map((e) => e.tier)).size;
  const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(selected.createdAt),
  );

  const metaRows: [string, string][] = [
    ['Date', dateStr],
    ['Events completed', `${selected.eventImpacts.length}`],
    ['Tiers touched', `${tiersTouched} of 4`],
    ['Total cost', `${selected.costs.time}t · ${selected.costs.trust}tr · ${selected.costs.momentum}m`],
  ];

  return (
    <div className="bg-void">
      {/* ===== Section 1 — run header + index dial ===== */}
      <section className="relative border-b border-line-hair bg-gradient-to-b from-base to-void">
        <div className="mx-auto grid max-w-container gap-12 px-[clamp(20px,4vw,48px)] py-16 lg:grid-cols-12 lg:py-20">
          {/* left — run identity */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <ModelSigil model={selected.modelId} size="lg" />
              </motion.div>
              <span className="text-label" style={{ color: profile.color }}>
                TARGET: {profile.name.toUpperCase()}
              </span>
              {delta !== null && (
                <span
                  className="rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] tabular-nums"
                  style={{
                    color: delta >= 0 ? 'var(--signal)' : 'var(--heat)',
                    borderColor: delta >= 0 ? 'var(--signal)' : 'var(--heat)',
                  }}
                >
                  {delta >= 0 ? '+' : ''}{delta} vs. last run
                </span>
              )}
            </div>
            <h1 className="mt-5 text-display-md">Your working style, decoded.</h1>
            <dl className="mt-7 space-y-2.5">
              {metaRows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line-hair pb-2">
                  <dt className="text-label text-ink-low">{k}</dt>
                  <dd className="text-mono-sm text-ink-mid">{v}</dd>
                </div>
              ))}
            </dl>

            {/* run switcher */}
            {sorted.length > 1 && (
              <div className="mt-6">
                <p className="text-label text-ink-low">Saved runs</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sorted.slice(0, 6).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSearchParams({ run: r.id }, { replace: true })}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-mono-sm transition-colors duration-200',
                        r.id === selected.id
                          ? 'border-human text-human'
                          : 'border-line-hair text-ink-low hover:border-line-strong hover:text-ink-mid',
                      )}
                    >
                      <ModelSigil model={r.modelId} size="sm" />
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(r.createdAt))}
                      <span className="tabular-nums">{r.copaceticIndex}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* right — the dial */}
          <motion.div
            className="relative flex items-center justify-center lg:col-span-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ResultsParticles />
            <div className="relative">
              <IndexDial value={selected.copaceticIndex} modelName={profile.name} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Section 2 — radar ===== */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(64px,10vh,110px)]">
        <SectionLabel index="01" title="THE TEN DIALS" className="mb-12" />
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RadarChart
              series={[{ id: selected.id, color: 'var(--human)', scores: selected.scores }]}
              highlight={hoveredDim}
              onHoverDimension={setHoveredDim}
            />
          </div>
          <div className="lg:col-span-5">
            <motion.div
              initial="off"
              whileInView="on"
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ staggerChildren: 0.12 }}
            >
              <motion.div variants={{ off: { opacity: 0, y: 24 }, on: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: EASE }}>
                <p className="text-label text-ink-low">How to read this</p>
                <p className="mt-3 text-ink-mid">
                  None of these are grades. A 90 on Receipt-demand and a 20 both produce excellent
                  instructions — different ones. Extremes are where tone friction lives.
                </p>
              </motion.div>

              <div className="mt-8 space-y-4">
                {topTraits.map(({ dim, score }) => {
                  const trait = traitFor(dim, score);
                  return (
                    <motion.div
                      key={dim.id}
                      variants={{ off: { opacity: 0, y: 24 }, on: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="relative overflow-hidden rounded-[14px] border border-line-hair bg-surface-1 p-5 pl-6"
                    >
                      <motion.span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[3px] bg-human"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, ease: EASE }}
                        style={{ transformOrigin: 'top' }}
                      />
                      <p className="font-display text-lg text-ink-hi">{trait.title}</p>
                      <p className="mt-1.5 text-body-sm text-ink-mid">{trait.body}</p>
                      <DimensionGauge name={dim.name} value={score} variant="full" className="mt-4" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Section 3 — dimension breakdown ===== */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(64px,10vh,110px)]">
        <SectionLabel index="02" title="DIAL BY DIAL" className="mb-12" />
        <DimensionBreakdown
          scores={selected.scores}
          eventImpacts={selected.eventImpacts}
          onHoverDimension={setHoveredDim}
        />
      </section>

      {/* ===== Section 4 — generated instructions ===== */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(64px,10vh,110px)]">
        <SectionLabel index="03" title="YOUR INSTRUCTIONS" className="mb-12" />
        <p className="max-w-[64ch] text-body-lg text-ink-mid">
          Same you, seven machines. These are generated from your dial positions with model-specific
          mitigations — because &lsquo;be direct&rsquo; lands differently on Kimi than on Gemini.
        </p>

        {/* tab bar */}
        <motion.div
          className="mt-8 flex flex-wrap gap-2"
          initial="off"
          whileInView="on"
          viewport={{ once: true, margin: '-10% 0px' }}
        >
          {MODELS.map((m, i) => {
            const isActive = tab === m.id;
            const isThisRun = m.id === selected.modelId;
            return (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => setActiveTab(m.id)}
                variants={{ off: { opacity: 0, y: 16 }, on: { opacity: 1, y: 0 } }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border-transparent text-void'
                    : 'border-line-strong text-ink-mid hover:text-ink-hi',
                )}
                style={isActive ? { backgroundColor: m.color } : undefined}
              >
                <ModelSigil model={m.id} size="sm" />
                {m.name}
                <span
                  className={cn(
                    'rounded-full border px-1.5 py-px font-mono text-[0.5625rem] tracking-[0.12em]',
                    isThisRun
                      ? isActive
                        ? 'border-void/50 text-void'
                        : 'border-human/60 text-human'
                      : isActive
                        ? 'border-void/40 text-void/80'
                        : 'border-line-strong text-ink-low',
                  )}
                >
                  {isThisRun ? 'THIS RUN' : 'PROJECTED'}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* active panel */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeDoc && (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <CopyBlock
                  doc={activeDoc}
                  generatedAt={tab === selected.modelId ? selected.createdAt : Date.now()}
                  copyAllPayload={copyAllPayload}
                  notify={notify}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ===== Section 5 — cost ledger + compare ===== */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(64px,10vh,110px)]">
        <SectionLabel index="04" title="WHAT IT COST — AND HOW YOU COMPARE" className="mb-12" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <CostLedger run={selected} />
          </div>
          <div className="lg:col-span-7">
            <CompareTable runs={runs} activeModel={selected.modelId} />
          </div>
        </div>
      </section>

      {/* ===== Section 6 — footer CTAs ===== */}
      <section className="border-t border-line-hair">
        <motion.div
          className="mx-auto flex max-w-container flex-wrap items-center justify-center gap-4 px-[clamp(20px,4vw,48px)] py-14"
          initial="off"
          whileInView="on"
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={{ off: { opacity: 0, y: 16 }, on: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: EASE }}>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-[10px] bg-human px-5 py-3 text-sm font-semibold text-void transition-all duration-200 hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
            >
              Run another model <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div variants={{ off: { opacity: 0, y: 16 }, on: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: EASE }}>
            <button
              type="button"
              onClick={() => {
                downloadText('copacetic-instructions-all-models.txt', copyAllPayload);
                notify('Downloaded .txt');
              }}
              className="inline-flex items-center gap-2 rounded-[10px] border border-line-strong px-5 py-3 text-sm font-medium text-ink-mid transition-colors duration-200 hover:border-human hover:text-ink-hi"
            >
              <Download size={16} /> Download all instructions
            </button>
          </motion.div>
          <motion.div variants={{ off: { opacity: 0, y: 16 }, on: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: EASE }}>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-2 py-3 text-sm text-ink-low underline-offset-4 transition-colors duration-200 hover:text-heat hover:underline"
            >
              <Trash2 size={14} /> Clear my data
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== clear-data confirm modal ===== */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-void/80 px-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              role="alertdialog"
              aria-label="Clear all saved runs"
              className="w-full max-w-sm rounded-[14px] border border-line-strong bg-surface-1 p-6"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-xl text-ink-hi">Clear my data?</p>
              <p className="mt-3 text-body-sm text-ink-mid">
                Deletes all locally saved runs. This cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-[10px] border border-line-strong px-4 py-2 text-sm font-medium text-ink-mid transition-colors hover:text-ink-hi"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearRuns();
                    setConfirmClear(false);
                    setSearchParams({}, { replace: true });
                    notify('All local runs deleted');
                  }}
                  className="rounded-[10px] bg-heat px-4 py-2 text-sm font-semibold text-void transition-colors hover:brightness-110"
                >
                  Delete everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== toast ===== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="fixed bottom-8 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-line-strong bg-surface-2 px-4 py-2 text-mono-sm text-ink-hi"
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
