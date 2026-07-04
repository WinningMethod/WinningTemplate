# Test Cases

This document records the acceptance tests for the WinningTemplate documentation/scaffold phase (slice 1 in `ROADMAP.md`) and the future review gates for real plugin implementation.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## Documentation-scaffold acceptance tests

Reviewer should verify the following:

1. `WinningMethod/WinningTemplate` exists as a private repo.
2. `WinningMethod/winningOS` has no changes from this workflow.
3. The repo contains documentation/scaffold files only.
4. No real plugin implementation code exists.
5. No real Supabase migrations exist.
6. No package/app scaffold exists.
7. Docs cite the WinningOS source files used.
8. `CREATING_A_PLUGIN.md` explains the future rename/fork flow.
9. `IMPLEMENTATION.md` is a worked documentation plan, not implementation code.
10. `docs/CONTRACT_TRACEABILITY.md` maps planned template surfaces back to WinningOS docs.
11. `docs/TEST_CASES.md` includes these acceptance tests.

## Suggested verification commands

Run from the WinningTemplate repository root:

```bash
git diff --check
find . -path ./.git -prune -o -type f -print | sort
find . -path ./.git -prune -o -type f ! -name '*.md' -print | sort
find . -path ./.git -prune -o -type f \( -name 'package.json' -o -name 'package-lock.json' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' -o -name 'next.config.*' -o -name 'tsconfig.json' -o -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.sql' \) -print | sort
```

Expected result for the documentation-scaffold phase:

- `git diff --check` exits successfully.
- File inventory contains only Markdown documentation files outside `.git`.
- Non-Markdown inventory is empty.
- Package/app/code/migration inventory is empty.

Run from the WinningOS repository root or verify with a fresh clone/status check:

```bash
git status --short
```

Expected result: no changes from this workflow.

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
