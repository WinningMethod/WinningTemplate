# WinningTemplate Agent Instructions

This repository is agent-agnostic. These rules apply to human developers and AI agents working in WinningTemplate.

## Source of truth

Before changing the plugin contract or repo shape, read these WinningMethod/winningOS source files:

1. `README.md`
2. `CORE.md`
3. `AGENTS.md`
4. `COMPATIBILITY.md`
5. `PLUGIN_TEMPLATE_HANDOVER.md`
6. `IMPLEMENTATION_PLAN.md`

This repository mirrors those docs; it does not override them. If WinningTemplate and WinningOS disagree, reconcile the mismatch in a reviewed change.

## Current phase

WinningTemplate is a working template (`ROADMAP.md` slices 1–4 complete): typed manifest, permission constants, an RLS-guarded example feature, migrations, uninstall script, validators, and a rename script. Slice 5 (live integration proof) is pending WinningOS Core Phase 10. `npm run check` must stay green on every change.

## Product rules

- WinningOS plugins are build-time/source-level modules.
- WinningOS plugins are not runtime marketplace extensions.
- `core-v0` is the compatibility level for this template.
- Core owns shell, auth, workspace, membership, permissions, theme, and navigation.
- Plugins extend Core through reviewed source, one registry line, plugin-owned routes, plugin-owned permissions, and plugin-owned data.
- Business-specific workflows do not belong in Core or in this generic template scaffold.

## Repository guardrails

- Three-repository rule: this template and WinningOS Core are pristine framework repos. Plugins install only into separate deployment repos (clones of Core). Never vendor Core into this repo, and never install this plugin into `WinningMethod/winningOS` — integration proofs use a throwaway scratch deployment repo.
- Only `plugin/` ships into a deployment; keep tooling (`core-stub/`, `scripts/`, docs) outside it.
- `core-stub/plugins/api.tsx` is the canonical `core-v0` Plugin API surface. Changing its exports or signatures is a compatibility-level conversation with WinningOS Core, never a casual edit.
- Plugin source imports Core only via `@/core/plugins/api` (the tsconfig maps nothing else, so violations fail typecheck).
- Never add secrets, `.env` files, or `NEXT_PUBLIC_` secret names.
- Every behavioral contract rule belongs in `scripts/validate-plugin.mjs` as an assertion.

## Future plugin rules to preserve

Future implementation work must preserve these `core-v0` constraints from WinningOS:

- `plugin_id` is stable, lowercase `snake_case`, and never renamed after release.
- Permission keys use `plugin.{plugin_id}.{action}`.
- Plugin tables use `plugin_{plugin_id}_*`.
- RLS is enabled in the same migration that creates plugin tables.
- Server/data enforcement is required; UI hiding is never security.
- Plugin migrations may touch only their own plugin objects, their own permission seeds, their own storage bucket, and declared dependency public tables.
- Plugins import Core only through the sanctioned future Plugin API barrel.
- Uninstall has three explicit levels: disable, remove source, purge data.

## Validation

For documentation-only changes, run:

```bash
git diff --check
```

Also run file inventory checks that prove the repo remains documentation/scaffold only.

Do not claim implementation readiness until the relevant future validation commands exist and have been run in a real implementation task.

## Page loading UX

All page-loading and Suspense fallbacks use skeleton screens. Follow `LOADING_STATES.md` and the notes route example. Never import Core internal UI paths.

## Performance gate

Follow `PERFORMANCE.md` for every new page and plugin. `npm run perf:validate` is required in CI; include live loading-path verification before declaring a page ready.
