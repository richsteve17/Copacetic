import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, CopyPlus, Download } from 'lucide-react';
import ModelSigil from '@/components/ModelSigil';
import { getModel, MODELS } from '@/data/models';
import type { InstructionDoc } from '@/data/instructions';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface CopyBlockProps {
  doc: InstructionDoc;
  generatedAt: number;
  /** payload bundling every model's instructions */
  copyAllPayload: string;
  notify: (msg: string) => void;
}

/** The deliverable: document card with generated custom instructions (design.md §7.10). */
export default function CopyBlock({ doc, generatedAt, copyAllPayload, notify }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const profile = getModel(doc.modelId);

  const stamp = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(generatedAt));

  const morph = async (ok: boolean) => {
    if (!ok) {
      notify('Copy failed — clipboard unavailable');
      return;
    }
    setCopied(true);
    notify('Copied to clipboard');
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line-hair bg-surface-1">
      {/* paper grain overlay (fades in last) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'url(./assets/paper-grain.png)', backgroundSize: '512px' }}

        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      />

      {/* sigil header row */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-line-hair px-6 py-4">
        <div className="flex items-center gap-3">
          <ModelSigil model={doc.modelId} size="md" />
          <div>
            <p className="font-mono text-sm font-bold tracking-[0.18em]" style={{ color: profile.color }}>
              CUSTOM INSTRUCTIONS — FOR {profile.name.toUpperCase()}
            </p>
            <p className="mt-0.5 text-mono-sm text-ink-low">Generated {stamp} · from your dial positions</p>
          </div>
        </div>
      </div>

      {/* code body — per-line "printing" cascade */}
      <div className="relative px-6 py-5">
        {doc.lines.map((line, i) =>
          line.kind === 'header' ? (
            <motion.p
              key={i}
              className="text-code mt-5 font-bold first:mt-0"
              style={{ color: profile.color }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04, duration: 0.3, ease: EASE }}
            >
              {line.text}
            </motion.p>
          ) : (
            <motion.p
              key={i}
              className="text-code"
              style={{ color: line.kind === 'mitigation' ? 'var(--human)' : 'var(--ink-hi)' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04, duration: 0.3, ease: EASE }}
            >
              {line.text}
            </motion.p>
          ),
        )}
      </div>

      {/* footer actions */}
      <div className="relative flex flex-wrap items-center gap-3 border-t border-line-hair px-6 py-4">
        <button
          type="button"
          onClick={async () => morph(await copyText(doc.text))}
          className="relative inline-flex items-center gap-2 overflow-hidden rounded-[10px] bg-human px-4 py-2 text-sm font-semibold text-void transition-all duration-200 hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => {
            downloadText(
              `copacetic-instructions-${doc.modelId}-${new Date(generatedAt).toISOString().slice(0, 10)}.txt`,
              doc.text,
            );
            notify('Downloaded .txt');
          }}
          className="inline-flex items-center gap-2 rounded-[10px] border border-line-strong px-4 py-2 text-sm font-medium text-ink-mid transition-colors duration-200 hover:border-human hover:text-ink-hi"
        >
          <Download size={16} /> Download .txt
        </button>
        <button
          type="button"
          onClick={async () => morph(await copyText(copyAllPayload))}
          className="inline-flex items-center gap-2 rounded-[10px] border border-line-strong px-4 py-2 text-sm font-medium text-ink-mid transition-colors duration-200 hover:border-human hover:text-ink-hi"
        >
          <CopyPlus size={16} /> Copy all {MODELS.length}
        </button>
      </div>
    </div>
  );
}
