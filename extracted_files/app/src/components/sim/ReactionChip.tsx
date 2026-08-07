import { motion } from 'framer-motion';

interface ReactionChipProps {
  index: number;
  label: string;
  onClick: () => void;
}

/** Pill reaction button (design.md §7.6) — keyboard-mapped 1–4 with kbd hint. */
export default function ReactionChip({ index, label, onClick }: ReactionChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="group relative flex items-center rounded-full border border-line-hair bg-surface-2 py-2.5 pl-4 pr-2.5 text-left text-[0.9375rem] font-medium text-ink-hi transition-colors duration-150 hover:border-[rgba(255,182,72,0.6)]"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-human opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      />
      <span>{label}</span>
      <kbd className="ml-3 rounded border border-line-strong bg-void/50 px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-low">
        {index + 1}
      </kbd>
    </motion.button>
  );
}
