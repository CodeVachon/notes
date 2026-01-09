# Changelog

All notable changes to this project will be documented in this file.

## [0.3.1] - 2026-01-09

### New Features

- **Storybook Integration** - Added Storybook for component development and documentation

### Bug Fixes

- Fixed Safari calendar date picker error

## [0.3.0] - 2026-01-08

### New Features

- **Generic Notes with Folder Structure** - Added support for organizing notes in folders
- **Cross Tab/Browser Syncing** - Notes now sync across multiple browser tabs and windows
- **Deployment Examples** - Added deployment configuration examples

### Improvements

- Updated landing page design

### Bug Fixes

- Fixed navigation issues
- Fixed "Go to Today" button on Safari
- Fixed cookie error on session expiration

## [0.2.1] - 2026-01-07

### Bug Fixes

- Fixed "useSettings must be used within a SettingsProvider" error on Tag detail pages
- Fixed "useSettings must be used within a SettingsProvider" error on Project pages
- Added missing `SettingsProvider` wrapper to tags and projects layouts

## [0.2.0] - 2026-01-07

### New Features

**Settings Panel**
- Added settings panel for customizing time format (12h/24h)
- Primary color selection for personalized theming

### Improvements

**Calendar**
- Calendar now displays full width for better visibility
- Fixed month selector functionality

**Tag Display**
- Updated tag display styling
- Added document titles for improved navigation

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
