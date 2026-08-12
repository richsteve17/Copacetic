import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Key, Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  getStoredApiKey,
  setStoredApiKey,
  DEFAULT_MODEL_MAP,
  fetchOpenRouterModels,
  type OpenRouterModel,
} from '@/lib/openrouter';

const LINKS = [
  { to: '/simulator', label: 'Simulator' },
  { to: '/models', label: 'Model Profiles' },
  { to: '/results', label: 'Results' },
  { to: '/method', label: 'Method' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const location = useLocation();
  const onSimulator = location.pathname.startsWith('/simulator');

  useEffect(() => {
    const key = getStoredApiKey();
    setApiKey(key);
    setLiveEnabled(Boolean(key));
  }, []);

  const handleSaveKey = () => {
    setStoredApiKey(apiKey);
    if (apiKey.trim()) {
      setLiveEnabled(true);
      setStatusMsg('API key saved! Live mode active.');
    } else {
      setLiveEnabled(false);
      setStatusMsg('API key cleared. Switched to Simulated mode.');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleFetchModels = async () => {
    setLoadingModels(true);
    const models = await fetchOpenRouterModels();
    setAvailableModels(models);
    setLoadingModels(false);
  };

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

          {/* OpenRouter Live Mode Button */}
          <button
            type="button"
            onClick={() => {
              setLiveModalOpen(true);
              if (availableModels.length === 0) handleFetchModels();
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition-all duration-200',
              liveEnabled
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'border-line-hair bg-surface-1 text-ink-mid hover:border-line-strong hover:text-ink-hi'
            )}
          >
            <Zap size={12} className={liveEnabled ? 'fill-emerald-400 text-emerald-400' : ''} />
            <span>{liveEnabled ? 'LIVE MODE ON' : 'CONNECT OPENROUTER'}</span>
          </button>

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

      {/* OpenRouter Modal */}
      <AnimatePresence>
        {liveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 px-4 backdrop-blur-md"
            onClick={() => setLiveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-line-hair bg-surface-1/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-line-hair pb-4">
                <div className="flex items-center gap-2.5">
                  <Key size={18} className="text-human" />
                  <h3 className="font-display text-lg text-ink-hi">OpenRouter Live Integration</h3>
                </div>
                <button
                  onClick={() => setLiveModalOpen(false)}
                  className="text-ink-low transition-colors hover:text-ink-hi"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs leading-relaxed text-ink-mid">
                  Connect your <span className="font-semibold text-ink-hi">OpenRouter API Key</span> to stream real-time completions live from Claude 3.7, GPT-4o, DeepSeek R1, Gemini 2.5, Grok 2, and Qwen 2.5!
                </p>

                <div>
                  <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-low">
                    OpenRouter API Key
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="flex-1 rounded-lg border border-line-hair bg-void px-3.5 py-2 font-mono text-xs text-ink-hi focus:border-human focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveKey}
                      className="rounded-lg bg-human px-4 py-2 text-xs font-semibold text-void transition-colors hover:bg-human-hover"
                    >
                      Save Key
                    </button>
                  </div>
                  {statusMsg && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                      <Check size={14} /> {statusMsg}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-line-hair bg-void/50 p-4 space-y-2.5">
                  <h4 className="font-mono text-xs font-semibold text-ink-hi uppercase tracking-wider">
                    Model API Map & Endpoints
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[0.75rem] font-mono text-ink-mid">
                    <div>Claude: <span className="text-human">{DEFAULT_MODEL_MAP.claude}</span></div>
                    <div>ChatGPT: <span className="text-human">{DEFAULT_MODEL_MAP.chatgpt}</span></div>
                    <div>DeepSeek: <span className="text-human">{DEFAULT_MODEL_MAP.deepseek}</span></div>
                    <div>Gemini: <span className="text-human">{DEFAULT_MODEL_MAP.gemini}</span></div>
                    <div>Grok: <span className="text-human">{DEFAULT_MODEL_MAP.grok}</span></div>
                    <div>Qwen: <span className="text-human">{DEFAULT_MODEL_MAP.qwen}</span></div>
                  </div>
                </div>

                {loadingModels ? (
                  <p className="text-xs font-mono text-ink-low animate-pulse">Fetching live OpenRouter models...</p>
                ) : availableModels.length > 0 ? (
                  liveEnabled ? (
                    <p className="text-xs font-mono text-emerald-400">
                      ✓ Connected &amp; active with OpenRouter API Key ({availableModels.length} models available)
                    </p>
                  ) : (
                    <p className="text-xs font-mono text-amber-400/90">
                      ⚡ OpenRouter model catalog synced ({availableModels.length} models) &middot; Enter API key above for live inference
                    </p>
                  )
                ) : null}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setLiveModalOpen(false)}
                    className="rounded-lg border border-line-strong px-4 py-2 text-xs font-medium text-ink-hi hover:border-human"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
