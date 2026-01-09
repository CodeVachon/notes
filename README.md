# Notes

A personal note-taking and task management application built with Next.js 16. Features a daily notebook system with rich-text editing, todos with priorities, automatic tag extraction, and project organization.

## Features

### Daily Notebook

- Date-based note-taking interface with calendar navigation
- Navigate between dates with previous/next buttons
- Smart date labels ("Today", "Yesterday", "Tomorrow")
- Calendar view showing dates with existing content

### Todo Management

- Create, edit, and delete todos for each day
- Priority levels (low, medium, high) with visual badges
- Due time support
- Mark todos as complete/incomplete
- Copy todos to different dates with source tracking
- Rich-text descriptions

### Notes

- Rich-text notes with HTML content
- Tiptap editor with extensive formatting:
    - Text styles (bold, italic, underline, strikethrough)
    - Headings (H1, H2, H3)
    - Bulleted and numbered lists
    - Code blocks with syntax highlighting
    - Links, quotes, and dividers
    - YouTube video embedding
    - Markdown shortcuts

### Comments

- Add comments to both todos and notes
- Rich-text editing for comments
- Edit and delete functionality

### Tag System

- Automatic tag extraction using `[[tagname]]` syntax
- Tag autocomplete with suggestions
- Tag pages showing all mentions across notes, todos, and comments
- Tags overview page with mention counts

### Projects

- Create projects with custom colors and emoji icons
- Assign notes and todos to multiple projects
- Project pages displaying all assigned items
- Sidebar visibility toggle

### Authentication

- GitHub OAuth via Better Auth
- Private application with allowed user restriction

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) with GitHub OAuth
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/)
- **Icons**: [Tabler Icons](https://tabler.io/icons)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)
- [Docker](https://www.docker.com/) (for PostgreSQL)
- A [GitHub](https://github.com/) account (for OAuth setup)

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd notes
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

### 4. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"** (or go to OAuth Apps > New OAuth App)
3. Fill in the application details:
    - **Application name**: Notes (or any name you prefer)
    - **Homepage URL**: `http://localhost:3000`
    - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. On the next page, copy the **Client ID**
6. Click **"Generate a new client secret"** and copy the secret
7. Add these values to your `.env` file:

```env
GITHUB_CLIENT_ID="your_client_id_here"
GITHUB_CLIENT_SECRET="your_client_secret_here"
```

### 5. Generate Better Auth Secret

Generate a secure secret for Better Auth:

```bash
bunx @better-auth/cli secret
```

Add the generated secret to your `.env` file:

```env
BETTER_AUTH_SECRET="your_generated_secret_here"
```

### 6. Set Allowed GitHub Username

Set your GitHub username to restrict access:

```env
ALLOWED_GITHUB_USERNAME="your_github_username"
```

### 7. Start the Database

```bash
bun run docker:up
```

### 8. Push the Database Schema

```bash
bun run db:push
```

### 9. Start the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

## Environment Variables

| Variable                  | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string                             |
| `BETTER_AUTH_SECRET`      | Secret key for Better Auth session encryption            |
| `BETTER_AUTH_URL`         | Base URL of the application                              |
| `GITHUB_CLIENT_ID`        | GitHub OAuth application client ID                       |
| `GITHUB_CLIENT_SECRET`    | GitHub OAuth application client secret                   |
| `ALLOWED_GITHUB_USERNAME` | GitHub username(s) allowed to sign in (case-insensitive) |

## Available Commands

### Development

```bash
bun run dev           # Start development server
bun run build         # Build for production
bun run start         # Start production server
bun run lint          # Run ESLint
bun run format        # Format files with Prettier
bun run format:check  # Check formatting compliance
```

### Database

```bash
bun run docker:up     # Start PostgreSQL container
bun run docker:down   # Stop PostgreSQL container
bun run docker:logs   # View PostgreSQL logs
bun run db:generate   # Generate migrations from schema changes
bun run db:migrate    # Apply migrations to database
bun run db:push       # Push schema directly (dev only)
bun run db:studio     # Open Drizzle Studio GUI
```

## Production Deployment

For production deployment:

1. Set `BETTER_AUTH_URL` to your production domain
2. Update the GitHub OAuth app with production URLs:
    - Homepage URL: `https://your-domain.com`
    - Callback URL: `https://your-domain.com/api/auth/callback/github`
3. Use `bun run db:migrate` instead of `db:push` for production databases
4. Run `bun run build` followed by `bun run start`

## License

Private project.
