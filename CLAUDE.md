# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern notes application built with Next.js 14 (App Router) and Supabase, featuring Markdown editing, tagging, search, and image upload capabilities. The app is designed for anonymous access without authentication.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Database-First Architecture

This application uses **Supabase PostgreSQL** with Row Level Security (RLS) policies configured for anonymous access. The database schema must be initialized before the application can function:

1. **Primary setup**: Execute `database.sql` in Supabase SQL Editor
   - Creates `notes`, `tags`, and `note_tags` tables
   - Sets up RLS policies for anonymous access
   - Creates triggers for `updated_at` auto-update
   - Includes search indexes on `title` and `content`

2. **Image upload setup**: Execute `storage-setup.sql` in Supabase SQL Editor
   - Creates `note-images` storage bucket with public access
   - Required for image paste/upload functionality

### Data Flow Pattern

**Client → API Routes → Supabase**

- All data operations go through Next.js API routes (`app/api/`)
- Single Supabase client instance in `lib/supabase.ts`
- API routes handle data transformation (e.g., flattening `note_tags` joins)

### Key API Endpoints

- `GET /api/notes` - List notes with optional `?search=` and `?tagId=` params
- `POST /api/notes` - Create note with tags
- `PATCH /api/notes/[id]` - Update note (content, pinned status, tags)
- `DELETE /api/notes/[id]` - Delete note
- `GET /api/tags` - List all tags
- `POST /api/upload` - Upload images to Supabase Storage

### Component Architecture

**Single-Page Application with Dialog-Based Editing**

```
app/page.tsx
└── NotesPage (components/notes-page.tsx) - Main orchestrator
    ├── NoteCard (×N) - Display note preview
    ├── NoteViewer - Read-only full note view (dialog)
    ├── NoteEditor - Create/edit notes (dialog)
    └── ThemeToggle - Dark mode switcher
```

**Key architectural decisions:**

1. **Client-side state management**: All state lives in `NotesPage` component, passed down as props
2. **Optimistic UI**: Notes list refreshes after mutations (create/update/delete)
3. **Dialog pattern**:
   - Click note card → opens `NoteViewer` (read-only)
   - Click "编辑" button → opens `NoteEditor` (editable)
4. **Responsive design**: Uses Tailwind `sm:` breakpoints extensively for mobile/desktop variants

### Image Upload Flow

1. User pastes image (Ctrl/Cmd+V) or clicks "上传图片" button
2. File sent to `/api/upload` route
3. Uploaded to Supabase Storage `note-images` bucket
4. Public URL returned and inserted as Markdown: `![图片](url)`
5. Markdown editor renders image inline

### TypeScript Types

Central type definitions in `types/index.ts`:

- `Note` - Base note structure
- `Tag` - Tag with color
- `NoteWithTags` - Note extended with associated tags array (used throughout UI)

The API routes transform Supabase's nested join results into the `NoteWithTags` structure.

### Styling System

- **Tailwind CSS v4** with new `@theme` syntax in `globals.css`
- **shadcn/ui components** in `components/ui/`
- **Dark mode** via `next-themes` with system preference support
- **Mobile-first responsive**:
  - Padding: `p-4 sm:p-6`
  - Font sizes: `text-xs sm:text-sm`
  - Buttons: Shortened text on mobile (`<span className="sm:hidden">`)

### Critical CSS Overrides

`app/globals.css` contains important Markdown viewer styles to prevent horizontal scrolling:

```css
.wmde-markdown * {
  max-width: 100% !important;
  overflow-wrap: break-word !important;
}
```

These styles are essential for proper mobile display and should not be removed.

## Environment Configuration

Required `.env.local` variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both variables are prefixed with `NEXT_PUBLIC_` because they're used in client-side code.

## Important Constraints

1. **No authentication system**: The app relies on RLS policies with `USING (true)` for anonymous access
2. **No server-side rendering for editor**: `MDEditor` is dynamically imported with `{ ssr: false }`
3. **Dialog width responsiveness**: Uses `max-w-6xl w-[95vw]` pattern to ensure proper sizing on all screens
4. **Text overflow prevention**: All text containers include `break-words` classes to prevent layout issues

## Common Modifications

### Adding a new note field

1. Add column to `notes` table in Supabase
2. Update `Note` interface in `types/index.ts`
3. Update API routes in `app/api/notes/` to include new field
4. Update `NoteEditor` component to capture new field
5. Update `NoteViewer` and `NoteCard` to display new field

### Adding a new API endpoint

1. Create `app/api/[endpoint]/route.ts`
2. Import `supabase` from `lib/supabase`
3. Export `GET`, `POST`, `PATCH`, or `DELETE` async functions
4. Use `NextResponse.json()` for responses
5. Include proper error handling with try/catch

### Modifying mobile responsiveness

Look for patterns like:
- `className="text-xs sm:text-sm"` - Text sizing
- `className="hidden sm:inline"` - Show on desktop only
- `className="sm:hidden"` - Show on mobile only
- `className="p-4 sm:p-6"` - Responsive padding
