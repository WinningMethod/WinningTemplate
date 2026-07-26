/**
 * TYPE-COMPATIBLE STAND-IN for the WinningOS Core Plugin API barrel
 * (`@/core/plugins/api`, shipped by Core in Phase 10).
 *
 * Purpose: let this template repo typecheck standalone. The template tsconfig
 * maps `@/core/plugins/api` to this file; inside a real Core deployment the
 * same import resolves to Core's real barrel and this folder is NEVER copied.
 *
 * This file is also the canonical definition of the `core-v0` Plugin API
 * surface: Core's Phase 10 barrel must export exactly these names with
 * type-compatible signatures. If Core needs to change this surface, that is a
 * compatibility-level conversation (see COMPATIBILITY.md), not a silent edit.
 *
 * The function bodies throw on purpose — plugin code is only executed inside
 * a Core deployment; standalone, this repo typechecks and validates but does
 * not run.
 */

import type { SupabaseClient } from "@supabase/supabase-js"

const STUB_ERROR =
  "core-stub is type-only. Plugin code runs inside a WinningOS Core deployment, where @/core/plugins/api resolves to the real barrel."

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CoreRoleKey = "owner" | "admin" | "member" | "viewer"

export type PluginPermissionKey = `plugin.${string}.${string}`

/**
 * Props every slot module receives from its host (ECOSYSTEM.md "Modules").
 * The host documents each slot's context shape in its IMPLEMENTATION.md.
 */
export type PluginModuleProps = {
  context?: Record<string, unknown>
}

/** One permission-filtered module contribution, as resolveSlotModules returns it. */
export type PluginSlotModule = {
  /** The contributing plugin's id. */
  pluginId: string
  title: string
  component: React.ComponentType<PluginModuleProps>
  permission: PluginPermissionKey
}

export type CoreSessionStatus = "unauthenticated" | "ready" | "pending_access"

export type CoreSession = {
  status: CoreSessionStatus
  hasActiveMembership: boolean
  user: { id: string; email: string | null } | null
  profile: { id: string; displayName: string } | null
  workspace: { id: string; name: string } | null
  membership: { id: string; roleKey: string } | null
}

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
    key: PluginPermissionKey
    name: string
    description: string
    /** Default role grants seeded by the plugin's migration. */
    defaultRoles: CoreRoleKey[]
  }[]
  /** Navigation entries Core MAY render (Core decides placement/order). */
  navigation: {
    label: string
    /** Path under the plugin host: /p/{id}{path}. Use "" for the root. */
    path: string
    /** lucide-react icon name; Core resolves it, falls back to a generic icon. */
    icon: string
    /** Permission required to see the entry. */
    permission: PluginPermissionKey
  }[]
  /**
   * Roll this plugin's nav entries up under another plugin's primary (first
   * visible) nav entry instead of adding top-level sidebar entries of its own.
   * The idiom for Viewers and Bridges orbiting an owner App: the owner keeps
   * the single sidebar entry for the function, satellites appear as its
   * dropdown children. A hint, not a command — Core resolves it (chains
   * collapse to the root plugin; cycles, uninstalled targets, or targets with
   * no visible entries fall back to top-level entries so nothing disappears),
   * and members can still rearrange everything per-user.
   */
  navRollup?: {
    /** Installed plugin id whose primary nav entry hosts this plugin's entries. */
    into: string
  }
  /** Route table: path under /p/{id} → React component (server or client). */
  routes: Record<string, React.ComponentType>
  /** Optional Settings → Plugins panel. */
  settings?: {
    label: string
    permission: PluginPermissionKey
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
  /**
   * Named extension points this plugin's UI offers to other plugins
   * (ECOSYSTEM.md "Modules"). Contributors target `{this_plugin_id}:{slot id}`;
   * the host renders contributions via `resolveSlotModules` and documents each
   * slot's context shape in its IMPLEMENTATION.md.
   */
  slots?: {
    /** Slot name, lowercase snake_case, unique within this plugin. */
    id: string
    /** Where it renders and what context the host passes. */
    description: string
  }[]
  /**
   * Components this plugin mounts into other plugins' declared slots
   * (`{host_plugin_id}:{slot_id}`). A module renders only when the host is
   * installed, declares the slot, and the member holds `permission` (owned by
   * the CONTRIBUTING plugin, not the host).
   */
  modules?: {
    /** Target slot: `{host_plugin_id}:{slot_id}`. */
    slot: string
    /** Short heading the host may render above the module. */
    title: string
    component: React.ComponentType<PluginModuleProps>
    permission: PluginPermissionKey
  }[]
}

// ---------------------------------------------------------------------------
// Session and permissions
// ---------------------------------------------------------------------------

/** Resolve the authenticated Core session (profile, workspace, membership). */
export async function ensureCoreSession(): Promise<CoreSession> {
  throw new Error(STUB_ERROR)
}

/**
 * Whether a role holds a plugin permission per the LIVE grant map
 * (core_role_permissions). Owners always hold everything; unknown keys deny.
 */
export async function roleHasPluginPermission(
  _roleKey: string | null | undefined,
  _permission: PluginPermissionKey,
): Promise<boolean> {
  throw new Error(STUB_ERROR)
}

/**
 * Modules the CURRENT member may see in a slot (`{host_plugin_id}:{slot_id}`):
 * installed contributions filtered by each module's own permission against the
 * live grant map. Hosts call this from the server component rendering the slot
 * and pass each module its documented context. Empty result = render nothing.
 */
export async function resolveSlotModules(_slotId: string): Promise<PluginSlotModule[]> {
  throw new Error(STUB_ERROR)
}

// ---------------------------------------------------------------------------
// Data access (Core Supabase conventions)
// ---------------------------------------------------------------------------

/** Request-scoped Supabase client for the signed-in user. RLS is the boundary. */
export async function createClient(): Promise<SupabaseClient> {
  throw new Error(STUB_ERROR)
}

/** Service-role client. Server-only, exceptional, always permission-gate first. */
export function createServiceRoleClient(): SupabaseClient {
  throw new Error(STUB_ERROR)
}

/** Best-effort audit append. Never throws. Actions: plugin.{id}.{event}. */
export async function logCoreAuditEvent(_input: {
  action: string
  subjectType?: string
  subjectId?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  throw new Error(STUB_ERROR)
}

// ---------------------------------------------------------------------------
// UI kit (Core's components/ui/* subset + page chrome)
// ---------------------------------------------------------------------------

type WithChildren<T = object> = T & { children?: React.ReactNode; className?: string }

export function Button(
  _props: WithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: "primary" | "outline" | "ghost" | "destructive"
      size?: "sm" | "default" | "lg" | "icon"
    }
  >,
): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function Card(_props: WithChildren): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function CardHeader(_props: WithChildren): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function CardTitle(_props: WithChildren): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function CardDescription(_props: WithChildren): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function CardContent(_props: WithChildren): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function Badge(
  _props: WithChildren<{ tone?: "success" | "warning" | "muted" | "danger" }>,
): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function Input(
  _props: React.InputHTMLAttributes<HTMLInputElement>,
): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function Label(
  _props: WithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>,
): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function PageContainer(_props: WithChildren): React.ReactElement {
  throw new Error(STUB_ERROR)
}

export function PageHeader(
  _props: WithChildren<{ title: string; description?: string; actions?: React.ReactNode }>,
): React.ReactElement {
  throw new Error(STUB_ERROR)
}
