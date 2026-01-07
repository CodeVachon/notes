# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-01-07

### New Features

**Tags in Titles**
- Tags (`[[tagname]]`) now work in note and todo titles, not just in body content
- Tags in titles are clickable and link to the tag page
- Tags in titles are now saved to the database when creating/updating notes and todos

**Date Tags**
- New date tag syntax: `[[2026-01-07]]` links directly to that date's notebook page
- Date tags work in both titles and body content
- Date tags are NOT stored in the tags database (they're navigation links only)

**YouTube Embeds**
- YouTube links in note/todo descriptions now render as embedded video players
- Supports youtube.com/watch, youtu.be, and youtube.com/shorts URLs
- Embeds appear in display mode only (not while editing)

**Copy Todo to Another Date**
- New "Copy to date" option in todo dropdown menu
- Opens a calendar picker to select the target date
- Copies title and description (not comments)
- Shows "Copied from [date]" link on copied todos for easy reference back to the original

**Quote Blocks**
- New blockquote button in the rich text editor toolbar
- Styled with left border and italic text

### Improvements

**UI/UX**
- Removed strikethrough styling on completed todos for better readability
- Custom scrollbar styling: black track with primary color thumb in dark mode
- Calendar "Go to Today" button now appears on tag/project pages
- Calendar preserves layout space when "Go to Today" button is hidden
- Fixed user dropdown menu causing layout shift when opened

### Database Changes

- Added `source_id` column to `todo` table for tracking copied todos

> **Note:** Run `bun run db:push` to apply the schema migration.
