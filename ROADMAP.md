# WinningTemplate Roadmap

The documentation scaffold is slice 1, not the destination. `PLUGIN_TEMPLATE_HANDOVER.md` in WinningOS commissions a **working template**: every future plugin is created by forking this repo, so this repo must end up containing runnable example code, not only prose. These slices are the committed sequence; each is a separate reviewed PR.

## Slice 1 — Documentation scaffold — DONE

Contract, repo shape, creation flow, traceability, test cases, non-goals, mirrored manifest type, SQL templates, sharp edges.

## Slice 2 — Contract artifacts — DONE

- `manifest.ts` exporting the example manifest (mirrored type until Core Phase 10 ships the importable one; `publicTables` lists the example table, `dependsOn: []` with a commented example).
- `permissions.ts` with typed constants matching the manifest.
- `db/migrations/001_init.sql` and `db/uninstall.sql` copied from `docs/SQL_TEMPLATES.md`.
- `package.json` + `tsconfig.json` minimal scaffold so the repo typechecks.
- Shipped with one layout refinement over the original contract sketch: the installable source lives under `plugin/` (copied verbatim into `plugins/{plugin_id}/`), keeping template tooling (`core-stub/`, `scripts/`, docs) out of deployments.

## Slice 3 — Example feature — DONE

A deliberately boring workspace-scoped notes list (create / view / manage) exercising every contract surface: `routes/` components, `server/` actions with `"use server"` + permission gates, `components/` UI matching Core's kit, audit events (`plugin.example_plugin.*`).

## Slice 4 — Validators and creation guide hardening — DONE

- `npm run plugin:validate` (string-assertion style, mirroring Core): manifest ↔ permissions ↔ migrations ↔ uninstall lockstep; RLS enabled in creating migrations; no `NEXT_PUBLIC_` secrets; no `core_` DDL; no slug resolution; named-constraint conflicts only; every `docs/SHARP_EDGES.md` rule that can be asserted, asserted.
- `CREATING_A_PLUGIN.md` gains the executable rename checklist verification.

## Slice 5 — Integration proof — DONE

Create a **scratch deployment repo** (third repo: clone of WinningOS Core; never install into the Core or template framework repos) and install the template there: copy `plugin/` to `plugins/example_plugin/`, one registry line in `config/plugins.ts`, install migrations, `db push`, run Core's acceptance checklist from `COMPATIBILITY.md`, verify disable-level removal (delete the registry line → Core builds, `/p/example_plugin` 404s, nav gone). File issues against whichever repo violates the contract — the contract wins arguments; PRs change the contract.

Outcome (2026-07-05): proven live on the AcmeCo deployment repo against a dedicated Supabase project (AcmeCo issue #1: 32/32 acceptance checks + 7/7 disable-level removal checks). The run filed and fixed issues #5 (author display name) and #6 (delete RLS wider than the manage gate) — corrected here as migration `002_require_manage_for_delete` and plugin v0.1.1.

## Definition of done (from the handover)

The template is done when the acceptance checklist passes on a live deployment, disable-level removal is verified, and a second agent can produce a new working plugin from this repo by following `CREATING_A_PLUGIN.md` **without asking questions**.

## Core 0.2.0 portability slice

Adds matched manifest/API declarations, metadata/import/document checks and the
paired scratch integration entrypoint. Credential-free install/removal/build proof is
separate from the still-required live database/role acceptance. This template
remains a single example plugin, never a deployment or a vendor copy of Core.
