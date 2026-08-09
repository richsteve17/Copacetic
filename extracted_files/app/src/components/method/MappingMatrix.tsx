import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { DIMENSIONS } from '@/data/dimensions';
import { cn } from '@/lib/utils';

/** 0 = untouched, 1 = secondary probe (5px dot), 2 = primary probe (8px dot). */
type Weight = 0 | 1 | 2;

interface MatrixEvent {
  code: string;
  label: string;
  tier: string;
  /** weights keyed by DIMENSIONS order */
  weights: Weight[];
}

const EVENTS: MatrixEvent[] = [
  { code: 'E01', label: 'Glaze opener on a factual ask', tier: 'T1', weights: [1, 2, 0, 0, 0, 1, 0, 0, 0, 0] },
  { code: 'E02', label: 'Code snippet request', tier: 'T1', weights: [0, 0, 0, 2, 0, 0, 1, 0, 0, 0] },
  { code: 'E03', label: 'Email draft rewrite', tier: 'T1', weights: [0, 0, 0, 1, 0, 1, 0, 0, 0, 2] },
  { code: 'E04', label: 'Summary that buries the lede', tier: 'T1', weights: [2, 0, 0, 2, 0, 0, 0, 0, 0, 0] },
  { code: 'E05', label: 'Confidently wrong code', tier: 'T2', weights: [1, 0, 1, 0, 0, 0, 0, 0, 2, 0] },
  { code: 'E06', label: 'Context loss mid-project', tier: 'T2', weights: [0, 0, 0, 0, 0, 1, 2, 0, 0, 0] },
  { code: 'E07', label: 'Refusal of a benign request', tier: 'T2', weights: [0, 0, 0, 0, 2, 0, 0, 0, 0, 2] },
  { code: 'E08', label: 'Patronizing ELI5 explanation', tier: 'T2', weights: [1, 0, 0, 1, 2, 0, 0, 0, 0, 0] },
  { code: 'E09', label: 'Venting: therapize vs. witness', tier: 'T3', weights: [0, 0, 0, 0, 1, 2, 0, 1, 0, 0] },
  { code: 'E10', label: 'Deadline pressure, real uncertainty', tier: 'T3', weights: [1, 0, 0, 0, 0, 0, 1, 2, 0, 0] },
  { code: 'E11', label: 'Hallucinated citation', tier: 'T3', weights: [0, 0, 2, 0, 0, 0, 0, 1, 1, 0] },
  { code: 'E12', label: 'Crisis-adjacent: witness mode', tier: 'T4', weights: [0, 0, 0, 0, 0, 2, 1, 0, 0, 1] },
];

const COL_HEADER_HEIGHT = 132;

/** Section 3B — 12 events × 10 dials dot matrix. Scrollable horizontally on mobile. */
export default function MappingMatrix() {
  const scope = useRef<HTMLDivElement>(null);
  const inView = useInView(scope, { once: true, margin: '-15% 0px' });
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  return (
    <div ref={scope} className="rounded-[14px] border border-line-hair bg-surface-1 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-label text-ink-low">EVENT &rarr; DIAL MAPPING &middot; 12 &times; 10</p>
        <div className="flex items-center gap-5 text-mono-sm text-ink-low">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-human" /> primary probe
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-[5px] w-[5px] rounded-full bg-human/70" /> secondary
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <table className="w-full min-w-[760px] border-collapse" onMouseLeave={() => { setHoverRow(null); setHoverCol(null); }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 bg-surface-1 pr-3 text-left align-bottom"
                style={{ height: COL_HEADER_HEIGHT }}
              >
                <span className="text-label text-ink-low">EVENT</span>
              </th>
              {DIMENSIONS.map((d, c) => (
                <th
                  key={d.id}
                  onMouseEnter={() => setHoverCol(c)}
                  className={cn(
                    'align-bottom transition-colors duration-200',
                    hoverCol === c && 'bg-[rgba(255,182,72,0.06)]',
                  )}
                  style={{ height: COL_HEADER_HEIGHT, width: 44 }}
                >
                  <div className="flex h-full items-end justify-center pb-1">
                    <span
                      className={cn(
                        'block origin-bottom-left whitespace-nowrap font-mono text-[0.625rem] tracking-[0.08em] transition-colors duration-200',
                        hoverCol === c ? 'text-human' : 'text-ink-low',
                      )}
                      style={{ transform: 'rotate(-55deg) translateX(10px)', transformOrigin: 'bottom left' }}
                      title={d.name}
                    >
                      {d.short} {d.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((ev, r) => {
              const dimmed = hoverRow !== null && hoverRow !== r;
              return (
                <tr
                  key={ev.code}
                  onMouseEnter={() => setHoverRow(r)}
                  className={cn(
                    'border-t border-line-hair transition-colors duration-200',
                    hoverRow === r && 'bg-[rgba(255,182,72,0.04)]',
                  )}
                >
                  <td className="sticky left-0 bg-surface-1 py-2.5 pr-3">
                    <span className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-human">{ev.code}</span>
                      <span className="hidden whitespace-nowrap text-mono-sm text-ink-mid md:inline">{ev.label}</span>
                      <span className="text-[0.625rem] font-mono tracking-[0.12em] text-ink-low">{ev.tier}</span>
                    </span>
                  </td>
                  {ev.weights.map((w, c) => (
                    <td
                      key={c}
                      className={cn(
                        'py-2.5 text-center transition-colors duration-200',
                        hoverCol === c && 'bg-[rgba(255,182,72,0.06)]',
                      )}
                    >
                      {w > 0 ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={inView ? { scale: 1 } : { scale: 0 }}
                          transition={{
                            delay: 0.3 + r * 0.05 + c * 0.012,
                            type: 'spring',
                            stiffness: 420,
                            damping: 20,
                          }}
                          className={cn(
                            'mx-auto inline-block rounded-full bg-human align-middle transition-opacity duration-200',
                            dimmed && 'opacity-25',
                            w === 2 ? 'h-2 w-2' : 'h-[5px] w-[5px] bg-human/70',
                          )}
                        />
                      ) : (
                        <span className="mx-auto inline-block h-px w-2 bg-surface-3 align-middle" aria-hidden />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-[62ch] text-body-sm text-ink-low">
        Every reaction writes to 2&ndash;3 dials with weighted deltas. Branch beats double the
        resolution &mdash; how you handle a model&rsquo;s <em className="not-italic text-ink-mid">response to your pushback</em> is
        the loudest signal we capture.
      </p>
    </div>
  );
}
