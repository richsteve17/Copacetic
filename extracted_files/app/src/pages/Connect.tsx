import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Zap, Check, AlertCircle, RefreshCw, Search, Shield, Send, Cpu, Lock } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import {
  getStoredApiKey,
  setStoredApiKey,
  DEFAULT_MODEL_MAP,
  fetchOpenRouterModels,
  streamOpenRouterCompletion,
  type OpenRouterModel,
} from '@/lib/openrouter';
import { MODELS } from '@/data/models';
import ModelSigil from '@/components/ModelSigil';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Connect() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Catalog state
  const [catalog, setCatalog] = useState<OpenRouterModel[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Live test sandbox state
  const [testModel, setTestModel] = useState<string>('chatgpt');
  const [testPrompt, setTestPrompt] = useState<string>('Say hello and confirm you are connected live via OpenRouter in one sentence.');
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState('');
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    const key = getStoredApiKey();
    setApiKey(key);
    if (key) setSaved(true);
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoadingCatalog(true);
    const models = await fetchOpenRouterModels();
    setCatalog(models);
    setLoadingCatalog(false);
  };

  const handleSave = () => {
    const trimmed = apiKey.trim();
    setStoredApiKey(trimmed);
    if (trimmed) {
      setSaved(true);
      setStatusMsg({ type: 'success', text: 'API Key saved successfully to local storage!' });
    } else {
      setSaved(false);
      setStatusMsg({ type: 'info', text: 'API Key cleared. Switched to local behavioral simulation mode.' });
    }
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter and save an OpenRouter API key first.' });
      return;
    }

    setTesting(true);
    setTestOutput('');
    setTestError(null);
    setTestLatency(null);
    const startTime = Date.now();

    const targetEndpoint = DEFAULT_MODEL_MAP[testModel] || testModel || 'openai/gpt-5.6-sol';

    try {
      await streamOpenRouterCompletion({
        apiKey: apiKey.trim(),
        modelId: targetEndpoint,
        prompt: testPrompt,
        onToken: (chunk) => {
          if (testLatency === null) {
            setTestLatency(Date.now() - startTime);
          }
          setTestOutput((prev) => prev + chunk);
        },
        onError: (err) => {
          setTestError(err.message);
        },
      });
      setStatusMsg({ type: 'success', text: `Live test successful! Latency: ${Date.now() - startTime}ms` });
    } catch (err: any) {
      setTestError(err.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const filteredCatalog = catalog.filter(
    (m) =>
      m.id.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="bg-void min-h-screen">
      {/* Header */}
      <section className="relative border-b border-line-hair bg-gradient-to-b from-base to-void pb-16 pt-32">
        <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)]">
          <SectionLabel index="LIVE INFERENCE" title="OPENROUTER.AI SETUP" className="mb-8" />
          
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-display-lg text-ink-hi">
                Connect Live OpenRouter API
              </h1>
              <p className="mt-4 max-w-[62ch] text-body-lg text-ink-mid">
                Run live inference across all 8 flagship systems or browse the full 400+ OpenRouter model catalog. Data stays strictly inside your browser.
              </p>
            </div>

            {/* Connection Status Badge */}
            <div className="shrink-0">
              <div
                className={`inline-flex items-center gap-2.5 rounded-2xl border px-5 py-3 font-mono text-xs shadow-lg backdrop-blur-md ${
                  saved && apiKey.trim()
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                }`}
              >
                <Zap size={16} className={saved && apiKey.trim() ? 'fill-emerald-400' : ''} />
                <div>
                  <span className="block font-bold uppercase tracking-wider">
                    {saved && apiKey.trim() ? 'LIVE MODE ACTIVE' : 'LOCAL SIMULATION MODE'}
                  </span>
                  <span className="text-[0.6875rem] opacity-80">
                    {saved && apiKey.trim() ? 'Streaming completions via OpenRouter API' : 'Using documented local behavioral models'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-16 space-y-16">
        {/* Section 1: API Key Configuration Card */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-[14px] border border-line-hair bg-surface-1 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-line-hair pb-4">
                <Key className="text-human" size={20} />
                <div>
                  <h3 className="font-display text-lg text-ink-hi">OpenRouter API Key</h3>
                  <p className="text-mono-sm text-ink-low">Stored locally in your browser&apos;s localStorage</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-low mb-2">
                    Enter Key
                  </label>
                  <div className="relative flex gap-2">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setSaved(false);
                      }}
                      placeholder="sk-or-v1-..."
                      className="flex-1 rounded-lg border border-line-hair bg-void px-4 py-2.5 font-mono text-xs text-ink-hi focus:border-human focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="rounded-lg border border-line-hair bg-surface-2 px-3 text-mono-sm text-ink-mid hover:text-ink-hi"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-human px-5 py-2.5 text-xs font-semibold text-void transition-all hover:bg-human-hover"
                  >
                    Save API Key
                  </button>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setApiKey('');
                        setStoredApiKey('');
                        setSaved(false);
                        setStatusMsg({ type: 'info', text: 'API key cleared.' });
                      }}
                      className="rounded-lg border border-line-hair bg-surface-2 px-4 py-2.5 text-xs font-medium text-ink-mid hover:text-heat hover:border-heat"
                    >
                      Clear Key
                    </button>
                  )}
                </div>

                {statusMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-3 font-mono text-xs flex items-center gap-2 ${
                      statusMsg.type === 'success'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : statusMsg.type === 'error'
                        ? 'border-heat/40 bg-heat/10 text-heat'
                        : 'border-line-strong bg-surface-2 text-ink-mid'
                    }`}
                  >
                    {statusMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {statusMsg.text}
                  </motion.div>
                )}
              </div>

              {/* Privacy Guarantee Box */}
              <div className="rounded-xl border border-line-hair bg-void/60 p-4 space-y-2 text-mono-sm">
                <div className="flex items-center gap-2 text-ink-hi font-medium">
                  <Lock size={14} className="text-human" />
                  <span>Zero Server Storage &middot; Direct Browser-to-OpenRouter</span>
                </div>
                <p className="text-ink-low text-[0.75rem] leading-relaxed">
                  Your key is never transmitted to any third-party backend or database. Requests are sent directly from your browser to OpenRouter&apos;s HTTPS API endpoint.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Live Connection Sandbox / Tester */}
          <div className="lg:col-span-6">
            <div className="rounded-[14px] border border-line-hair bg-surface-1 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-line-hair pb-4">
                <div className="flex items-center gap-3">
                  <Send className="text-human" size={20} />
                  <div>
                    <h3 className="font-display text-lg text-ink-hi">Live Test Playground</h3>
                    <p className="text-mono-sm text-ink-low">Stream a test prompt to verify connection</p>
                  </div>
                </div>
                {testLatency !== null && (
                  <span className="font-mono text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {testLatency}ms
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-low mb-2">
                    Target Model
                  </label>
                  <select
                    value={testModel}
                    onChange={(e) => setTestModel(e.target.value)}
                    className="w-full rounded-lg border border-line-hair bg-void px-3.5 py-2.5 font-mono text-xs text-ink-hi focus:border-human focus:outline-none"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.vendor}) &mdash; {DEFAULT_MODEL_MAP[m.id]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-low mb-2">
                    Test Prompt
                  </label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-line-hair bg-void px-3.5 py-2 font-mono text-xs text-ink-hi focus:border-human focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-surface-2 border border-line-strong px-4 py-2.5 font-mono text-xs font-semibold text-ink-hi transition-colors hover:border-human hover:text-human disabled:opacity-50"
                >
                  {testing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  {testing ? 'Streaming Completion...' : 'Send Live Test Stream'}
                </button>

                {/* Output Terminal */}
                <div className="rounded-xl border border-line-hair bg-void p-4 font-mono text-xs min-h-[120px] space-y-2">
                  <div className="flex items-center justify-between text-[0.6875rem] text-ink-low border-b border-line-hair pb-2">
                    <span>OUTPUT STREAM</span>
                    <span>{testing ? 'RECEIVING TOKENS...' : 'READY'}</span>
                  </div>
                  {testError ? (
                    <p className="text-heat leading-relaxed">{testError}</p>
                  ) : testOutput ? (
                    <p className="text-ink-hi leading-relaxed whitespace-pre-wrap">{testOutput}</p>
                  ) : (
                    <p className="text-ink-low italic">Click &quot;Send Live Test Stream&quot; to test your API key...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Flagship Endpoint Mapping Matrix */}
        <div className="space-y-6">
          <div>
            <SectionLabel index="FLAGSHIP ENDPOINTS" title="MODEL MAP" className="mb-4" />
            <h2 className="text-display-md text-ink-hi">8 Verified OpenRouter Model Endpoints</h2>
            <p className="mt-2 text-body text-ink-mid">
              These are the canonical model endpoints mapped for COPACETIC live runs:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODELS.map((m) => {
              const endpoint = DEFAULT_MODEL_MAP[m.id] || 'openai/gpt-5.6-sol';
              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-line-hair bg-surface-1 p-5 space-y-3"
                  style={{ borderColor: `color-mix(in srgb, ${m.color} 30%, transparent)` }}
                >
                  <div className="flex items-center gap-3">
                    <ModelSigil model={m.id} size="md" />
                    <div>
                      <h4 className="font-display text-base" style={{ color: m.color }}>
                        {m.name}
                      </h4>
                      <span className="text-label text-ink-low">{m.vendor}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-line-hair bg-void px-3 py-2">
                    <span className="block font-mono text-[0.625rem] text-ink-low uppercase">API Endpoint</span>
                    <span className="block font-mono text-xs font-semibold text-human truncate mt-0.5">
                      {endpoint}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Full OpenRouter Model Catalog Explorer */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel index="LIVE CATALOG" title="ALL OPENROUTER MODELS" className="mb-4" />
              <h2 className="text-display-md text-ink-hi">Synced Catalog ({catalog.length} Models)</h2>
              <p className="mt-2 text-body text-ink-mid">
                Fetched live from OpenRouter.ai public API registry
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-low" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search models..."
                  className="rounded-lg border border-line-hair bg-surface-1 pl-9 pr-4 py-2 font-mono text-xs text-ink-hi focus:border-human focus:outline-none w-64"
                />
              </div>
              <button
                type="button"
                onClick={loadCatalog}
                disabled={loadingCatalog}
                className="rounded-lg border border-line-hair bg-surface-1 p-2.5 text-ink-mid hover:text-ink-hi"
                title="Refresh catalog"
              >
                <RefreshCw size={14} className={loadingCatalog ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto rounded-[14px] border border-line-hair bg-surface-1">
            {loadingCatalog ? (
              <div className="p-12 text-center font-mono text-xs text-ink-low animate-pulse">
                Syncing OpenRouter model catalog...
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="p-12 text-center font-mono text-xs text-ink-low">
                No models found matching &quot;{catalogSearch}&quot;
              </div>
            ) : (
              <div className="divide-y divide-line-hair">
                {filteredCatalog.slice(0, 100).map((m) => (
                  <div key={m.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-surface-2 transition-colors">
                    <div>
                      <span className="font-mono text-xs font-bold text-ink-hi block">{m.name || m.id}</span>
                      <span className="font-mono text-[0.6875rem] text-human block mt-0.5">{m.id}</span>
                    </div>
                    <div className="flex items-center gap-6 text-mono-sm text-ink-low">
                      <span>Context: <strong className="text-ink-mid">{m.context_length ? (m.context_length / 1024).toFixed(0) + 'k' : 'N/A'}</strong></span>
                      {m.pricing && (
                        <span>Prompt: <strong className="text-ink-mid">${(parseFloat(m.pricing.prompt) * 1000000).toFixed(2)}/M</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
