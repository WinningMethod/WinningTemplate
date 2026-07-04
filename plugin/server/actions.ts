"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  createClient,
  ensureCoreSession,
  logCoreAuditEvent,
  roleHasPluginPermission,
} from "@/core/plugins/api"
import { PERMISSIONS } from "../permissions"

// Safe kebab-case status codes carried in query params; human messages render
// in the page. Never reflect user input or raw errors (Core error pattern).
const NOTES_PATH = "/p/example_plugin"

function readTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

/**
 * Create a note. Gated on the LIVE plugin.example_plugin.create grant (owners
 * always pass); the RLS insert policy re-enforces the same permission plus
 * author identity server-side — this app-layer gate is UX, not the boundary.
 */
export async function createNote(formData: FormData): Promise<never> {
  const title = readTrimmedString(formData, "title")
  const body = readTrimmedString(formData, "body")

  if (!title || title.length > 200 || body.length > 5000) {
    redirect(`${NOTES_PATH}/new?status=invalid`)
  }

  const session = await ensureCoreSession()

  if (
    !session.hasActiveMembership
    || !session.profile?.id
    || !await roleHasPluginPermission(session.membership?.roleKey, PERMISSIONS.create)
  ) {
    redirect(`${NOTES_PATH}?status=denied`)
  }

  const supabase = await createClient()
  const { error } = await supabase.from("plugin_example_plugin_notes").insert({
    workspace_id: session.workspace?.id,
    author_profile_id: session.profile.id,
    title,
    body,
  })

  if (error) {
    console.error("example_plugin: failed to create note", { code: error.code })
    redirect(`${NOTES_PATH}/new?status=failed`)
  }

  await logCoreAuditEvent({
    action: "plugin.example_plugin.note_created",
    subjectType: "plugin_example_plugin_note",
    metadata: { title: title.slice(0, 80) },
  })

  revalidatePath(NOTES_PATH)
  redirect(`${NOTES_PATH}?status=created`)
}

/**
 * Delete any note. Gated on plugin.example_plugin.manage; the RLS delete
 * policy re-enforces author-or-manage server-side.
 */
export async function deleteNote(formData: FormData): Promise<never> {
  const noteId = readTrimmedString(formData, "noteId")

  if (!noteId) {
    redirect(`${NOTES_PATH}?status=failed`)
  }

  const session = await ensureCoreSession()

  if (!await roleHasPluginPermission(session.membership?.roleKey, PERMISSIONS.manage)) {
    redirect(`${NOTES_PATH}?status=denied`)
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("plugin_example_plugin_notes")
    .delete()
    .eq("id", noteId)

  if (error) {
    console.error("example_plugin: failed to delete note", { code: error.code })
    redirect(`${NOTES_PATH}?status=failed`)
  }

  await logCoreAuditEvent({
    action: "plugin.example_plugin.note_deleted",
    subjectType: "plugin_example_plugin_note",
    subjectId: noteId,
  })

  revalidatePath(NOTES_PATH)
  redirect(`${NOTES_PATH}?status=deleted`)
}
