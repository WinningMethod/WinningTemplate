# WinningTemplate Implementation Plan

This is a worked documentation plan for the future WinningTemplate implementation. It is not implementation code and does not authorize adding package files, app scaffolding, migrations, or executable validators in the current documentation-only branch.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## Purpose

WinningTemplate should become the starting point for future WinningOS build-time plugins. It must teach plugin authors how to satisfy the `core-v0` contract before they build real plugin behavior.

## Compatibility target

```text
core-v0
```

`core-v0` is a compatibility level, not a product version. Future template implementation must treat compatibility drift as a reviewed contract change, not a silent edit.

## Future plugin identity

The template may use an example identity for demonstration, but a real plugin created from the template must choose a permanent lowercase `snake_case` `plugin_id` before implementation begins.

The chosen id drives:

- route prefix: `/p/{plugin_id}`
- permission keys: `plugin.{plugin_id}.{action}`
- database tables: `plugin_{plugin_id}_*`
- audit event names: `plugin.{plugin_id}.{event}`
- server-only env var prefix: `PLUGIN_{PLUGIN_ID}_*`

## Planned future surfaces

The future implementation plan may include these surfaces, each added in a separate reviewed slice:

1. Plugin manifest documentation and, later, a real manifest export.
2. Permission constant documentation and, later, typed permission constants.
3. Route/component examples mounted only by Core under `/p/{plugin_id}`.
4. Server/data examples that use Core-approved session and permission helpers.
5. Database migration examples that create only plugin-owned tables and enable RLS immediately.
6. Explicit uninstall documentation and, later, a destructive operator-run uninstall script.
7. Validators that check manifest, permissions, migrations, uninstall behavior, secrets, and naming conventions.
8. Integration instructions for source inclusion plus one Core registry line.

The current branch creates only the documentation for these surfaces.

## Future install documentation requirements

A real plugin's install guide must explain:

- source inclusion by copy or subtree under Core `plugins/{plugin_id}/`
- one registry line in Core `config/plugins.ts`
- migration installation by copying ordinal plugin migrations into Core's timestamped migration history
- validation through plugin commands and Core typecheck/build/validators once available
- no runtime fetching, UI install flow, marketplace, or unreviewed remote code execution

## Future data and permission plan

Future plugin docs and implementation must list every permission and table.

Permissions must:

- use `plugin.{plugin_id}.{action}`
- be registered by the plugin's first migration
- be denied by default when not granted
- be enforced by server/data boundaries, not just UI hiding
- read the live Core grant map rather than hardcoding role behavior

Tables must:

- use `plugin_{plugin_id}_*`
- include `workspace_id` references to Core workspaces
- include `created_at` and `updated_at` conventions where appropriate
- enable RLS in the same migration that creates the table
- reference Core profile/membership identity rather than `auth.users` directly
- avoid changing Core tables or private schemas

## Future navigation and settings plan

Core owns the shell and final rendering. A plugin may request navigation and settings entries through its manifest, but Core decides placement, permission-gates entries, and removes them when the registry line is removed.

A plugin must not:

- replace Core navigation
- reorder Core Home, Members, or Settings entries
- add workspace switching or auth controls
- put provider/API-key fields into Core-owned settings areas
- render outside its `/p/{plugin_id}` subtree except via declared settings panels

## Future removal plan

The template must teach three explicit removal levels:

1. Disable: remove the registry line.
2. Remove source: delete `plugins/{plugin_id}/` after disabling.
3. Purge data: explicitly run the plugin's uninstall SQL.

Disable and remove-source must not automatically delete data. Purge-data is operator-owned, destructive, and reviewed separately.

## Future validation plan

Future validators should assert the documented contract instead of relying on reviewer memory. Planned checks include:

- manifest compatibility equals `core-v0`
- manifest permissions match permission constants and migrations
- manifest tables match migrations and uninstall script
- RLS is enabled for every plugin table
- no `NEXT_PUBLIC_` secret names are used for server secrets
- no plugin migration alters Core tables or private schemas
- workspace resolution does not depend on mutable slugs
- cross-plugin dependencies reference declared `publicTables`
- disable-level removal is documented and testable

## Known limitations of this branch

- No plugin code exists.
- No migrations exist.
- No validators exist.
- No package manager or framework scaffold exists.
- Core Phase 10 host primitives are documented as future surfaces, not consumed here.

This is deliberate. The current deliverable is a reviewer-ready documentation scaffold only.
