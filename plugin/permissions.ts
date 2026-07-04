// Permission constants for example_plugin. The single place the keys are
// spelled; the manifest, server code, and RLS policies all reference these
// exact strings. Format: plugin.{plugin_id}.{action} (COMPATIBILITY.md).
// scripts/validate-plugin.mjs asserts this file, manifest.ts, and
// db/migrations stay in lockstep.

import type { PluginPermissionKey } from "@/core/plugins/api"

export const PLUGIN_ID = "example_plugin"

export const PERMISSIONS = {
  view: "plugin.example_plugin.view",
  create: "plugin.example_plugin.create",
  manage: "plugin.example_plugin.manage",
} as const satisfies Record<string, PluginPermissionKey>

export type ExamplePluginPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
