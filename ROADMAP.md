# WinningTemplate Roadmap

The documentation scaffold is slice 1, not the destination. `PLUGIN_TEMPLATE_HANDOVER.md` in WinningOS commissions a **working template**: every future plugin is created by forking this repo, so this repo must end up containing runnable example code, not only prose. These slices are the committed sequence; each is a separate reviewed PR.

## Slice 1 — Documentation scaffold (this repo today)

Contract, repo shape, creation flow, traceability, test cases, non-goals, mirrored manifest type, SQL templates, sharp edges.

## Slice 2 — Contract artifacts

- `manifest.ts` exporting the example manifest (mirrored type until Core Phase 10 ships the importable one; `publicTables` lists the example table, `dependsOn: []` with a commented example).
- `permissions.ts` with typed constants matching the manifest.
- `db/migrations/001_init.sql` and `db/uninstall.sql` copied from `docs/SQL_TEMPLATES.md`.
- `package.json` + `tsconfig.json` minimal scaffold so the repo typechecks.

## Slice 3 — Example feature

A deliberately boring workspace-scoped notes list (create / view / manage) exercising every contract surface: `routes/` components, `server/` actions with `"use server"` + permission gates, `components/` UI matching Core's kit, audit events (`plugin.example_plugin.*`).

## Slice 4 — Validators and creation guide hard-ening

- `npm run plugin:validate` (string-assertion style, mirroring Core): manifest ↔ permissions ↔ migrations ↔ uninstall lockstep; RLS enabled in creating migrations; no `NEXT_PUBLIC_` secrets; no `core_` DDL; no slug resolution; named-constraint conflicts only; every `docs/SHARP_EDGES.md` rule that can be asserted, asserted.
- `CREATING_A_PLUGIN.md` gains the executable rename checklist verification.

## Slice 5 — Integration proof (requires Core Phase 10)

Install the template into a real Core deployment: copy source to `plugins/example_plugin/`, one registry line in `config/plugins.ts`, install migrations, `db push`, run Core's acceptance checklist from `COMPATIBILITY.md`, verify disable-level removal (delete the registry line → Core builds, `/p/example_plugin` 404s, nav gone). File issues against whichever repo violates the contract — the contract wins arguments; PRs change the contract.

## Definition of done (from the handover)

The template is done when the acceptance checklist passes on a live deployment, disable-level removal is verified, and a second agent can produce a new working plugin from this repo by following `CREATING_A_PLUGIN.md` **without asking questions**.
