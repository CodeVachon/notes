# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands use Bun as the runtime:

```bash
bun run dev       # Start development server
bun run build     # Build for production
bun run start     # Start production server
bun run lint      # Run ESLint
bun run format    # Format all files with Prettier
bun run format:check  # Check formatting compliance
```

### Database Commands

```bash
bun run docker:up     # Start PostgreSQL container
bun run docker:down   # Stop PostgreSQL container
bun run docker:logs   # View PostgreSQL logs

bun run db:generate   # Generate migrations from schema changes
bun run db:migrate    # Apply migrations to database
bun run db:push       # Push schema directly (dev only)
bun run db:studio     # Open Drizzle Studio GUI
```

## Architecture

This is a Next.js 16 App Router project using:

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with OKLch color theming
- **UI Components**: Base UI primitives with shadcn-style patterns
- **Icons**: Tabler Icons React
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with GitHub OAuth

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - Reusable UI components (button, card, input, etc.)
- `src/components/` - Application-specific components
- `src/db/schema/` - Drizzle ORM schema definitions
- `src/db/migrations/` - Generated SQL migrations
- `src/lib/auth.ts` - Better Auth configuration
- `src/lib/auth-client.ts` - Client-side auth utilities
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging
- `src/styles/globals.css` - Global styles and CSS theme variables

### Import Alias

Use `@/` for absolute imports from `src/`:

```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { db } from "@/db";
```

### Database Layer

Drizzle ORM with PostgreSQL. Schema defined in `src/db/schema/` with tables for users, sessions, todos, notes, comments, tags, and projects. Database connection in `src/db/index.ts`.

Schema changes workflow:
1. Edit schema files in `src/db/schema/`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:push` (dev) or `bun run db:migrate` (prod)

### Server Actions

Server actions are co-located with their routes in `actions.ts` files:
- `src/app/notebook/actions.ts` - Todo, note, and comment CRUD
- `src/app/projects/actions.ts` - Project management
- `src/app/tags/actions.ts` - Tag extraction and syncing

Actions use a `getUser()` helper that validates the session via Better Auth.

### Component Patterns

UI components use class-variance-authority (CVA) for type-safe variants:

```typescript
const buttonVariants = cva("base-classes", {
  variants: { variant: {...}, size: {...} },
  defaultVariants: {...}
})
```

Components follow a composable subcomponent pattern:

```tsx
<Card>
    <CardHeader>
        <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>...</CardContent>
</Card>
```

### Theming

CSS variables defined in `src/styles/globals.css` control colors. Dark mode is applied via `.dark` class on root element. Theme colors use OKLch color space with semantic naming (`--primary`, `--secondary`, `--accent`, `--destructive`, etc.).

## Code Style

- Print width: 100 characters
- Indentation: 4 spaces (2 for JSON/YAML)
- No trailing commas
- Double quotes
- Tailwind classes auto-sorted by Prettier plugin
