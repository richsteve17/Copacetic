import { motion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface WordSplitProps {
  text: string;
  className?: string;
  /** delay before the stagger begins */
  delay?: number;
}

/**
 * Kinetic headline split (design.md §5.6): per-word y 110%→0, rotate 2°→0,
 * stagger 0.045s, 0.9s, inside an overflow-hidden mask.
 */
export default function WordSplit({ text, className, delay = 0 }: WordSplitProps) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '110%', rotate: 2 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.045 }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
