import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ModelId } from '@/data/models';
import { MODELS } from '@/data/models';
import WordSplit from '@/components/models/WordSplit';
import StickyProfileNav from '@/components/models/StickyProfileNav';
import RosterGrid from '@/components/models/RosterGrid';
import ProfileSection from '@/components/models/ProfileSection';
import ContrastTable from '@/components/models/ContrastTable';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MODEL_IDS = new Set<string>(MODELS.map((m) => m.id));

/** Model Profiles — one research-backed behavior dossier per roster system. */
export default function Models() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<ModelId>(MODELS[0].id);
  const sectionsRef = useRef(new Map<ModelId, HTMLElement>());

  const registerSection = useCallback((id: ModelId, el: HTMLElement | null) => {
    if (el) sectionsRef.current.set(id, el);
    else sectionsRef.current.delete(id);
  }, []);

  const scrollToProfile = useCallback(
    (id: ModelId) => {
      const el = sectionsRef.current.get(id) ?? document.getElementById(id);
      setActiveId(id);
      navigate({ pathname: location.pathname, hash: `#${id}` }, { replace: true });
      el?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
    },
    [location.pathname, navigate],
  );

  // Anchor deep links: /models#<modelId> scrolls to that dossier.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!MODEL_IDS.has(id)) return;
    // wait a frame so the dossier sections have laid out
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      setActiveId(id as ModelId);
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  // Track the active dossier for the sticky profile-nav underline.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id as ModelId);
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    );
    sectionsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Section 1 — Page header */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] pt-24">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-label"
        >
          <span className="text-human">[</span>
          <span className="text-ink-low"> PROFILES </span>
          <span className="text-human">]</span>
        </motion.p>
        <h1 className="mt-6 max-w-[16ch] text-display-lg text-ink-hi">
          <WordSplit text="Eight systems. Eight documented personalities." />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          className="mt-7 max-w-[60ch] text-body-lg text-ink-mid"
        >
          These profiles aren&rsquo;t vibes — they&rsquo;re compiled from postmortems, model cards,
          system prompts, issue trackers, and peer-reviewed studies. When the simulator speaks as
          one of these systems, this page is where the voice came from.
        </motion.p>
      </section>

      {/* Sticky profile-nav */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
        className="mt-12"
      >
        <StickyProfileNav activeId={activeId} onSelect={scrollToProfile} />
      </motion.div>

      {/* Section 2 — Roster grid */}
      <RosterGrid onFullProfile={scrollToProfile} />

      {/* The full profiles, one section per system */}
      {MODELS.map((m, i) => (
        <ProfileSection
          key={m.id}
          profile={m}
          order={i}
          registerSection={registerSection}
        />
      ))}

      {/* Section 10 — Cross-model contrast table */}
      <ContrastTable />

      {/* Section 11 — Footer CTA */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(255,182,72,0.06), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(110px,16vh,190px)] text-center">
          <h2 className="mx-auto max-w-[24ch] text-display-md text-ink-hi">
            <WordSplit text="Met them all? Now find out which one you're actually copacetic with." />
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/simulator"
              className="group inline-flex animate-breathe items-center gap-2 rounded-[10px] bg-human px-8 py-4 text-base font-semibold text-void shadow-glow-human transition-colors hover:bg-human-hover hover:animate-none"
            >
              Run the simulation
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/method"
              className="inline-flex items-center gap-2 rounded-[10px] border border-line-strong px-8 py-4 text-base font-medium text-ink-hi transition-colors hover:border-human"
            >
              Read the method <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
