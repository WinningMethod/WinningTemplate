# Non-Goals

This document records what WinningTemplate must not do in the current documentation-only branch and what future WinningOS plugins must not assume.

Source documents used from WinningMethod/winningOS: `README.md`, `CORE.md`, `AGENTS.md`, `COMPATIBILITY.md`, `PLUGIN_TEMPLATE_HANDOVER.md`, and `IMPLEMENTATION_PLAN.md`.

## Current branch non-goals

The documentation-scaffold phase (slice 1 in `ROADMAP.md`) does not create:

- real plugin implementation code
- real Supabase migrations
- `db/uninstall.sql`
- package files or lockfiles
- Next.js, Supabase, or TypeScript app scaffolding
- executable scripts or validators
- generated UI components
- secrets, environment files, auth config, or provider setup
- business-specific workflows
- a pull request merge

The branch exists to document the future template contract and make it reviewable.

## WinningTemplate non-goals

WinningTemplate is not:

- a runtime plugin marketplace
- a package registry or remote plugin loader
- a generic SaaS app
- a second Core implementation
- a place to redefine Core auth, workspace, membership, permissions, theme, or navigation
- a place to add company-specific workflows
- a place to make a single coding agent mandatory

## Future plugin non-goals

A real plugin built from this template must not:

- bypass source review or build-time inclusion
- install itself through a Core UI marketplace
- import arbitrary Core internals around the future Plugin API barrel
- alter Core tables, private schemas, or unrelated plugin tables
- rely on UI hiding as the security boundary
- hardcode role behavior instead of reading the live grant map
- duplicate Core identity or read `auth.users` directly
- expose secrets through client-visible environment variables
- make disable/remove-source removal destructive
- assume workspace slugs are stable identity

## Core non-goals preserved by the template

WinningOS Core does not own business-specific workflows such as CRM, meeting notes, billing, analytics, documents, automations, or agent/chat experiences. Those are plugin territory once the build-time plugin boundary is ready.

The template should teach plugin authors how to extend Core without pulling those workflows back into Core.

## Runtime marketplace non-goal

The `core-v0` contract is explicit: plugins are reviewed source included before build. Core must never auto-fetch plugin repositories, install plugins from a runtime UI, or execute plugin code that was not included and reviewed as deployment source.

## Data purge non-goal

Disabling or removing plugin source is not data deletion. Purge-data removal is a separate, explicit, destructive operator action. This prevents accidental data loss and keeps audit history meaningful.
