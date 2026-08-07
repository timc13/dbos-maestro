import { DBOSClient } from '@dbos-inc/dbos-sdk';

import { DBOS_SYSTEM_DATABASE_SCHEMA, DBOS_SYSTEM_DATABASE_URL } from '$app/env/private';

let client: Promise<DBOSClient> | undefined;

/**
 * Lazily create a single DBOSClient connected to the DBOS system database.
 * Connection is configured via the DBOS_SYSTEM_DATABASE_URL environment variable.
 */
export function getDbosClient(): Promise<DBOSClient> {
	if (!client) {
		if (!DBOS_SYSTEM_DATABASE_URL) {
			throw new Error('DBOS_SYSTEM_DATABASE_URL environment variable is not set');
		}
		client = DBOSClient.create({
			systemDatabaseUrl: DBOS_SYSTEM_DATABASE_URL,
			systemDatabaseSchemaName: DBOS_SYSTEM_DATABASE_SCHEMA || undefined,
			systemDatabasePoolSize: 5
		}).catch((error: unknown) => {
			// Allow a retry on the next request instead of caching the failure forever.
			client = undefined;
			throw error;
		});
	}
	return client;
}
