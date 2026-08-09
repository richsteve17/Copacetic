import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { to: '/simulator', label: 'Simulator' },
  { to: '/models', label: 'Model Profiles' },
  { to: '/results', label: 'Results' },
  { to: '/method', label: 'Method' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onSimulator = location.pathname.startsWith('/simulator');

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-line-hair bg-[rgba(11,11,15,0.72)] backdrop-blur-[14px]">
      <nav className="mx-auto flex h-full max-w-container items-center justify-between px-[clamp(20px,4vw,48px)]">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src="/assets/logo.svg" alt="COPACETIC logo" width={24} height={24} />
          <span className="font-mono text-sm font-bold tracking-[0.32em] text-ink-hi">COPACETIC</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'relative pb-1 text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-ink-hi' : 'text-ink-mid hover:text-ink-hi',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-human"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {onSimulator ? (
            <span className="rounded-full border border-line-strong px-3.5 py-1.5 text-label text-ink-mid">
              RUN IN PROGRESS
            </span>
          ) : (
            <Link
              to="/simulator"
              className="rounded-[10px] bg-human px-4 py-2 text-sm font-semibold text-void transition-all duration-200 hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
            >
              Run a simulation
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center text-ink-mid md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-16 z-40 flex flex-col bg-void/95 px-8 py-10 backdrop-blur-xl md:hidden"
          >
            {LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block border-b border-line-hair py-5 font-display text-[2rem]',
                      isActive ? 'text-human' : 'text-ink-hi',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * LINKS.length, duration: 0.35 }}
              className="pt-8"
            >
              <Link
                to="/simulator"
                onClick={() => setOpen(false)}
                className="inline-block rounded-[10px] bg-human px-5 py-3 text-sm font-semibold text-void"
              >
                Run a simulation
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
