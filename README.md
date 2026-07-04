# WinningTemplate

WinningTemplate is the working base every WinningOS build-time plugin starts from. Clone it, rename it, and you have a contract-complete plugin skeleton: typed manifest, permission constants, an RLS-guarded example feature, migrations, an uninstall script, and validators that enforce the `core-v0` contract mechanically.

## Quickstart

```bash
git clone <this repo> my_plugin && cd my_plugin
npm install
npm run check                       # typecheck + contract validators (should pass untouched)
npm run rename -- my_plugin "My Plugin"
npm run check                       # still green after the rename
# now replace the example notes feature with yours, keeping the structure
```

Only the `plugin/` folder ever ships into a Core deployment. `core-stub/`, `scripts/`, `docs/`, and the package files are template tooling.

## Current status

- Scope: working template (`ROADMAP.md` slices 1–4 complete).
- Compatibility target: `core-v0`.
- Plugin model: source-level modules included at build time, not runtime marketplace extensions.
- Standalone: typechecks against `core-stub/` (the canonical Plugin API surface) and passes `plugin:validate`; runs only inside a Core deployment.
- Pending: live integration proof once WinningOS Core ships Phase 10 (`ROADMAP.md` slice 5).

## WinningOS source documents

This scaffold is grounded in these WinningMethod/winningOS source files:

- `README.md` — build-time modularity, Core status, and foundational documents.
- `CORE.md` — Core responsibilities, non-goals, Supabase assumptions, permissions, theme, and plugin timing.
- `AGENTS.md` — agent-agnostic contribution rules, validation expectations, and plugin guardrails.
- `COMPATIBILITY.md` — the `core-v0` build-time plugin contract.
- `PLUGIN_TEMPLATE_HANDOVER.md` — template repo requirements, future validator expectations, SQL/RLS sharp edges, and creation workflow.
- `IMPLEMENTATION_PLAN.md` — Phase 10 plugin-host primitives and Core sequencing.

## Contract rules the template enforces When that happens, it must still follow the `core-v0` contract:

- stable lowercase `snake_case` `plugin_id`
- permission keys shaped as `plugin.{plugin_id}.{action}`
- plugin-owned tables shaped as `plugin_{plugin_id}_*`
- source included before build under `plugins/{plugin_id}/`
- exactly one Core registry line in `config/plugins.ts`
- routes mounted under `/p/{plugin_id}`
- Core imports only through the future `@/core/plugins/api` barrel
- RLS and server/data enforcement; UI hiding is never the security boundary
- explicit disable, remove-source, and purge-data uninstall levels

## What this repository must not contain

- business-specific workflows (those belong in real plugins forked from here)
- runtime marketplace assumptions, install UI, or remote plugin loading
- direct Core imports around the `@/core/plugins/api` barrel (the tsconfig makes these fail typecheck)
- secrets, `.env` files, or `NEXT_PUBLIC_`-prefixed secret names

## Documentation map

- `AGENTS.md` — repo-wide contribution rules.
- `CREATING_A_PLUGIN.md` — future fork/rename flow for creating a real plugin from the template.
- `IMPLEMENTATION.md` — the filled ten-point integration guide for the example plugin.
- `docs/CONTRACT_TRACEABILITY.md` — template surfaces mapped back to WinningOS source docs.
- `docs/TEST_CASES.md` — acceptance tests for this documentation-only branch and future review gates.
- `docs/REPO_STRUCTURE.md` — intended documentation-only and future plugin repo shape.
- `docs/NON_GOALS.md` — explicit non-goals and out-of-scope work.
- `docs/MANIFEST.md` — the mirrored `WinningOSPluginManifest` interface and field rules.
- `docs/SQL_TEMPLATES.md` — the canonical migration/RLS/uninstall SQL idioms, to be copied verbatim in the implementation slice.
- `docs/SHARP_EDGES.md` — the ten rules distilled from real WinningOS production bugs.
- `ROADMAP.md` — the committed slice sequence from documentation scaffold to working template.
