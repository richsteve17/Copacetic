import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MODELS } from '@/data/models';
import SectionLabel from '@/components/SectionLabel';
import ModelSigil from '@/components/ModelSigil';
import { CONTRAST_ROWS } from '@/components/models/modelExtras';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Section 10 — Cross-model contrast table (models.md §10).
 * Sticky first column; horizontally scrollable with column snap on mobile.
 */
export default function ContrastTable() {
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] pt-[clamp(80px,12vh,150px)]">
      <SectionLabel index="02" title="SIDE BY SIDE" className="mb-12" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="overflow-hidden rounded-[14px] border border-line-hair bg-surface-1"
      >
        <div className="overflow-x-auto scroll-smooth [scroll-snap-type:x_proximity]">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-hair">
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-44 min-w-44 bg-surface-1 p-4 align-bottom"
                >
                  <span className="text-label text-ink-low">AXIS</span>
                </th>
                {MODELS.map((m, i) => (
                  <motion.th
                    key={m.id}
                    scope="col"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                    onMouseEnter={() => setHoverCol(i)}
                    onMouseLeave={() => setHoverCol(null)}
                    className="min-w-[8.5rem] snap-start p-4 align-bottom"
                    style={{
                      backgroundColor:
                        hoverCol === i
                          ? `color-mix(in srgb, ${m.color} 6%, transparent)`
                          : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ModelSigil model={m.id} size="sm" />
                      <span className="text-label" style={{ color: m.color }}>
                        {m.name}
                      </span>
                    </div>
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTRAST_ROWS.map((row) => (
                <tr
                  key={row.axis}
                  className="group border-b border-line-hair transition-colors duration-150 last:border-b-0 hover:bg-surface-2"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-surface-1 p-4 transition-colors duration-150 group-hover:bg-surface-2"
                  >
                    <span className="text-label text-ink-low transition-colors duration-150 group-hover:text-ink-hi">
                      {row.axis}
                    </span>
                  </th>
                  {MODELS.map((m, i) => (
                    <td
                      key={m.id}
                      onMouseEnter={() => setHoverCol(i)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={cn('snap-start p-4 align-top')}
                      style={{
                        backgroundColor:
                          hoverCol === i
                            ? `color-mix(in srgb, ${m.color} 6%, transparent)`
                            : 'transparent',
                      }}
                    >
                      <span className="text-mono-sm leading-relaxed text-ink-mid">
                        {row.cells[m.id]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <p className="mt-4 text-mono-sm text-ink-low lg:hidden">
        Scroll sideways — the axis column stays put.
      </p>
    </section>
  );
}
