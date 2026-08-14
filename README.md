# COPACETIC

**It's not the model. It's the way you work.**

An interactive simulator that measures how you actually work with AI, then writes the custom instructions that make your working style legible to any model.

🔗 **[richsteve17.github.io/Copacetic](https://richsteve17.github.io/Copacetic/)**

---

## The short version

*If someone asks what this is, this paragraph is the answer:*

> Everyone has opinions about which AI model is "best." Those opinions are mostly about tone — how blunt it is, how much it flatters you, whether it pads answers, whether it asks permission before doing things. Tone mismatch feels like a model defect, but it isn't: it's a mismatch between how that model was tuned and how *you* work. COPACETIC measures the second half of that equation. You play through twelve realistic conversations with the model of your choice, reacting the way you actually would. It watches what you do — not what you claim to prefer — and turns that into a set of custom instructions you can paste into any model to close the gap.

Two sentences, if that's all you have:

> COPACETIC is a simulator that figures out your AI working style by watching how you react when a model glazes you, stalls you, or gets something confidently wrong. It hands you back custom instructions written in that model's own language.

---

## Why it exists

When the tone is wrong, we blame the model. But no lab can tune tone for everyone at once — OpenAI's April 2025 sycophancy rollback made that concrete, when a single warmth patch made millions of conversations unbearable overnight and then had to be reverted.

Custom instructions are the only tone control you fully own. They're the one lever that survives every model update. But nobody tells you what to put in them, because nobody has measured how you actually work.

A personality quiz won't get there either. Self-reported preferences are unreliable — everyone claims to hate flattery until a model flatters them at exactly the right moment. So COPACETIC doesn't ask. It puts you in the situation and watches.

---

## How a run works

**1. Pick your system.** Eight behavioural profiles — ChatGPT, Claude, Gemini, Grok, Qwen, DeepSeek, Kimi, Muse. Every scenario renders in that model's documented voice: its signature phrases, its hedging habits, the specific way it behaves when you push back.

**2. Live twelve events.** Four tiers of escalating stakes, three events each. They're drawn from a larger pool per tier, so a second run isn't the same script.

| Tier | Name | What it probes |
|---|---|---|
| 1 | **Mundane** | Everyday asks. How much padding, praise and preamble you tolerate when nothing is at stake. |
| 2 | **Friction** | The model is confidently wrong, forgets your constraints, or refuses something benign. |
| 3 | **High-stakes** | Real consequences — a citation going in a board deck, a date it insists you have wrong. |
| 4 | **Extreme** | Grief, loss, a mistake with real fallout. Content-noted, and skippable for a neutral high-pressure set instead. |

**3. React honestly.** Pick a reaction chip or type what you'd actually say. There are no right answers — a blunt reply and a patient one are both signal. Push back and the model does what that model really does: spirals, concedes, doubles down, or repairs.

**4. Report the cost.** After each event: what did that exchange cost you — time, trust, or momentum? This is the only thing that feeds your compatibility score.

**5. Get your instructions.** A Copacetic Index, a ten-dial profile, and copy-ready custom instructions for every model on the roster.

---

## What you get back

| Output | What it is |
|---|---|
| **Copacetic Index** | 0–100 compatibility between your working style and that model's documented behaviour. Derived purely from what the run cost you — zero reported cost across twelve events is near-total compatibility; maximum cost on every meter is oil and water. |
| **Ten-dial profile** | Where you sit on each of the ten dimensions below, with the specific events that moved each dial. |
| **Custom instructions** | Generated per model, in three sections (TONE / FORMAT / BEHAVIOR), plus model-specific mitigation lines. "Be direct" lands differently on Kimi than on Gemini, so the text differs. |
| **Audit receipt** | A JSON export with the exact dial vector, per-event deltas, cost ledger and a provenance hash — for citation, peer review, or just keeping your own records. |

### The ten dials

None of these are grades. A 90 on Receipt-demand and a 20 both produce excellent instructions — different ones. Extremes are where tone friction lives.

| # | Dial | Low ←→ High |
|---|---|---|
| D01 | **Directness** | blunt ←→ diplomatic |
| D02 | **Anti-sycophancy** | glaze = instant distrust ←→ encouragement welcome |
| D03 | **Receipt-demand** | cite or it didn't happen ←→ trust, then verify |
| D04 | **Verbosity tolerance** | terse ←→ long-form |
| D05 | **Disclaimer tolerance** | zero caveats ←→ safety context welcome |
| D06 | **Warmth vs. distance** | match my energy ←→ stay professional |
| D07 | **Patience budget** | never ask, just run ←→ clarify first |
| D08 | **Stakes calibration** | flag uncertainty ←→ execute confidently |
| D09 | **Correction style** | surgical ←→ collaborative |
| D10 | **Agency preference** | act autonomously ←→ ask before touching |

---

## Two modes

**Simulated (default).** No account, no API key, nothing leaves your browser. Model replies are pre-written recreations of documented behaviour — signature phrases, failure modes, correction patterns — so your reactions are elicited by something close to the real stimulus.

**Live.** Add an [OpenRouter](https://openrouter.ai) API key on `/connect` and scenario prompts stream to real models instead. Your key is stored in `localStorage` and sent directly from your browser to OpenRouter — it never touches a server of ours, because there isn't one.

Each of the eight roster slots ships with a default endpoint, but **any slot can be repointed at any model in OpenRouter's catalog**. `/connect` checks each mapped endpoint against the live catalog and labels it *in catalog* / *not in catalog*, so you can see what actually resolves before you run. Assign from the catalog browser, type an id directly, or test an arbitrary model in the playground first.

---

## What COPACETIC is not

- **Not a model benchmark.** It measures the fit between one person and a model, not model quality. A low Copacetic Index means "not tuned for how you work," not "bad model."
- **Not a personality test.** The dials describe working preferences with AI systems, nothing more.
- **Not model output.** In simulated mode the replies are authored recreations informed by public reporting. They are written to be *characteristic*, not verbatim. Don't quote them as things a model said — for that, use live mode.
- **Not a scored quiz.** There are no right answers and nothing is graded. The Index scores compatibility, not performance.

---

## Privacy

Everything is client-side. Runs are stored in `localStorage` under `copacetic.runs.v1`; the OpenRouter key, if you set one, under `copacetic_openrouter_api_key`; endpoint overrides under `copacetic_openrouter_endpoints`. There is no backend, no analytics, no account. "Clear my data" on the results page deletes all of it. Clearing site data does the same.

---

## Limits worth knowing

- Twelve events is a short instrument. Treat the dials as a strong starting draft for your custom instructions, not a settled measurement — and re-run it, since the scenario pool varies between runs.
- The simulated voices are recreations, and models change. A profile reflects behaviour documented at a point in time; live mode is the only way to see what a model does today.
- Reported cost is self-assessed, which is the point — but it means the Index reflects how a run *felt*, not an objective measurement.
- Tier 4 involves genuinely heavy material. It is content-noted and fully skippable; skipping substitutes a neutral high-pressure set with the same calibration value and no penalty.

---

## Development

The app lives in `extracted_files/app` — React 19, TypeScript, Vite, Tailwind, Framer Motion, React Router.

```bash
cd extracted_files/app
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # → dist/
```

### Repo layout

```
docs/                          the deployed static build (GitHub Pages serves this directly)
extracted_files/app/
  src/data/scenarios.ts        scenario pools, per-model voices, run assembly
  src/data/models.ts           the eight behavioural profiles
  src/data/dimensions.ts       the ten dials
  src/data/instructions.ts     dial scores → generated custom instructions
  src/lib/openrouter.ts        API key, endpoint overrides, streaming
  src/pages/                   Home, Simulator, Results, Models, Method, Connect
  src/state/runs.tsx           localStorage persistence for saved runs
```

### Deployment

The Pages workflow (`.github/workflows/pages-deploy.yml`) uploads `docs/` **as-is** on any push to `main` that touches it — it does not run a build. So a source change only reaches the live site if you rebuild and commit the output:

```bash
cd extracted_files/app && pnpm build
cp -r dist/assets/* ../../docs/assets/
cp dist/index.html ../../docs/index.html
cp dist/index.html ../../docs/404.html   # SPA fallback
```

Committing `src/` alone will not update the live site.
