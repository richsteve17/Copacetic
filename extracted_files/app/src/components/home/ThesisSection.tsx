import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/SectionLabel';

gsap.registerPlugin(ScrollTrigger);

const LINES: { text: string; emphasis?: boolean }[] = [
  { text: 'When the tone is wrong, we blame the model.' },
  { text: 'But the model is a mirror with training data.' },
  { text: 'You bring the patience budget, the flattery threshold, the receipt demands, the verbosity tolerance.', emphasis: true },
  { text: 'That working style is legible — and once it\u2019s legible, it\u2019s writable.', emphasis: true },
  { text: 'COPACETIC writes it into instructions any model can follow.' },
];

const PARAGRAPHS = [
  'The failure is relational, not technical. April 2025\u2019s sycophancy rollback proved it: one warmth patch made millions of conversations unbearable overnight, because no lab can tune tone for everyone at once.',
  'Custom instructions are the only tone control you fully own — the one lever that survives every update. But nobody tells you what to put in them, because nobody has measured how you actually work.',
  'The answer isn\u2019t a personality quiz. It\u2019s watching what you do when the model glazes you, stalls you, refuses you, or falls apart — and writing that down in a language the machine can follow.',
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Section 2 — The Thesis (scroll-scrubbed manifesto, no pin). */
export default function ThesisSection() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lines = gsap.utils.toArray<HTMLElement>('.manifesto-line');
      if (reduced) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { opacity: 0.12, y: 12 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: line, start: 'top 85%', end: 'top 55%', scrub: 0.6 },
          },
        );
      });
      gsap.fromTo(
        '.manifesto-rule',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          ease: 'power2.out',
          transformOrigin: 'left',
          scrollTrigger: { trigger: '.manifesto-rule', start: 'top 80%' },
        },
      );
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative">
      <div className="mx-auto max-w-reading px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="01" title="THE THESIS" className="mb-14" />

        <div className="space-y-5">
          {LINES.map((l, i) => (
            <p
              key={i}
              className="manifesto-line text-display-md text-ink-hi"
              style={{ opacity: 0.12 }}
            >
              {l.emphasis ? (
                <em className="not-italic">
                  <em className="text-human">{l.text}</em>
                </em>
              ) : (
                l.text
              )}
            </p>
          ))}
          <div className="manifesto-rule h-px w-24 bg-human" style={{ transform: 'scaleX(0)' }} />
        </div>

        <div className="mt-16 space-y-8">
          {PARAGRAPHS.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-25% 0px' }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              className="text-body-lg text-ink-mid"
            >
              {p}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
