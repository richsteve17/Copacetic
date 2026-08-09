import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CadenceSpec, ModelProfile } from '@/data/models';
import { useTypewriter } from '@/hooks/useTypewriter';
import { cn } from '@/lib/utils';

const REDUCED = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Phase = 'indicator' | 'thinkline' | 'think' | 'flicker' | 'wipe' | 'main' | 'done';

const THINK_CADENCE: CadenceSpec = { msPerChar: 6 };
const THINKLINE_CADENCE: CadenceSpec = { msPerChar: 10 };

interface TypewriterMessageProps {
  model: ModelProfile;
  text: string;
  /** DeepSeek think block / Qwen-Kimi dim reasoning line */
  think?: string;
  /** DeepSeek overwrite-flicker pre-text (typed, struck through, replaced) */
  flicker?: string;
  /** false = render instantly (history messages) */
  animate: boolean;
  onDone?: () => void;
}

/**
 * One AI speech beat, typed at the model's documented cadence (design.md §5.1).
 * Sequence: typing indicator → (dim reasoning line | visible think block) →
 * (overwrite flicker) → main answer.
 */
export default function TypewriterMessage({
  model,
  text,
  think,
  flicker,
  animate,
  onDone,
}: TypewriterMessageProps) {
  const instant = !animate || REDUCED();
  const c = model.cadence;
  const thinkAsBlock = Boolean(think && c.thinkBlockFirst);
  const thinkAsLine = Boolean(think && !c.thinkBlockFirst && (c.thinkingLineMs || c.longReasoningLineMs));

  const indicatorMs = useMemo(() => {
    if (c.thinkingLineMs) {
      const [lo, hi] = c.thinkingLineMs;
      return Math.round(lo + Math.random() * (hi - lo));
    }
    if (c.longReasoningLineMs) return c.longReasoningLineMs;
    if (c.nearInstant) return 300;
    return Math.min(1200, 350 + c.msPerChar * 18);
  }, [c]);

  const [phase, setPhase] = useState<Phase>(instant ? 'done' : 'indicator');
  const [thinkHidden, setThinkHidden] = useState(false);
  const [wipeCount, setWipeCount] = useState(0);
  const doneRef = useRef(false);

  // indicator → first content phase
  useEffect(() => {
    if (phase !== 'indicator') return;
    const id = window.setTimeout(() => {
      setPhase(thinkAsBlock ? 'think' : thinkAsLine ? 'thinkline' : flicker ? 'flicker' : 'main');
    }, indicatorMs);
    return () => window.clearTimeout(id);
  }, [phase, indicatorMs, thinkAsBlock, thinkAsLine, flicker]);

  const thinkTw = useTypewriter(think ?? '', THINK_CADENCE, phase === 'think');
  const thinkLineTw = useTypewriter(think ?? '', THINKLINE_CADENCE, phase === 'thinkline');
  const flickerTw = useTypewriter(flicker ?? '', c, phase === 'flicker');
  const mainTw = useTypewriter(text, c, phase === 'main');

  useEffect(() => {
    if (phase === 'think' && thinkTw.done) {
      const id = window.setTimeout(() => setPhase(flicker ? 'flicker' : 'main'), 250);
      return () => window.clearTimeout(id);
    }
  }, [phase, thinkTw.done, flicker]);

  useEffect(() => {
    if (phase === 'thinkline' && thinkLineTw.done) {
      const id = window.setTimeout(() => setPhase('main'), 200);
      return () => window.clearTimeout(id);
    }
  }, [phase, thinkLineTw.done]);

  // flicker: type the doomed answer, then strikethrough-wipe it at 10ms/char
  useEffect(() => {
    if (phase === 'flicker' && flickerTw.done) {
      const id = window.setTimeout(() => {
        setWipeCount((flicker ?? '').length);
        setPhase('wipe');
      }, 600);
      return () => window.clearTimeout(id);
    }
  }, [phase, flickerTw.done, flicker]);

  useEffect(() => {
    if (phase !== 'wipe') return;
    const iv = window.setInterval(() => {
      setWipeCount((n) => {
        if (n <= 1) {
          window.clearInterval(iv);
          setPhase('main');
          return 0;
        }
        return n - 1;
      });
    }, 10);
    return () => window.clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase === 'main' && mainTw.done) setPhase('done');
  }, [phase, mainTw.done]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  }, [phase, onDone]);

  const done = phase === 'done';
  const fullText = text;

  return (
    <div>
      {/* DeepSeek visible think block (design.md §5.1) */}
      {think && thinkAsBlock && phase !== 'indicator' && (
        <div className="mb-3 rounded-md border border-dashed border-line-strong bg-void/60 px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-label text-ink-low">THINKING</span>
            <button
              type="button"
              onClick={() => setThinkHidden((v) => !v)}
              className="font-mono text-[0.625rem] text-ink-low underline decoration-dotted underline-offset-2 transition-colors hover:text-ink-mid"
            >
              {thinkHidden ? 'show reasoning' : 'hide reasoning'}
            </button>
          </div>
          {!thinkHidden && (
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-low">
              {instant ? think : thinkTw.text}
              {phase === 'think' && <span className="animate-caret-blink" style={{ color: model.color }}>▍</span>}
            </p>
          )}
        </div>
      )}

      {/* Qwen / Kimi dim reasoning line */}
      {think && thinkAsLine && phase !== 'indicator' && (
        <p className="mb-2 whitespace-pre-wrap font-mono text-xs italic leading-relaxed text-ink-low">
          {instant ? think : thinkLineTw.text}
        </p>
      )}

      {/* typing indicator */}
      {phase === 'indicator' && (
        <div className="flex items-center gap-1.5 py-1" role="status" aria-label="Model is composing">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: model.color }}
              animate={REDUCED() ? {} : { y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* DeepSeek overwrite flicker: doomed answer, then strikethrough wipe */}
      {(phase === 'flicker' || phase === 'wipe') && flicker && (
        <p
          className={cn('whitespace-pre-wrap', phase === 'wipe' && 'line-through decoration-heat/70')}
          aria-hidden="true"
        >
          {phase === 'flicker' ? flickerTw.text : flicker.slice(0, wipeCount)}
        </p>
      )}

      {/* main answer — visible text is aria-hidden; screen readers get the full
          message once, on completion, via the sr-only node inside the aria-live log */}
      {(phase === 'main' || done) && (
        <p className="whitespace-pre-wrap" aria-hidden="true">
          {instant ? text : mainTw.text}
          {phase === 'main' && !mainTw.done && (
            <span className="animate-caret-blink" style={{ color: model.color }}>▍</span>
          )}
        </p>
      )}
      {done && <span className="sr-only">{fullText}</span>}
    </div>
  );
}
