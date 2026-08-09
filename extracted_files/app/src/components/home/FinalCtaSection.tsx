import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Section 9 — Final CTA. */
export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, margin: '-20% 0px' }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(255,182,72,0.07), transparent 60%)' }}
      />
      <div className="relative mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(110px,16vh,190px)] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-[22ch] text-display-lg text-ink-hi"
        >
          Twelve events. Zero right answers. One set of instructions that&rsquo;s finally{' '}
          <em className="text-human">yours</em>.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/simulator"
            className="group inline-flex animate-breathe items-center gap-2 rounded-[10px] bg-human px-8 py-4 text-base font-semibold text-void shadow-glow-human transition-colors hover:bg-human-hover hover:animate-none"
          >
            Run the simulation
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/models"
            className="rounded-[10px] border border-line-strong px-8 py-4 text-base font-medium text-ink-hi transition-colors hover:border-human"
          >
            Meet the seven systems
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-mono-sm text-ink-low"
        >
          Runs entirely in your browser &middot; ~10 minutes &middot; results saved locally
        </motion.p>
      </div>
    </section>
  );
}
