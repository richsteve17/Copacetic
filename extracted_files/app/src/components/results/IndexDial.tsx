import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/** lerp between two hex colors */
function lerpColor(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** heat → human → signal across 0–100 (design.md §5.5) */
export function indexColor(value: number): string {
  const v = Math.max(0, Math.min(100, value));
  if (v <= 50) return lerpColor('#FF6E63', '#FFB648', v / 50);
  return lerpColor('#FFB648', '#5CE8A0', (v - 50) / 50);
}

export function indexVerdict(value: number): { text: string; color: string; italic: boolean } {
  if (value < 40) return { text: 'Oil and water', color: 'var(--heat)', italic: false };
  if (value < 70) return { text: 'Workable, with instructions', color: 'var(--human)', italic: false };
  if (value < 90) return { text: 'Copacetic', color: 'var(--signal)', italic: false };
  return { text: 'Spooky. Frame it.', color: 'var(--signal)', italic: true };
}

const CX = 160;
const CY = 165;
const R = 118;
const START = 135; // degrees, bottom-left
const SWEEP = 270;

function polar(deg: number, r: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function arcPath(fromDeg: number, toDeg: number, r: number): string {
  const [x1, y1] = polar(fromDeg, r);
  const [x2, y2] = polar(toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const ARC = arcPath(START, START + SWEEP, R);
// exact 270° arc length
const ARC_LEN = (SWEEP / 360) * 2 * Math.PI * R;

interface IndexDialProps {
  value: number; // 0–100
  modelName: string;
}

/** The Copacetic Index dial: 270° arc, count-up 1.6s power2.out, band verdicts. */
export default function IndexDial({ value, modelName }: IndexDialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 2); // power2.out
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else setShown(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  const progress = shown / 100;
  const color = indexColor(shown);
  const verdict = indexVerdict(value);
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 320 300" className="w-full max-w-[320px]" role="img" aria-label={`Copacetic Index ${Math.round(value)} out of 100`}>
          {/* track */}
          <path d={ARC} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
          {/* score arc — sweeps with the count-up */}
          <path
            d={ARC}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={ARC_LEN * (1 - progress)}
            style={{ transition: 'stroke 200ms linear' }}
          />
          {/* ticks every 10 points */}
          {ticks.map((tv, i) => {
            const deg = START + (tv / 100) * SWEEP;
            const [x1, y1] = polar(deg, R - 10);
            const [x2, y2] = polar(deg, R - 16);
            return (
              <motion.line
                key={tv}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--line-strong)"
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.02, duration: 0.3 }}
              />
            );
          })}
        </svg>
        {/* center readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-index-hero tabular-nums" style={{ color, fontSize: 'clamp(4rem, 8vw, 6.5rem)' }}>
            {Math.round(shown)}
          </span>
          <span className="mt-1 text-label text-ink-low">COPACETIC INDEX</span>
          <motion.span
            className="mt-3 font-display text-xl"
            style={{ color: verdict.color, fontStyle: verdict.italic ? 'italic' : 'normal' }}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.7, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            &ldquo;{verdict.text}&rdquo;
          </motion.span>
        </div>
      </div>
      <p className="mt-5 max-w-[46ch] text-center text-mono-sm text-ink-low">
        Compatibility between your measured working style and {modelName}&rsquo;s documented
        behavior — before custom instructions.
      </p>
    </div>
  );
}
