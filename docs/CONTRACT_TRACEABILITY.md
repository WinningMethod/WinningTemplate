# Contract Traceability

This document maps the planned WinningTemplate documentation and future template surfaces back to WinningMethod/winningOS source documents.

Source documents cited:

- WinningMethod/winningOS `README.md`
- WinningMethod/winningOS `CORE.md`
- WinningMethod/winningOS `AGENTS.md`
- WinningMethod/winningOS `COMPATIBILITY.md`
- WinningMethod/winningOS `PLUGIN_TEMPLATE_HANDOVER.md`
- WinningMethod/winningOS `IMPLEMENTATION_PLAN.md`

## Traceability table

| WinningTemplate surface | Contract expectation | WinningOS source |
| --- | --- | --- |
| Repository purpose | Template for future WinningOS build-time plugins; no runtime marketplace. | `README.md`, `CORE.md`, `COMPATIBILITY.md` |
| Documentation-only branch | Current branch must not create real plugin code, migrations, package scaffold, or app scaffold. | `AGENTS.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, `IMPLEMENTATION_PLAN.md` |
| Compatibility level | Template targets `core-v0`. | `COMPATIBILITY.md` |
| Plugin identity | Stable lowercase `snake_case` `plugin_id`; reserved ids avoided; id never changes after release. | `COMPATIBILITY.md` |
| Future fork/rename flow | New plugin repos start from the template and rename every id-dependent surface before implementation. | `PLUGIN_TEMPLATE_HANDOVER.md`, `COMPATIBILITY.md` |
| Manifest expectations | Future manifest is the single source of plugin declarations: id, name, version, compatibility, permissions, navigation, routes, settings, tables, public tables, dependencies. | `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| Permission keys | Plugin permissions use `plugin.{plugin_id}.{action}` and are enforced by live grants, not UI hiding. | `COMPATIBILITY.md`, `CORE.md`, `AGENTS.md`, `IMPLEMENTATION_PLAN.md` |
| Table naming | Plugin-owned tables use `plugin_{plugin_id}_*` and include workspace scoping. | `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| RLS expectations | Plugin tables enable RLS in the creating migration; RLS/RPC/server enforcement is required. | `CORE.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| Core ownership boundary | Core owns shell, auth, workspace, membership, permissions, theme, and navigation. | `CORE.md`, `COMPATIBILITY.md`, `IMPLEMENTATION_PLAN.md` |
| Navigation/settings | Plugins request entries through the manifest; Core renders and gates them. Satellites declare `navRollup: { into: host }` so their entries roll up under the host's primary entry. | `COMPATIBILITY.md`, `IMPLEMENTATION_PLAN.md` |
| Installation model | Source inclusion under Core `plugins/{plugin_id}/` plus exactly one registry line in `config/plugins.ts`; no auto-fetch or UI install. | `COMPATIBILITY.md`, `IMPLEMENTATION_PLAN.md` |
| Plugin API boundary | Future plugins import Core only through `@/core/plugins/api`. | `COMPATIBILITY.md`, `IMPLEMENTATION_PLAN.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| Secrets | Plugin secrets are server-only and named with `PLUGIN_{PLUGIN_ID}_*`; no `NEXT_PUBLIC_*` secrets. | `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| Cross-plugin dependencies | Cross-plugin reads require declared dependencies and `publicTables`; writes go through owning plugin server functions/RPCs. | `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| Uninstall expectations | Disable, remove-source, and purge-data are separate; data purge is explicit and never automatic. | `COMPATIBILITY.md`, `IMPLEMENTATION_PLAN.md` |
| Validation expectations | Future validators should assert manifest/permissions/migrations/uninstall drift, RLS, secrets, and migration boundaries. | `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md` |
| Non-goals | No business-specific workflows in Core or generic template; no runtime marketplace; no agent/chat in Core. | `CORE.md`, `AGENTS.md`, `IMPLEMENTATION_PLAN.md` |

## Current branch compliance

This branch implements only documentation files:

- `README.md`
- `AGENTS.md`
- `CREATING_A_PLUGIN.md`
- `IMPLEMENTATION.md`
- `docs/CONTRACT_TRACEABILITY.md`
- `docs/TEST_CASES.md`
- `docs/REPO_STRUCTURE.md`
- `docs/NON_GOALS.md`

It intentionally does not implement manifest, permissions, migrations, validators, app code, package files, or plugin runtime behavior.
