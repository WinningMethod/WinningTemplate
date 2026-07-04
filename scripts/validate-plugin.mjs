// Plugin contract validator (WinningOS core-v0). String-assertion style,
// mirroring Core's validators: every behavioral rule the contract cares about
// is asserted here so it cannot silently regress. Rules are derived from the
// PLUGIN_ID in plugin/permissions.ts, so they keep working after
// `npm run rename -- your_plugin_id`.

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }

  console.log(`✓ ${message}`)
}

function read(path) {
  assert(existsSync(path), `exists: ${path}`)
  return readFileSync(path, "utf8")
}

// ---------------------------------------------------------------------------
// Plugin identity
// ---------------------------------------------------------------------------
const permissionsSource = read("plugin/permissions.ts")
const idMatch = permissionsSource.match(/export const PLUGIN_ID = "([a-z][a-z0-9_]*)"/)
assert(Boolean(idMatch), "permissions.ts declares PLUGIN_ID in lowercase snake_case")
const PLUGIN_ID = idMatch[1]

const RESERVED_IDS = ["core", "plugin", "plugins", "example"]
assert(!RESERVED_IDS.includes(PLUGIN_ID), `plugin id "${PLUGIN_ID}" is not a reserved id`)

const manifest = read("plugin/manifest.ts")
assert(manifest.includes('compatibility: "core-v0"'), "manifest declares core-v0 compatibility")
assert(manifest.includes("import type { WinningOSPluginManifest }"), "manifest is typed against the Core manifest type")
assert(manifest.includes("PLUGIN_ID"), "manifest id comes from the single PLUGIN_ID constant")

// ---------------------------------------------------------------------------
// Permission keys: plugin.{id}.{action} only, manifest/constants in lockstep
// ---------------------------------------------------------------------------
const permissionKeys = [...permissionsSource.matchAll(/"(plugin\.[a-z0-9_.]+)"/g)].map((m) => m[1])
assert(permissionKeys.length > 0, "permissions.ts declares at least one permission key")

for (const key of permissionKeys) {
  assert(
    new RegExp(`^plugin\\.${PLUGIN_ID}\\.[a-z][a-z0-9_]*$`).test(key),
    `permission key ${key} matches plugin.${PLUGIN_ID}.{action}`,
  )
}

const migrationDir = "plugin/db/migrations"
const migrationFiles = readdirSync(migrationDir).filter((file) => file.endsWith(".sql")).sort()
assert(migrationFiles.length > 0, "at least one migration exists")

for (const file of migrationFiles) {
  assert(/^\d{3}_[a-z0-9_]+\.sql$/.test(file), `migration ${file} uses ordinal NNN_name.sql naming`)
}

const migrations = migrationFiles.map((file) => read(join(migrationDir, file))).join("\n")
const uninstall = read("plugin/db/uninstall.sql")

for (const key of permissionKeys) {
  assert(migrations.includes(`'${key}'`), `migration registers ${key}`)
}
assert(uninstall.includes(`like 'plugin.${PLUGIN_ID}.%'`), "uninstall removes this plugin's permission and grant rows")

// ---------------------------------------------------------------------------
// Tables: plugin_{id}_* only, workspace-scoped, RLS in the creating migration
// ---------------------------------------------------------------------------
const createdTables = [...migrations.matchAll(/create table if not exists public\.([a-z0-9_]+)/g)].map((m) => m[1])
assert(createdTables.length > 0, "migrations create at least one table")

for (const table of createdTables) {
  assert(table.startsWith(`plugin_${PLUGIN_ID}_`), `table ${table} uses the plugin_${PLUGIN_ID}_ prefix`)
  assert(
    migrations.includes(`alter table public.${table} enable row level security`),
    `RLS is enabled for ${table} in the creating migration set`,
  )
  assert(
    new RegExp(`create table if not exists public\\.${table}[\\s\\S]*?workspace_id uuid not null references public\\.core_workspaces`).test(migrations),
    `${table} is workspace-scoped via core_workspaces`,
  )
  assert(manifest.includes(`"${table}"`), `manifest declares table ${table}`)
  assert(uninstall.includes(`drop table if exists public.${table}`), `uninstall drops ${table}`)
}

const manifestTables = [...manifest.matchAll(/"(plugin_[a-z0-9_]+)"/g)].map((m) => m[1])
for (const table of manifestTables) {
  assert(createdTables.includes(table), `manifest table ${table} is created by a migration`)
}

// ---------------------------------------------------------------------------
// Migration allowed-touch surface (COMPATIBILITY.md)
// ---------------------------------------------------------------------------
const sqlNoComments = (text) => text.split("\n").filter((line) => !line.trim().startsWith("--")).join("\n")
const migrationsSql = sqlNoComments(migrations)

assert(!/alter table public\.core_/.test(migrationsSql), "migrations never ALTER core_* tables")
assert(!/create table if not exists public\.core_/.test(migrationsSql), "migrations never create core_* tables")
assert(!/drop table[^;]*core_/.test(migrationsSql), "migrations never drop core_* tables")
assert(!/create (or replace )?function private\./.test(migrationsSql), "migrations never define private-schema functions")
assert(!/grant [^;]*private\./.test(migrationsSql), "migrations never grant private-schema helpers")
assert(!/to anon/.test(migrationsSql), "migrations never grant anything to anon")
assert(
  !/insert into public\.core_(?!permissions|role_permissions)/.test(migrationsSql),
  "migrations only insert into the two approved core seed points",
)
assert(!/on conflict \(/.test(migrationsSql), "ON CONFLICT always uses the named-constraint form (WinningOS #49)")
assert(!/slug = '/.test(migrationsSql) && !/slug='/.test(migrationsSql), "migrations never resolve anything by slug (WinningOS #52)")

// ---------------------------------------------------------------------------
// Source rules: barrel-only Core imports, server-only boundaries, no secrets
// ---------------------------------------------------------------------------
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

const sourceFiles = walk("plugin").filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
assert(sourceFiles.length > 0, "plugin source files exist")

for (const file of sourceFiles) {
  const contents = read(file)
  const coreImports = [...contents.matchAll(/from "(@\/[^"]+)"/g)].map((m) => m[1])

  for (const spec of coreImports) {
    assert(spec === "@/core/plugins/api", `${file} imports Core only through @/core/plugins/api (found ${spec})`)
  }

  assert(!contents.includes("NEXT_PUBLIC_"), `${file} contains no NEXT_PUBLIC_ names (plugin secrets are server-only)`)
  assert(!contents.includes("auth.users"), `${file} never reads auth.users directly`)
  assert(!contents.includes('eq("slug"'), `${file} never resolves the workspace by slug`)
}

const serverFiles = sourceFiles.filter((file) => file.includes("/server/"))
for (const file of serverFiles) {
  const contents = read(file)
  assert(
    contents.startsWith('"use server"') || contents.includes('import "server-only"'),
    `${file} is guarded ("use server" or server-only import)`,
  )
}

const dataLayer = read("plugin/server/data.ts")
assert(dataLayer.includes("roleHasPluginPermission"), "read layer derives capability flags from the live grant map")

const actionsLayer = read("plugin/server/actions.ts")
assert(actionsLayer.includes("ensureCoreSession"), "actions resolve identity from the Core session, never from the client")
assert(actionsLayer.includes("logCoreAuditEvent"), "privileged actions append audit events")
assert(actionsLayer.includes(`plugin.${PLUGIN_ID}.`), "audit actions use the plugin.{id}.{event} namespace")

// ---------------------------------------------------------------------------
// Repo hygiene
// ---------------------------------------------------------------------------
assert(read("IMPLEMENTATION.md").includes("core-v0"), "IMPLEMENTATION.md states the compatibility level")
assert(existsSync("plugin/db/uninstall.sql"), "purge-data uninstall script exists")

console.log(`\nPlugin contract validation passed for "${PLUGIN_ID}".`)
