import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import type { DimensionId } from '@/data/dimensions';
import { DIMENSIONS } from '@/data/dimensions';
import type { ModelId } from '@/data/models';
import { getModel, MODELS } from '@/data/models';
import type { CostLevel, CostMeter, ReactionOption, ScenarioEvent, Tier } from '@/data/scenarios';
import {
  BASE_SCORE,
  buildRunEvents,
  clampScore,
  computeCopaceticIndex,
  COST_WEIGHT,
  eventIntroLine,
} from '@/data/scenarios';
import { useRuns } from '@/state/runs';
import type { EventImpact } from '@/state/runs';
import ModelSigil from '@/components/ModelSigil';
import ChatLog from '@/components/sim/ChatLog';
import type { ChatMessage } from '@/components/sim/ChatLog';
import ReactionTray from '@/components/sim/ReactionTray';
import { CostPulseCard } from '@/components/sim/CostPulse';
import HudPanel, { HudStrip } from '@/components/sim/HudPanel';
import ModelPicker from '@/components/sim/ModelPicker';
import BriefingCard from '@/components/sim/BriefingCard';
import TierInterstitial from '@/components/sim/TierInterstitial';
import ContentNote from '@/components/sim/ContentNote';
import Handoff from '@/components/sim/Handoff';
import { getStoredApiKey, DEFAULT_MODEL_MAP, streamOpenRouterCompletion } from '@/lib/openrouter';


type Stage = 'select' | 'briefing' | 'event' | 'note' | 'interstitial' | 'handoff';
type EvPhase = 'ai' | 'await' | 'branch' | 'cost';

const ALL_SCORES = (): Record<DimensionId, number> =>
  Object.fromEntries(DIMENSIONS.map((d) => [d.id, BASE_SCORE])) as Record<DimensionId, number>;

const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Simulator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { runs, saveRun } = useRuns();

  const [stage, setStage] = useState<Stage>('select');
  const [modelId, setModelId] = useState<ModelId | null>(null);
  const [freeTextOn, setFreeTextOn] = useState(true);
  const [skipExtreme, setSkipExtreme] = useState(false);

  const [eventIdx, setEventIdx] = useState(0);
  const [evPhase, setEvPhase] = useState<EvPhase>('ai');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [branched, setBranched] = useState(false);

  const [scores, setScores] = useState<Record<DimensionId, number>>(ALL_SCORES);
  const [costs, setCosts] = useState({ time: 0, trust: 0, momentum: 0 });
  const [costSel, setCostSel] = useState<Record<CostMeter, CostLevel>>({
    time: 'none',
    trust: 'none',
    momentum: 'none',
  });
  const [impacts, setImpacts] = useState<EventImpact[]>([]);
  const [interTier, setInterTier] = useState<Tier>(2);
  const [exitOpen, setExitOpen] = useState(false);
  const [savedRunId, setSavedRunId] = useState<string | null>(null);

  const msgSeq = useRef(0);
  const pendingDeltas = useRef<Partial<Record<DimensionId, number>>>({});

  // latest-state refs for timers / global key handlers
  const stageRef = useRef(stage);
  const evPhaseRef = useRef(evPhase);
  const costsRef = useRef(costs);
  const scoresRef = useRef(scores);
  const impactsRef = useRef(impacts);
  stageRef.current = stage;
  evPhaseRef.current = evPhase;
  costsRef.current = costs;
  scoresRef.current = scores;
  impactsRef.current = impacts;

  const events = useMemo(() => buildRunEvents(skipExtreme), [skipExtreme]);
  const model = modelId ? getModel(modelId) : null;
  const ev: ScenarioEvent | null = stage === 'event' || stage === 'note' || stage === 'interstitial'
    ? events[Math.min(eventIdx, 11)]
    : null;

  // ── deep link /simulator?model=<id> preselects a model (skips select) ──
  useEffect(() => {
    const q = searchParams.get('model');
    if (!q) return;
    const found = MODELS.find((m) => m.id === q);
    if (found) {
      setModelId(found.id);
      setStage('briefing');
    }
    // once, on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previousRuns = useMemo(() => {
    const map: Partial<Record<ModelId, number>> = {};
    for (const r of runs) map[r.modelId] = r.copaceticIndex;
    return map;
  }, [runs]);

  const nextId = (prefix: string) => `${prefix}-${++msgSeq.current}`;

  // ── event lifecycle ────────────────────────────────────────────────────
  const startEvent = useCallback(
    (idx: number, list: ScenarioEvent[]) => {
      const e = list[idx];
      if (!e || !modelId) return;
      const voice = e.voices[modelId];
      setEventIdx(idx);
      setBranched(false);
      setCostSel({ time: 'none', trust: 'none', momentum: 'none' });
      pendingDeltas.current = {};

      const apiKey = getStoredApiKey();
      const aiMsgId = nextId('ai');

      if (apiKey) {
        // LIVE OPENROUTER MODE
        const openRouterModel = DEFAULT_MODEL_MAP[modelId] || 'openai/gpt-4o';
        setMessages((prev) => [
          ...prev,
          { id: nextId('sys'), kind: 'system', text: `— ${eventIntroLine(e)} [LIVE OPENROUTER: ${openRouterModel}] —` },
          { id: nextId('usr'), kind: 'user', text: e.setup },
          {
            id: aiMsgId,
            kind: 'ai',
            text: '⚡ Connecting to OpenRouter...',
            animate: true,
            ts: ts(),
          },
        ]);
        setEvPhase('ai');

        let accumulated = '';
        streamOpenRouterCompletion({
          apiKey,
          modelId: openRouterModel,
          prompt: e.setup,
          onToken: (chunk) => {
            accumulated += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulated } : m))
            );
          },
          onError: (err) => {
            console.error('OpenRouter Live Error, falling back:', err);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, text: `[Live Stream Error: ${err.message}] Falling back to simulated voice:\n\n${voice.ai}` }
                  : m
              )
            );
          },
        });
      } else {
        // SIMULATED VOICE MODE
        setMessages((prev) => [
          ...prev,
          { id: nextId('sys'), kind: 'system', text: `— ${eventIntroLine(e)} —` },
          { id: nextId('usr'), kind: 'user', text: e.setup },
          {
            id: aiMsgId,
            kind: 'ai',
            text: voice.ai,
            think: voice.think,
            flicker: voice.flicker,
            animate: true,
            ts: ts(),
          },
        ]);
        setEvPhase('ai');
      }
    },
    [modelId],
  );


  const applyDeltas = useCallback((deltas: Partial<Record<DimensionId, number>>) => {
    for (const [k, v] of Object.entries(deltas) as [DimensionId, number][]) {
      pendingDeltas.current[k] = (pendingDeltas.current[k] ?? 0) + v;
    }
    setScores((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(deltas) as [DimensionId, number][]) {
        next[k] = clampScore(next[k] + v);
      }
      return next;
    });
  }, []);

  const handleAiDone = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, animate: false } : m)));
    setEvPhase((p) => (p === 'ai' ? 'await' : p === 'branch' ? 'cost' : p));
  }, []);

  const chooseOption = useCallback(
    (opt: ReactionOption) => {
      if (evPhaseRef.current !== 'await' || !modelId || !ev) return;
      const voice = ev.voices[modelId];
      applyDeltas(opt.deltas);
      if (opt.pushback && !branched && voice.branch) {
        setBranched(true);
        setMessages((prev) => [
          ...prev,
          { id: nextId('usr'), kind: 'user', text: opt.label },
          { id: nextId('sys'), kind: 'system', text: '— PUSHBACK REGISTERED —', accent: true },
          {
            id: nextId('ai'),
            kind: 'ai',
            text: voice.branch,
            think: voice.branchThink,
            animate: true,
            ts: ts(),
          },
        ]);
        setEvPhase('branch');
      } else {
        setMessages((prev) => [...prev, { id: nextId('usr'), kind: 'user', text: opt.label }]);
        setEvPhase('cost');
      }
    },
    [modelId, ev, branched, applyDeltas],
  );

  const sendFreeText = useCallback(
    (text: string) => {
      if (evPhaseRef.current !== 'await' || !ev) return;
      applyDeltas(ev.freeTextDeltas);
      setMessages((prev) => [...prev, { id: nextId('usr'), kind: 'user', text }]);
      setEvPhase('cost');
    },
    [ev, applyDeltas],
  );

  const selectCost = useCallback((meter: CostMeter, level: CostLevel) => {
    setCostSel((prev) => {
      const old = prev[meter];
      setCosts((c) => ({ ...c, [meter]: c[meter] - COST_WEIGHT[old] + COST_WEIGHT[level] }));
      return { ...prev, [meter]: level };
    });
  }, []);

  const recordImpact = useCallback(() => {
    if (!ev) return [] as EventImpact[];
    const impact: EventImpact = {
      eventId: ev.id,
      eventTitle: ev.title,
      tier: ev.tier,
      deltas: { ...pendingDeltas.current },
    };
    const next = [...impactsRef.current, impact];
    setImpacts(next);
    return next;
  }, [ev]);

  const finishRun = useCallback(
    (allImpacts: EventImpact[]) => {
      if (!modelId) return;
      const finalCosts = costsRef.current;
      const record = saveRun({
        modelId,
        scores: scoresRef.current,
        copaceticIndex: computeCopaceticIndex(finalCosts),
        costs: finalCosts,
        eventImpacts: allImpacts,
      });
      setSavedRunId(record.id);
      setStage('handoff');
    },
    [modelId, saveRun],
  );

  const goInterstitial = useCallback((tier: Tier) => {
    setInterTier(tier);
    setStage('interstitial');
  }, []);

  const nextFromCost = useCallback(() => {
    if (evPhaseRef.current !== 'cost') return;
    const allImpacts = recordImpact();
    if (eventIdx >= 11) {
      finishRun(allImpacts);
    } else if (eventIdx === 2) {
      goInterstitial(2);
    } else if (eventIdx === 5) {
      goInterstitial(3);
    } else if (eventIdx === 8) {
      if (skipExtreme) goInterstitial(4);
      else setStage('note');
    } else {
      startEvent(eventIdx + 1, events);
    }
  }, [eventIdx, skipExtreme, events, recordImpact, finishRun, goInterstitial, startEvent]);

  // auto-advance after 2.5s idle on the cost card (resets on interaction)
  const advanceRef = useRef(nextFromCost);
  advanceRef.current = nextFromCost;
  useEffect(() => {
    if (evPhase !== 'cost' || stage !== 'event') return;
    const id = window.setTimeout(() => advanceRef.current(), 2500);
    return () => window.clearTimeout(id);
  }, [evPhase, stage, eventIdx, costSel]);

  const interstitialDone = useCallback(() => {
    setStage('event');
    startEvent(eventIdx + 1, events);
  }, [eventIdx, events, startEvent]);

  // ── run lifecycle ──────────────────────────────────────────────────────
  const beginRun = useCallback(
    ({ freeText, skipExtreme: skip }: { freeText: boolean; skipExtreme: boolean }) => {
      setFreeTextOn(freeText);
      setSkipExtreme(skip);
      setScores(ALL_SCORES());
      setCosts({ time: 0, trust: 0, momentum: 0 });
      setImpacts([]);
      setMessages([]);
      setSavedRunId(null);
      const list = buildRunEvents(skip);
      setStage('event');
      startEvent(0, list);
    },
    [startEvent],
  );

  const selectModel = useCallback((id: ModelId) => {
    setModelId(id);
    setStage('briefing');
  }, []);

  const restart = useCallback(() => {
    setStage('select');
    setModelId(null);
    setMessages([]);
    setEventIdx(0);
    setSkipExtreme(false);
    setSavedRunId(null);
  }, []);

  // ── keyboard: 1–4 chips, Esc exit modal (simulator.md §Interaction) ────
  const chooseRef = useRef(chooseOption);
  chooseRef.current = chooseOption;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (stageRef.current === 'event') setExitOpen((v) => !v);
        return;
      }
      if (stageRef.current !== 'event' || evPhaseRef.current !== 'await') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4 && ev && ev.options[n - 1]) {
        e.preventDefault();
        chooseRef.current(ev.options[n - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ev]);

  // ── render ─────────────────────────────────────────────────────────────
  if (stage === 'select') {
    return <ModelPicker previousRuns={previousRuns} onSelect={selectModel} />;
  }

  if (stage === 'briefing' && model) {
    return <BriefingCard model={model} onBegin={beginRun} />;
  }

  if (stage === 'handoff' && model) {
    return (
      <Handoff
        model={model}
        onResults={() => navigate(`/results?run=${savedRunId ?? ''}`)}
        onRestart={restart}
      />
    );
  }

  if (!model || !ev) return null;

  const progress = impacts.length / 12;
  const tier4Active = ev.tier === 4 && !skipExtreme && stage === 'event';
  const topDims = DIMENSIONS.map((d) => ({ name: d.name, value: scores[d.id] }))
    .sort((a, b) => Math.abs(b.value - BASE_SCORE) - Math.abs(a.value - BASE_SCORE))
    .slice(0, 3);

  return (
    <div className="relative">
      {/* 2px run progress hairline under the nav (simulator.md page chrome) */}
      <div className="fixed inset-x-0 top-16 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-human transition-transform duration-500 ease-calibration"
          style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }}
        />
      </div>

      <div className="flex h-[calc(100dvh-4rem)]">
        <HudPanel
          eventN={ev.n}
          totalEvents={12}
          tier={ev.tier}
          scores={scores}
          costs={costs}
          showResources={tier4Active}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <HudStrip
            eventN={ev.n}
            totalEvents={12}
            tier={ev.tier}
            showResources={tier4Active}
          />

          {/* chat header */}
          <div className="flex items-center justify-between border-b border-line-hair bg-base px-[clamp(16px,3vw,32px)] py-3">
            <div className="flex items-center gap-3">
              <ModelSigil model={model.id} size="sm" />
              <span className="font-mono text-sm font-bold" style={{ color: model.color }}>
                {model.name}
              </span>
              <motion.span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: model.color }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="rounded border border-dashed border-line-strong px-1.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-low">
                Simulated voice
              </span>
            </div>
            <span className="hidden font-mono text-[0.625rem] text-ink-low sm:inline">
              Esc — exit run
            </span>
          </div>

          <ChatLog messages={messages} model={model} onAiDone={handleAiDone} />

          {/* reaction tray / cost pulse */}
          <AnimatePresence mode="wait">
            {evPhase === 'cost' ? (
              <CostPulseCard
                key={`cost-${eventIdx}`}
                selections={costSel}
                onSelect={selectCost}
                onNext={nextFromCost}
                isLast={eventIdx >= 11}
              />
            ) : (
              <motion.div key={`tray-${eventIdx}`} exit={{ opacity: 0, y: 12 }}>
                {evPhase === 'await' && (
                  <ReactionTray
                    options={ev.options}
                    freeText={freeTextOn}
                    freeTextPlaceholder={ev.freeTextPlaceholder}
                    reflective={ev.reflective}
                    onChip={chooseOption}
                    onFreeText={sendFreeText}
                  />
                )}
                {evPhase !== 'await' && <div className="border-t border-line-hair bg-surface-1/85 py-3 text-center font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-low">{evPhase === 'branch' ? 'pushback registered — responding' : 'simulating…'}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tier interstitial + Tier-4 content note takeovers */}
      <AnimatePresence>
        {stage === 'note' && (
          <ContentNote
            key="note"
            onContinue={() => goInterstitial(4)}
            onSkip={() => {
              setSkipExtreme(true);
              goInterstitial(4);
            }}
          />
        )}
        {stage === 'interstitial' && (
          <TierInterstitial
            key={`tier-${interTier}`}
            tier={interTier}
            eventsCompleted={eventIdx + 1}
            topDims={topDims}
            costs={costs}
            onDone={interstitialDone}
          />
        )}
      </AnimatePresence>

      {/* Exit confirm modal */}
      <AnimatePresence>
        {exitOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 px-6"
            onClick={() => setExitOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="w-full max-w-sm rounded-[14px] border border-line-hair bg-surface-1 p-6"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-label="Exit run confirmation"
            >
              <p className="font-display text-xl text-ink-hi">Exit this run?</p>
              <p className="mt-2 text-sm text-ink-mid">Progress this run will be lost.</p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setExitOpen(false)}
                  className="flex-1 rounded-[10px] border border-line-strong px-4 py-2.5 text-sm font-medium text-ink-hi transition-colors hover:border-human hover:text-human"
                >
                  Keep running
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 rounded-[10px] bg-heat px-4 py-2.5 text-sm font-semibold text-void transition-opacity hover:opacity-90"
                >
                  Exit run
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
