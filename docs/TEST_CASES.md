# Test Cases

This document records the acceptance tests for the working template (slices 1–4 in `ROADMAP.md`) and the review gates for plugins forked from it.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## Working-template acceptance tests

Run from the repository root:

```bash
git diff --check
npm install
npm run check     # typecheck against core-stub + plugin:validate
```

Reviewer should verify:

1. `npm run check` passes untouched after a fresh clone.
2. `npm run rename -- test_plugin "Test Plugin"` followed by `npm run check` also passes (rename keeps the contract green); discard the rename afterwards.
3. Only `plugin/` is documented and used as installable source; tooling stays outside it.
4. `core-stub/plugins/api.tsx` matches the Plugin API surface in WinningOS `PLUGIN_TEMPLATE_HANDOVER.md`/`COMPATIBILITY.md`.
5. `IMPLEMENTATION.md` fills all ten contract points for `example_plugin`.
6. `plugin/db/migrations/001_init.sql` and `db/uninstall.sql` follow `docs/SQL_TEMPLATES.md` idioms exactly (named-constraint conflicts, RLS in the creating migration, workspace scoping, approved seed points only).

## Future plugin implementation acceptance checklist

When implementation work is authorized later, reviewers should add tests for the full `core-v0` contract:

- source is included at build time under `plugins/{plugin_id}/`
- install requires exactly one Core registry line
- manifest compatibility is `core-v0`
- manifest permissions match constants, migrations, and uninstall script
- plugin tables use `plugin_{plugin_id}_*`
- plugin permissions use `plugin.{plugin_id}.{action}`
- RLS is enabled in the same migration that creates each table
- DB/server enforcement exists for all privileged reads and writes
- UI hiding is treated only as UX, not security
- no plugin migration alters Core tables or private schema
- secrets are server-only and never `NEXT_PUBLIC_*`
- routes live under `/p/{plugin_id}`
- disable-level removal works by removing the registry line
- purge-data removal is explicit, destructive, and never automatic
- cross-plugin dependencies: every `dependsOn` target is registered earlier in Core's `config/plugins.ts`, every cross-plugin FK targets a declared `publicTables` entry, FK delete behavior is documented, and uninstall ordering is dependents-first
- manifest `publicTables`/`dependsOn` match the migrations' actual foreign keys
- validators and Core integration checks pass against a real Core deployment when available
