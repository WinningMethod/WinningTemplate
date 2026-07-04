-- example_plugin uninstall: purge-data removal (level 3 in COMPATIBILITY.md).
--
-- EXPLICIT, DESTRUCTIVE, OPERATOR-RUN ONLY. Never executed automatically and
-- never part of the migration history. Disable-level removal (deleting the
-- config/plugins.ts registry line) and remove-source removal do NOT touch
-- data — run this only when the workspace owner has decided the plugin's
-- data should cease to exist.
--
-- Ordering: if other plugins declare dependsOn: example_plugin, run THEIR
-- uninstall scripts first (dependents before dependencies).

drop table if exists public.plugin_example_plugin_notes;

delete from public.core_role_permissions where permission_key like 'plugin.example_plugin.%';
delete from public.core_permissions where key like 'plugin.example_plugin.%';

-- Audit history intentionally retains plugin.example_plugin.* action strings:
-- the trail records what happened, including actions by plugins that no
-- longer exist.
