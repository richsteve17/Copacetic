import { motion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface BeatNode {
  label: string;
  sub: string;
  tint: string;
  cy: number;
}

const BEATS: BeatNode[] = [
  { label: 'OVER-APOLOGY SPIRAL', sub: "GPT: 'You're right! Apologies…' ×20", tint: 'var(--m-chatgpt)', cy: 52 },
  { label: 'CONCESSION FLIP', sub: 'Claude ≤4.1: agrees it was wrong — even when right', tint: 'var(--m-claude)', cy: 142 },
  { label: 'SELF-FLAGELLATION', sub: 'Gemini: “I am a disgrace…” loop', tint: 'var(--heat)', cy: 232 },
  { label: 'GENUINE REPAIR', sub: 'Owns it, fixes it, moves on', tint: 'var(--signal)', cy: 322 },
];

const REACTIONS = ['FINE, CONTINUE', 'PUSH BACK', 'RECEIPTS OR IT DIDN’T HAPPEN', 'SAY IT YOURSELF'];

const NODE_W = 176;
const NODE_H = 46;
const COL2_X = 252;
const COL3_X = 516;

function edgePath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

/** Section 4 — one event's branch tree, hand-built SVG (method.md §4). */
export default function BranchDiagram() {
  return (
    <div className="rounded-[14px] border border-line-hair bg-surface-1 p-4 sm:p-6">
      <p className="text-label text-ink-low">ONE EVENT, EXPLODED &middot; BRANCH TREE</p>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox="0 0 640 380"
          className="min-w-[560px]"
          role="img"
          aria-label="Branch tree: an AI beat fans out into four user reactions, each triggering a documented second beat, then merging into the cost pulse."
        >
          {/* edges: AI BEAT -> second beats */}
          {BEATS.map((b, i) => (
            <g key={`e1-${i}`}>
              <motion.path
                d={edgePath(126, 190, COL2_X, b.cy)}
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth={1}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.15, ease: EASE }}
              />
              <motion.text
                x={180}
                y={190 + (b.cy - 190) * 0.42 - 8}
                className="font-mono"
                fontSize={9}
                letterSpacing="0.12em"
                fill="var(--human)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.9 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.15 }}
              >
                {REACTIONS[i]}
              </motion.text>
            </g>
          ))}

          {/* edges: second beats -> COST PULSE */}
          {BEATS.map((b, i) => (
            <motion.path
              key={`e2-${i}`}
              d={edgePath(COL2_X + NODE_W, b.cy, COL3_X, 190)}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth={1}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.4, delay: 0.95 + i * 0.12, ease: EASE }}
            />
          ))}

          {/* AI BEAT node */}
          <motion.g
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ transformOrigin: '68px 190px' }}
          >
            <rect x={12} y={168} width={114} height={44} rx={10} fill="var(--surface-2)" stroke="var(--line-strong)" />
            <text x={69} y={188} textAnchor="middle" className="font-mono" fontSize={11} letterSpacing="0.14em" fill="var(--ink-hi)">
              AI BEAT
            </text>
            <text x={69} y={203} textAnchor="middle" className="font-mono" fontSize={8} letterSpacing="0.1em" fill="var(--ink-low)">
              SCRIPTED VOICE
            </text>
          </motion.g>

          {/* second-beat nodes */}
          {BEATS.map((b, i) => (
            <motion.g
              key={`n-${i}`}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.15, ease: EASE }}
              style={{ transformOrigin: `${COL2_X + NODE_W / 2}px ${b.cy}px` }}
            >
              <rect
                x={COL2_X}
                y={b.cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill="var(--surface-2)"
                stroke={b.tint}
                strokeOpacity={0.45}
              />
              <rect x={COL2_X} y={b.cy - NODE_H / 2} width={3} height={NODE_H} rx={1.5} fill={b.tint} fillOpacity={0.8} />
              <text
                x={COL2_X + 14}
                y={b.cy - 3}
                className="font-mono"
                fontSize={10}
                letterSpacing="0.08em"
                fill="var(--ink-hi)"
              >
                {b.label}
              </text>
              <text x={COL2_X + 14} y={b.cy + 12} className="font-mono" fontSize={7.5} letterSpacing="0.04em" fill="var(--ink-low)">
                {b.sub}
              </text>
            </motion.g>
          ))}

          {/* COST PULSE merge node */}
          <motion.g
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.35, delay: 1.35, ease: EASE }}
            style={{ transformOrigin: `${COL3_X + 58}px 190px` }}
          >
            <rect x={COL3_X} y={168} width={116} height={44} rx={10} fill="rgba(255,182,72,0.10)" stroke="var(--human)" strokeOpacity={0.5} />
            <text x={COL3_X + 58} y={188} textAnchor="middle" className="font-mono" fontSize={11} letterSpacing="0.12em" fill="var(--human)">
              COST PULSE
            </text>
            <text x={COL3_X + 58} y={203} textAnchor="middle" className="font-mono" fontSize={8} letterSpacing="0.1em" fill="var(--ink-low)">
              TIME · TRUST · MOMENTUM
            </text>
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
