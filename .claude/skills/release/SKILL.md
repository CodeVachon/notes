---
name: release
description: Create a new release version. Use when asked to create a release, prepare a release, bump version, or update the changelog.
---

# Release Skill

This skill guides the process of creating a new release for the notes application.

## Instructions

When the user asks to create a release, follow these steps:

### Step 1: Determine Release Type

Use the AskUserQuestion tool to ask the user what type of release this is:

**Options:**
- **Patch** (x.x.X) - Bug fixes and minor changes that don't add features
- **Minor** (x.X.0) - New features that are backwards compatible
- **Major** (X.0.0) - Breaking changes or major new features

### Step 2: Calculate New Version

Read `package.json` to get the current version. Parse the semantic version (MAJOR.MINOR.PATCH) and increment the appropriate number:
- Patch: increment PATCH, keep MAJOR and MINOR
- Minor: increment MINOR, reset PATCH to 0, keep MAJOR
- Major: increment MAJOR, reset MINOR and PATCH to 0

### Step 3: Ask for Changelog Content

Use AskUserQuestion or ask the user directly what changes should be documented in this release. The changelog follows this format:

```markdown
## [VERSION] - YYYY-MM-DD

### New Features
- Feature descriptions here

### Improvements
- Improvement descriptions here

### Bug Fixes
- Bug fix descriptions here

### Database Changes
- Any schema changes here (remind to run migrations)
```

Only include sections that have content.

### Step 4: Update Files

1. **Update `package.json`**: Change the `version` field to the new version number

2. **Update `CHANGELOG.md`**: Add the new version section at the top (after the header), above all existing versions

### Step 5: Check Database Migrations

Run the following command to check if there are any pending schema changes:

```bash
bun run db:generate
```

If new migrations are generated:
- Inform the user that new migrations were created
- Remind them to run `bun run db:push` (dev) or `bun run db:migrate` (prod) after deployment

If no changes are detected, confirm that migrations are up to date.

### Step 6: Summary

Provide a summary of what was done:
- Old version -> New version
- Changelog entries added
- Migration status
- Remind user to commit these changes and create a git tag if desired

## Example Changelog Entry

```markdown
## [0.2.0] - 2026-01-15

### New Features

**Feature Name**
- Description of the feature
- Additional details

### Improvements

**Area of Improvement**
- What was improved

### Database Changes

- Added `column_name` to `table_name` table

> **Note:** Run `bun run db:push` to apply the schema migration.
```
