import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { ModelId, ModelProfile } from '@/data/models';
import { MODELS } from '@/data/models';
import SectionLabel from '@/components/SectionLabel';
import ModelSigil from '@/components/ModelSigil';
import FingerprintBars from '@/components/models/FingerprintBars';
import SpecimenChip from '@/components/models/SpecimenChip';
import { ROSTER_SUMMARIES } from '@/components/models/modelExtras';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Asymmetric grid spans (models.md §2): incumbents 6/6, middle row 4/4/4, contrarians 6/6. */
const SPANS: Record<ModelId, string> = {
  chatgpt: 'lg:col-span-6',
  claude: 'lg:col-span-6',
  gemini: 'lg:col-span-4',
  grok: 'lg:col-span-4',
  qwen: 'lg:col-span-4',
  deepseek: 'lg:col-span-6',
  kimi: 'lg:col-span-6',
};

interface RosterGridProps {
  onFullProfile: (id: ModelId) => void;
}

function RosterCard({
  profile,
  index,
  onFullProfile,
}: {
  profile: ModelProfile;
  index: number;
  onFullProfile: (id: ModelId) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col rounded-[14px] border border-line-hair bg-surface-1 p-6 transition-colors duration-300"
      style={{ ['--card-accent' as string]: profile.color }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${profile.color} 50%, transparent)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line-hair)';
      }}
    >
      <div className="flex items-start gap-4">
        <ModelSigil model={profile.id} size="lg" />
        <div>
          <h3 className="font-display text-[1.75rem] leading-tight" style={{ color: profile.color }}>
            {profile.name}
          </h3>
          <p className="mt-1 text-mono-sm text-ink-low">{profile.vendor}</p>
        </div>
      </div>

      <p className="mt-5 text-[0.9375rem] font-medium leading-relaxed text-ink-hi">
        {ROSTER_SUMMARIES[profile.id]}
      </p>

      <div className="mt-4">
        <SpecimenChip profile={profile} phrase={profile.signaturePhrases[0]} />
      </div>

      <FingerprintBars profile={profile} className="mt-6" />

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <button
          type="button"
          onClick={() => onFullProfile(profile.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mid transition-colors hover:text-ink-hi"
        >
          Full profile <ArrowDown size={14} />
        </button>
        <Link
          to={`/simulator?model=${profile.id}`}
          className="inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-px"
          style={{
            borderColor: `color-mix(in srgb, ${profile.color} 55%, transparent)`,
            color: profile.color,
            backgroundColor: `color-mix(in srgb, ${profile.color} 8%, transparent)`,
          }}
        >
          Simulate <ArrowRight size={14} />
        </Link>
      </div>
    </motion.article>
  );
}

/** Section 2 — Roster Grid (quick-scan dossier cards). */
export default function RosterGrid({ onFullProfile }: RosterGridProps) {
  return (
    <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] pt-[clamp(64px,9vh,110px)]">
      <SectionLabel index="01" title="THE ROSTER" className="mb-12" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        {MODELS.map((m, i) => (
          <div key={m.id} className={SPANS[m.id]}>
            <RosterCard profile={m} index={i} onFullProfile={onFullProfile} />
          </div>
        ))}
      </div>
    </section>
  );
}
