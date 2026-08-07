import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/data/models';
import TypewriterText from '@/components/models/TypewriterText';

interface SpecimenChipProps {
  profile: ModelProfile;
  phrase: string;
  className?: string;
}

/**
 * Typeable signature-phrase chip (models.md §2 / §F): dashed model-color
 * border; on click the phrase types itself in the model's documented cadence,
 * then a replay icon appears. Reduced motion renders the phrase instantly.
 */
export default function SpecimenChip({ profile, phrase, className }: SpecimenChipProps) {
  const [started, setStarted] = useState(false);
  const [typed, setTyped] = useState(false);
  const [nonce, setNonce] = useState(0);

  const activate = () => {
    if (started && !typed) return; // mid-typing
    if (typed) {
      // replay
      setTyped(false);
      setNonce((n) => n + 1);
      return;
    }
    setStarted(true);
  };

  return (
    <button
      type="button"
      onClick={activate}
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border border-dashed px-3.5 py-1.5 text-left',
        'font-mono text-[0.8125rem] leading-snug tracking-[0.02em] transition-all duration-200',
        'hover:-translate-y-0.5',
        className,
      )}
      style={{
        borderColor: `color-mix(in srgb, ${profile.color} 55%, transparent)`,
        color: typed || started ? 'var(--ink-hi)' : profile.color,
      }}
      aria-label={
        typed ? `Replay specimen: ${phrase}` : started ? phrase : `Type specimen: ${phrase}`
      }
    >
      {started ? (
        <TypewriterText
          profile={profile}
          text={phrase}
          active
          nonce={nonce}
          onDone={() => setTyped(true)}
        />
      ) : (
        <span>{phrase}</span>
      )}
      {typed && (
        <RotateCcw size={12} className="shrink-0" style={{ color: profile.color }} aria-hidden />
      )}
    </button>
  );
}
