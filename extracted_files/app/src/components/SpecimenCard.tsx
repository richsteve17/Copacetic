import { cn } from '@/lib/utils';
import type { ModelId } from '@/data/models';
import { getModel } from '@/data/models';
import ModelSigil from '@/components/ModelSigil';
import CitationChip from '@/components/CitationChip';

interface SpecimenCardProps {
  model: ModelId;
  quote: string;
  context: string;
  citation: { label: string; url: string };
  className?: string;
}

/** Quoted AI speech sample, treated as a lab specimen (design.md §7.5). */
export default function SpecimenCard({ model, quote, context, citation, className }: SpecimenCardProps) {
  const profile = getModel(model);
  return (
    <figure
      className={cn('rounded-lg border border-line-hair bg-surface-1 p-5', className)}
      style={{ borderLeft: `3px solid ${profile.color}` }}
    >
      <blockquote className="text-mono-sm text-ink-hi">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <ModelSigil model={model} size="sm" withName />
        <span className="text-mono-sm text-ink-low">{context}</span>
        <CitationChip label={citation.label} url={citation.url} className="ml-auto" />
      </figcaption>
    </figure>
  );
}
