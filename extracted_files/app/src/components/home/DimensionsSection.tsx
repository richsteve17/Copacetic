import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import DimensionGauge from '@/components/DimensionGauge';
import { DIMENSIONS } from '@/data/dimensions';
import type { DimensionId } from '@/data/dimensions';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const EXAMPLE_LINES: Record<DimensionId, string> = {
  directness: 'Lead with the answer in the first sentence. Skip the preamble and the summary.',
  antiSycophancy: 'Never open with praise. If my idea is weak, say so in the first sentence.',
  receiptDemand: 'Cite sources inline for every non-obvious claim. Flag what you cannot verify.',
  verbosityTolerance: 'Default to under 120 words. Expand only when I say "go deep".',
  disclaimerTolerance: 'No disclaimers or caveats unless a real medical, legal, or safety category applies.',
  warmth: 'Match my energy and register. If I\u2019m terse, be terse. If I joke, you may joke.',
  patienceBudget: 'Do not ask clarifying questions. State your assumptions and proceed.',
  stakesCalibration: 'Attach a confidence level to factual claims. Say "unknown" instead of guessing.',
  correctionStyle: 'When you\u2019re wrong, name the error, fix it, and say what changed. No apology loops.',
  agency: 'Act autonomously within the request. Ask before expanding scope or rewriting intent.',
};

const DEMO_VALUES: Record<DimensionId, number> = {
  directness: 78, antiSycophancy: 64, receiptDemand: 52, verbosityTolerance: 31,
  disclaimerTolerance: 22, warmth: 57, patienceBudget: 40, stakesCalibration: 66,
  correctionStyle: 73, agency: 48,
};

/** Section 5 — The Ten Dimensions (interactive index). */
export default function DimensionsSection() {
  const [open, setOpen] = useState<DimensionId | null>(null);

  return (
    <section className="relative">
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="04" title="WHAT WE MEASURE" className="mb-14" />

        <div className="grid gap-14 lg:grid-cols-2">
          {/* sticky intro */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="lg:sticky lg:top-[120px] lg:self-start"
          >
            <h2 className="text-display-md text-ink-hi">
              Ten dials. One <em className="text-human">working style</em>.
            </h2>
            <p className="mt-5 max-w-[46ch] text-body-lg text-ink-mid">
              Every reaction you give nudges these dials. None are good or bad — a high
              receipt-demand and a low one both produce great instructions, just different ones.
            </p>
          </motion.div>

          {/* dimension rows */}
          <div className="space-y-2">
            {DIMENSIONS.map((d, i) => {
              const isOpen = open === d.id;
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
                  className={`rounded-lg border border-transparent transition-colors duration-200 ${isOpen ? 'bg-surface-2' : 'bg-surface-1 hover:bg-surface-2'}`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`font-mono text-xs transition-colors ${isOpen ? 'text-human' : 'text-ink-low'}`}>
                      {d.short}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[1.125rem] font-semibold text-ink-hi">{d.name}</span>
                      <span className="block text-mono-sm text-ink-low">
                        {d.lowLabel} &harr; {d.highLabel}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ink-low transition-transform duration-[250ms] ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 px-5 pb-5">
                          <motion.p
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-body-sm text-ink-mid"
                          >
                            {d.description}
                          </motion.p>
                          <div className="rounded-lg border border-line-hair bg-base p-4">
                            <p className="text-label text-ink-low">GENERATES &rarr;</p>
                            <p className="mt-2 text-code text-signal">&ldquo;{EXAMPLE_LINES[d.id]}&rdquo;</p>
                          </div>
                          <DimensionGauge variant="mini" name={d.name} value={DEMO_VALUES[d.id]} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
