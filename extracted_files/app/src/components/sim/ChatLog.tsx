import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ModelProfile } from '@/data/models';
import TypewriterMessage from './TypewriterMessage';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  kind: 'system' | 'user' | 'ai';
  text: string;
  think?: string;
  flicker?: string;
  animate?: boolean;
  /** system line rendered in --human (pushback registered) */
  accent?: boolean;
  ts?: string;
}

interface ChatLogProps {
  messages: ChatMessage[];
  model: ModelProfile;
  onAiDone: (id: string) => void;
  className?: string;
}

/** Scrolling simulation log (simulator.md §3): system lines, user bubbles, AI speech. */
export default function ChatLog({ messages, model, onAiDone, className }: ChatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // keep the log pinned to the newest content while a message is typing
  const anyAnimating = messages.some((m) => m.animate);
  useEffect(() => {
    if (!anyAnimating) return;
    const iv = window.setInterval(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 400);
    return () => window.clearInterval(iv);
  }, [anyAnimating]);

  return (
    <div
      ref={scrollRef}
      className={cn('flex-1 space-y-5 overflow-y-auto px-[clamp(16px,3vw,32px)] py-6', className)}
      aria-live="polite"
    >
      {messages.map((m) => {
        if (m.kind === 'system') {
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
              role="separator"
            >
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn('h-px flex-1 origin-center', m.accent ? 'bg-human/40' : 'bg-line-hair')}
              />
              {m.accent ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1, 0.3, 1] }}
                  transition={{ duration: 0.3, times: [0, 0.25, 0.5, 0.75, 1] }}
                  className="text-mono-sm text-human"
                >
                  {m.text}
                </motion.span>
              ) : (
                <span className="text-mono-sm text-ink-low">{m.text}</span>
              )}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn('h-px flex-1 origin-center', m.accent ? 'bg-human/40' : 'bg-line-hair')}
              />
            </motion.div>
          );
        }

        if (m.kind === 'user') {
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="ml-auto max-w-[85%] rounded-2xl rounded-br-[4px] border px-4 py-3 text-sm text-ink-hi"
              style={{
                background: 'rgba(255,182,72,0.10)',
                borderColor: 'rgba(255,182,72,0.35)',
              }}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
            </motion.div>
          );
        }

        // AI message
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-[92%]"
          >
            <div className="mb-1.5 flex items-baseline gap-2">
              {m.ts && <span className="font-mono text-[0.6875rem] text-ink-low">{m.ts}</span>}
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em]" style={{ color: model.color }}>
                {model.name}
              </span>
            </div>
            <div
              className="rounded-2xl rounded-tl-[4px] border border-line-hair bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink-hi"
              style={{ borderLeftWidth: 3, borderLeftColor: model.color }}
            >
              <TypewriterMessage
                model={model}
                text={m.text}
                think={m.think}
                flicker={m.flicker}
                animate={Boolean(m.animate)}
                onDone={m.animate ? () => onAiDone(m.id) : undefined}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
