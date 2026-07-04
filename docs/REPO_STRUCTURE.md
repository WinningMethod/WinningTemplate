# Repository Structure

This document defines the current documentation-only structure and the future plugin-template structure expected by the WinningOS `core-v0` contract.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## Current documentation-only structure

The WIN-16 branch should contain only Markdown documentation:

```text
README.md
AGENTS.md
CREATING_A_PLUGIN.md
IMPLEMENTATION.md
docs/
  CONTRACT_TRACEABILITY.md
  TEST_CASES.md
  REPO_STRUCTURE.md
  NON_GOALS.md
```

No implementation folders are required for this branch. Optional placeholder folders are allowed only when they contain a `README.md` and no implementation code, but this branch keeps the scaffold minimal.

## Files intentionally absent in this branch

The following are intentionally absent:

```text
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
next.config.*
tsconfig.json
manifest.ts
permissions.ts
components/
routes/
server/
db/migrations/
db/uninstall.sql
scripts/*.ts
scripts/*.js
app/
```

Their absence is part of the documentation-only acceptance criteria.

## Future full plugin repo shape

WinningOS `COMPATIBILITY.md` defines the future plugin repo shape as:

```text
README.md                 what it does, screenshots, status
IMPLEMENTATION.md         integration guide
manifest.ts               WinningOSPluginManifest export
permissions.ts            permission-string constants
components/               plugin UI
routes/                   route components mounted by Core
server/                   server actions and data access
db/migrations/            ordinal plugin migrations
db/uninstall.sql          explicit data-removal script
tests/ or scripts/        validation commands
```

That future structure must not be added until a later implementation task explicitly authorizes real plugin scaffolding.

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
