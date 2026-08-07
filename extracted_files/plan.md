# COPACETIC — AI Tone Simulator & Working-Style Profiler

## Mission
Build an interactive web app that fixes AI tone **from the user side**: instead of a quiz, users
play through branching simulations of real AI-interaction events (mundane → extreme). The
simulated AI responds according to a research-backed behavior profile of the model being tested
(GPT, Claude, Gemini, Grok, Qwen, DeepSeek, Kimi). The app reads HOW the user reacts — what
triggers them, what they tolerate, how they push back — and outputs tailored custom
instructions / base prompts per model. Goal: the most copacetic human↔AI working relationship.

## Core loop
1. Pick target AI system (7 profiles).
2. Play scenario tiers: Mundane → Friction → High-Stakes → Extreme. Each scenario is a live
   event (AI response rendered in that model's documented voice), with user choices, free-text
   pushback, and tolerance reactions.
3. Engine tracks working-style dimensions: directness, anti-sycophancy, receipt-demand,
   verbosity tolerance, disclaimer tolerance, warmth vs. distance preference, patience budget,
   stakes sensitivity, correction style.
4. Output: Copacetic Index per model + generated custom instructions tuned per model
   (different prompt for Claude vs GPT vs Grok, etc.), exportable/copyable.

## Stage 1 — Research (parallel explore agents, background)
- Agent A: ChatGPT/GPT + Claude documented tone/behavior patterns
- Agent B: Gemini + Grok
- Agent C: Qwen + DeepSeek + Kimi
- Collect: sycophancy, hedging/disclaimer habits, refusal behavior, verbosity/formatting,
  emotional-context handling, error admission, known incidents (e.g., GPT-4o sycophancy
  rollback), characteristic phrases. Output: structured profile brief per model.

## Stage 2 — Scenario engine design (orchestrator)
- Scenario taxonomy + branching structures + working-style measurement model.
- Built while research runs; profiles plug in when Stage 1 lands.

## Stage 3 — Build (vibecoding-webapp-swarm, loaded at stage start)
- Design-first React + Vite + TS + Tailwind. Dark, low-saturation, warm, game-like UI.
- Static-only (no backend): profiles + scenarios as bundled JSON/TS data; results computed
  client-side; localStorage persistence; export/copy prompt output.
- Configure Vite base for GitHub Pages compatibility.

## Stage 4 — Delivery
- website_version_manager build_version (type: static) → version card preview.
- Export production build as static bundle to /mnt/agents/output/ + KIMI_REF.
