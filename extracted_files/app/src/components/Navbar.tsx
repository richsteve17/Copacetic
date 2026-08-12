import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredApiKey } from '@/lib/openrouter';

const LINKS = [
  { to: '/simulator', label: 'Simulator' },
  { to: '/models', label: 'Model Profiles' },
  { to: '/results', label: 'Results' },
  { to: '/method', label: 'Method' },
  { to: '/connect', label: 'Connect API' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false);

  const location = useLocation();
  const onSimulator = location.pathname.startsWith('/simulator');

  useEffect(() => {
    const key = getStoredApiKey();
    setLiveEnabled(Boolean(key && key.trim()));
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-line-hair bg-[rgba(11,11,15,0.72)] backdrop-blur-[14px]">
      <nav className="mx-auto flex h-full max-w-container items-center justify-between px-[clamp(20px,4vw,48px)]">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src="./assets/logo.svg" alt="COPACETIC logo" width={24} height={24} />
          <span className="font-mono text-sm font-bold tracking-[0.32em] text-ink-hi">COPACETIC</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
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

          {/* OpenRouter Live Mode Link to /connect */}
          <Link
            to="/connect"
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition-all duration-200',
              liveEnabled
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'border-line-hair bg-surface-1 text-ink-mid hover:border-line-strong hover:text-ink-hi'
            )}
          >
            <Zap size={12} className={liveEnabled ? 'fill-emerald-400 text-emerald-400' : ''} />
            <span>{liveEnabled ? 'LIVE API ON' : 'CONNECT OPENROUTER'}</span>
          </Link>

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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-line-hair bg-surface-1/95 px-6 py-6 backdrop-blur-xl md:hidden space-y-4"
          >
            <div className="flex flex-col gap-4">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'text-base font-medium transition-colors',
                      isActive ? 'text-human font-semibold' : 'text-ink-mid hover:text-ink-hi'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              <Link
                to="/connect"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-line-hair bg-void p-3 font-mono text-xs text-ink-hi"
              >
                <Zap size={14} className={liveEnabled ? 'text-emerald-400 fill-emerald-400' : 'text-human'} />
                <span>{liveEnabled ? 'Live API Active' : 'Connect OpenRouter API Key'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
