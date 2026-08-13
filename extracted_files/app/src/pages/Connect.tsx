import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Zap, Check, AlertCircle, RefreshCw, Search, Send, Lock, RotateCcw, CircleSlash } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import {
  getStoredApiKey,
  setStoredApiKey,
  DEFAULT_MODEL_MAP,
  getResolvedEndpointMap,
  setModelEndpoint,
  resetModelEndpoint,
  resetAllModelEndpoints,
  fetchOpenRouterModels,
  streamOpenRouterCompletion,
  type OpenRouterModel,
} from '@/lib/openrouter';
import { MODELS } from '@/data/models';
import ModelSigil from '@/components/ModelSigil';

const MODEL_IDS = MODELS.map((m) => m.id);
const CATALOG_LIST_ID = 'openrouter-catalog-options';

/** Slot endpoints as currently resolved, read fresh from storage. */
const readEndpoints = () => getResolvedEndpointMap(MODEL_IDS);

export default function Connect() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Catalog state
  const [catalog, setCatalog] = useState<OpenRouterModel[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Slot → endpoint mapping (editable)
  const [endpoints, setEndpoints] = useState(readEndpoints);

  // Live test sandbox state
  const [testSlot, setTestSlot] = useState<string>('chatgpt');
  const [customTarget, setCustomTarget] = useState('');
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
    setCatalogError(false);
    const models = await fetchOpenRouterModels();
    setCatalog(models);
    setCatalogError(models.length === 0);
    setLoadingCatalog(false);
  };

  /** Catalog ids, for checking whether a mapped endpoint actually exists. */
  const catalogIds = useMemo(() => new Set(catalog.map((m) => m.id)), [catalog]);
  const catalogReady = catalog.length > 0;

  const flash = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleSave = () => {
    const trimmed = apiKey.trim();
    setStoredApiKey(trimmed);
    if (trimmed) {
      setSaved(true);
      flash('success', 'API key saved to this browser.');
    } else {
      setSaved(false);
      flash('info', 'API key cleared. Switched to local behavioural simulation mode.');
    }
  };

  const assignEndpoint = (slot: string, endpoint: string) => {
    setModelEndpoint(slot, endpoint);
    setEndpoints(readEndpoints());
  };

  const clearEndpoint = (slot: string) => {
    resetModelEndpoint(slot);
    setEndpoints(readEndpoints());
  };

  /** The model id the test will actually be sent to. */
  const testTarget = testSlot === 'custom' ? customTarget.trim() : endpoints[testSlot]?.endpoint ?? '';

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      flash('error', 'Enter and save an OpenRouter API key first.');
      return;
    }
    if (!testTarget) {
      flash('error', 'Enter a model id to test against.');
      return;
    }

    setTesting(true);
    setTestOutput('');
    setTestError(null);
    setTestLatency(null);
    const startTime = Date.now();
    let firstToken = true;

    try {
      await streamOpenRouterCompletion({
        apiKey: apiKey.trim(),
        modelId: testTarget,
        prompt: testPrompt,
        onToken: (chunk) => {
          if (firstToken) {
            firstToken = false;
            setTestLatency(Date.now() - startTime);
          }
          setTestOutput((prev) => prev + chunk);
        },
        onError: (err) => setTestError(err.message),
      });
      flash('success', `Live test succeeded against ${testTarget}.`);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((m) => m.id.toLowerCase().includes(q) || (m.name ?? '').toLowerCase().includes(q));
  }, [catalog, catalogSearch]);

  const customCount = MODEL_IDS.filter((id) => endpoints[id]?.custom).length;

  return (
    <div className="bg-void min-h-screen">
      {/* shared option list — lets every endpoint field autocomplete the full catalog */}
      <datalist id={CATALOG_LIST_ID}>
        {catalog.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </datalist>

      {/* Header */}
      <section className="relative border-b border-line-hair bg-gradient-to-b from-base to-void pb-16 pt-32">
        <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)]">
          <SectionLabel index="LIVE INFERENCE" title="OPENROUTER.AI SETUP" className="mb-8" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-display-lg text-ink-hi">Connect Live OpenRouter API</h1>
              <p className="mt-4 max-w-[62ch] text-body-lg text-ink-mid">
                Point any of the {MODELS.length} roster slots at any model in the OpenRouter catalog, then run the
                simulator against it live. Your key and your endpoint choices stay in this browser.
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
                    {saved && apiKey.trim() ? 'Streaming completions via OpenRouter API' : 'Using documented local behavioural models'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-16 space-y-16">
        {/* ── API key + live test ─────────────────────────────────────────── */}
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
                        flash('info', 'API key cleared.');
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

              <div className="rounded-xl border border-line-hair bg-void/60 p-4 space-y-2 text-mono-sm">
                <div className="flex items-center gap-2 text-ink-hi font-medium">
                  <Lock size={14} className="text-human" />
                  <span>Zero Server Storage &middot; Direct Browser-to-OpenRouter</span>
                </div>
                <p className="text-ink-low text-[0.75rem] leading-relaxed">
                  Your key is never transmitted to any third-party backend or database. Requests go directly from your
                  browser to OpenRouter&apos;s HTTPS API endpoint.
                </p>
              </div>
            </div>
          </div>

          {/* Live test sandbox — accepts any model id, not just the roster */}
          <div className="lg:col-span-6">
            <div className="rounded-[14px] border border-line-hair bg-surface-1 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-line-hair pb-4">
                <div className="flex items-center gap-3">
                  <Send className="text-human" size={20} />
                  <div>
                    <h3 className="font-display text-lg text-ink-hi">Live Test Playground</h3>
                    <p className="text-mono-sm text-ink-low">Stream a test prompt to any OpenRouter model</p>
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
                    Target
                  </label>
                  <select
                    value={testSlot}
                    onChange={(e) => setTestSlot(e.target.value)}
                    className="w-full rounded-lg border border-line-hair bg-void px-3.5 py-2.5 font-mono text-xs text-ink-hi focus:border-human focus:outline-none"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.vendor}) &mdash; {endpoints[m.id]?.endpoint}
                      </option>
                    ))}
                    <option value="custom">Any other OpenRouter model…</option>
                  </select>
                </div>

                {testSlot === 'custom' && (
                  <div>
                    <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-low mb-2">
                      Model ID
                    </label>
                    <input
                      type="text"
                      list={CATALOG_LIST_ID}
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      placeholder="e.g. mistralai/mistral-large"
                      className="w-full rounded-lg border border-line-hair bg-void px-3.5 py-2.5 font-mono text-xs text-ink-hi focus:border-human focus:outline-none"
                    />
                    {catalogReady && customTarget.trim() && !catalogIds.has(customTarget.trim()) && (
                      <p className="mt-2 font-mono text-[0.6875rem] text-amber-400">
                        Not found in the live catalog — the request will probably 404.
                      </p>
                    )}
                  </div>
                )}

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
                  {testing ? 'Streaming completion…' : 'Send live test stream'}
                </button>

                <div className="rounded-xl border border-line-hair bg-void p-4 font-mono text-xs min-h-[120px] space-y-2">
                  <div className="flex items-center justify-between text-[0.6875rem] text-ink-low border-b border-line-hair pb-2">
                    <span className="truncate">{testTarget || 'NO TARGET'}</span>
                    <span>{testing ? 'RECEIVING TOKENS…' : 'READY'}</span>
                  </div>
                  {testError ? (
                    <p className="text-heat leading-relaxed">{testError}</p>
                  ) : testOutput ? (
                    <p className="text-ink-hi leading-relaxed whitespace-pre-wrap">{testOutput}</p>
                  ) : (
                    <p className="text-ink-low italic">Send a test stream to verify your key and endpoint…</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Editable slot → endpoint map ────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel index="ENDPOINT MAP" title="WHICH MODEL RUNS EACH SLOT" className="mb-4" />
              <h2 className="text-display-md text-ink-hi">{MODELS.length} slots, any catalog model</h2>
              <p className="mt-2 max-w-[70ch] text-body text-ink-mid">
                Each roster slot carries a documented behavioural profile and a default endpoint. The default is a
                starting point, not a guarantee — repoint any slot at any model in the catalog and the simulator will
                run against it. Checked against the live catalog below, so you can see what actually resolves.
              </p>
            </div>
            {customCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  resetAllModelEndpoints();
                  setEndpoints(readEndpoints());
                  flash('info', 'All slots restored to their default endpoints.');
                }}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-line-hair bg-surface-1 px-4 py-2.5 font-mono text-xs text-ink-mid hover:border-human hover:text-ink-hi"
              >
                <RotateCcw size={14} /> Reset all {customCount} override{customCount === 1 ? '' : 's'}
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODELS.map((m) => {
              const slot = endpoints[m.id] ?? { endpoint: DEFAULT_MODEL_MAP[m.id], custom: false };
              const inCatalog = catalogIds.has(slot.endpoint);
              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-3 rounded-xl border border-line-hair bg-surface-1 p-5"
                  style={{ borderColor: `color-mix(in srgb, ${m.color} 30%, transparent)` }}
                >
                  <div className="flex items-center gap-3">
                    <ModelSigil model={m.id} size="md" />
                    <div className="min-w-0">
                      <h4 className="font-display text-base" style={{ color: m.color }}>
                        {m.name}
                      </h4>
                      <span className="text-label text-ink-low">{m.vendor}</span>
                    </div>
                  </div>

                  <label className="block font-mono text-[0.625rem] uppercase tracking-wider text-ink-low">
                    OpenRouter model id
                  </label>
                  <input
                    type="text"
                    list={CATALOG_LIST_ID}
                    value={slot.endpoint}
                    onChange={(e) => assignEndpoint(m.id, e.target.value)}
                    spellCheck={false}
                    className="w-full rounded-lg border border-line-hair bg-void px-3 py-2 font-mono text-[0.6875rem] text-human focus:border-human focus:outline-none"
                  />

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    {catalogReady ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider ${
                          inCatalog
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {inCatalog ? <Check size={9} /> : <CircleSlash size={9} />}
                        {inCatalog ? 'in catalog' : 'not in catalog'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-line-strong px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-ink-low">
                        unchecked
                      </span>
                    )}
                    {slot.custom && (
                      <>
                        <span className="inline-flex items-center rounded-full border border-human/50 px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-human">
                          custom
                        </span>
                        <button
                          type="button"
                          onClick={() => clearEndpoint(m.id)}
                          className="ml-auto inline-flex items-center gap-1 font-mono text-[0.625rem] text-ink-low hover:text-ink-hi"
                          title={`Restore ${DEFAULT_MODEL_MAP[m.id]}`}
                        >
                          <RotateCcw size={10} /> reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {catalogError && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 font-mono text-xs text-amber-400">
              Could not reach the OpenRouter catalog, so endpoints could not be checked. The ids above are still used
              as-is for live runs.
            </p>
          )}
        </div>

        {/* ── Catalog explorer, with assign-to-slot ───────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel index="LIVE CATALOG" title="ALL OPENROUTER MODELS" className="mb-4" />
              <h2 className="text-display-md text-ink-hi">
                Synced catalog ({catalog.length} model{catalog.length === 1 ? '' : 's'})
              </h2>
              <p className="mt-2 text-body text-ink-mid">
                Fetched live from OpenRouter&apos;s public registry. Assign any row to a slot to run the simulator
                against it.
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
                Syncing OpenRouter model catalog…
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="p-12 text-center font-mono text-xs text-ink-low">
                {catalogError
                  ? 'Catalog unavailable — check your connection and refresh.'
                  : `No models found matching "${catalogSearch}"`}
              </div>
            ) : (
              <div className="divide-y divide-line-hair">
                {filteredCatalog.slice(0, 100).map((m) => (
                  <div
                    key={m.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-surface-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-bold text-ink-hi block truncate">{m.name || m.id}</span>
                      <span className="font-mono text-[0.6875rem] text-human block mt-0.5 truncate">{m.id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-mono-sm text-ink-low">
                      <span>
                        Context:{' '}
                        <strong className="text-ink-mid">
                          {m.context_length ? `${(m.context_length / 1024).toFixed(0)}k` : 'N/A'}
                        </strong>
                      </span>
                      {m.pricing && (
                        <span>
                          Prompt:{' '}
                          <strong className="text-ink-mid">
                            ${(parseFloat(m.pricing.prompt) * 1000000).toFixed(2)}/M
                          </strong>
                        </span>
                      )}
                      <select
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          assignEndpoint(e.target.value, m.id);
                          const name = MODELS.find((r) => r.id === e.target.value)?.name ?? e.target.value;
                          flash('success', `${name} slot now runs ${m.id}.`);
                        }}
                        aria-label={`Assign ${m.id} to a roster slot`}
                        className="rounded-lg border border-line-hair bg-void px-2.5 py-1.5 font-mono text-[0.6875rem] text-ink-mid hover:border-human hover:text-ink-hi focus:border-human focus:outline-none"
                      >
                        <option value="">Assign to slot…</option>
                        {MODELS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {filteredCatalog.length > 100 && (
                  <div className="p-4 text-center font-mono text-[0.6875rem] text-ink-low">
                    Showing 100 of {filteredCatalog.length} matches — narrow the search to see the rest.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
