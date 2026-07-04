# The Plugin Manifest

This is the mirrored `WinningOSPluginManifest` interface from WinningOS `COMPATIBILITY.md` (`core-v0`). The template keeps this copy in lockstep with Core until Core ships the importable type in `core/plugins/manifest.ts` (Phase 10); after that, plugins import the type and this document becomes commentary only. If this copy and Core's `COMPATIBILITY.md` ever disagree, Core wins and this file is the bug.

This is documentation for the current scaffold phase; the real `manifest.ts` export arrives with the implementation slice in `ROADMAP.md`.

```ts
export type WinningOSPluginManifest = {
  /** Stable snake_case id. Never changes after first release. */
  id: string
  /** Human display name. */
  name: string
  /** Plugin semver. */
  version: string
  /** Compatibility level this plugin was built and verified against. */
  compatibility: "core-v0"
  /** Every permission the plugin registers. Format: plugin.{id}.{action}. */
  permissions: {
    key: `plugin.${string}.${string}`
    name: string
    description: string
    /** Default role grants seeded by the plugin's migration. */
    defaultRoles: ("owner" | "admin" | "member" | "viewer")[]
  }[]
  /** Navigation entries Core MAY render (Core decides placement/order). */
  navigation: {
    label: string
    /** Path under the plugin host: /p/{id}{path}. Use "" for the root. */
    path: string
    /** lucide-react icon name; Core resolves it, falls back to a generic icon. */
    icon: string
    /** Permission required to see the entry. */
    permission: `plugin.${string}.${string}`
  }[]
  /** Route table: path under /p/{id} → React component (server or client). */
  routes: Record<string, React.ComponentType>
  /** Optional Settings → Plugins panel. */
  settings?: {
    label: string
    permission: `plugin.${string}.${string}`
    component: React.ComponentType
  }
  /** Every table the plugin owns. Must match db/migrations exactly. */
  tables: `plugin_${string}`[]
  /**
   * Tables this plugin exposes as its stable interface. Other plugins may
   * read and foreign-key ONLY these. Schema changes to public tables are
   * breaking (major version). Omit/empty = nothing shared.
   */
  publicTables?: `plugin_${string}`[]
  /**
   * Plugins this plugin builds on. Dependencies must be installed first,
   * uninstalled after, and expose what this plugin uses via publicTables.
   */
  dependsOn?: { pluginId: string; minVersion: string }[]
}
```

## Field rules

- The manifest is the **single source of declarations**. Validators compare it against `permissions.ts`, `db/migrations/`, and `db/uninstall.sql`; drift fails review.
- `routes` keys are plugin-relative (`""`, `"/new"`, `"/items/[id]"`). Core mounts them under `/p/{plugin_id}`, so collisions with Core or other plugins are structurally impossible.
- `compatibility` is a literal type: installing a plugin against a Core with a different level is a **build-time type error**, not a runtime surprise.
- The template's own manifest must declare its example table in `publicTables` (the template demonstrates *being* a dependency) and ship `dependsOn: []` with a commented example (`{ pluginId: "crm", minVersion: "1.0.0" }`).
