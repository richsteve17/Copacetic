import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { DimensionId } from '@/data/dimensions';
import { DIMENSIONS } from '@/data/dimensions';

export interface RadarSeries {
  id: string;
  color: string;
  scores: Record<DimensionId, number>;
  /** dashed stroke for older runs in compare mode */
  dashed?: boolean;
  /** fill opacity (0 = stroke only) */
  fillOpacity?: number;
  /** draw animation delay in seconds */
  delay?: number;
}

const SIZE = 480;
const C = SIZE / 2;
const R = 168;
const LABEL_R = 196;

function axisPoint(i: number, frac: number): [number, number] {
  const rad = ((-90 + i * 36) * Math.PI) / 180;
  return [C + R * frac * Math.cos(rad), C + R * frac * Math.sin(rad)];
}

function polygonPath(scores: Record<DimensionId, number>): string {
  return DIMENSIONS.map((d, i) => {
    const v = Math.max(0, Math.min(100, scores[d.id] ?? 0)) / 100;
    const [x, y] = axisPoint(i, v);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

interface RadarChartProps {
  series: RadarSeries[];
  /** currently cross-highlighted dimension (from breakdown rows) */
  highlight?: DimensionId | null;
  onHoverDimension?: (d: DimensionId | null) => void;
  className?: string;
  showLabels?: boolean;
}

/** 10-axis working-style radar with draw-in animation (design.md §5.3). */
export default function RadarChart({
  series,
  highlight = null,
  onHoverDimension,
  className,
  showLabels = true,
}: RadarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-25% 0px' });
  const [hovered, setHovered] = useState<DimensionId | null>(null);

  const paths = useMemo(() => series.map((s) => polygonPath(s.scores)), [series]);
  const rings = useMemo(
    () =>
      [0.25, 0.5, 0.75, 1].map((f) =>
        DIMENSIONS.map((_, i) => {
          const [x, y] = axisPoint(i, f);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ') + ' Z',
      ),
    [],
  );

  const setHover = (d: DimensionId | null) => {
    setHovered(d);
    onHoverDimension?.(d);
  };

  const hoveredIndex = hovered ? DIMENSIONS.findIndex((d) => d.id === hovered) : -1;
  const hoveredDim = hoveredIndex >= 0 ? DIMENSIONS[hoveredIndex] : null;
  const primary = series[0];
  const tipPos = hoveredIndex >= 0 ? axisPoint(hoveredIndex, Math.max(0.12, (primary?.scores[DIMENSIONS[hoveredIndex].id] ?? 0) / 100)) : null;

  return (
    <div ref={ref} className={className}>
      <div className="relative mx-auto w-full max-w-[480px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img" aria-label="Ten-dimension working-style radar">
          {/* grid rings */}
          {rings.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--line-hair)" strokeWidth="1" />
          ))}
          {/* axes */}
          {DIMENSIONS.map((_, i) => {
            const [x, y] = axisPoint(i, 1);
            return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--line-hair)" strokeWidth="1" />;
          })}

          {/* series polygons */}
          {series.map((s, si) => (
            <g key={s.id}>
              <motion.path
                d={paths[si]}
                fill={s.color}
                fillOpacity={s.fillOpacity ?? 0.18}
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray={s.dashed ? '6 5' : undefined}
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={inView ? { pathLength: 1, fillOpacity: s.fillOpacity ?? 0.18 } : {}}
                transition={{
                  pathLength: { duration: 1.4, delay: s.delay ?? 0, ease: [0.22, 1, 0.36, 1] },
                  fillOpacity: { duration: 0.6, delay: (s.delay ?? 0) + 1.2 },
                }}
              />
              {/* vertex dots (interactive on the primary series) */}
              {si === 0 &&
                DIMENSIONS.map((d, i) => {
                  const v = Math.max(0, Math.min(100, s.scores[d.id] ?? 0)) / 100;
                  const [x, y] = axisPoint(i, v);
                  const isHot = hovered === d.id || highlight === d.id;
                  return (
                    <motion.circle
                      key={d.id}
                      cx={x}
                      cy={y}
                      r={isHot ? 7 : 4}
                      fill={s.color}
                      style={{ cursor: 'pointer' }}
                      initial={{ opacity: 0 }}
                      animate={
                        highlight === d.id
                          ? { opacity: [1, 0.4, 1, 0.4, 1] }
                          : inView
                            ? { opacity: 1 }
                            : {}
                      }
                      transition={
                        highlight === d.id
                          ? { duration: 0.9 }
                          : { delay: (s.delay ?? 0) + 1.1 + i * 0.03, duration: 0.25 }
                      }
                      onMouseEnter={() => setHover(d.id)}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
            </g>
          ))}

          {/* axis labels */}
          {showLabels &&
            DIMENSIONS.map((d, i) => {
              const [x, y] = axisPoint(i, LABEL_R / R);
              const cos = Math.cos(((-90 + i * 36) * Math.PI) / 180);
              const anchor = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle';
              return (
                <motion.text
                  key={d.id}
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className="fill-ink-mid"
                  style={{ fontSize: 12, fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: hovered === d.id || highlight === d.id ? 1 : 0.85 } : {}}
                  transition={{ delay: 1.4 + i * 0.04, duration: 0.3 }}
                  stroke={hovered === d.id || highlight === d.id ? 'var(--human)' : undefined}
                  strokeWidth={0.4}
                >
                  {d.name}
                </motion.text>
              );
            })}
        </svg>

        {/* hover tooltip */}
        {hoveredDim && tipPos && primary && (
          <motion.div
            key={hoveredDim.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="pointer-events-none absolute z-10 w-48 rounded-lg border border-line-strong bg-surface-2 p-3"
            style={{
              left: `${(tipPos[0] / SIZE) * 100}%`,
              top: `${(tipPos[1] / SIZE) * 100}%`,
              transform: 'translate(-50%, -115%)',
            }}
          >
            <p className="text-label text-human">{hoveredDim.short}</p>
            <p className="mt-1 font-mono text-sm text-ink-hi tabular-nums">
              {Math.round(primary.scores[hoveredDim.id])}
              <span className="text-ink-low"> / 100</span>
            </p>
            <p className="mt-1 text-mono-sm text-ink-low">
              {hoveredDim.lowLabel} ⟷ {hoveredDim.highLabel}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
