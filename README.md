# Maestro

A lightweight, standalone alternative to DBOS Conductor. Maestro connects directly to a
[DBOS](https://www.dbos.dev/) system database and lets you inspect and manage workflows —
no agent or DBOS Cloud account required.

Built with SvelteKit (async SSR + remote functions), Tailwind CSS 4, shadcn-svelte, and
[`@dbos-inc/dbos-sdk`](https://www.npmjs.com/package/@dbos-inc/dbos-sdk)'s `DBOSClient`.

## Features

- **Workflows** — paged list of all workflows with status and name filters
  - Cancel a PENDING / ENQUEUED / DELAYED workflow
  - Delete a workflow (only allowed for CANCELLED or SUCCESS workflows; enforced server-side)
  - Fork a workflow from a chosen start step
- **Queues** — paged list of queued workflows, filterable by queue name, with the same actions
- **Schedules** — list workflow schedules (cron, status, timezone, queue, last fired) and delete them

## Configuration

Set the connection string for the DBOS **system** database (usually `<appdb>_dbos_sys`):

```bash
DBOS_SYSTEM_DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dbos_sys
# optional, defaults to `dbos`
DBOS_SYSTEM_DATABASE_SCHEMA=dbos
```

Environment variables are declared in `src/env.ts` and read via `$app/env/private`.
Put them in a `.env` file for local development.

### Authentication

The app is gated behind Google sign-in ([better-auth](https://www.better-auth.com/)). Sessions
and accounts are stored in a local SQLite file (`auth.db` at the project root, gitignored).

1. Create an OAuth client in the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (Web application
   type). Add an authorized redirect URI of `<BETTER_AUTH_URL>/api/auth/callback/google`,
   e.g. `http://localhost:5173/api/auth/callback/google` for local dev.
2. Set the required env vars:

   ```bash
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   BETTER_AUTH_SECRET=...      # generate with `openssl rand -base64 32`
   BETTER_AUTH_URL=http://localhost:5173

   # optional — restrict sign-in to a single Google Workspace domain
   ALLOWED_EMAIL_DOMAIN=example.com
   ```

3. Create the auth database schema (one-time, and again after upgrading `better-auth` if it
   adds fields):

   ```bash
   pnpm exec auth migrate --config auth.cli.config.ts
   ```

   `auth.cli.config.ts` is a standalone config used only by this CLI — it can't resolve the
   `$app/env/private` import that `src/lib/server/auth.ts` uses, since the CLI runs outside Vite.

## Development

```bash
pnpm install
pnpm run dev       # start dev server
pnpm run check     # svelte-kit sync + svelte-check
pnpm run lint      # prettier --check + eslint
pnpm run test      # vitest
pnpm run build     # production build (adapter-node)
node build         # run the production server
```

## Project layout

- `src/lib/server/dbos.ts` — lazy singleton `DBOSClient` connected to the system database
- `src/lib/server/auth.ts` — `better-auth` instance (Google provider, SQLite storage, email
  domain restriction); `src/lib/auth-client.ts` is the client-side counterpart
- `src/hooks.server.ts` — mounts the better-auth handler and redirects unauthenticated
  requests to `/login`
- `src/lib/remote/workflow.remote.ts` — `query`/`command` remote functions for listing,
  cancelling, deleting, and forking workflows
- `src/lib/remote/schedule.remote.ts` — remote functions for listing and deleting schedules
- `src/routes/login` — the sign-in page (outside the authenticated app shell)
- `src/routes/(app)/{workflows,queues,schedules}` — the three pages, wrapped in the sidebar
  layout; tables and dialogs live in `src/lib/components`
