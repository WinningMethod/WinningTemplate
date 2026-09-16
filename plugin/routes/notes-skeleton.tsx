import { PageContainer } from "@/core/plugins/api"

export function NotesSkeleton() {
  return <PageContainer>
    <div role="status" aria-label="Loading notes">
      <span className="sr-only">Loading notes…</span>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="space-y-3 border-b border-border pb-5">
          <div className="h-7 w-40 rounded bg-primary/10" />
          <div className="h-4 w-full max-w-lg rounded bg-primary/10" />
        </div>
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="h-5 w-24 rounded bg-primary/10" />
          {[0,1,2,3,4].map(i => <div key={i} className="space-y-2 border-b border-border pb-4"><div className="h-4 w-1/3 rounded bg-primary/10" /><div className="h-3 w-3/4 rounded bg-primary/10" /></div>)}
        </div>
      </div>
    </div>
  </PageContainer>
}
