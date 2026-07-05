# SQL Templates (copy these idioms exactly)

These are the canonical SQL patterns from WinningOS `PLUGIN_TEMPLATE_HANDOVER.md`, using the example id `example_plugin`. They are documentation in the current scaffold phase; the real `db/migrations/*.sql` and `db/uninstall.sql` files arrive with the implementation slice in `ROADMAP.md` and must be copied from here, not re-invented. Every idiom below encodes a lesson from a real WinningOS production bug (see `docs/SHARP_EDGES.md`).

## Migration file naming

Inside the plugin repo, migrations use ordinals: `db/migrations/001_init.sql`, `002_add_x.sql`. The **install date** supplies the timestamp when they are copied into a Core deployment:

```text
supabase/migrations/{YYYYMMDDHHMMSS}_plugin_example_plugin_001_init.sql
```

This keeps ordering correct relative to each deployment's own history and prevents cross-repo timestamp collisions. Installed migration files are never edited afterward; plugin upgrades append new ordinals.

## Permission registration (first migration, after creating tables)

```sql
-- Register this plugin's permissions. Idempotent; only plugin.example_plugin.* keys.
insert into public.core_permissions (key, name, description, namespace)
values
  ('plugin.example_plugin.view',   'View Example',   'See example plugin data.',            'plugin'),
  ('plugin.example_plugin.create', 'Create Example', 'Create example plugin records.',      'plugin'),
  ('plugin.example_plugin.manage', 'Manage Example', 'Edit or delete any example records.', 'plugin')
on conflict on constraint core_permissions_key_unique do update
  set name = excluded.name, description = excluded.description, namespace = excluded.namespace;

-- Default grants. Owners hold everything by construction; seed the rest.
insert into public.core_role_permissions (role_key, permission_key)
select r.role_key, g.permission_key
from (values
  ('plugin.example_plugin.view',   array['admin', 'member', 'viewer']),
  ('plugin.example_plugin.create', array['admin', 'member']),
  ('plugin.example_plugin.manage', array['admin'])
) as g(permission_key, roles)
cross join lateral unnest(g.roles) as r(role_key)
on conflict on constraint core_role_permissions_pkey do nothing;
```

Note the conflict targets: **named constraints, never column inference** — the column-inference form fails at runtime inside PL/pgSQL when names collide (WinningOS issue #49).

## Table + RLS (same migration that creates the table)

```sql
create table if not exists public.plugin_example_plugin_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.core_workspaces(id) on delete cascade,
  author_profile_id uuid not null references public.core_profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plugin_example_plugin_notes_title_not_blank check (length(trim(title)) > 0)
);

create or replace trigger plugin_example_plugin_notes_touch_updated_at
before update on public.plugin_example_plugin_notes
for each row execute function public.core_touch_updated_at();

alter table public.plugin_example_plugin_notes enable row level security;

create policy "Members with view can read example notes"
  on public.plugin_example_plugin_notes for select to authenticated
  using (private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.view'));

create policy "Members with create can insert their own example notes"
  on public.plugin_example_plugin_notes for insert to authenticated
  with check (
    private.core_current_member_has_permission(workspace_id, 'plugin.example_plugin.create')
    and author_profile_id = private.core_current_profile_id()
  );
-- update: author-or-manage pattern, same helpers.
-- delete: manage-only (issue #6) — the permission named for an action is the
-- boundary at EVERY layer; do not make RLS wider than the app-layer gate.
```

Privilege caveat: `private.core_current_member_has_permission`, `private.core_is_active_member`, and `private.core_current_profile_id` are all EXECUTE-granted to `authenticated` (the profile-id grant shipped with Core Phase 10, migration `20260704210000`). Use these three helpers verbatim; a plugin migration must never grant additional `private.*` helpers itself.

## Cross-plugin foreign keys (only with a declared dependency)

```sql
-- Requires manifest dependsOn: [{ pluginId: "crm", minVersion: "..." }] and
-- plugin_crm_clients listed in the CRM's publicTables. Delete behavior is a
-- documented product decision: cascade (history dies with the client) or
-- restrict (clients with history cannot be deleted).
client_id uuid not null references public.plugin_crm_clients(id) on delete cascade,
```

## Uninstall script (`db/uninstall.sql`, operator-run only)

```sql
-- Explicit, destructive, never run automatically. Purge-data removal level.
drop table if exists public.plugin_example_plugin_notes;
delete from public.core_role_permissions where permission_key like 'plugin.example_plugin.%';
delete from public.core_permissions where key like 'plugin.example_plugin.%';
-- Audit history intentionally retains plugin.example_plugin.* action strings.
```

If other plugins depend on this one, their uninstall scripts run **first** (dependents before dependencies).
