import { motion } from 'framer-motion';
import SectionLabel from '@/components/SectionLabel';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    n: '01',
    title: 'Pick your machine.',
    body: 'Choose the system you actually use — ChatGPT, Claude, Gemini, Grok, Qwen, DeepSeek, Kimi, or Muse. Every event renders in that model\u2019s documented voice, from signature phrases to failure modes.',
  },
  {
    n: '02',
    title: 'Live the events.',
    body: 'Twelve branching simulations, from a glazed email draft to a model that changes overnight mid-project. Some events escalate — push back and the model does what that model really does: spirals, concedes, doubles down, or repairs.',
  },
  {
    n: '03',
    title: 'React honestly.',
    body: 'No right answers. Chip reactions or free-text what you\u2019d actually say. After each event: what did that cost you — time, trust, or momentum?',
  },
  {
    n: '04',
    title: 'Get your instructions.',
    body: 'A Copacetic Index per model, a 10-dimension working-style radar, and copy-ready custom instructions tuned per system — because \u2018skip the disclaimers\u2019 lands differently on Claude than on Grok.',
  },
];

/** Section 3 — How It Works (4 steps). */
export default function HowItWorksSection() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="02" title="HOW IT WORKS" className="mb-14" />

        <div className="relative grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {/* dashed connector (desktop) */}
          <svg
            aria-hidden
            className="absolute left-0 right-0 top-16 hidden h-px w-full xl:block"
            preserveAspectRatio="none"
          >
            <line
              x1="0" y1="0" x2="100%" y2="0"
              stroke="var(--line-strong)"
              strokeDasharray="6 6"
              className="animate-dash-drift"
            />
          </svg>

          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-[14px] border border-line-hair bg-surface-1 p-6 transition-colors duration-300 hover:border-[rgba(255,182,72,0.4)]"
            >
              <span className="block font-display text-5xl text-human transition-transform duration-300 group-hover:scale-[1.08] group-hover:origin-left">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-xl font-medium text-ink-hi">{s.title}</h3>
              <p className="mt-3 text-body-sm text-ink-mid">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
