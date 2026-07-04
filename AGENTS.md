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

WinningTemplate is currently documentation/scaffold only. The approved scope is to document the future template contract without creating real plugin implementation code.

## Product rules

- WinningOS plugins are build-time/source-level modules.
- WinningOS plugins are not runtime marketplace extensions.
- `core-v0` is the compatibility level for this template.
- Core owns shell, auth, workspace, membership, permissions, theme, and navigation.
- Plugins extend Core through reviewed source, one registry line, plugin-owned routes, plugin-owned permissions, and plugin-owned data.
- Business-specific workflows do not belong in Core or in this generic template scaffold.

## Documentation-only guardrail

Do not add any of the following unless a later task explicitly authorizes implementation work:

- package files or dependency manifests
- generated app/framework scaffolds
- real plugin source code
- real Supabase migrations or uninstall SQL
- executable validators or scripts
- secrets, environment files, or auth/provider configuration

Allowed work in this phase: Markdown documentation and documentation-only placeholder directories with their own `README.md` files.

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
