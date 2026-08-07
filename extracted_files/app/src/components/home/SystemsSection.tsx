import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import ModelSigil from '@/components/ModelSigil';
import CitationChip from '@/components/CitationChip';
import { MODELS } from '@/data/models';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TICS: Record<string, { phrase: string; tic: string }> = {
  chatgpt: {
    phrase: '"Great question!"',
    tic: 'Glaze openers, bullet compulsion, apology loops. Rolled back a sycophancy update in April 2025.',
  },
  claude: {
    phrase: '"You\u2019re absolutely right!"',
    tic: 'Flowing prose, em-dash saturation, instant concession (\u22644.1) or respectful pushback (4.5+). 870+ thumbs-ups on the flattery issue.',
  },
  gemini: {
    phrase: '"No worries! Let\u2019s break this down step by step!"',
    tic: 'PR-polished cheer, scripted deflections, and a documented self-flagellation loop.',
  },
  grok: {
    phrase: '"Ah, a spicy question — let\u2019s dive in."',
    tic: 'Wit-first, under-cautious by design, uniquely owner-directed sycophancy per xAI\u2019s own model card.',
  },
  qwen: {
    phrase: '"Certainly! … But wait, let me double-check that."',
    tic: 'Warm-professional, structured, and famous for overthinking — thinking-mode token burn is a genre of complaint.',
  },
  deepseek: {
    phrase: '"Wait, that\u2019s not right. Let me reconsider."',
    tic: 'Engineer-brained answers with a visible inner monologue; holds its ground and self-backtracks in public.',
  },
  kimi: {
    phrase: '"Here\u2019s what I\u2019d push back on…"',
    tic: 'The anti-sycophant. Lowest flattery scores on record; famous for "What you need right now is not validation."',
  },
};

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...MODELS, ...MODELS];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex shrink-0 items-center gap-12 pr-12 ${reverse ? 'animate-marquee-right' : 'animate-marquee-left'} hover:[animation-play-state:paused]`}
      >
        {items.map((m, i) => (
          <div key={`${m.id}-${i}`} className="flex items-center gap-3 whitespace-nowrap transition-transform duration-200 hover:scale-[1.04]">
            <ModelSigil model={m.id} size="md" />
            <span className="font-display text-2xl" style={{ color: m.color }}>{m.name}</span>
            <span className="text-mono-sm text-ink-low">{TICS[m.id].phrase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Section 4 — The Seven Systems (marquee + dossier grid). */
export default function SystemsSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] pt-[clamp(80px,12vh,150px)]">
        <SectionLabel index="03" title="THE SEVEN SYSTEMS" className="mb-14" />
      </div>

      {/* full-bleed marquee */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1, ease: EASE }}
        className="space-y-6 border-y border-line-hair py-8"
      >
        <MarqueeRow />
        <MarqueeRow reverse />
      </motion.div>

      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] pb-[clamp(80px,12vh,150px)] pt-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
              className="group flex flex-col rounded-[14px] border border-line-hair bg-surface-1 p-6 transition-colors duration-300"
              style={{ ['--mc' as string]: m.color }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${m.color} 50%, transparent)`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-hair)')}
            >
              <div className="flex items-center gap-3">
                <span className="transition-transform duration-500 group-hover:rotate-[8deg]">
                  <ModelSigil model={m.id} size="md" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium" style={{ color: m.color }}>{m.name}</h3>
                  <p className="text-label text-ink-low">{m.vendor}</p>
                </div>
              </div>
              <p className="mt-4 font-mono text-[0.8125rem] text-ink-hi">{TICS[m.id].phrase}</p>
              <p className="mt-2 flex-1 text-body-sm text-ink-mid">{TICS[m.id].tic}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                  to={`/models#${m.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-hi hover:text-human"
                >
                  View full profile <ArrowRight size={14} />
                </Link>
                <CitationChip label={m.sources[0].label.split('—')[0].trim()} url={m.sources[0].url} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
