-- example_plugin 002: align delete RLS with the manifest contract.
--
-- WinningTemplate issue #6 (found by the AcmeCo acceptance run): 001 shipped
-- an author-or-manage delete policy, but the manifest defines
-- plugin.example_plugin.manage as THE delete permission — members create notes
-- by default and must not delete even their own unless the owner grants
-- manage live in Settings → Roles. UI, server action, and RLS must agree; the
-- widest layer is the real boundary.
--
-- 001 is shipped and therefore frozen (upgrades append ordinals, never edit).
-- Both drop lines are idempotent across either prior policy name.

drop policy if exists "Authors or managers can delete example notes" on public.plugin_example_plugin_notes;
drop policy if exists "Managers can delete example notes" on public.plugin_example_plugin_notes;

create policy "Managers can delete example notes"
  on public.plugin_example_plugin_notes
  for delete
  to authenticated
  using (private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.manage'));
