// The manifest is the single source of declarations for this plugin
// (COMPATIBILITY.md core-v0). Core's registry imports this default export;
// routes, navigation, settings, permissions, and tables all derive from it.
// scripts/validate-plugin.mjs asserts it matches permissions.ts and
// db/migrations exactly.

import type { WinningOSPluginManifest } from "@/core/plugins/api"
import { PERMISSIONS, PLUGIN_ID } from "./permissions"
import { NotesPage } from "./routes/notes-page"
import { NewNotePage } from "./routes/new-note-page"
import { ExamplePluginSettingsPanel } from "./routes/settings-panel"

const manifest: WinningOSPluginManifest = {
  id: PLUGIN_ID,
  name: "Example Plugin",
  version: "0.1.1",
  compatibility: "core-v0",
  minCoreVersion: "0.2.0",
  publicApi: [],
  jobs: {},

  permissions: [
    {
      key: PERMISSIONS.view,
      name: "View example notes",
      description: "See the example plugin's notes list.",
      defaultRoles: ["admin", "member", "viewer"],
    },
    {
      key: PERMISSIONS.create,
      name: "Create example notes",
      description: "Create notes in the example plugin.",
      defaultRoles: ["admin", "member"],
    },
    {
      key: PERMISSIONS.manage,
      name: "Manage example notes",
      description: "Delete any note in the example plugin.",
      defaultRoles: ["admin"],
    },
  ],

  navigation: [
    {
      label: "Example",
      path: "",
      icon: "StickyNote",
      permission: PERMISSIONS.view,
    },
  ],

  // Satellite plugins (Viewers, Bridges, Connectors — anything orbiting a
  // domain owner) also declare navRollup so their entries render as dropdown
  // children of the host's primary nav entry instead of top-level sidebar
  // entries. Example: navRollup: { into: "crm" }
  // This template plugin is its own host, so it declares none.

  routes: {
    "": NotesPage,
    "/new": NewNotePage,
  },

  settings: {
    label: "Example Plugin",
    permission: PERMISSIONS.view,
    component: ExamplePluginSettingsPanel,
  },

  tables: ["plugin_example_plugin_notes"],

  // This plugin demonstrates BEING a dependency: other plugins may declare
  // dependsOn: [{ pluginId: "example_plugin", minVersion: "0.1.0" }] and
  // foreign-key plugin_example_plugin_notes. Schema changes to public tables
  // are breaking (major version).
  publicTables: ["plugin_example_plugin_notes"],

  // Plugins this plugin builds on. Dependencies install first, uninstall last.
  // Example: [{ pluginId: "crm", minVersion: "1.0.0" }]
  dependsOn: [],
}

export default manifest
