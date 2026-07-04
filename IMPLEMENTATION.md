# Example Plugin — Integration Guide

The worked `IMPLEMENTATION.md` required by WinningOS `COMPATIBILITY.md` (`core-v0`), filled in for `example_plugin` so template users have a real example, not a blank form. When you fork this template, rewrite every section for your plugin (start with `npm run rename -- your_plugin_id "Your Name"`).

## 1. What the plugin does

A deliberately boring workspace-scoped notes list: members with permission can view notes, create notes, and (with the manage grant) delete any note. It exists to exercise every `core-v0` contract surface — manifest, three permissions on the live grant map, one RLS-guarded table, navigation entry, settings panel, audit events, and three-level removal — with zero business complexity.

## 2. Compatibility

`compatibility: core-v0`. Last verified against WinningOS Core: *(set the Core commit/tag here at each release; first live verification happens when Core Phase 10 ships — see `ROADMAP.md` slice 5).*

## 3. Install steps

Installs target a **deployment repo** — a third repo created by cloning WinningOS Core, one per company OS (or a throwaway scratch clone for integration testing). Never install into `WinningMethod/winningOS` or this template repo; both stay pristine framework repos (three-repository model in WinningOS `COMPATIBILITY.md`).

```bash
# 0. Have a deployment repo: a clone of WinningOS Core with its own
#    Supabase project and hosting (e.g. acme-os).

# 1. Bring the installable source (only the plugin/ folder ships):
cp -R plugin/ {deployment-repo}/plugins/example_plugin/

# 2. Register it — the ONE Core edit:
#    In {deployment-repo}/config/plugins.ts:
#      import examplePlugin from "@/plugins/example_plugin/manifest"
#      export const installedPlugins = [examplePlugin]

# 3. Install migrations (install date supplies the timestamp):
cp plugin/db/migrations/001_init.sql \
   {deployment-repo}/supabase/migrations/$(date +%Y%m%d%H%M%S)_plugin_example_plugin_001_init.sql
cd {deployment-repo} && npx supabase db push

# 4. Verify:
npm run typecheck && npm run build && npm run plugins:validate
```

Everything outside `plugin/` (core-stub, scripts, docs, package files) is template tooling and is never copied into a deployment.

## 4. Environment variables

None. A real plugin that needs secrets uses server-only names prefixed `PLUGIN_EXAMPLE_PLUGIN_*`, documents each one here, and never uses `NEXT_PUBLIC_*`.

## 5. Tables and permissions

Tables (all workspace-scoped, RLS enabled in the creating migration):

| Table | Public? | Purpose |
|---|---|---|
| `plugin_example_plugin_notes` | yes (`publicTables`) | The notes list; other plugins may `dependsOn` this plugin and foreign-key it |

Permissions (registered by `001_init.sql`, deny-by-default, owner-editable in Settings → Roles):

| Key | Default roles |
|---|---|
| `plugin.example_plugin.view` | admin, member, viewer |
| `plugin.example_plugin.create` | admin, member |
| `plugin.example_plugin.manage` | admin |

**Core-side requirement:** the insert policy uses `private.core_current_profile_id()`, which Core must EXECUTE-grant to `authenticated` (WinningOS Phase 10, task 8). Without it, inserts fail loudly with `permission denied`.

## 6. Navigation and settings

One nav entry ("Example", icon `StickyNote`, gated on `plugin.example_plugin.view`) rendered by Core in the Plugins sidebar group; one settings panel under Settings → Plugins → Example Plugin. Both come from `plugin/manifest.ts`; Core decides placement.

## 7. External integrations and secrets

None. The plugin talks only to the deployment's own Supabase project through Core's clients.

## 8. Validation commands

```bash
npm install
npm run check        # typecheck (standalone, via core-stub) + plugin:validate
```

`plugin:validate` asserts the contract mechanically: manifest ↔ permissions ↔ migrations ↔ uninstall lockstep, RLS in creating migrations, workspace scoping, barrel-only Core imports, named-constraint conflicts, no `core_*` DDL, no slug resolution, no `NEXT_PUBLIC_` secrets, audit events namespaced. Migrations must additionally be executed against a real Supabase project before any release — statically valid SQL still fails live (WinningOS #49).

## 9. Removal

1. **Disable** — delete the registry line from `config/plugins.ts`. `/p/example_plugin` 404s, the nav entry and settings panel disappear, Core builds. Data and grants remain.
2. **Remove source** — also delete `plugins/example_plugin/`.
3. **Purge data** — operator explicitly runs `plugin/db/uninstall.sql` (drops the notes table, deletes this plugin's permission and grant rows). Never automatic. If other plugins `dependsOn` this one, run their uninstall scripts first.

## 10. Known limitations

- Standalone, this repo typechecks against `core-stub/` (the canonical Phase 10 API surface) but does not run; plugin code executes only inside a Core deployment.
- Live integration proof is pending WinningOS Core Phase 10 (registry, host route, API barrel) — `ROADMAP.md` slice 5.
- The notes UI is intentionally minimal; it demonstrates boundaries, not product polish.
