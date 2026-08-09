import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Custom cursor (design.md §6): 10px --human dot + 28px lagging hairline ring.
 * Desktop + fine pointers only; disabled on touch and reduced-motion.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<'rest' | 'interactive' | 'text'>('rest');
  const [ringColor, setRingColor] = useState<string>('var(--line-strong)');

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 320, damping: 30, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 320, damping: 30, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      const target = e.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') return;

      const textField = target.closest('input, textarea, [contenteditable="true"]');
      if (textField) {
        setMode('text');
        return;
      }
      const bubble = target.closest<HTMLElement>('[data-model-color]');
      if (bubble?.dataset.modelColor) {
        setRingColor(bubble.dataset.modelColor);
        setMode('interactive');
        return;
      }
      const interactive = target.closest('a, button, [role="button"], [data-cursor]');
      setRingColor(interactive ? 'rgba(255,182,72,0.4)' : 'var(--line-strong)');
      setMode(interactive ? 'interactive' : 'rest');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [dotX, dotY]);

  if (!enabled) return null;

  const interactive = mode === 'interactive';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        className="absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: ringColor,
          opacity: mode === 'text' ? 0 : 1,
        }}
        animate={{
          width: interactive ? 44 : 28,
          height: interactive ? 44 : 28,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
      <motion.div
        className="absolute rounded-full bg-human"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%', opacity: mode === 'text' ? 0 : 1 }}
        animate={{ width: interactive ? 4 : 10, height: interactive ? 4 : 10 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
