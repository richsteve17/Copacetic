import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import type { ModelId } from '@/data/models';
import { MODELS } from '@/data/models';
import { MODEL_CARD_INFO } from '@/data/scenarios';
import ModelSigil from '@/components/ModelSigil';

interface ModelPickerProps {
  /** latest saved copacetic index per model (rerun badge) */
  previousRuns: Partial<Record<ModelId, number>>;
  onSelect: (id: ModelId) => void;
}

function FingerprintBar({ label, level, color }: { label: string; level: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-low">{label}</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-0.5 w-4 rounded-full"
            style={{ backgroundColor: i < level ? color : 'var(--surface-3)' }}
          />
        ))}
      </span>
    </div>
  );
}

/** State 1 — Model Select (simulator.md §1). */
export default function ModelPicker({ previousRuns, onSelect }: ModelPickerProps) {
  const randomize = () => {
    const pick = MODELS[Math.floor(Math.random() * MODELS.length)];
    onSelect(pick.id);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[960px] flex-col items-center justify-center px-[clamp(20px,4vw,48px)] py-16">
      <p className="text-label text-human">[ SELECT TARGET SYSTEM ]</p>
      <h2 className="mt-4 text-center text-display-lg">Which machine are we tuning you for?</h2>

      <div className="mt-12 flex flex-wrap justify-center gap-5">
        {MODELS.map((m, i) => {
          const info = MODEL_CARD_INFO[m.id];
          const prev = previousRuns[m.id];
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group w-full max-w-[290px] rounded-[14px] border border-line-hair bg-surface-1 p-5 text-left transition-colors duration-200 sm:w-[calc(33.333%-14px)]"
              style={{ ['--mc' as string]: m.color }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${m.color} 60%, transparent)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
              }}
            >
              <div className="flex items-start justify-between">
                <ModelSigil model={m.id} size="lg" />
                {prev !== undefined && (
                  <span className="rounded-full border border-line-strong px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-mid">
                    Rerun
                  </span>
                )}
              </div>
              <p className="mt-4 font-display text-[1.5rem] leading-tight text-ink-hi">{m.name}</p>
              <p className="mt-1 text-mono-sm text-ink-low">{info.version}</p>
              <p className="mt-3 min-h-[2.5rem] text-sm italic leading-snug text-ink-mid">{info.teaser}</p>
              <div className="mt-4 space-y-1.5 border-t border-line-hair pt-3">
                <FingerprintBar label="Glaze" level={info.glaze} color={m.color} />
                <FingerprintBar label="Backbone" level={info.backbone} color={m.color} />
                <FingerprintBar label="Verbosity" level={info.verbosity} color={m.color} />
              </div>
              {prev !== undefined && (
                <p className="mt-3 font-mono text-[0.625rem] text-ink-low">
                  previous index <span className="text-human">{prev}</span>
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={randomize}
        className="mt-10 inline-flex items-center gap-2 text-sm text-ink-mid underline decoration-dotted underline-offset-4 transition-colors hover:text-human"
      >
        <Dices size={14} />
        Randomize for me
      </button>
      <p className="mt-4 max-w-[52ch] text-center text-mono-sm text-ink-low">
        Voices are simulated recreations built from documented behavior — see Method &amp; Sources.
      </p>
    </div>
  );
}
