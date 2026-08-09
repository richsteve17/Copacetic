import { cn } from '@/lib/utils';

interface DimensionGaugeProps {
  name: string;
  /** 0–100 */
  value: number;
  variant?: 'mini' | 'full';
  /** fill color — defaults to --human */
  color?: string;
  className?: string;
}

/** Hairline track that fills with --human (design.md §7.7). */
export default function DimensionGauge({
  name,
  value,
  variant = 'full',
  color = 'var(--human)',
  className,
}: DimensionGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink-hi">{name}</span>
        {variant === 'full' && (
          <span className="font-mono text-xs text-ink-low tabular-nums">{Math.round(clamped)}</span>
        )}
      </div>
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-transform duration-[600ms] ease-calibration"
          style={{
            backgroundColor: color,
            transform: `scaleX(${clamped / 100})`,
            transformOrigin: 'left',
            width: '100%',
          }}
        />
      </div>
    </div>
  );
}
