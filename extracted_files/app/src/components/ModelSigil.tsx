import { cn } from '@/lib/utils';
import type { ModelId } from '@/data/models';
import { getModel } from '@/data/models';

const SIZE_PX = { sm: 20, md: 32, lg: 56 } as const;

interface ModelSigilProps {
  model: ModelId;
  size?: keyof typeof SIZE_PX;
  /** show the model name in label style next to the glyph */
  withName?: boolean;
  className?: string;
}

export default function ModelSigil({ model, size = 'md', withName = false, className }: ModelSigilProps) {
  const profile = getModel(model);
  const px = SIZE_PX[size];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={`./assets/glyph-${model}.svg`}
        alt={`${profile.name} sigil`}
        width={px}
        height={px}
        style={{ width: px, height: px }}
        className="shrink-0"
      />

      {withName && (
        <span className="text-label" style={{ color: profile.color }}>
          {profile.name}
        </span>
      )}
    </span>
  );
}
