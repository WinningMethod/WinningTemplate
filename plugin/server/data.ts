import "server-only"

import { createClient, ensureCoreSession, roleHasPluginPermission, type CoreSession } from "@/core/plugins/api"
import { PERMISSIONS } from "../permissions"

export type ExampleNote = {
  id: string
  title: string
  body: string
  authorProfileId: string
  createdAt: string
}

type NoteRow = {
  id: string
  title: string
  body: string
  author_profile_id: string
  created_at: string
}

export type NotesOverview = {
  session: CoreSession
  notes: ExampleNote[]
  canView: boolean
  canCreate: boolean
  canManage: boolean
}

/**
 * Notes for the current member. Reads go through the user client so RLS is
 * the boundary — if the member lacks plugin.example_plugin.view, the select
 * returns zero rows regardless of what the UI shows. The permission flags
 * come from the live grant map so rendered controls match what the server
 * will actually allow.
 */
export async function getNotesOverview(): Promise<NotesOverview> {
  const session = await ensureCoreSession()
  const roleKey = session.membership?.roleKey

  const [canView, canCreate, canManage] = await Promise.all([
    roleHasPluginPermission(roleKey, PERMISSIONS.view),
    roleHasPluginPermission(roleKey, PERMISSIONS.create),
    roleHasPluginPermission(roleKey, PERMISSIONS.manage),
  ])

  if (!session.hasActiveMembership || !canView) {
    return { session, notes: [], canView, canCreate, canManage }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("plugin_example_plugin_notes")
    .select("id, title, body, author_profile_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("example_plugin: failed to list notes", { code: error.code })
    return { session, notes: [], canView, canCreate, canManage }
  }

  const notes = ((data ?? []) as NoteRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    authorProfileId: row.author_profile_id,
    createdAt: row.created_at,
  }))

  return { session, notes, canView, canCreate, canManage }
}
