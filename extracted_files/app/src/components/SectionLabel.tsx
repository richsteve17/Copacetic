import { cn } from '@/lib/utils';

interface SectionLabelProps {
  /** zero-padded section number, e.g. "02" */
  index: string;
  title: string;
  /** when true, renders the hairline rule the label sits on */
  withRule?: boolean;
  className?: string;
}

export default function SectionLabel({ index, title, withRule = true, className }: SectionLabelProps) {
  return (
    <div className={cn('relative', className)}>
      {withRule && <div className="section-rule absolute inset-x-0 top-1/2" aria-hidden />}
      <span className="relative inline-flex items-center gap-1 bg-base pr-4 text-label">
        <span className="text-human">[{index}]</span>
        <span className="text-ink-low">/</span>
        <span className="text-ink-low">{title}</span>
      </span>
    </div>
  );
}
