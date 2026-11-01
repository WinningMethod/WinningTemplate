import "server-only"

import { createClient, type PluginSearchHit, type PluginSearchProvider } from "@/core/plugins/api"

// Global search provider (Core 0.4.0). Core calls it with the searcher's
// verified identity; it must return only what that searcher may open.
//
// Humans: the user client runs under RLS, so the notes table's
// plugin.example_plugin.view policy is the boundary — no grant, no rows.
//
// Agents: this example has no agent-authorized read path (no agentApi or
// SECURITY DEFINER function resolving the agent), so it returns nothing for
// agents rather than reading with the service role. A real plugin should add
// one and search through it (see CREATING_A_PLUGIN.md "Search").

type NoteRow = { id: string; title: string; body: string }

export const exampleSearch: PluginSearchProvider = async ({ query, limit, signal }, actor) => {
  if (actor.kind !== "human") return []

  // Escape LIKE wildcards; two plain filters avoid building a PostgREST or() string.
  const pattern = `%${query.replace(/[\\%_]/g, (match) => `\\${match}`)}%`
  const supabase = await createClient()
  const columns = "id, title, body"
  const [byTitle, byBody] = await Promise.all([
    supabase.from("plugin_example_plugin_notes").select(columns).ilike("title", pattern).limit(limit).abortSignal(signal),
    supabase.from("plugin_example_plugin_notes").select(columns).ilike("body", pattern).limit(limit).abortSignal(signal),
  ])
  if (byTitle.error || byBody.error) throw new Error("example_plugin search unavailable")

  const notes = new Map<string, NoteRow>()
  for (const row of [...(byTitle.data ?? []), ...(byBody.data ?? [])] as NoteRow[]) notes.set(row.id, row)

  return [...notes.values()].slice(0, limit).map((note): PluginSearchHit => ({
    id: note.id,
    kind: "record",
    title: note.title,
    path: "Example / Notes",
    href: "/p/example_plugin",
    text: note.body,
  }))
}
