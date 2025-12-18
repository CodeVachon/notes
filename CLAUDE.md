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

## Architecture

This is a Next.js 16 App Router project using:

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with OKLch color theming
- **UI Components**: Base UI primitives with shadcn-style patterns
- **Icons**: Tabler Icons React

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - Reusable UI components (button, card, input, etc.)
- `src/components/` - Application-specific components
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging
- `src/styles/globals.css` - Global styles and CSS theme variables

### Import Alias

Use `@/` for absolute imports from `src/`:

```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

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
