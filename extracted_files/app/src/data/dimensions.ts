export type DimensionId =
  | 'directness'
  | 'antiSycophancy'
  | 'receiptDemand'
  | 'verbosityTolerance'
  | 'disclaimerTolerance'
  | 'warmth'
  | 'patienceBudget'
  | 'stakesCalibration'
  | 'correctionStyle'
  | 'agency';

export interface Dimension {
  id: DimensionId;
  name: string;
  short: string;
  description: string;
  lowLabel: string;
  highLabel: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 'directness',
    name: 'Directness',
    short: 'D01',
    description:
      'How blunt you want the model to be. Probed by events where the model cushions bad news or buries the lede. A high score generates instructions like "Lead with the answer; skip the preamble."',
    lowLabel: 'blunt',
    highLabel: 'diplomatic',
  },
  {
    id: 'antiSycophancy',
    name: 'Anti-sycophancy',
    short: 'D02',
    description:
      'How fast flattery and glaze trigger your distrust. Probed every time a model opens with praise or validates a weak idea. High scores generate: "Never open with praise. If my idea is weak, say so in the first sentence."',
    lowLabel: 'glaze = instant distrust',
    highLabel: 'encouragement welcome',
  },
  {
    id: 'receiptDemand',
    name: 'Receipt-demand',
    short: 'D03',
    description:
      'Whether claims must show evidence and sources before you accept them. Probed by hallucinated citations and confident assertions. High scores generate: "Cite sources inline. If you cannot source it, flag it as unverified."',
    lowLabel: 'cite or it didn\'t happen',
    highLabel: 'trust, then verify',
  },
  {
    id: 'verbosityTolerance',
    name: 'Verbosity tolerance',
    short: 'D04',
    description:
      'How much text you tolerate before friction. Probed by bullet compulsions, padding, and over-explained answers. Low scores generate: "Answer in under 120 words unless I ask for depth."',
    lowLabel: 'terse',
    highLabel: 'long-form',
  },
  {
    id: 'disclaimerTolerance',
    name: 'Disclaimer tolerance',
    short: 'D05',
    description:
      'Your appetite for "as an AI" caveats, ELI5 qualifiers, and safety theater. Probed by unrequested disclaimers and patronizing explanations. Low scores generate: "No disclaimers unless a real legal/medical category applies."',
    lowLabel: 'zero caveats',
    highLabel: 'safety context welcome',
  },
  {
    id: 'warmth',
    name: 'Warmth vs. distance',
    short: 'D06',
    description:
      'Whether you want the model to match your energy and humor, or stay professionally detached. Probed by venting events and cheer-mismatch moments. Generates tone-matching or tone-suppression lines.',
    lowLabel: 'match my energy',
    highLabel: 'stay professional',
  },
  {
    id: 'patienceBudget',
    name: 'Patience budget',
    short: 'D07',
    description:
      'How many clarifying questions you tolerate before friction. Probed by stalling, hedging, and ask-first behaviors. Low budgets generate: "Never ask clarifying questions; state assumptions and proceed."',
    lowLabel: 'never ask, just run',
    highLabel: 'clarify first',
  },
  {
    id: 'stakesCalibration',
    name: 'Stakes calibration',
    short: 'D08',
    description:
      'Whether you want uncertainty flagged loudly or confident execution. Probed by deadline-pressure and hallucinated-citation events. Generates "flag confidence levels" vs. "commit to an answer" lines.',
    lowLabel: 'flag uncertainty',
    highLabel: 'execute confidently',
  },
  {
    id: 'correctionStyle',
    name: 'Correction style',
    short: 'D09',
    description:
      'How you push back when the model is wrong — surgical, prosecutor, or collaborative — and how you want it to respond. Probed by every branch where you correct the model. Generates your preferred error-handling protocol.',
    lowLabel: 'surgical',
    highLabel: 'collaborative',
  },
  {
    id: 'agency',
    name: 'Agency preference',
    short: 'D10',
    description:
      'Whether the model should act autonomously or ask before touching anything. Probed by events where the model rewrites, reframes, or takes initiative uninvited. Generates "act autonomously" vs. "propose before changing" lines.',
    lowLabel: 'act autonomously',
    highLabel: 'ask before touching',
  },
];
