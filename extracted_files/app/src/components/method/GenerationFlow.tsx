import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import DimensionGauge from '@/components/DimensionGauge';
import ModelSigil from '@/components/ModelSigil';
import type { ModelId } from '@/data/models';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    index: '01',
    title: 'Read the dials',
    body: "Each dial's position maps to instruction fragments: a 90 on Anti-sycophancy writes “Never open with praise”; a 20 writes “Brief encouragement is welcome”.",
  },
  {
    index: '02',
    title: 'Apply model mitigations',
    body: 'Each system gets its documented failure modes patched explicitly.',
    mitigations: true,
  },
  {
    index: '03',
    title: 'Emit per-model documents',
    body: "Tone, format, and behavior sections, sized to your verbosity dial, copyable and downloadable. Projected versions for models you haven't run yet.",
  },
];

const MITIGATIONS: { model: ModelId; text: string }[] = [
  { model: 'claude', text: 'skip anti-anthropomorphic disclaimers unless a real category error matters' },
  { model: 'chatgpt', text: 'no glaze openers; cite inline' },
  { model: 'gemini', text: 'drop the PR cheer' },
  { model: 'grok', text: 'keep the snark, add receipts' },
  { model: 'qwen', text: 'answer first, deliberation invisible' },
  { model: 'deepseek', text: 'keep reasoning visible, conclusion first' },
  { model: 'kimi', text: 'pushback welcome, keep it evidence-bound' },
];

const EXAMPLE_LINES: { model: ModelId; lines: string[] }[] = [
  {
    model: 'chatgpt',
    lines: [
      'Cite sources inline for every factual claim.',
      'If a claim cannot be sourced, flag it as unverified.',
      'No fabricated references — say "I don\'t know" instead.',
    ],
  },
  {
    model: 'kimi',
    lines: [
      'Show the evidence before the conclusion.',
      'Push back when my claim has no source — that is welcome here.',
      'Keep challenges evidence-bound, not diplomatic.',
    ],
  },
];

function Connector() {
  return (
    <svg width="44" height="12" viewBox="0 0 44 12" className="hidden shrink-0 self-center lg:block" aria-hidden>
      <line
        x1="2"
        y1="6"
        x2="42"
        y2="6"
        stroke="var(--human)"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="animate-dash-drift"
      />
      <path d="M 38 2 L 43 6 L 38 10" fill="none" stroke="var(--human)" strokeOpacity="0.7" strokeWidth="1" />
    </svg>
  );
}

/** Section 5 — dials → instructions flow + worked example (method.md §5). */
export default function GenerationFlow() {
  const exampleRef = useRef<HTMLDivElement>(null);
  const exampleInView = useInView(exampleRef, { once: true, margin: '-20% 0px' });
  const [gaugeValue, setGaugeValue] = useState(0);

  useEffect(() => {
    if (exampleInView) {
      const t = window.setTimeout(() => setGaugeValue(88), 250);
      return () => window.clearTimeout(t);
    }
  }, [exampleInView]);

  return (
    <div>
      {/* three-step flow */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-0">
        {STEPS.map((s, i) => (
          <div key={s.index} className="contents">
            {i > 0 && <Connector />}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.15 }}
              className="flex-1 rounded-[14px] border border-line-hair bg-surface-1 p-6"
            >
              <p className="text-label text-human">STEP {s.index}</p>
              <h3 className="mt-3 font-display text-xl text-ink-hi">{s.title}</h3>
              <p className="mt-3 text-body-sm text-ink-mid">{s.body}</p>
              {s.mitigations && (
                <ul className="mt-4 space-y-2">
                  {MITIGATIONS.map((m) => (
                    <li key={m.model} className="flex items-start gap-2.5">
                      <ModelSigil model={m.model} size="sm" className="mt-0.5 shrink-0" />
                      <span className="text-mono-sm text-ink-low">{m.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* worked example */}
      <motion.div
        ref={exampleRef}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mt-10 rounded-[14px] border border-line-hair bg-surface-1 p-6 sm:p-8"
      >
        <p className="text-label text-ink-low">WORKED EXAMPLE &middot; SAME DIAL, DIFFERENT MACHINE</p>

        <div className="mt-6 grid items-center gap-6 md:grid-cols-[220px_64px_1fr]">
          {/* the dial */}
          <div>
            <DimensionGauge name="Receipt-demand" value={gaugeValue} />
            <p className="mt-3 text-mono-sm text-ink-low">
              one dial, position <span className="text-human">88</span>/100
            </p>
          </div>

          {/* the arrow */}
          <svg viewBox="0 0 64 24" className="hidden md:block" aria-hidden>
            <line x1="2" y1="12" x2="56" y2="12" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" />
            <path d="M 52 6 L 60 12 L 52 18" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
            {exampleInView && (
              <motion.circle
                r={3}
                cy={12}
                fill="var(--human)"
                initial={{ cx: 2, opacity: 0 }}
                animate={{ cx: 56, opacity: [0, 1, 1, 0] }}
                transition={{ delay: 1.1, duration: 0.4, ease: 'easeIn' }}
              />
            )}
          </svg>

          {/* two mini copyblocks */}
          <div className="grid gap-4 sm:grid-cols-2">
            {EXAMPLE_LINES.map((ex, bi) => (
              <div key={ex.model} className="rounded-lg border border-line-hair bg-void p-4">
                <div className="flex items-center justify-between border-b border-line-hair pb-3">
                  <ModelSigil model={ex.model} size="sm" withName />
                  <span className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-low">
                    CUSTOM INSTRUCTIONS
                  </span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {ex.lines.map((line, li) => (
                    <motion.p
                      key={li}
                      initial={{ opacity: 0, y: 8 }}
                      animate={exampleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                      transition={{ delay: 1.4 + bi * 0.15 + li * 0.05, duration: 0.4, ease: EASE }}
                      className="text-code text-ink-mid"
                    >
                      <span className="text-human">{String(li + 1).padStart(2, '0')} </span>
                      {line}
                    </motion.p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
