import path from 'node:path';

import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';

/**
 * Config for the `auth` CLI only (`pnpm exec auth migrate --config auth.cli.config.ts`).
 * The CLI runs outside of Vite, so it can't resolve the `$app/env/private` import used by
 * src/lib/server/auth.ts. Only the `database` shape matters for schema generation/migration —
 * social providers and hooks are irrelevant to the CLI, so they're omitted here. Keep
 * AUTH_DATABASE_PATH in sync with src/lib/server/auth.ts.
 */
export const auth = betterAuth({
	database: new Database(path.join(process.cwd(), 'auth.db'))
});
