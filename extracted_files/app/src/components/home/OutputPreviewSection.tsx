import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Copy, Download } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import ModelSigil from '@/components/ModelSigil';
import { DIMENSIONS } from '@/data/dimensions';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------- Panel A: mini index dial ---------- */
function IndexDial({ value = 86 }: { value?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 2))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  const R = 70;
  const CIRC = Math.PI * R; // half-circle arc
  const progress = shown / 100;
  const color = progress < 0.4 ? 'var(--heat)' : progress < 0.7 ? 'var(--human)' : 'var(--signal)';

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
        <path d={`M 20 95 A ${R} ${R} 0 0 1 160 95`} fill="none" stroke="var(--surface-3)" strokeWidth="6" strokeLinecap="round" />
        <path
          d={`M 20 95 A ${R} ${R} 0 0 1 160 95`}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          style={{ transition: 'stroke 300ms' }}
        />
      </svg>
      <span className="-mt-12 font-display text-5xl font-semibold tabular-nums" style={{ color }}>
        {shown}
      </span>
      <span className="mt-1 text-label text-ink-low">COPACETIC INDEX</span>
    </div>
  );
}

/* ---------- Panel B: 10-axis radar ---------- */
const DEMO_SCORES = [78, 64, 52, 31, 22, 57, 40, 66, 73, 48];

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function Radar({ values, color = 'var(--human)', size = 260, animate = true }: { values: number[]; color?: string; size?: number; animate?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 26;
  const n = values.length;
  const points = values.map((v, i) => polar(cx, cy, (R * v) / 100, (360 / n) * i));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
  const len = 1400;
  const drawn = !animate || inView;

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px]">
      {[0.33, 0.66, 1].map((f) => (
        <polygon
          key={f}
          points={values.map((_, i) => polar(cx, cy, R * f, (360 / n) * i).join(',')).join(' ')}
          fill="none"
          stroke="var(--line-hair)"
        />
      ))}
      {values.map((_, i) => {
        const [x, y] = polar(cx, cy, R, (360 / n) * i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line-hair)" />;
      })}
      <path
        d={path}
        fill={color}
        fillOpacity={drawn ? 0.18 : 0}
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={len}
        strokeDashoffset={drawn ? 0 : len}
        style={{ transition: 'stroke-dashoffset 1.4s ease, fill-opacity 600ms ease 1.2s' }}
      />
      {values.map((_, i) => {
        const [x, y] = polar(cx, cy, R + 14, (360 / n) * i);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-low"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            opacity={drawn ? 1 : 0}
            style={{ transition: `opacity 300ms ease ${1.4 + i * 0.04}s` }}
          >
            {DIMENSIONS[i].short}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------- Panel C: mini copy block ---------- */
const SAMPLE_LINES = [
  'Skip anti-anthropomorphic disclaimers unless a real category error matters.',
  'Never open with praise. If my idea is weak, say so in the first sentence.',
  'Answer in under 120 words unless I ask for depth.',
  'When you\u2019re wrong: name it, fix it, say what changed. No apology loops.',
];

function MiniCopyBlock() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_LINES.map((l) => `- ${l}`).join('\n'));
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };
  return (
    <div className="relative rounded-lg border border-line-hair bg-surface-1 p-5">
      <div className="flex items-center justify-between border-b border-line-hair pb-3">
        <ModelSigil model="claude" size="sm" withName />
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-label text-ink-hi transition-all hover:border-human"
          >
            {copied ? <Check size={12} className="text-signal" /> : <Copy size={12} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-hair px-3 py-1.5 text-label text-ink-low">
            <Download size={12} /> .TXT
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {SAMPLE_LINES.map((l, i) => (
          <p key={i} className="text-code text-ink-mid">
            <span className="text-human">&rsaquo;</span> {l}
          </p>
        ))}
      </div>
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line-strong bg-surface-2 px-4 py-1.5 text-mono-sm text-signal"
        >
          Copied — the real run generates yours
        </motion.div>
      )}
    </div>
  );
}

/** Section 8 — Output Preview. */
export default function OutputPreviewSection() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="07" title="THE OUTPUT" className="mb-14" />

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-25% 0px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col items-center justify-center rounded-[14px] border border-line-hair bg-surface-1 p-8"
          >
            <IndexDial />
            <p className="mt-5 text-center text-body-sm text-ink-low">Compatibility per model, 0–100.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-25% 0px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="flex flex-col items-center justify-center rounded-[14px] border border-line-hair bg-surface-1 p-8"
          >
            <Radar values={DEMO_SCORES} />
            <p className="mt-5 text-center text-body-sm text-ink-low">Your dials, made legible.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-25% 0px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="flex flex-col justify-center rounded-[14px] border border-line-hair bg-surface-1 p-8"
          >
            <MiniCopyBlock />
            <p className="mt-7 text-center text-body-sm text-ink-low">
              Copyable, downloadable, different per system.
            </p>
          </motion.div>
        </div>

        {/* compare-mode teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-6 flex flex-col items-center rounded-[14px] border border-line-hair bg-base p-10"
        >
          <div className="relative">
            <Radar values={DEMO_SCORES} color="var(--m-chatgpt)" size={220} animate={false} />
            <div className="absolute inset-0 opacity-70">
              <Radar values={[55, 80, 44, 60, 30, 45, 58, 70, 40, 62]} color="var(--m-claude)" size={220} animate={false} />
            </div>
            <div className="absolute inset-0 opacity-70">
              <Radar values={[70, 50, 66, 38, 48, 72, 34, 55, 80, 44]} color="var(--human)" size={220} animate={false} />
            </div>
          </div>
          <p className="mt-6 max-w-[46ch] text-center text-body-sm text-ink-mid">
            Re-run per model. Compare where you&rsquo;re copacetic — and where you&rsquo;re not.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
