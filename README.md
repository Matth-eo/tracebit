# Tracebit

A simple, private issue tracker built with Next.js 16, React 19, Tailwind CSS 4, Prisma, and PostgreSQL. Uses the existing email/password authentication and database-backed session cookies.

## Local setup

1. Install dependencies: `npm install`.
2. Set `DATABASE_URL` and `AUTH_SECRET` in `.env` (do not commit secrets).
3. Generate the client: `npx prisma generate`.
4. Apply migrations: `npx prisma migrate deploy`.
5. Start the app: `npm run dev`.

## Project-to-issue flow

Register or log in, then open Projects from the sidebar. Create a project to go directly to its detail page. Create issues with a title, optional description, type (Bug/Feature/Task), status (Todo/In Progress/Done), and priority (Low/Medium/High). Use Save status on an issue to move work forward. Expand Edit issue to edit all fields, or use Delete issue and confirm to remove it. Expand Edit project to rename the project, update its description, or delete it. Project deletion also deletes its issues and returns you to Projects. Every mutation refreshes dashboard and list data. Omitted issue descriptions are stored as empty strings using the existing schema; no additional migration is required.

The dashboard shows project totals, open issues (Todo + In Progress), in-progress issues, completed issues, and the newest projects/issues. Issues lists your issues and links back to the corresponding project and issue. Search titles (case-insensitive), combine status/priority/type filters, then select Apply filters. Filters persist in the URL; Clear resets them. All filtering happens in PostgreSQL and remains scoped to your account.

Projects belong to the authenticated user. Issue access is checked through the parent project's owner in server-side reads and mutations. Foreign project URLs return 404. No membership or collaboration features are included.

## Verification

- `npm run lint`
- `npm run build`
- `node --test tests/issue-actions.test.cjs tests/issue-filters.test.cjs` (20 tests covering mutation guards, optional descriptions, combined search/filter queries, invalid query parameters, and owner-scoped dashboard data)

## Main files

- `prisma/schema.prisma` and `prisma/migrations/20260906150000_add_issues/migration.sql`: issue model, enums, index, and project relation.
- `src/app/dashboard/layout.tsx`, `src/components/`, `src/app/globals.css`: responsive workspace shell and shared UI.
- `src/app/dashboard/page.tsx`: owner-scoped dashboard totals and recent work.
- `src/app/dashboard/projects/`: project list and project detail pages.
- `src/app/dashboard/actions.ts`: authenticated project creation, editing, deletion, and redirects.
- `src/app/dashboard/issues/`: all-issues page, issue forms, and guarded server actions.
- `src/lib/auth.ts`, `src/lib/workspace.ts`: existing session lookup and authenticated page guard.
