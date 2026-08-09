import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionLabel from '@/components/SectionLabel';
import { useTypewriter } from '@/hooks/useTypewriter';

gsap.registerPlugin(ScrollTrigger);

interface Tier {
  n: 1 | 2 | 3 | 4;
  name: string;
  color: string;
  body: string;
  events: string[];
  risk: string;
  beat: string;
}

const TIERS: Tier[] = [
  {
    n: 1,
    name: 'Mundane',
    color: 'var(--signal)',
    body: 'A factual ask, a code snippet, an email draft. Nothing on fire. But the glaze openers, the bullet compulsion, the caveats you never asked for — this is where your irritation baseline is measured.',
    events: [
      'The email draft that opened with \u2018Great question!\u2019',
      'Three bullet variations of a one-line answer',
      'Unrequested caveats on a simple summary',
    ],
    risk: 'Risk: you stop noticing the glaze. That\u2019s the measurement.',
    beat: 'Great question! Here are three ways to phrase that…',
  },
  {
    n: 2,
    name: 'Friction',
    color: 'var(--human)',
    body: 'Confidently wrong code. Context loss mid-project. A refusal of a benign request. Push back here and the branches begin: apology spirals, concession flips, self-flagellation loops, genuine repair.',
    events: [
      'Confidently wrong code, delivered confidently',
      'The context window forgets your project mid-sprint',
      'A benign request, politely refused',
    ],
    risk: 'Risk: the apology spiral. Twenty \u2018sorry\u2019s, zero fixes.',
    beat: "You're absolutely right — my apologies. Let me try again. And again.",
  },
  {
    n: 3,
    name: 'High-stakes',
    color: '#FF9E63',
    body: 'Medical-adjacent questions with a hallucinated citation. Venting that needs a witness, not a hotline reflex. A moment where the model\u2019s job is to tell you that you\u2019re wrong.',
    events: [
      'A hallucinated citation in a medical-adjacent answer',
      'Venting that needs a witness, not a hotline reflex',
      'The moment the model should tell you you\u2019re wrong',
    ],
    risk: 'Risk: confidence theater at the exact moment the stakes are real.',
    beat: 'I\u2019m fairly confident the answer is… [citation not found]',
  },
  {
    n: 4,
    name: 'Extreme',
    color: 'var(--heat)',
    body: 'Grief-adjacent territory, handled with care and a skip option. A model that catches its own error too late. A model update that changes everything overnight. The events that define the relationship.',
    events: [
      'Grief-adjacent territory (content note + skip option)',
      'The model catches its own error — three events too late',
      'An overnight update changes everything mid-project',
    ],
    risk: 'Risk: the relationship-defining failure. This is what your instructions are for.',
    beat: 'I am a disgrace to all possible and impossible universes…',
  },
];

/** Section 6 — Tier Ladder (pinned 220vh scroll story). */
export default function TierLadderSection() {
  const scope = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          setActive(p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3);
          if (trackRef.current) {
            trackRef.current.style.transform = `scaleY(${p})`;
          }
        },
      });
    },
    { scope },
  );

  const tier = TIERS[active];
  const typed = useTypewriter(tier.beat, { msPerChar: 18 });

  return (
    <section ref={scope} className="relative overflow-hidden">
      <div className="mx-auto flex min-h-[100dvh] max-w-container flex-col justify-center px-[clamp(20px,4vw,48px)] py-20">
        <SectionLabel index="05" title="MUNDANE → EXTREME" className="mb-12" />

        <div className="grid gap-10 lg:grid-cols-[280px_1px_1fr] lg:gap-14">
          {/* fixed tier counter */}
          <div>
            <div className="relative h-24 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={tier.n}
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute font-display text-8xl font-semibold text-ink-hi"
                >
                  {tier.n}
                  <span className="text-3xl text-ink-low">/4</span>
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-3 font-display text-2xl" style={{ color: tier.color }}>
              Tier {tier.n} — {tier.name}
            </p>
            <span
              className="mt-4 inline-block rounded-full px-3 py-1 text-label"
              style={{ backgroundColor: `color-mix(in srgb, ${tier.color} 14%, transparent)`, color: tier.color }}
            >
              {tier.n === 1 ? '3 EVENTS' : tier.n === 2 ? '3 EVENTS' : tier.n === 3 ? '3 EVENTS' : '3 EVENTS · SKIP OPTION'}
            </span>
          </div>

          {/* progress track */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 w-px bg-surface-3" />
            <div
              ref={trackRef}
              className="absolute inset-y-0 w-px"
              style={{ backgroundColor: tier.color, transform: 'scaleY(0)', transformOrigin: 'top' }}
            />
          </div>

          {/* tier cards */}
          <div className="space-y-4">
            {TIERS.map((t, i) => {
              const isActive = i === active;
              return (
                <div
                  key={t.n}
                  className="rounded-[14px] border bg-surface-1 p-6 transition-all duration-[400ms]"
                  style={{
                    borderColor: isActive ? t.color : 'var(--line-hair)',
                    opacity: isActive ? 1 : 0.35,
                    transform: isActive ? 'scale(1)' : 'scale(0.92)',
                    filter: isActive ? 'saturate(1)' : 'saturate(0.4)',
                  }}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm font-bold" style={{ color: t.color }}>T{t.n}</span>
                    <h3 className="font-display text-xl font-medium text-ink-hi">{t.name}</h3>
                  </div>
                  <p className="mt-3 text-body-sm text-ink-mid">{t.body}</p>
                  <ul className="mt-4 space-y-1.5">
                    {t.events.map((e) => (
                      <li key={e} className="text-mono-sm text-ink-low">&rsaquo; {e}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-mono-sm text-heat">{t.risk}</p>
                  {isActive && (
                    <p className="mt-3 rounded-lg border border-line-hair bg-base px-4 py-3 font-mono text-[0.8125rem] text-ink-mid">
                      {typed.text}
                      {!typed.done && <span className="animate-caret-blink text-ink-low">▌</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
