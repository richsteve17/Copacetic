import { Component, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import TeaserSim from '@/components/home/TeaserSim';
import ParticleField from '@/components/home/ParticleField';
import { MODELS } from '@/data/models';
import { DIMENSIONS } from '@/data/dimensions';
import { RUN_LENGTH } from '@/data/scenarios';

class WebGLErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.warn('ParticleField WebGL fallback:', err); }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SplitWords({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 2 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ delay: delay + i * 0.045, duration: 0.9, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Section 1 — Hero + live teaser simulation. Full-bleed (opts out of Layout's pt-16). */
export default function HeroSection() {
  const [particlesVisible, setParticlesVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(([e]) => setParticlesVisible(e.isIntersecting), { threshold: 0 });
    io.observe(host);
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden">
      {/* background: R3F particle field + CSS vignette fallback */}
      <div ref={hostRef} className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,182,72,0.04), transparent 60%)' }} />
        {particlesVisible && (
          <WebGLErrorBoundary>
            <ParticleField />
          </WebGLErrorBoundary>
        )}
      </div>


      <div className="relative mx-auto grid w-full max-w-container gap-14 px-[clamp(20px,4vw,48px)] pb-24 pt-32 lg:grid-cols-12 lg:items-center">
        {/* left column */}
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-label text-human"
          >
            [ SIMULATOR &middot; NOT A QUIZ ]
          </motion.p>

          <h1 className="mt-6 text-display-xl text-ink-hi">
            <span className="block">
              <SplitWords text="It's not the model." delay={0.15} />
            </span>
            <span className="block">
              <SplitWords text="It's the way" delay={0.35} />{' '}
              <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.em
                  className="inline-block text-human"
                  initial={{ y: '110%', rotate: 2 }}
                  animate={{ y: '0%', rotate: 0 }}
                  transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
                >
                  you
                </motion.em>
              </span>{' '}
              <SplitWords text="work." delay={0.55} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7, ease: EASE }}
            className="mt-7 max-w-[46ch] text-body-lg text-ink-mid"
          >
            COPACETIC drops you inside simulated AI conversations — mundane to extreme — in the
            documented voice of the model you actually use. React the way you really would.
            We&rsquo;ll reverse-engineer the custom instructions that make it copacetic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/simulator"
              className="group inline-flex items-center gap-2 rounded-[10px] bg-human px-6 py-3.5 text-sm font-semibold text-void transition-all duration-200 hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
            >
              Run the simulation
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/method"
              className="rounded-[10px] border border-line-strong px-6 py-3.5 text-sm font-medium text-ink-hi transition-colors duration-200 hover:border-human"
            >
              Read the method
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.6 }}
            className="mt-10 text-label text-ink-low"
          >
            {MODELS.length} SYSTEMS &middot; {RUN_LENGTH} EVENTS &middot; 4 TIERS &middot; {DIMENSIONS.length} DIMENSIONS &middot; 0 RIGHT ANSWERS
          </motion.p>
        </div>

        {/* right column — the working teaser sim */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
          className="lg:col-span-5"
        >
          <TeaserSim />
          <p className="mt-4 text-mono-sm text-ink-low">
            A taste. The full run is {RUN_LENGTH} events across 4 tiers — including the ones that go wrong
            at the worst possible moment.
          </p>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.div
        aria-hidden
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <span className="text-label text-ink-low">SCROLL</span>
        <div className="mx-auto mt-2 h-10 w-px overflow-hidden bg-surface-3">
          <div className="h-full w-px animate-scroll-line bg-human" />
        </div>
      </motion.div>
    </section>
  );
}
