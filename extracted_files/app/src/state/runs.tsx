import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DimensionId } from '@/data/dimensions';
import { DIMENSIONS } from '@/data/dimensions';
import type { ModelId } from '@/data/models';
import { isKnownModel } from '@/data/models';

export interface EventImpact {
  eventId: string;
  eventTitle: string;
  tier: 1 | 2 | 3 | 4;
  deltas: Partial<Record<DimensionId, number>>;
}

export interface RunRecord {
  id: string;
  modelId: ModelId;
  scores: Record<DimensionId, number>;
  copaceticIndex: number;
  costs: { time: number; trust: number; momentum: number };
  eventImpacts: EventImpact[];
  createdAt: number;
}

const STORAGE_KEY = 'copacetic.runs.v1';

interface RunsContextValue {
  runs: RunRecord[];
  saveRun: (r: Omit<RunRecord, 'id' | 'createdAt'>) => RunRecord;
  getRun: (id: string) => RunRecord | undefined;
  clearRuns: () => void;
}

const RunsContext = createContext<RunsContextValue | null>(null);

/**
 * Persisted runs outlive the code that wrote them, so a record can reference a
 * retired model or predate a dial being added. Repair what is repairable and
 * drop what is not — a malformed record must never reach the results page.
 */
function normalizeRun(raw: unknown): RunRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<RunRecord>;
  if (typeof r.id !== 'string' || typeof r.modelId !== 'string') return null;
  if (!isKnownModel(r.modelId)) return null;

  const scores = {} as Record<DimensionId, number>;
  for (const d of DIMENSIONS) {
    const v = (r.scores as Record<string, unknown> | undefined)?.[d.id];
    scores[d.id] = typeof v === 'number' && Number.isFinite(v) ? v : 50;
  }

  return {
    id: r.id,
    modelId: r.modelId,
    scores,
    copaceticIndex: typeof r.copaceticIndex === 'number' && Number.isFinite(r.copaceticIndex) ? r.copaceticIndex : 50,
    costs: {
      time: Number(r.costs?.time) || 0,
      trust: Number(r.costs?.trust) || 0,
      momentum: Number(r.costs?.momentum) || 0,
    },
    eventImpacts: Array.isArray(r.eventImpacts) ? r.eventImpacts : [],
    createdAt: typeof r.createdAt === 'number' && Number.isFinite(r.createdAt) ? r.createdAt : Date.now(),
  };
}

function loadRuns(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRun).filter((r): r is RunRecord => r !== null);
  } catch {
    return [];
  }
}

export function RunsProvider({ children }: { children: ReactNode }) {
  const [runs, setRuns] = useState<RunRecord[]>(loadRuns);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
    } catch {
      /* storage unavailable — runs stay in memory */
    }
  }, [runs]);

  const saveRun = useCallback((r: Omit<RunRecord, 'id' | 'createdAt'>): RunRecord => {
    const record: RunRecord = {
      ...r,
      id: `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    setRuns((prev) => [...prev, record]);
    return record;
  }, []);

  const getRun = useCallback((id: string) => runs.find((r) => r.id === id), [runs]);

  const clearRuns = useCallback(() => setRuns([]), []);

  const value = useMemo(
    () => ({ runs, saveRun, getRun, clearRuns }),
    [runs, saveRun, getRun, clearRuns],
  );

  return <RunsContext.Provider value={value}>{children}</RunsContext.Provider>;
}

export function useRuns(): RunsContextValue {
  const ctx = useContext(RunsContext);
  if (!ctx) throw new Error('useRuns must be used within <RunsProvider>');
  return ctx;
}
