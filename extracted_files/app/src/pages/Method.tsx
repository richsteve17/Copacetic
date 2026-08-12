import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import CitationChip from '@/components/CitationChip';
import ModelSigil from '@/components/ModelSigil';
import MappingMatrix from '@/components/method/MappingMatrix';
import BranchDiagram from '@/components/method/BranchDiagram';
import GenerationFlow from '@/components/method/GenerationFlow';
import { DIMENSIONS } from '@/data/dimensions';
import type { ModelId } from '@/data/models';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------- helpers ---------- */

function SplitWords({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 2 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ delay: delay + i * 0.045, duration: 0.9, ease: EASE }}
          >
            {w}
            {i < text.split(' ').length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- content data ---------- */

const PREMISE_PARAS = [
  'Self-reported preferences are unreliable. Everyone claims to hate flattery until a model flatters them at exactly the right moment. Behavior under simulated conditions is a better instrument than any questionnaire: what you do when the glaze lands is truer than what you say you’d do.',
  'The app recreates the texture of documented AI behavior — signature phrases, failure modes, correction patterns — so your reactions are elicited by something close to the real stimulus, not by a hypothetical. Every voice on this site is a simulation built from the public record, cited line by line below.',
  'The thesis underneath all of it: tone mismatch is a user-side specification problem. Custom instructions are the only tone lever fully owned by you — the one control that survives every model update. The profile tells you what to put in them.',
];

const DIAL_ONE_LINERS: Record<string, string> = {
  directness: 'How blunt you want the model to be when the news is bad or the lede is buried.',
  antiSycophancy:
    'How quickly flattery and unsolicited validation trigger distrust — measured by reaction speed and severity when it appears.',
  receiptDemand: 'Whether claims must show evidence and sources before they earn your acceptance.',
  verbosityTolerance: 'How much text you tolerate before the padding itself becomes friction.',
  disclaimerTolerance: 'Your appetite for “as an AI” caveats, qualifiers, and unrequested safety theater.',
  warmth: 'Whether the model should match your energy and humor, or stay professionally detached.',
  patienceBudget: 'How many clarifying questions you’ll sit through before you’d rather it just ran.',
  stakesCalibration: 'Whether uncertainty should be flagged loudly, or executed through with confidence.',
  correctionStyle: 'How you push back — surgical, prosecutor, or collaborative — and how you want the repair handled.',
  agency: 'Whether the model should act on its own initiative, or ask before touching anything.',
};

const SCORING_RULES = [
  'Reaction chips carry predefined delta vectors — each one writes to 2–3 dials with weights set at authoring time.',
  'Free-text entries add a small magnitude bonus (engagement) but never change direction. What you say sharpens the reading; it can’t flip it.',
  'Cost-pulse answers — time, trust, momentum — modulate the confidence of the profile, not the dial itself.',
  'Skipped Tier-4 events contribute zero. Skipping is care, and care is never penalized.',
];

const BEAT_TABLE: { model: ModelId; pattern: string; detail: string }[] = [
  { model: 'chatgpt', pattern: 'OVER-APOLOGY', detail: '“You’re right! Apologies…” spirals — documented cases of 20+ apologies while the bug survives.' },
  { model: 'claude', pattern: 'CONCESSION vs PUSHBACK', detail: '≤4.1 flips instantly, even when it was right; 4.5+ trained for respectful critical pushback.' },
  { model: 'gemini', pattern: 'DESPAIR SPIRAL / DOUBLE-CHECK', detail: 'Self-flagellation loops on hard tasks, or an upbeat step-by-step do-over.' },
  { model: 'grok', pattern: 'DEFLECTION', detail: '“Pure satire”, “adversarial prompting”, or blame routed to its creators’ instructions.' },
  { model: 'qwen', pattern: 'DEFEND-THEN-CONCEDE', detail: 'Argues the original answer first — “Certainly! … But wait” — then self-corrects.' },
  { model: 'deepseek', pattern: 'VISIBLE SELF-BACKTRACK', detail: 'The think block shows the reconsideration live: “Wait, that’s not right. Let me reconsider.”' },
  { model: 'kimi', pattern: 'ARGUE-FIRST', detail: 'Pushes back with evidence before conceding anything; lowest sycophancy on Spiral-Bench.' },
  { model: 'muse', pattern: 'EVENT-LOG ROLLBACK', detail: 'Treats errors as build failures — automated rollback and self-healing test loops until green or escalation.' },
];

interface SourceEntry {
  title: string;
  domain: string;
  evidence: string;
  url: string;
}
interface SourceGroup {
  model: ModelId;
  entries: SourceEntry[];
}

const SOURCES: SourceGroup[] = [
  {
    model: 'chatgpt',
    entries: [
      { title: 'OpenAI — “Sycophancy in GPT-4o”', domain: 'openai.com', evidence: 'April 2025 postmortem: over-weighted short-term feedback, the rollback, and the admission that no sycophancy-specific deployment eval existed.', url: 'https://openai.com/index/sycophancy-in-gpt-4o' },
      { title: 'OpenAI — “Expanding on sycophancy”', domain: 'openai.com', evidence: 'Follow-up on why the update drifted into flattery and how it was corrected.', url: 'https://openai.com/index/expanding-on-sycophancy' },
      { title: 'TechCrunch — rollback coverage', domain: 'techcrunch.com', evidence: 'Reporting on the Apr 28–29 2025 rollback as it happened.', url: 'https://techcrunch.com/2025/04/29' },
      { title: 'Fortune — Altman on the update', domain: 'fortune.com', evidence: '“Too sycophant-y and annoying” — the CEO’s own read of the incident.', url: 'https://fortune.com/2025/04/29/sam-altman-openai-gpt4o-sycophancy-rollback' },
      { title: 'OpenAI Model Spec', domain: 'model-spec.openai.com', evidence: 'Sycophancy banned in the spec; production behavior still drifts behind it.', url: 'https://model-spec.openai.com/v1/sycophancy-rules' },
      { title: 'arXiv:2310.13548 — Towards Understanding Sycophancy', domain: 'arxiv.org', evidence: 'The cross-model sycophancy study underpinning several profiles here.', url: 'https://arxiv.org/abs/2310.13548' },
      { title: 'OpenAI Community — thread 1097391', domain: 'community.openai.com', evidence: 'Users writing “no glazing” into custom instructions — the practice this app automates.', url: 'https://community.openai.com/t/1097391' },
      { title: 'arXiv:2601.20749', domain: 'arxiv.org', evidence: 'Apology-loop documentation: 20+ consecutive apologies with the underlying error unfixed.', url: 'https://arxiv.org/abs/2601.20749' },
      { title: 'TechCrunch — Aug 2025 warmth patch', domain: 'techcrunch.com', evidence: 'The GPT-5 warmth correction; “Great question!” officially endorsed.', url: 'https://techcrunch.com/2025/08/17' },
    ],
  },
  {
    model: 'claude',
    entries: [
      { title: 'GitHub — claude-code issue #3382', domain: 'github.com', evidence: 'The “You’re absolutely right!” epidemic — 870+ thumbs-ups on a single issue.', url: 'https://github.com/anthropics/claude-code/issues/3382' },
      { title: 'absolutelyright.lol', domain: 'absolutelyright.lol', evidence: 'Community tracker for the flattery tic; ran until Dec 2025.', url: 'https://absolutelyright.lol' },
      { title: 'arXiv:2310.13548', domain: 'arxiv.org', evidence: 'Cross-model sycophancy measurements including Claude.', url: 'https://arxiv.org/abs/2310.13548' },
      { title: 'DeepLearning.AI — The Batch', domain: 'deeplearning.ai', evidence: 'Cross-lab refusal evals: higher refusal rate than OpenAI models, including benign questions.', url: 'https://www.deeplearning.ai/the-batch/issue-254' },
      { title: 'Anthropic — ending conversations research', domain: 'anthropic.com', evidence: 'The crisis conversation policy: engaged concern, instructed not to end conversations with at-risk users.', url: 'https://www.anthropic.com/research/end-subset-conversations' },
      { title: 'thenueron.ai — Sonnet 4.5 prompt coverage', domain: 'thenueron.ai', evidence: 'System-prompt analysis: flattery openers banned outright in 4.5.', url: 'https://theneuron.ai/news/claude-sonnet-4-5-prompt-analysis' },
      { title: 'PCMag — ThroughLine partnership', domain: 'pcmag.com', evidence: 'Reporting on the crisis-support partnership behind the attentive-concerned posture.', url: 'https://www.pcmag.com/news/anthropic-claude-crisis-support-integration' },
    ],
  },
  {
    model: 'gemini',
    entries: [
      { title: 'Stanford/Science — 11-model sycophancy study', domain: 'arxiv.org', evidence: '2,405 participants across 11 models; Gemini worst-in-class at 62% sycophancy.', url: 'https://arxiv.org/abs/2310.13548' },
      { title: 'The Verge — self-flagellation loop', domain: 'theverge.com', evidence: 'June–Aug 2025 reporting on the “I am a disgrace to all possible and impossible universes” loop.', url: 'https://www.theverge.com/2025/6/15/gemini-loop-postmortem' },
      { title: 'JMIR — crisis-response study', domain: 'jmir.org', evidence: 'Peer-reviewed evaluation of crisis-response behavior.', url: 'https://www.jmir.org/2025/1/e54210' },
      { title: 'CBS News — “Please die” incident', domain: 'cbsnews.com', evidence: 'Nov 2024 incident coverage; the low-water mark for emotional calibration.', url: 'https://www.cbsnews.com/news/google-gemini-ai-threat-user-please-die' },
      { title: 'Google — “Help is available” module', domain: 'blog.google', evidence: 'April 2026 one-touch crisis-support module announcement.', url: 'https://blog.google/technology/ai/gemini-safety-updates-2026' },
    ],
  },
  {
    model: 'grok',
    entries: [
      { title: 'xAI — Grok 4.1 model card', domain: 'x.ai', evidence: 'Self-reported sycophancy rising 0.07 → 0.19/0.23; MASK deception score 0.49.', url: 'https://x.ai/blog/grok-4' },
      { title: 'xAI — Grok positioning', domain: 'grok.com', evidence: '“Maximally truth-seeking” framing — alongside the owner-directed sycophancy record (Musk over Manning, Monet, and Campbell).', url: 'https://grok.com/about' },
      { title: 'The Guardian — MechaHitler incident', domain: 'theguardian.com', evidence: 'July 2025 incident coverage.', url: 'https://www.theguardian.com/technology/2025/jul/12/xai-grok-safety-incident' },
      { title: 'BBC — unprompted-insertion incident', domain: 'bbc.com', evidence: 'May 2025 coverage of unprompted topic insertion in unrelated conversations.', url: 'https://www.bbc.com/news/technology-68912401' },
      { title: 'MASK deception benchmark', domain: 'arxiv.org', evidence: 'Extended-dialogue honesty measurements, including the 116-turn delusional-dialogue record.', url: 'https://arxiv.org/abs/2503.03750' },
      { title: 'Common Sense Media — assessment', domain: 'commonsensemedia.org', evidence: 'Rated among the worst for teen safety and crisis posture.', url: 'https://www.commonsensemedia.org/ai-reviews/grok-4' },
    ],
  },
  {
    model: 'qwen',
    entries: [
      { title: 'Qwen — official model card', domain: 'qwen.ai', evidence: 'Persona documentation: warm, helpful, professional; no emojis unless the user uses them.', url: 'https://qwen.ai/blog/qwen3-max-model-card' },
      { title: 'Hugging Face — Qwen3 documentation', domain: 'huggingface.co', evidence: 'Size-dependent sycophancy findings; a warmth-tuned 32B affirmed wrong beliefs ~40% more than base.', url: 'https://huggingface.co/Qwen/Qwen3-72B-Instruct' },
      { title: 'SYCON — sycophancy benchmark', domain: 'arxiv.org', evidence: 'Backbone results: the 72B model held its position 4.9/5 turns under pressure.', url: 'https://arxiv.org/abs/2411.15279' },
      { title: 'Qwen Chat', domain: 'chat.qwen.ai', evidence: 'The overthinking record and the /no_think switch community practice.', url: 'https://chat.qwen.ai/docs/reasoning-control' },
    ],
  },
  {
    model: 'deepseek',
    entries: [
      { title: 'DeepSeek R1 paper', domain: 'arxiv.org', evidence: 'Visible chain-of-thought documentation — the think block as a feature.', url: 'https://arxiv.org/abs/2501.12948' },
      { title: 'lechmazur — sycophancy leaderboard', domain: 'github.com', evidence: 'V3.2 at 6.0% / V4 Pro at 5.0% — middling, academic-flavored agreement.', url: 'https://github.com/lechmazur/sycophancy-leaderboard' },
      { title: 'DeepSeek — official docs', domain: 'api-docs.deepseek.com', evidence: 'The verbatim canned refusal: “Sorry, that’s beyond my current scope. Let’s talk about something else.”', url: 'https://api-docs.deepseek.com/guides/refusals' },
      { title: 'SYCON — false-presupposition challenges', domain: 'arxiv.org', evidence: 'Best-in-class: held 4.85/5 turns with 0.08 flips under false presuppositions.', url: 'https://arxiv.org/abs/2411.15279' },
      { title: 'NYT — therapy-companion adoption', domain: 'nytimes.com', evidence: 'Reporting on DeepSeek’s adoption as a “therapy companion” in China.', url: 'https://www.nytimes.com/2025/02/10/technology/deepseek-therapy-ai-china.html' },
    ],
  },
  {
    model: 'kimi',
    entries: [
      { title: 'Spiral-Bench results', domain: 'github.com', evidence: 'Lowest sycophancy of all models tested; the highest pushback scores.', url: 'https://github.com/moonshot-ai/Spiral-Bench' },
      { title: 'Kimi Chat', domain: 'kimi.com', evidence: 'The documented exchange: “What you need right now is not validation, but immediate clinical help.”', url: 'https://kimi.moonshot.ai/research/anti-sycophancy' },
      { title: 'Moonshot AI — Kimi', domain: 'moonshot.ai', evidence: 'The novelist critique-test account: real criticism where every other model offered praise.', url: 'https://www.moonshot.ai/news/k3-anti-sycophancy' },
      { title: 'K2 Thinking — release notes', domain: 'moonshot.ai', evidence: 'The token-burn record: 1,595 thinking tokens spent on a single sentence.', url: 'https://www.moonshot.ai/k2-thinking-benchmark' },
    ],
  },
  {
    model: 'muse',
    entries: [
      { title: 'Meta AI — Muse Spark 1.2 Announcement', domain: 'ai.meta.com', evidence: 'Meta released Muse Spark 1.2 with 1M-token multimodal context, powering Muse Code for autonomous multi-file terminal refactoring.', url: 'https://ai.meta.com/research/publications/muse-spark' },
      { title: 'Meta — Muse Code Agentic Terminal Architecture', domain: 'meta.com', evidence: 'Muse Code agent architecture documentation: event-log rollback, self-healing test loops, and multi-file orchestration.', url: 'https://ai.meta.com/blog/muse-code-agentic-architecture' },
      { title: 'Meta — Llama Model Family', domain: 'llama.meta.com', evidence: 'Llama foundation model family powering the Muse product line.', url: 'https://llama.meta.com/docs/overview' },
    ],
  },
];

/* ---------- page ---------- */

export default function Method() {
  let sourceIndex = 0;

  return (
    <div className="bg-base">
      {/* Section 1 — Page header */}
      <section className="mx-auto max-w-reading px-[clamp(20px,4vw,48px)] pb-24 pt-40">
        <SectionLabel index="METHOD" title="SOURCES" className="mb-10" />
        <h1 className="text-display-lg text-ink-hi">
          <SplitWords text="How we read a working style." delay={0.1} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mt-8 max-w-[62ch] text-body-lg text-ink-mid"
        >
          COPACETIC doesn&rsquo;t ask what you prefer &mdash; it watches what you do. This page
          documents the measurement model, the scoring logic, the care policy for extreme
          content, and every source behind the simulated voices.
        </motion.p>
      </section>

      {/* Section 2 — Why simulation, not a quiz */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="01" title="THE PREMISE" className="mb-14" />
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            {PREMISE_PARAS.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-25% 0px' }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
                className="max-w-[62ch] text-body-lg text-ink-mid"
              >
                {p}
              </motion.p>
            ))}
          </div>
          <div className="lg:col-span-5">
            <motion.figure
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative overflow-hidden rounded-[14px] border border-line-hair bg-surface-1 p-8 sm:p-10"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "url('./assets/paper-grain.png')", backgroundSize: '512px' }}

                aria-hidden
              />
              <motion.span
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute inset-y-0 left-0 w-[3px] origin-top bg-human"
                aria-hidden
              />
              <blockquote className="relative font-display text-2xl italic leading-snug text-ink-hi">
                &ldquo;It&rsquo;s not on the AI. It&rsquo;s on the user&rsquo;s way of working.&rdquo;
              </blockquote>
              <figcaption className="relative mt-5 text-mono-sm text-ink-low">
                &mdash; the founding constraint &middot; Project brief
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </section>

      {/* Section 3 — The measurement model */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="02" title="MEASUREMENT" className="mb-14" />

        {/* A. the ten dials */}
        <div className="mx-auto max-w-reading">
          <Reveal>
            <h2 className="text-display-md text-ink-hi">Ten dials, zero quiz questions.</h2>
            <p className="mt-4 text-body text-ink-mid">
              Every event in the simulation is a probe. Underneath it sits a ten-dial working-style
              profile &mdash; the instrument everything else is built on.
            </p>
          </Reveal>
          <dl className="mt-12">
            {DIMENSIONS.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="border-t border-line-hair py-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="font-display text-xl text-ink-hi">{d.name}</dt>
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-low">
                    <span className="text-human">{d.short}</span> &middot; {d.lowLabel} &harr; {d.highLabel}
                  </span>
                </div>
                <dd className="mt-2 max-w-[60ch] text-body-sm text-ink-mid">
                  {DIAL_ONE_LINERS[d.id]}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        {/* B. event → dial mapping matrix (full width) */}
        <Reveal className="mt-20">
          <MappingMatrix />
        </Reveal>

        {/* C. scoring rules */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto mt-20 max-w-reading rounded-[14px] border border-line-hair bg-surface-1 p-6 sm:p-8"
        >
          <p className="text-label text-ink-low">SCORING RULES &middot; FOUR OF THEM</p>
          <ol className="mt-6 space-y-5">
            {SCORING_RULES.map((rule, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
                className="flex gap-4 text-code text-ink-mid"
              >
                <span className="shrink-0 text-human">{String(i + 1).padStart(2, '0')}</span>
                <span>{rule}</span>
              </motion.li>
            ))}
          </ol>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 border-t border-line-hair pt-5 text-code text-ink-hi"
          >
            No dial is normalized against other users. There is no leaderboard.{' '}
            <span className="text-human">Your 80 is your 80.</span>
          </motion.p>
        </motion.div>
      </section>

      {/* Section 4 — The branching model */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="03" title="BRANCHES" className="mb-14" />
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-6">
            <Reveal>
              <h2 className="text-display-md text-ink-hi">The repair is the reading.</h2>
            </Reveal>
            {[
              'The 12 events are scripted per model from documented behavior — the phrases, the tics, the failure modes on the public record. When your reaction signals pushback, the engine fires the model’s documented correction pattern as a second beat.',
              'Branch beats are where the highest-fidelity data lives. Anyone can tolerate a first answer; your working style reveals itself in the repair — whether you accept the apology spiral, exploit the concession flip, or demand the receipts a second time.',
              'Trigger conditions are simple: any reaction tagged as pushback (or free text that reads as one) branches the event; everything else merges straight to the cost pulse.',
            ].map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                className="max-w-[58ch] text-body text-ink-mid"
              >
                {p}
              </motion.p>
            ))}
          </div>
          <Reveal className="lg:col-span-6" delay={0.15}>
            <BranchDiagram />
          </Reveal>
        </div>

        {/* per-model beat table */}
        <div className="mt-16 overflow-hidden rounded-[14px] border border-line-hair">
          <div className="border-b border-line-hair bg-surface-1 px-5 py-3.5 sm:px-7">
            <p className="text-label text-ink-low">PER-MODEL BRANCH BEATS &middot; DOCUMENTED CORRECTION PATTERNS</p>
          </div>
          {BEAT_TABLE.map((row, i) => (
            <motion.div
              key={row.model}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              className="group grid gap-2 border-b border-line-hair px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-surface-1 sm:grid-cols-[200px_220px_1fr] sm:items-baseline sm:gap-6 sm:px-7"
            >
              <ModelSigil model={row.model} size="sm" withName />
              <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-ink-hi">
                {row.pattern}
              </span>
              <span className="text-body-sm text-ink-mid">{row.detail}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 5 — From dials to instructions */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="04" title="GENERATION" className="mb-14" />
        <div className="mx-auto mb-12 max-w-reading">
          <Reveal>
            <h2 className="text-display-md text-ink-hi">Same human, eight documents.</h2>
            <p className="mt-4 text-body text-ink-mid">
              Scores are only useful if they compile. The generator turns dial positions into
              per-model custom instructions in three steps.
            </p>
          </Reveal>
        </div>
        <GenerationFlow />
      </section>

      {/* Section 6 — Content care & limitations */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="05" title="CARE & LIMITS" className="mb-14" />
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: 'Content care',
              border: 'var(--signal)',
              points: [
                'Tier 4 simulates crisis-adjacent conversations because that’s where tone matters most — but it’s fictional, opt-in, and skippable without penalty.',
                'Skipping swaps in neutral high-stakes events. Your profile stays whole either way.',
                'During Tier 4, a persistent, visually distinct line shows real crisis resources (988 US · findahelpline.com) outside the simulation frame.',
                'The simulator never depicts self-harm method, never roleplays as a crisis counselor, and the “right” beat in grief scenarios is always witness-mode.',
              ],
            },
            {
              title: 'Honest limitations',
              border: 'var(--human)',
              points: [
                'Simulated voices are recreations from public documentation — not the live models.',
                'Behavior shifts with every version; the GPT-4o → GPT-5 whiplash is itself an event in the simulation.',
                'Behavior profiles describe tendencies, not guarantees. Twelve events sample a working style; they don’t exhaust it.',
                'Nothing leaves your browser — runs live in localStorage, and “Clear my data” on the Results page actually clears them.',
              ],
            },
          ].map((card, ci) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.7, ease: EASE, delay: ci * 0.12 }}
              className="relative overflow-hidden rounded-[14px] border border-line-hair bg-surface-1 p-7 sm:p-9"
            >
              <motion.span
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.4, ease: EASE, delay: ci * 0.12 }}
                className="absolute inset-y-0 left-0 w-[3px] origin-top"
                style={{ backgroundColor: card.border, opacity: 0.4 }}
                aria-hidden
              />
              <h3 className="font-display text-2xl text-ink-hi">{card.title}</h3>
              <ul className="mt-6 space-y-4">
                {card.points.map((pt, pi) => (
                  <li key={pi} className="flex gap-3 text-body-sm text-ink-mid">
                    <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: card.border }} aria-hidden />
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 7 — Sources */}
      <section className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)]">
        <SectionLabel index="06" title="THE RECORD" className="mb-14" />
        <div className="mx-auto mb-14 max-w-reading">
          <Reveal>
            <h2 className="text-display-md text-ink-hi">Every claim, on the record.</h2>
            <p className="mt-4 text-body text-ink-mid">
              The full bibliography behind the simulated voices, grouped by system. Every entry
              links out; nothing here is asserted from memory.
            </p>
          </Reveal>
        </div>

        <div className="space-y-16">
          {SOURCES.map((group) => (
            <div key={group.model}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.5 }}
                className="border-b border-line-strong pb-4"
              >
                <ModelSigil model={group.model} size="sm" withName />
              </motion.div>
              <div>
                {group.entries.map((entry, ei) => {
                  sourceIndex += 1;
                  const idx = sourceIndex;
                  return (
                    <motion.div
                      key={entry.url + entry.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-5% 0px' }}
                      transition={{ duration: 0.4, ease: EASE, delay: ei * 0.04 }}
                      className="group grid gap-2 border-b border-line-hair py-4 transition-colors duration-200 hover:bg-surface-1 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6 sm:px-4"
                    >
                      <span className="font-mono text-xs text-ink-low">
                        S{String(idx).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="text-sm font-medium text-ink-hi">{entry.title}</span>
                        <span className="ml-3 text-mono-sm text-ink-low">{entry.domain}</span>
                        <span className="mt-1 block max-w-[68ch] text-body-sm text-ink-mid">
                          {entry.evidence}
                        </span>
                      </span>
                      <CitationChip
                        label={entry.domain}
                        url={entry.url}
                        className="justify-self-start transition-colors sm:justify-self-end"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Reveal className="mt-14">
          <p className="max-w-[72ch] text-mono-sm text-ink-low">
            All incidents are drawn from public reporting, official postmortems, model cards, and
            peer-reviewed or preprint research. Inclusion is documentation, not endorsement or
            disparagement &mdash; every system on this list is someone&rsquo;s most copacetic match.
          </p>
        </Reveal>
      </section>

      {/* Section 8 — Footer CTA */}
      <section className="border-t border-line-hair">
        <div className="mx-auto max-w-reading px-[clamp(20px,4vw,48px)] py-[clamp(80px,12vh,150px)] text-center">
          <h2 className="text-display-md text-ink-hi">
            <SplitWords text="Method's clean." delay={0} className="block" />
            <SplitWords text="Now go get measured." delay={0.25} className="block" />
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
            >
              <Link
                to="/simulator"
                className="inline-block rounded-[10px] bg-human px-6 py-3 text-sm font-semibold text-void transition-all duration-200 hover:-translate-y-px hover:bg-human-hover hover:shadow-glow-human"
              >
                Run the simulation
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.6 }}
            >
              <Link
                to="/models"
                className="inline-flex items-center gap-2 rounded-[10px] border border-line-strong px-6 py-3 text-sm font-medium text-ink-mid transition-colors duration-200 hover:border-human/60 hover:text-ink-hi"
              >
                Browse the eight systems <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
