import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	/** Connection string for the DBOS system database (e.g. postgresql://user:pass@host:5432/app_dbos_sys). */
	DBOS_SYSTEM_DATABASE_URL: {
		schema: (value) => value
	},
	/** Optional schema name for the DBOS system tables. Defaults to `dbos`. */
	DBOS_SYSTEM_DATABASE_SCHEMA: {
		schema: (value) => value
	},
	/** OAuth client ID for the Google login button (Google Cloud Console > APIs & Services > Credentials). */
	GOOGLE_CLIENT_ID: {
		schema: (value) => value
	},
	/** OAuth client secret matching GOOGLE_CLIENT_ID. */
	GOOGLE_CLIENT_SECRET: {
		schema: (value) => value
	},
	/** Secret used by better-auth to sign sessions and cookies. Generate with `openssl rand -base64 32`. */
	BETTER_AUTH_SECRET: {
		schema: (value) => value
	},
	/** Public base URL of this app, used to build the Google OAuth redirect URI (e.g. http://localhost:5173). */
	BETTER_AUTH_URL: {
		schema: (value) => value
	},
	/** Optional email domain (e.g. `mavenmetrics.io`). When set, only Google accounts on this domain may sign in. */
	ALLOWED_EMAIL_DOMAIN: {
		schema: (value) => value
	}
});
