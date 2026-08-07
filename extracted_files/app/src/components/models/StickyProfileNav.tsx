import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ModelId } from '@/data/models';
import { MODELS } from '@/data/models';
import ModelSigil from '@/components/ModelSigil';

interface StickyProfileNavProps {
  activeId: ModelId;
  onSelect: (id: ModelId) => void;
}

/**
 * Sticky profile-nav bar (models.md §1): sticks under the 64px navbar,
 * 7 sigil chips, active profile highlighted in its model color with a
 * sliding underline (layoutId, 300ms spring). Shadow intensifies once stuck.
 */
export default function StickyProfileNav({ activeId, onSelect }: StickyProfileNavProps) {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      // sentinel sits right above the bar; when it leaves the viewport top, bar is stuck
      rootMargin: '-64px 0px 0px 0px',
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px" />
      <div
        className={cn(
          'sticky top-16 z-40 border-b border-line-hair bg-surface-1/85 backdrop-blur-[14px] transition-shadow duration-300',
          stuck && 'shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
        )}
      >
        <div className="mx-auto flex max-w-container items-center gap-1 overflow-x-auto px-[clamp(20px,4vw,48px)] py-2.5">
          {MODELS.map((m) => {
            const active = m.id === activeId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'relative flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-200',
                  active ? 'bg-surface-2' : 'hover:bg-surface-2/60',
                )}
              >
                <ModelSigil model={m.id} size="sm" />
                <span
                  className="text-label transition-colors duration-200"
                  style={{ color: active ? m.color : 'var(--ink-low)' }}
                >
                  {m.name}
                </span>
                {active && (
                  <motion.span
                    layoutId="profile-nav-underline"
                    className="absolute inset-x-3 -bottom-[9px] h-0.5"
                    style={{ backgroundColor: m.color }}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
