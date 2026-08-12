import { useEffect, useRef, useState } from 'react';
import type { ModelProfile } from '@/data/models';

const isReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface TypewriterTextProps {
  profile: ModelProfile;
  text: string;
  /** flip to true to start typing (e.g. on scroll into view or click) */
  active: boolean;
  /** increment to replay after completion */
  nonce?: number;
  /** show the dim "Thinking…" lead-in when the cadence calls for it */
  thinkingLabel?: string;
  className?: string;
  onDone?: () => void;
}

/**
 * Typewriter with per-model documented cadence (design.md §5.1).
 * Respects prefers-reduced-motion: renders full text instantly.
 * Grok renders near-instantly; Qwen/Kimi/DeepSeek show a dim reasoning
 * lead-in before the answer; Claude pauses at em-dashes; Gemini pauses
 * before exclamation marks; ChatGPT pauses before bullets and types in bursts.
 */
export default function TypewriterText({
  profile,
  text: rawText,
  active,
  nonce = 0,
  thinkingLabel,
  className,
  onDone,
}: TypewriterTextProps) {
  const text = rawText || '';
  const [len, setLen] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [cursorOn, setCursorOn] = useState(false);
  const timers = useRef<number[]>([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
    clear();
    setThinking(false);

    if (isReduced()) {
      setLen(text.length);
      onDoneRef.current?.();
      return clear;
    }

    const c = profile.cadence;
    setLen(0);
    setCursorOn(true);

    const finish = () => {
      setLen(text.length);
      onDoneRef.current?.();
      // cursor blinks at line end (~3 cycles of 530ms), then disappears
      timers.current.push(window.setTimeout(() => setCursorOn(false), 1600));
    };

    const type = () => {
      if (c.nearInstant) {
        // Grok one-liners appear near-instantly (≈300ms total)
        timers.current.push(window.setTimeout(finish, 300));
        return;
      }
      let i = 0;
      const step = () => {
        const burst = c.burst && Math.random() < 0.35 ? 3 : 1;
        i = Math.min(text.length, i + burst);
        setLen(i);
        if (i >= text.length) {
          finish();
          return;
        }
        let delay = c.msPerChar;
        const next = text[i];
        if (c.pauseMsAtDashes && next === '—') delay += c.pauseMsAtDashes;
        if (c.pauseMsBeforeExclaim && next === '!') delay += c.pauseMsBeforeExclaim;
        if (c.pauseMsBeforeBullets && (next === '•' || next === '\n' || next === '-'))
          delay += c.pauseMsBeforeBullets;
        timers.current.push(window.setTimeout(step, delay));
      };
      timers.current.push(window.setTimeout(step, c.msPerChar));
    };

    const thinkMs = c.thinkingLineMs
      ? c.thinkingLineMs[0] + Math.random() * (c.thinkingLineMs[1] - c.thinkingLineMs[0])
      : (c.longReasoningLineMs ?? (c.thinkBlockFirst ? 1100 : 0));

    if (thinkMs > 0) {
      setThinking(true);
      timers.current.push(
        window.setTimeout(() => {
          setThinking(false);
          type();
        }, thinkMs),
      );
    } else {
      type();
    }

    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, nonce, text, profile.id]);

  const showCursor = cursorOn && !thinking && active && !isReduced();

  return (
    <span className={className}>
      <span aria-hidden>
        {thinking && (
          <span className="mb-1 block text-mono-sm text-ink-low">
            {thinkingLabel ??
              (profile.cadence.thinkBlockFirst ? '<think> reasoning…' : 'Thinking…')}
          </span>
        )}
        <span>{text.slice(0, len)}</span>
        {showCursor && (
          <span
            className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-caret-blink [animation-duration:530ms]"
            style={{ backgroundColor: profile.color }}
          />
        )}
      </span>
      {/* announce the full specimen to screen readers once, not per character */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
