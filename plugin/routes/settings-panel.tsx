import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/plugins/api"
import { getNotesOverview } from "../server/data"

/**
 * Settings → Plugins → Example Plugin panel, mounted by Core from the
 * manifest. Read-only status here; a real plugin puts its configuration
 * surface in this panel (never inside Core's own settings tabs).
 */
export async function ExamplePluginSettingsPanel() {
  const { notes, canManage } = await getNotesOverview()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Plugin</CardTitle>
        <CardDescription>
          Plugin configuration lives here, under Settings → Plugins — never inside Core&apos;s
          Workspace or Branding tabs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Notes stored: {notes.length}</p>
        <p>You {canManage ? "can" : "cannot"} manage other members&apos; notes.</p>
      </CardContent>
    </Card>
  )
}
