-- example_plugin 001: notes table, RLS, and permission registration.
--
-- Install into a Core deployment by copying to:
--   supabase/migrations/{YYYYMMDDHHMMSS}_plugin_example_plugin_001_init.sql
-- (the install date supplies the timestamp; never edit after installing —
-- plugin upgrades append new ordinals).
--
-- Conventions from WinningOS COMPATIBILITY.md / docs/SQL_TEMPLATES.md:
-- - only plugin_example_plugin_* objects plus this plugin's own permission
--   seed rows are touched; no core_* DDL, no private-schema changes
-- - RLS is enabled in the same migration that creates the table
-- - ON CONFLICT always uses the named-constraint form (PL/pgSQL substitution
--   makes the column-inference form a runtime landmine — WinningOS #49)
-- - workspace membership + live permission grants are the boundary; the
--   private helpers used here are EXECUTE-granted to authenticated by Core
--
-- Core-side requirement (WinningOS Phase 10, task 8): the insert policy uses
-- private.core_current_profile_id(), which Core must EXECUTE-grant to
-- authenticated. Integration fails loudly (permission denied) if missing.

create table if not exists public.plugin_example_plugin_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.core_workspaces(id) on delete cascade,
  author_profile_id uuid not null references public.core_profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plugin_example_plugin_notes_title_not_blank check (length(trim(title)) > 0),
  constraint plugin_example_plugin_notes_title_length check (char_length(title) <= 200),
  constraint plugin_example_plugin_notes_body_length check (char_length(body) <= 5000)
);

create index if not exists plugin_example_plugin_notes_workspace_created_idx
  on public.plugin_example_plugin_notes (workspace_id, created_at desc);

create or replace trigger plugin_example_plugin_notes_touch_updated_at
before update on public.plugin_example_plugin_notes
for each row execute function public.core_touch_updated_at();

alter table public.plugin_example_plugin_notes enable row level security;

drop policy if exists "Members with view can read example notes" on public.plugin_example_plugin_notes;

create policy "Members with view can read example notes"
  on public.plugin_example_plugin_notes
  for select
  to authenticated
  using (private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.view'));

drop policy if exists "Members with create can insert their own example notes" on public.plugin_example_plugin_notes;

create policy "Members with create can insert their own example notes"
  on public.plugin_example_plugin_notes
  for insert
  to authenticated
  with check (
    private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.create')
    and author_profile_id = private.core_current_profile_id()
  );

drop policy if exists "Authors or managers can update example notes" on public.plugin_example_plugin_notes;

create policy "Authors or managers can update example notes"
  on public.plugin_example_plugin_notes
  for update
  to authenticated
  using (
    author_profile_id = private.core_current_profile_id()
    or private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.manage')
  )
  with check (
    author_profile_id = private.core_current_profile_id()
    or private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.manage')
  );

drop policy if exists "Authors or managers can delete example notes" on public.plugin_example_plugin_notes;

create policy "Authors or managers can delete example notes"
  on public.plugin_example_plugin_notes
  for delete
  to authenticated
  using (
    author_profile_id = private.core_current_profile_id()
    or private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.manage')
  );

-- Register this plugin's permissions. Idempotent; only plugin.example_plugin.* keys.
insert into public.core_permissions (key, name, description, namespace)
values
  ('plugin.example_plugin.view',   'View example notes',   'See the example plugin''s notes list.', 'plugin'),
  ('plugin.example_plugin.create', 'Create example notes', 'Create notes in the example plugin.',   'plugin'),
  ('plugin.example_plugin.manage', 'Manage example notes', 'Delete any note in the example plugin.', 'plugin')
on conflict on constraint core_permissions_key_unique do update
  set name = excluded.name, description = excluded.description, namespace = excluded.namespace;

-- Default grants (must match manifest.ts defaultRoles). Owner holds
-- everything by construction and is never seeded.
insert into public.core_role_permissions (role_key, permission_key)
select r.role_key, g.permission_key
from (values
  ('plugin.example_plugin.view',   array['admin', 'member', 'viewer']),
  ('plugin.example_plugin.create', array['admin', 'member']),
  ('plugin.example_plugin.manage', array['admin'])
) as g(permission_key, roles)
cross join lateral unnest(g.roles) as r(role_key)
on conflict on constraint core_role_permissions_pkey do nothing;
