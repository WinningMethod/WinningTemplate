# Creating a WinningOS Plugin From This Template

This guide describes the future flow for turning WinningTemplate into a real plugin repository. It is intentionally documentation-only today; it does not create implementation code.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## 1. Start by forking or copying the template

Future plugin authors should create a new repository from WinningTemplate, then rename every template placeholder before writing plugin behavior.

Recommended flow:

1. Create a new private plugin repo from this template.
2. Choose a stable `plugin_id` before writing code.
3. Rename all template references from the example/template identity to the real plugin identity.
4. Fill out the plugin docs first.
5. Only then add implementation code, migrations, validators, and package files in a reviewed implementation task.

The `plugin_id` is permanent after release because it is embedded in URLs, table names, permission strings, migrations, audit events, and external documentation.

## 2. Choose the plugin identity

A valid WinningOS plugin identity must be:

- lowercase `snake_case`
- unique within a deployment
- stable forever once released
- not reserved by Core or the template

Reserved ids from the `core-v0` contract include `core`, `plugin`, `plugins`, and `example`. The template example id `example_plugin` is reserved for template/example usage and should not be reused by real business plugins.

## 3. Rename checklist

When a real plugin is created, rename every surface consistently:

- repository name and README title
- `plugin_id`
- plugin display name
- future `manifest.ts` id and metadata
- future permission constants
- every permission key using `plugin.{plugin_id}.{action}`
- every table name using `plugin_{plugin_id}_*`
- future migration filenames and migration contents
- future uninstall script references
- route paths under `/p/{plugin_id}`
- future server-only env var prefix, using `PLUGIN_{PLUGIN_ID}_*`
- docs, screenshots, validation instructions, and known limitations

Do not rename a released plugin id. If the identity is wrong after release, treat the replacement as a new plugin with an explicit migration/export plan.

## 4. Document before implementing

A real plugin's `IMPLEMENTATION.md` must state the ten points required by WinningOS `COMPATIBILITY.md`:

1. what the plugin does
2. `compatibility: core-v0` and the Core commit/tag last verified against
3. exact install steps, including source inclusion, one registry edit, and migration install command
4. required environment variables and which are server-only
5. every table and permission registered by the plugin
6. requested navigation and settings entries
7. external integrations and where secrets live
8. validation commands
9. removal at disable, remove-source, and purge-data levels
10. known limitations

## 5. Use the canonical artifacts, do not re-derive them

The manifest shape lives in `docs/MANIFEST.md`, the migration/RLS/uninstall SQL idioms in `docs/SQL_TEMPLATES.md`, and the hard-won correctness rules in `docs/SHARP_EDGES.md`. Real plugins copy these and rename; re-deriving them from memory is how the original bugs come back.

## 6. Future implementation gates

A real implementation task must add the future plugin surfaces deliberately and reviewably. The expected final plugin repo shape is documented in `docs/REPO_STRUCTURE.md`, but this current branch intentionally does not create those files.

Future plugin implementation should include:

- a manifest matching the Core `WinningOSPluginManifest` type
- typed permission constants matching the manifest
- routes and components mounted only by Core under `/p/{plugin_id}`
- server/data access through Core-approved boundaries
- migrations with workspace-scoped plugin tables and RLS
- an explicit uninstall script for purge-data removal
- validators that keep manifest, permissions, migrations, and uninstall docs in sync

## 7. Security and data rules

Every plugin must enforce security outside the UI:

- use server-side permission checks and DB-side RLS/RPC enforcement
- rely on the live Core grant map, not hardcoded role assumptions
- keep secrets server-only; never expose provider secrets through `NEXT_PUBLIC_*`
- reference Core identity and membership rather than duplicating auth
- resolve workspace context structurally, never by mutable slug
- avoid touching `core_*`, private schema, or another plugin's private tables

## 8. Dependency and shared data decisions

When a plugin needs data owned by another plugin, choose deliberately:

- depend on that plugin only if the needed table is listed in its `publicTables`
- declare the dependency in the manifest before using the data
- install dependencies first and remove dependents first
- write another plugin's data only through the owning plugin's exposed server functions or RPCs
- consider extracting shared infrastructure into a small data-owning plugin if multiple plugins need the same entity

## 9. Removal expectations

Every real plugin must document and support three removal levels:

1. Disable: remove the plugin registry line; routes, nav, and settings disappear while data remains.
2. Remove source: delete the source folder after disabling; data still remains.
3. Purge data: an operator explicitly runs the plugin's uninstall script; this is destructive and never automatic.

Audit history should retain historical `plugin.{plugin_id}.*` action strings.

## 10. Review checklist before release

Before a real plugin is released, reviewers should verify:

- source is included at build time only
- registry installation is exactly one line
- `plugin_id`, permissions, tables, routes, and env vars are consistently renamed
- manifest and docs state `compatibility: core-v0`
- RLS exists before app code reads plugin tables
- server/data boundaries enforce permissions
- uninstall expectations are explicit
- validation commands have been run against the plugin repo and a real Core integration where applicable
