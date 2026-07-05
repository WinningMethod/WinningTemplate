import Link from "next/link"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageContainer,
  PageHeader,
} from "@/core/plugins/api"
import { createNote } from "../server/actions"

const STATUS_NOTICES: Record<string, string> = {
  invalid: "Title is required (max 200 characters); body up to 5000.",
  failed: "That didn't save. Try again in a moment.",
}

/** /p/example_plugin/new — create form posting to a permission-gated action. */
export async function NewNotePage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const notice = STATUS_NOTICES[params?.status ?? ""] ?? null

  return (
    <PageContainer>
      <PageHeader
        title="New note"
        description="Submits to a server action gated on the live plugin.example_plugin.create grant; RLS re-enforces it."
      />

      {notice ? (
        <div role="alert">
          <Badge tone="danger">{notice}</Badge>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create a note</CardTitle>
          <CardDescription>The author is resolved server-side from the Core session — never from the form.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createNote}>
            <Label htmlFor="note-title">Title</Label>
            <Input id="note-title" name="title" required maxLength={200} />
            <Label htmlFor="note-body">Body</Label>
            <Input id="note-body" name="body" maxLength={5000} />
            <Button type="submit">Create note</Button>
            <Link
              href="/p/example_plugin"
              className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Cancel
            </Link>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
