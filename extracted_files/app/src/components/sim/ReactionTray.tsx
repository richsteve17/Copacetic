import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SendHorizonal } from 'lucide-react';
import type { ReactionOption } from '@/data/scenarios';
import ReactionChip from './ReactionChip';

interface ReactionTrayProps {
  options: ReactionOption[];
  freeText: boolean;
  freeTextPlaceholder?: string;
  reflective?: boolean;
  onChip: (opt: ReactionOption) => void;
  onFreeText: (text: string) => void;
}

/** Sticky bottom tray (simulator.md §3): 2–4 chips + optional free-text input. */
export default function ReactionTray({
  options,
  freeText,
  freeTextPlaceholder,
  reflective,
  onChip,
  onFreeText,
}: ReactionTrayProps) {
  const [draft, setDraft] = useState('');

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onFreeText(t);
    setDraft('');
  };

  return (
    <div className="border-t border-line-hair bg-surface-1/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-chat px-[clamp(16px,3vw,32px)] py-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={options.map((o) => o.id).join('|')}
            className="flex flex-wrap gap-2.5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {options.map((o, i) => (
              <motion.div
                key={o.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <ReactionChip index={i} label={o.label} onClick={() => onChip(o)} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {freeText && (
          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={freeTextPlaceholder ?? 'Say what you\u2019d actually say…'}
              aria-label={reflective ? 'Your reflective custom-instruction line' : 'Say what you\u2019d actually say'}
              className="min-w-0 flex-1 rounded-[10px] border border-line-hair bg-surface-2 px-4 py-2.5 text-sm text-ink-hi caret-human placeholder:text-ink-low focus:border-line-strong focus:outline-none"
            />
            <motion.button
              type="submit"
              disabled={!draft.trim()}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-human text-void transition-colors hover:bg-human-hover disabled:opacity-40"
              aria-label="Send reaction"
            >
              <SendHorizonal size={16} />
            </motion.button>
          </form>
        )}

        <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-low">
          keys 1–{options.length} select · Enter sends{reflective ? ' · this line becomes your custom instructions' : ''}
        </p>
      </div>
    </div>
  );
}
