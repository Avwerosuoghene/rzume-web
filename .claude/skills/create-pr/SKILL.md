---
name: create-pr
description: >-
  Generate a PR description from the current branch's changes in rzume_web, and write
  an implementation-summary.md to the vault linking back to the architect plan and
  Figma feature spec. Use after /code-review and /pre-commit-checklist both pass, as
  the last step before opening a PR.
argument-hint: "[nothing needed — reads the current branch's diff against master]"
---

# Create PR — rzume_web

The last step in the chain: `/architect` → `/figma-feature-plan` → `/write-tests` → `/implement` →
`/quality-gate` → `/code-review` → `/pre-commit-checklist` → **this**.

## Step 1: Gather the diff

```bash
git diff master...HEAD --name-only
git diff master...HEAD
git log master..HEAD --oneline
```

This repo's default/PR-target branch is `master` (confirmed via `git branch -a` — not `main`,
despite that being the more common convention elsewhere).

## Step 2: Classify changes

Sort into **Additions** (new files/components/services), **Changes** (modified behavior — not
formatting/import reordering), **Removals** (deleted functionality). Skip import-only or
whitespace-only diffs.

## Step 3: Commit message style

This repo uses Conventional Commits: `<type>(<scope>): <description>` — e.g.
`fix(scroll-listener): fixes scroll listener`, `feat(dashboard): Implements updated view page`.
Match this style for the PR title even if individual commits on the branch don't follow it
perfectly.

## Step 4: Write the PR description

```markdown
[1-2 sentence description of what this PR does and why — not a repeat of the bullet lists below]

## Changes

- `ComponentName`/`ServiceName` — what changed and why

## Testing

- [ ] Unit tests added/updated: `<file>`
- [ ] E2E covered: `<cypress spec>` (if applicable)
- [ ] `npm run lint` / `npm run type-check` / `npm run test:ci` all pass

## Related

- Plan: <link to the vault plan.md if one exists for this feature — vault is local-only, so state
  the gist inline too, don't rely on the link being clickable for reviewers>
```

Don't fabricate a "Testing" checkbox item that wasn't actually verified — if `/pre-commit-checklist`
wasn't fully run, say so rather than checking boxes optimistically.

## Step 5: Write the implementation summary to the vault

If this feature has a folder in `~/Documents/rzume-web-vault/features/<feature-slug>/` (created by
`/architect` and/or `/figma-feature-plan`), add `implementation-summary.md` there:

```markdown
---
tags: [rzume-web, implementation-summary]
status: implemented
created: YYYY-MM-DD
---

## Implementation Summary: <feature>

Plan: [[plan]]
Spec: [[feature-spec]]

### What shipped
<brief summary, matching the PR description's opening>

### Deviations from the plan
<anything that changed from the original architect plan/feature spec, and why — omit if none>

### PR
<link, once opened>
```

If no vault folder exists for this change (a small fix that skipped `/architect`), skip this step
— don't create a vault entry for something that was never planned there.

**Confirm before overwriting** an existing `implementation-summary.md` — don't silently replace one
that already documents a previous pass at this feature.

## What this skill does NOT cover

- **Whether the change is actually ready** → `/pre-commit-checklist` should already have passed
- **Reviewing the code itself** → `/code-review`
