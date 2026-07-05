import Link from "next/link"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  PageHeader,
} from "@/core/plugins/api"
import { getNotesOverview } from "../server/data"
import { deleteNote } from "../server/actions"

// Human messages for the safe status codes the server actions redirect with.
const STATUS_NOTICES: Record<string, { message: string; isFailure: boolean }> = {
  created: { message: "Note created.", isFailure: false },
  deleted: { message: "Note deleted.", isFailure: false },
  denied: { message: "You don't have permission for that action.", isFailure: true },
  failed: { message: "That didn't save. Try again in a moment.", isFailure: true },
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(value),
  )
}

/**
 * Plugin root route, mounted by Core at /p/example_plugin. Server component:
 * data comes from the RLS-guarded read layer; controls render from the live
 * grant map so what members see matches what the server allows.
 */
export async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const notice = STATUS_NOTICES[params?.status ?? ""] ?? null
  const { notes, canCreate, canManage } = await getNotesOverview()

  return (
    <PageContainer>
      <PageHeader
        title="Example notes"
        description="The reference feature every WinningOS plugin is forked from: a workspace-scoped list with live-grant permissions, RLS, and audit events."
        actions={
          canCreate ? (
            <Link
              href="/p/example_plugin/new"
              className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              New note
            </Link>
          ) : undefined
        }
      />

      {notice ? (
        <div role={notice.isFailure ? "alert" : "status"}>
          <Badge tone={notice.isFailure ? "danger" : "success"}>{notice.message}</Badge>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Reads go through RLS; without plugin.example_plugin.view this list is empty no matter
            what the UI renders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.title}</strong> — {note.body || "(no body)"}{" "}
                  <span>by {note.authorName}</span>{" "}
                  <span>{formatDate(note.createdAt)}</span>
                  {canManage && (
                    <form action={deleteNote}>
                      <input type="hidden" name="noteId" value={note.id} />
                      <Button size="sm" variant="destructive" type="submit">
                        Delete
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
