import { useEffect, useRef, useState } from 'react';
import type { CadenceSpec } from '@/data/models';

const REDUCED = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Per-model cadence typewriter (design.md §5.1).
 * Returns the visible substring and a done flag. Restarts when `text` changes.
 */
export function useTypewriter(text: string, cadence: CadenceSpec, active = true) {
  const [shown, setShown] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    if (REDUCED()) {
      setShown(text.length);
      return;
    }
    setShown(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i >= text.length) return;
      const next = text[i];
      let delay = cadence.msPerChar;
      if (cadence.pauseMsBeforeBullets && (next === '\n' || next === '•')) delay = cadence.pauseMsBeforeBullets;
      if (cadence.pauseMsAtDashes && (next === '—' || next === '–')) delay = cadence.pauseMsAtDashes;
      if (cadence.pauseMsBeforeExclaim && next === '!') delay = cadence.pauseMsBeforeExclaim;
      if (cadence.nearInstant && text.length < 60) delay = Math.min(delay, 5);
      timer.current = window.setTimeout(tick, delay);
    };
    timer.current = window.setTimeout(tick, cadence.nearInstant ? 300 : cadence.msPerChar * 3);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [text, active, cadence]);

  return { text: text.slice(0, shown), done: shown >= text.length };
}
