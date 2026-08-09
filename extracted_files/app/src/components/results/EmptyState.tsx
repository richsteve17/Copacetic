import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DIMENSIONS } from '@/data/dimensions';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Dim all-zero radar ghost, slowly rotating (60s linear loop). */
function GhostRadar() {
  const C = 120;
  const R = 100;
  const pts = DIMENSIONS.map((_, i) => {
    const rad = ((-90 + i * 36) * Math.PI) / 180;
    return `${C + R * 0.08 * Math.cos(rad)},${C + R * 0.08 * Math.sin(rad)}`;
  }).join(' ');
  const rings = [0.33, 0.66, 1].map((f) =>
    DIMENSIONS.map((_, i) => {
      const rad = ((-90 + i * 36) * Math.PI) / 180;
      return `${C + R * f * Math.cos(rad)},${C + R * f * Math.sin(rad)}`;
    }).join(' '),
  );
  return (
    <div
      className="mx-auto w-44 animate-[spin_60s_linear_infinite] opacity-60"
      aria-hidden
      style={{ animationDuration: '60s' }}
    >
      <svg viewBox="0 0 240 240">
        {rings.map((p, i) => (
          <polygon key={i} points={p} fill="none" stroke="var(--line-hair)" strokeWidth="1" />
        ))}
        {DIMENSIONS.map((_, i) => {
          const rad = ((-90 + i * 36) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={C}
              y1={C}
              x2={C + R * Math.cos(rad)}
              y2={C + R * Math.sin(rad)}
              stroke="var(--line-hair)"
              strokeWidth="1"
            />
          );
        })}
        <polygon points={pts} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
      </svg>
    </div>
  );
}

/** Section 6 — no runs saved yet. */
export default function EmptyState() {
  const headline = 'No signal yet.';
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-container flex-col items-center justify-center px-[clamp(20px,4vw,48px)] py-24 text-center">
      <GhostRadar />
      <h1 className="mt-10 text-display-md" aria-label={headline}>
        {headline.split(' ').map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.7, ease: EASE }}
            >
              {w}
              {i < headline.split(' ').length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.p
        className="mt-5 max-w-[46ch] text-body-lg text-ink-mid"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
      >
        The dials only move when you do. Run a simulation and this page becomes your profile —
        index, radar, and instructions written in your own working style.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
      >
        <Link
          to="/simulator"
          className="mt-9 inline-flex items-center gap-2 rounded-[10px] bg-human px-5 py-3 text-sm font-semibold text-void transition-all duration-200 hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
        >
          Run the simulation <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
