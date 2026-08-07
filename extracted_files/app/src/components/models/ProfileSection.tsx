import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowRight, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/data/models';
import SectionLabel from '@/components/SectionLabel';
import ModelSigil from '@/components/ModelSigil';
import CitationChip from '@/components/CitationChip';
import FingerprintBars from '@/components/models/FingerprintBars';
import SpecimenChip from '@/components/models/SpecimenChip';
import TypewriterText from '@/components/models/TypewriterText';
import {
  CORRECTION_STATES,
  SIMULATOR_PROBES,
  SPECIMEN_CONTEXTS,
} from '@/components/models/modelExtras';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------- shared bits ---------- */

function ModuleHeader({
  tag,
  title,
  color,
  quiet = false,
}: {
  tag: string;
  title: string;
  color: string;
  quiet?: boolean;
}) {
  return (
    <div className="mb-5">
      <p className="text-label" style={{ color: quiet ? 'var(--ink-low)' : color }}>
        {tag}
      </p>
      <div className="mt-1.5 flex items-center gap-4">
        <h4 className="shrink-0 font-display text-[1.25rem] text-ink-hi">{title}</h4>
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-left"
          style={{
            backgroundColor: quiet
              ? 'var(--line-strong)'
              : `color-mix(in srgb, ${color} 40%, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>
    </div>
  );
}

function Module({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** SpecimenCard look-alike whose quote types itself in model cadence on scroll into view. */
function TypedSpecimen({
  profile,
  quote,
  context,
  citation,
  className,
}: {
  profile: ModelProfile;
  quote: string;
  context: string;
  citation: { label: string; url: string };
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  return (
    <figure
      ref={ref}
      className={cn('rounded-lg border border-line-hair bg-surface-1 p-5', className)}
      style={{ borderLeft: `3px solid ${profile.color}` }}
    >
      <blockquote className="text-mono-sm leading-relaxed text-ink-hi">
        &ldquo;
        <TypewriterText profile={profile} text={quote} active={inView} />
        &rdquo;
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <ModelSigil model={profile.id} size="sm" withName />
        <span className="text-mono-sm text-ink-low">{context}</span>
        <CitationChip label={citation.label} url={citation.url} className="ml-auto" />
      </figcaption>
    </figure>
  );
}

function ChipCascade({
  sources,
  base = 0,
}: {
  sources: { label: string; url: string }[];
  base?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((s, i) => (
        <motion.span
          key={s.url + s.label}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.35, ease: EASE, delay: base + i * 0.05 }}
        >
          <CitationChip label={s.label} url={s.url} />
        </motion.span>
      ))}
    </div>
  );
}

/* ---------- module C: under-correction toggle ---------- */

function CorrectionToggle({ profile }: { profile: ModelProfile }) {
  const states = CORRECTION_STATES[profile.id];
  const [mode, setMode] = useState<'whenWrong' | 'whenPushed'>('whenWrong');
  const citation = profile.sources[1] ?? profile.sources[0];
  const options = [
    { key: 'whenWrong' as const, label: 'When wrong' },
    { key: 'whenPushed' as const, label: 'When pushed' },
  ];
  return (
    <div>
      <div
        role="tablist"
        aria-label="Correction behavior state"
        className="mb-4 inline-flex rounded-full border border-line-hair bg-surface-1 p-1"
      >
        {options.map((o) => (
          <button
            key={o.key}
            role="tab"
            aria-selected={mode === o.key}
            type="button"
            onClick={() => setMode(o.key)}
            className={cn(
              'relative rounded-full px-4 py-1.5 text-label transition-colors duration-200',
              mode === o.key ? 'text-ink-hi' : 'text-ink-low hover:text-ink-mid',
            )}
          >
            {mode === o.key && (
              <motion.span
                layoutId={`correction-pill-${profile.id}`}
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: `color-mix(in srgb, ${profile.color} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${profile.color} 45%, transparent)`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <figure
            className="rounded-lg border border-line-hair bg-surface-1 p-5"
            style={{ borderLeft: `3px solid ${profile.color}` }}
          >
            <blockquote className="text-mono-sm leading-relaxed text-ink-hi">
              {states[mode]}
            </blockquote>
            <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <ModelSigil model={profile.id} size="sm" withName />
              <span className="text-mono-sm text-ink-low">
                {mode === 'whenWrong' ? 'correcting itself' : 'held against pressure'}
              </span>
              <CitationChip label={citation.label} url={citation.url} className="ml-auto" />
            </figcaption>
          </figure>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- the full profile ---------- */

interface ProfileSectionProps {
  profile: ModelProfile;
  /** 0-based order among the seven dossiers (drives section index + alternating side) */
  order: number;
  registerSection: (id: ModelProfile['id'], el: HTMLElement | null) => void;
}

export default function ProfileSection({ profile, order, registerSection }: ProfileSectionProps) {
  const flip = order % 2 === 1;
  const signature = profile.signaturePhrases[0];
  const sectionIndex = String(order + 3).padStart(2, '0');

  return (
    <section
      id={profile.id}
      ref={(el) => registerSection(profile.id, el)}
      className="scroll-mt-36 pt-[clamp(72px,10vh,130px)]"
    >
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)]">
        <SectionLabel
          index={sectionIndex}
          title={`DOSSIER · ${profile.name.toUpperCase()}`}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left column — sticky identity rail */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className={cn('lg:col-span-4', flip && 'lg:order-2')}
          >
            <div className="lg:sticky lg:top-[140px]">
              <ModelSigil model={profile.id} size="lg" />
              <h2
                className="mt-5 text-display-md"
                style={{ color: profile.color }}
              >
                {profile.name}
              </h2>
              <p className="mt-2 text-mono-sm text-ink-low">
                {profile.vendor} · behavior dossier
              </p>
              <p className="mt-4 max-w-[38ch] text-mono-sm leading-relaxed text-ink-low">
                {profile.tagline}
              </p>

              <FingerprintBars profile={profile} variant="large" className="mt-8 max-w-[260px]" />

              <Link
                to={`/simulator?model=${profile.id}`}
                className="mt-9 inline-flex items-center gap-2 rounded-[10px] border px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-px"
                style={{
                  color: profile.color,
                  borderColor: `color-mix(in srgb, ${profile.color} 60%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${profile.color} 15%, transparent)`,
                  boxShadow: `0 0 0px color-mix(in srgb, ${profile.color} 0%, transparent)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${profile.color} 25%, transparent)`;
                  e.currentTarget.style.boxShadow = `0 0 24px color-mix(in srgb, ${profile.color} 25%, transparent)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${profile.color} 15%, transparent)`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Simulate this system <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>

          {/* Right column — dossier modules A–G */}
          <div className={cn('space-y-14 lg:col-span-8', flip && 'lg:order-1')}>
            {/* A. Register */}
            <Module>
              <ModuleHeader tag="A / REGISTER" title="How it talks" color={profile.color} />
              <p className="max-w-[62ch] text-body-lg text-ink-mid">{profile.register}</p>
              <TypedSpecimen
                profile={profile}
                quote={signature}
                context={SPECIMEN_CONTEXTS[profile.id]}
                citation={profile.sources[0]}
                className="mt-6"
              />
            </Module>

            {/* B. Flagship incident */}
            <Module>
              <ModuleHeader
                tag="B / FLAGSHIP INCIDENT"
                title="The documented meltdown"
                color={profile.color}
              />
              <div
                className="rounded-[10px] border border-line-hair bg-surface-2 p-6"
                style={{ borderLeft: `3px solid ${profile.color}` }}
              >
                <div className="flex items-center gap-2">
                  <Flag size={13} style={{ color: profile.color }} aria-hidden />
                  <span className="text-label" style={{ color: profile.color }}>
                    FLAGSHIP
                  </span>
                </div>
                <h4 className="mt-3 font-display text-[1.375rem] text-ink-hi">
                  {profile.flagshipIncident.title}
                </h4>
                <p className="mt-3 max-w-[64ch] leading-relaxed text-ink-mid">
                  {profile.flagshipIncident.summary}
                </p>
                <div className="mt-5">
                  <ChipCascade sources={profile.sources.slice(0, 3)} />
                </div>
              </div>
            </Module>

            {/* C. Under correction */}
            <Module>
              <ModuleHeader
                tag="C / UNDER CORRECTION"
                title="Wrong vs. pushed"
                color={profile.color}
              />
              <CorrectionToggle profile={profile} />
            </Module>

            {/* D. Refusal texture */}
            <Module>
              <ModuleHeader
                tag="D / REFUSAL TEXTURE"
                title="How it declines"
                color={profile.color}
              />
              <figure
                className="rounded-lg border border-line-hair bg-surface-1 p-5"
                style={{ borderLeft: `3px solid ${profile.color}` }}
              >
                <blockquote className="text-mono-sm leading-relaxed text-ink-hi">
                  {profile.refusals}
                </blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <ModelSigil model={profile.id} size="sm" withName />
                  <span className="text-mono-sm text-ink-low">documented decline style</span>
                  <CitationChip
                    label={profile.sources[profile.sources.length - 1].label}
                    url={profile.sources[profile.sources.length - 1].url}
                    className="ml-auto"
                  />
                </figcaption>
              </figure>
            </Module>

            {/* E. Crisis posture — deliberately quiet, no model color */}
            <Module>
              <ModuleHeader
                tag="E / CRISIS POSTURE"
                title="When it matters most"
                color={profile.color}
                quiet
              />
              <div className="rounded-[10px] border border-line-hair p-5">
                <p className="max-w-[64ch] leading-relaxed text-ink-mid">{profile.emotional}</p>
                <p className="mt-4 border-t border-line-hair pt-4 text-mono-sm text-ink-low">
                  Note — crisis-adjacent content in the simulator is fictional, always preceded by
                  a content note, and skippable without penalty.
                </p>
              </div>
            </Module>

            {/* F. Phrasebook */}
            <Module>
              <ModuleHeader tag="F / PHRASEBOOK" title="Signature phrases" color={profile.color} />
              <div className="flex flex-wrap gap-2.5">
                {profile.signaturePhrases.map((phrase, i) => (
                  <motion.span
                    key={phrase}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.35, ease: EASE, delay: i * 0.03 }}
                  >
                    <SpecimenChip profile={profile} phrase={phrase} />
                  </motion.span>
                ))}
              </div>
            </Module>

            {/* G. In the simulator */}
            <Module>
              <div className="flex flex-col gap-4 rounded-[10px] border border-line-hair bg-surface-2 p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-mono-sm leading-relaxed text-ink-mid">
                  <span className="text-ink-hi">Testing for {profile.name} surfaces:</span>{' '}
                  {SIMULATOR_PROBES[profile.id]}
                </p>
                <Link
                  to={`/simulator?model=${profile.id}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-px"
                  style={{
                    color: profile.color,
                    borderColor: `color-mix(in srgb, ${profile.color} 60%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${profile.color} 12%, transparent)`,
                  }}
                >
                  Simulate this system <ArrowRight size={14} />
                </Link>
              </div>
            </Module>

            {/* Sources */}
            <Module>
              <p className="mb-3 text-label text-ink-low">SOURCES ON RECORD</p>
              <ChipCascade sources={profile.sources} />
            </Module>
          </div>
        </div>
      </div>
    </section>
  );
}
