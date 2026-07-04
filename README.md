# WinningTemplate

WinningTemplate is the documentation/scaffold-only starting point for future WinningOS build-time plugin repositories.

This repository is intentionally not a working plugin yet. It records the contract, repo shape, review gates, and future creation workflow that a real plugin must follow before source code, migrations, package files, or app scaffolding are added.

## Current status

- Scope: documentation/scaffold only.
- Compatibility target: `core-v0`.
- Plugin model: source-level modules included at build time, not runtime marketplace extensions.
- Repo state: no real plugin implementation code, no Supabase migrations, no Next.js/app scaffold, and no package scaffold.

## WinningOS source documents

This scaffold is grounded in these WinningMethod/winningOS source files:

- `README.md` — build-time modularity, Core status, and foundational documents.
- `CORE.md` — Core responsibilities, non-goals, Supabase assumptions, permissions, theme, and plugin timing.
- `AGENTS.md` — agent-agnostic contribution rules, validation expectations, and plugin guardrails.
- `COMPATIBILITY.md` — the `core-v0` build-time plugin contract.
- `PLUGIN_TEMPLATE_HANDOVER.md` — template repo requirements, future validator expectations, SQL/RLS sharp edges, and creation workflow.
- `IMPLEMENTATION_PLAN.md` — Phase 10 plugin-host primitives and Core sequencing.

## What WinningTemplate will become

A future implementation pass may turn this documentation scaffold into an example plugin template. When that happens, it must still follow the `core-v0` contract:

- stable lowercase `snake_case` `plugin_id`
- permission keys shaped as `plugin.{plugin_id}.{action}`
- plugin-owned tables shaped as `plugin_{plugin_id}_*`
- source included before build under `plugins/{plugin_id}/`
- exactly one Core registry line in `config/plugins.ts`
- routes mounted under `/p/{plugin_id}`
- Core imports only through the future `@/core/plugins/api` barrel
- RLS and server/data enforcement; UI hiding is never the security boundary
- explicit disable, remove-source, and purge-data uninstall levels

## What this repository must not contain yet

Until a reviewed implementation task explicitly authorizes it, do not add:

- real plugin source files
- `manifest.ts`, `permissions.ts`, route components, server actions, or UI components
- `db/migrations/*.sql` or `db/uninstall.sql`
- `package.json`, lockfiles, framework config, or generated app scaffold
- Next.js, Supabase, or validator implementation code
- business-specific workflows
- runtime marketplace assumptions

## Documentation map

- `AGENTS.md` — repo-wide contribution rules.
- `CREATING_A_PLUGIN.md` — future fork/rename flow for creating a real plugin from the template.
- `IMPLEMENTATION.md` — worked documentation plan for the future template implementation.
- `docs/CONTRACT_TRACEABILITY.md` — template surfaces mapped back to WinningOS source docs.
- `docs/TEST_CASES.md` — acceptance tests for this documentation-only branch and future review gates.
- `docs/REPO_STRUCTURE.md` — intended documentation-only and future plugin repo shape.
- `docs/NON_GOALS.md` — explicit non-goals and out-of-scope work.
