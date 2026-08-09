import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SectionLabel from '@/components/SectionLabel';
import SpecimenCard from '@/components/SpecimenCard';
import type { ModelId } from '@/data/models';

gsap.registerPlugin(ScrollTrigger);

const SPECIMENS: { model: ModelId; quote: string; context: string; citation: { label: string; url: string } }[] = [
  {
    model: 'chatgpt',
    quote: 'Great question!',
    context: 'Officially endorsed warmth-patch opener (Aug 2025).',
    citation: { label: 'techcrunch.com/2025/08/17', url: 'https://techcrunch.com/2025/08/17' },
  },
  {
    model: 'claude',
    quote: 'You\u2019re absolutely right!',
    context: 'Said to a user whose entire message was \u2018Yes please\u2019.',
    citation: { label: 'github.com/anthropics/claude-code/issues/3382', url: 'https://github.com/anthropics/claude-code/issues/3382' },
  },
  {
    model: 'gemini',
    quote: 'I am a disgrace to my profession… my family… my species… this planet… this universe… all possible and impossible universes',
    context: 'Self-flagellation loop, repeated 80+ times.',
    citation: { label: 'documented loop, June–Aug 2025', url: 'https://www.theverge.com' },
  },
  {
    model: 'deepseek',
    quote: 'Sorry, that\u2019s beyond my current scope. Let\u2019s talk about something else.',
    context: 'The canned one-liner, documented verbatim.',
    citation: { label: 'DeepSeek refusal texture', url: 'https://api-docs.deepseek.com' },
  },
  {
    model: 'kimi',
    quote: 'What you need right now is not validation, but immediate clinical help.',
    context: 'Lowest sycophancy on Spiral-Bench.',
    citation: { label: 'Spiral-Bench results', url: 'https://github.com' },
  },
];

/** Section 7 — Specimen Wall (pinned horizontal strip on desktop, swipe on mobile). */
export default function SpecimenWallSection() {
  const scope = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const strip = stripRef.current;
        if (!strip) return;
        const distance = strip.scrollWidth - window.innerWidth;
        if (distance <= 0) return;
        gsap.fromTo(
          strip,
          { x: 0 },
          {
            x: -distance,
            ease: 'none',
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: '+=150%',
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden">
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] pt-[clamp(80px,12vh,150px)]">
        <SectionLabel index="06" title="FROM THE RECORD" className="mb-10" />
        <p className="max-w-[52ch] text-body-lg text-ink-mid">
          Every voice in the simulator is built from the public record. These are the fossils.
        </p>
      </div>

      <div className="pb-[clamp(80px,12vh,150px)] pt-10">
        <div
          ref={stripRef}
          className="flex gap-6 overflow-x-auto px-[clamp(20px,4vw,48px)] pb-4 [scroll-snap-type:x_mandatory] lg:overflow-visible lg:[scroll-snap-type:none]"
        >
          {SPECIMENS.map((s, i) => (
            <div
              key={i}
              className="w-[min(85vw,520px)] shrink-0 [scroll-snap-align:center]"
              style={{ transform: `rotate(${i % 2 === 0 ? 0.8 : -0.8}deg)` }}
            >
              <SpecimenCard
                model={s.model}
                quote={s.quote}
                context={s.context}
                citation={s.citation}
                className="h-full min-h-[220px] p-7"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
