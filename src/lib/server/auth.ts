import path from 'node:path';

import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import Database from 'better-sqlite3';

import { getRequestEvent } from '$app/server';
import {
	ALLOWED_EMAIL_DOMAIN,
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$app/env/private';

/**
 * Shared with auth.cli.config.ts (used only by `auth migrate`, which runs outside Vite and
 * can't resolve $app/env/private) — keep the sqlite path in sync if this changes.
 */
export const AUTH_DATABASE_PATH = path.join(process.cwd(), 'auth.db');

export const auth = betterAuth({
	database: new Database(AUTH_DATABASE_PATH),
	secret: BETTER_AUTH_SECRET,
	baseURL: BETTER_AUTH_URL,
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID ?? '',
			clientSecret: GOOGLE_CLIENT_SECRET ?? ''
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const domain = ALLOWED_EMAIL_DOMAIN?.trim();
					if (domain && !user.email.toLowerCase().endsWith(`@${domain.toLowerCase()}`)) {
						throw new APIError('FORBIDDEN', {
							message: `Sign-in is restricted to @${domain} accounts.`
						});
					}
				}
			}
		},
		session: {
			create: {
				// Re-checked here (not just on user create) so an account that was allowed when
				// created is rejected on every subsequent login if ALLOWED_EMAIL_DOMAIN
				// later changes or the account was created before the restriction existed.
				before: async (session, context) => {
					const domain = ALLOWED_EMAIL_DOMAIN?.trim();
					if (!domain) return;

					const user = await context?.context.internalAdapter.findUserById(session.userId);
					if (!user || !user.email.toLowerCase().endsWith(`@${domain.toLowerCase()}`)) {
						throw new APIError('FORBIDDEN', {
							message: `Sign-in is restricted to @${domain} accounts.`
						});
					}
				}
			}
		}
	},
	// Must be the last plugin — it attaches Set-Cookie headers to the SvelteKit response.
	plugins: [sveltekitCookies(getRequestEvent)]
});
