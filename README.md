# Fluxion Workbench (MVP)

## Quickstart

```bash
npm install
npm run dev:workbench   # Next.js UI on http://localhost:3000
npm run dev:runtime     # Fastify orchestrator on http://localhost:4000
```

* Workbench UI: http://localhost:3000
* Runtime API:  http://localhost:4000/health

Set `NEXT_PUBLIC_RUNTIME_URL` if you expose the runtime on a different host/port.

## Local-first storage

Flow specs and run logs live under `data/`. Copy one of the starter templates into your workspace by opening a flow URL (e.g. `/support-triage`) and clicking **Initialize Flow**. Each execution appends a record to `data/runs/<flowId>.json`, which also powers the in-product run history tab.

## Policy-aware nodes

Built-in nodes now consult the egress allowlist defined via `FLUXION_HTTP_ALLOWLIST` (see `.env.example`). HTTP calls that are not explicitly permitted are blocked by default.

## Evaluations

Define golden sets in `evals/*.yaml` and run them locally:

```bash
npm run evals
```

The harness resolves flows from `data/flows`, runs each case, and reports pass/fail per suite.

## Build

```bash
npm run build
```

This compiles all workspace packages and the Next.js application before producing a production build.
# FluxionWS_v2
