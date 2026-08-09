import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitationChipProps {
  label: string;
  url: string;
  className?: string;
}

export default function CitationChip({ label, url, className }: CitationChipProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1',
        'text-[0.6875rem] font-mono leading-none text-ice transition-colors duration-200',
        'hover:bg-[rgba(126,200,248,0.12)]',
        className,
      )}
      style={{ borderColor: 'color-mix(in srgb, var(--ice) 40%, transparent)' }}
    >
      <span className="max-w-[26ch] truncate">{label}</span>
      <ExternalLink size={10} aria-hidden />
    </a>
  );
}
