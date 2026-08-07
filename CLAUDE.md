# Maestro — SvelteKit DBOS workflow manager

Standalone DBOS Conductor-style app. Connects to a DBOS system database via
`@dbos-inc/dbos-sdk`'s `DBOSClient` and manages workflows, queues, and schedules.

## Framework notes (SvelteKit 3 "next")

- Kit/adapter config lives **inline in `vite.config.ts`** inside the `sveltekit()` plugin —
  there is no `svelte.config.js`. Async compilation (`compilerOptions.experimental.async`) and
  `experimental.remoteFunctions` are enabled there.
- Use `#lib/...` package imports (defined in `package.json` `imports`), **not** `$lib` —
  `$lib` does not exist in this Kit version.
- Env vars are declared in `src/env.ts` with `defineEnvVars` and imported from
  `$app/env/private` (not `$env/dynamic/private`). Adding a variable requires declaring it
  in `src/env.ts` first.
- Svelte 5 runes only (`$state`, `$derived`, `$props`); runes mode is forced in vite config.

## Conventions (mirrors mavenmetrics/client)

- Remote functions in `src/lib/remote/*.remote.ts` using `query`/`command` from `$app/server`
  with valibot schemas. Server-only helpers in `src/lib/server/`.
- Data loading in pages: `<svelte:boundary>` with `pending`/`failed` snippets and
  `{@const result = await someQuery}` — avoid `{#await}` for remote functions.
  After a mutation, call `.refresh()` on the query the page holds.
- UI: shadcn-svelte components in `src/lib/components/ui/` (copied, not CLI-managed),
  icons from `@lucide/svelte/icons/*`, toasts via `svelte-sonner`.
- Delete/cancel eligibility rules live in `src/lib/workflow-status.ts` and are enforced
  server-side in the remote functions (client-side disabling is cosmetic).

## Commands

- `pnpm run dev` / `check` / `lint` / `format` / `test` / `build`
- Requires `DBOS_SYSTEM_DATABASE_URL` (see README). Without it, pages render an error
  boundary with a retry button.

## Before commit

- `pnpm run lint` and `pnpm run check` must pass.
