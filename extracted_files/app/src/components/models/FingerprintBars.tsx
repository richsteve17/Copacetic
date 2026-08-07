import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/data/models';
import { FINGERPRINTS } from '@/components/models/modelExtras';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FingerprintBarsProps {
  profile: ModelProfile;
  /** large = profile sticky column; compact = roster card */
  variant?: 'compact' | 'large';
  className?: string;
}

/** 3-bar fingerprint: Glaze / Backbone / Verbosity, filled to documented level. */
export default function FingerprintBars({
  profile,
  variant = 'compact',
  className,
}: FingerprintBarsProps) {
  const stats = FINGERPRINTS[profile.id];
  const large = variant === 'large';
  return (
    <div className={cn('space-y-3', large && 'space-y-4', className)}>
      {stats.map((stat, i) => (
        <div key={stat.label}>
          <div className="flex items-baseline justify-between">
            <span className={cn('text-label text-ink-low', large && 'text-[0.75rem]')}>
              {stat.label}
            </span>
            <span className="font-mono text-[0.75rem] text-ink-low">
              {Math.round(stat.value * 100)}
            </span>
          </div>
          <div
            className={cn('mt-1.5 w-full overflow-hidden rounded-full bg-surface-3', large ? 'h-[3px]' : 'h-0.5')}
          >
            <motion.div
              className="h-full origin-left rounded-full"
              style={{ backgroundColor: profile.color }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: stat.value }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
