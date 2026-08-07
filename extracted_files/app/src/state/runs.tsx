import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DimensionId } from '@/data/dimensions';
import type { ModelId } from '@/data/models';

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

function loadRuns(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RunRecord[]) : [];
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
