# Repository Structure

This document defines the current documentation-only structure and the future plugin-template structure expected by the WinningOS `core-v0` contract.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## Repository structure (working template)

```text
README.md                 quickstart + contract summary
AGENTS.md                 repo rules for humans and agents
CREATING_A_PLUGIN.md      the fork/rename flow
IMPLEMENTATION.md         filled ten-point integration guide (example_plugin)
ROADMAP.md                slice status; slice 5 pending Core Phase 10
package.json              template toolchain (typecheck, validate, rename)
tsconfig.json             maps ONLY @/core/plugins/api -> core-stub (barrel rule)
plugin/                   THE INSTALLABLE SOURCE — the only folder that ships
  manifest.ts             WinningOSPluginManifest export (single declaration source)
  permissions.ts          PLUGIN_ID + typed permission constants
  routes/                 route components Core mounts under /p/{plugin_id}
  server/                 "use server" actions + server-only data access
  components/             plugin UI pieces (as needed)
  db/migrations/          001_init.sql ... (ordinals; install date adds timestamp)
  db/uninstall.sql        explicit purge-data script (operator-run only)
core-stub/                type-compatible stand-in for @/core/plugins/api
                          (canonical Plugin API surface; NEVER installed)
scripts/
  validate-plugin.mjs     contract validators (npm run plugin:validate)
  rename-plugin.mjs       one-shot template rename (npm run rename)
docs/                     contract references (this folder)
```

### Why `plugin/` instead of source at the repo root

Installation is `cp -R plugin/ {core}/plugins/{plugin_id}/` — one copy, nothing to exclude. Template tooling, stubs, lockfiles, and docs stay behind by construction, which keeps the deployment's `plugins/` folder pure reviewed source. This refines the original contract sketch (which listed `manifest.ts` at the repo root); WinningOS `COMPATIBILITY.md` should reflect the `plugin/` layout when next amended.

## Core integration shape

Future plugin installation into WinningOS Core follows the build-time model:

1. Include reviewed source under Core `plugins/{plugin_id}/`.
2. Add exactly one registry line to Core `config/plugins.ts`.
3. Copy plugin ordinal migrations into Core's timestamped migration history.
4. Run Core and plugin validation commands.
5. Deploy the app as one source-owned system.

There is no runtime marketplace, UI install flow, remote plugin loading, or auto-fetch behavior.

## Naming conventions

Future real plugins must use:

- `plugin_id`: stable lowercase `snake_case`
- permissions: `plugin.{plugin_id}.{action}`
- tables: `plugin_{plugin_id}_*`
- routes: `/p/{plugin_id}`
- env vars: `PLUGIN_{PLUGIN_ID}_*`

## Ownership boundaries

Core owns:

- shell
- auth and session boundary
- workspace and membership model
- role and permission grant map
- theme and branding tokens
- navigation rendering
- plugin registry and host route

Plugins own:

- plugin-specific routes under the Core host route
- plugin-specific UI and server/data access
- plugin-owned tables
- plugin permission declarations
- plugin uninstall script and validation docs

Plugins do not redefine Core identity, workspace, auth, membership, theme, navigation, or runtime installation behavior.
