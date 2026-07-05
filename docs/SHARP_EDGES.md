# Sharp Edges

Every rule here caused a real WinningOS Core production bug (issue numbers from `WinningMethod/winningOS`). The template's future validators and docs must encode them so plugins never re-learn them live. Source: `PLUGIN_TEMPLATE_HANDOVER.md`.

1. **RLS helper privileges** — policy expressions execute as the querying role. If a policy calls a function the `authenticated` role can't EXECUTE (or in a schema without USAGE), every read of that table fails with `permission denied for schema private` (#46/#47). Use only the helpers Core has granted; never add grants from a plugin migration.
2. **`ON CONFLICT` inside PL/pgSQL** — the column-inference form is subject to variable substitution; when output columns share names with conflict columns you get `column reference is ambiguous` **at runtime only** (#49). Always `on conflict on constraint {name}`.
3. **Output-parameter shadowing** — qualify every column reference in plpgsql bodies whose functions declare same-named output columns (Core hit this class three times).
4. **Never resolve the workspace by slug** — it is owner-editable; a rename once took the whole app down (#52). Resolve structurally: `where deleted_at is null order by created_at asc limit 1`.
5. **Server-action body limits** — uploads above Next's default 1 MB action body limit crash before validation runs (#57). Core raised its limit to 6 MB and validates client-side first; plugin upload features must do both.
6. **Statically-valid SQL still fails live** — Core's #49 shipped because no review environment executed migrations. Run every migration against a real Supabase project before tagging a release.
7. **Auth/session context** — get user context from `ensureCoreSession()` only. Never read `auth.users` directly, never cache role keys across requests, never trust a role passed from the client.
8. **Error surfacing** — safe kebab-case codes in query params, human messages in the page, raw errors only in server logs. No vendor names, no reflected user input (#26).
9. **Live grants, not constants** — owners edit grants at runtime (#42). Never bake "admin can X" into plugin logic; ask the grant map.
10. **Additive migrations only** — never edit a shipped migration; upgrades append new ordinals. Uninstall is a separate operator-run script, never a migration.
11. **RLS wider than the app gate is a hole, not a convenience** — the first live acceptance run (AcmeCo issue #1 → template issue #6) caught 001 shipping an author-or-manage delete policy while the manifest, UI, and server action all treated `manage` as the delete permission. The UI hid the buttons, the action denied — and a member with the anon client deleted their own row straight through RLS. For every action, UI, server code, and RLS must gate on the **same** permission; the widest layer is the real boundary. Encode the action→permission mapping once (the manifest) and check each layer against it during review.
