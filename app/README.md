# ResearchPeps

Protocol-aware bloodwork interpretation for bodybuilders and biohackers. You
enter your current protocol (AAS, peptides, HGH, SARMs, supplements) and your
lab results, and the app explains each flagged value in the context of what
you're taking — instead of a generic "out of range" note.

**Educational tool only. Not medical advice, not a diagnosis.**

## How it works

1. **Deterministic rule engine** (`src/lib/rules/engine.ts`) — pure functions
   that match lab flags (high/low/normal, computed from sex-specific
   reference ranges) against the user's protocol, producing structured
   `Insight`s with severity, source facts, and related compounds. This is
   the layer that's actually "correct" — transparent and auditable.
2. **LLM explanation layer** (`src/lib/llm/explain.ts`) — turns the
   rule engine's structured facts into plain-language prose. If
   `ANTHROPIC_API_KEY` is not set, it falls back to a deterministic template
   that stitches the same facts into readable sentences, so the app fully
   works without an API key.

The LLM is only ever asked to *phrase* facts the rule engine already
computed — it's not asked to invent associations.

## Getting started

```bash
npm install
npx prisma db push   # creates prisma/dev.db (SQLite)
npx prisma db seed   # loads the compound + biomarker catalog
npm run dev
```

Open http://localhost:3000. This MVP is single-user (no auth) — there's one
demo profile shared by whoever runs the app locally.

### Optional: LLM narrative

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-5   # optional, this is the default
```

Without a key, interpretation pages still work — they use the template
fallback instead of a model-generated narrative.

## Data model

- `Compound` / `Biomarker` — seeded catalogs (`prisma/seed.ts`) covering
  common AAS, peptides, HGH, SARMs, ancillaries, and the biomarkers most
  relevant to monitoring them.
- `ProtocolItem` — a user's current protocol (compound + dose + frequency).
- `LabPanel` / `LabResult` — one lab draw and its values.

## What's not built yet

- Auth / multi-user accounts
- PDF/OCR lab upload (currently manual entry only)
- Trend charts across panels
- "Protocol simulator" (what-if dosing questions)
- Any real medical/clinical review of the rule set — the seeded reference
  ranges and rules are general-purpose starting points, not sourced from a
  clinician review, and should be treated as a scaffold to refine, not a
  finished product.
