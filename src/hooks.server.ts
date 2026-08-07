import { redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { building } from '$app/env';
import { auth } from '#lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isAuthApi = pathname.startsWith('/api/auth');
	const isFrameworkAsset = pathname.startsWith('/_app/');
	const needsSession = !isAuthApi && !isFrameworkAsset;

	const session = needsSession
		? await auth.api.getSession({ headers: event.request.headers })
		: null;
	event.locals.session = session;

	if (needsSession) {
		if (session && pathname === '/login') {
			redirect(303, '/');
		}
		if (!session && pathname !== '/login') {
			const redirectTo = encodeURIComponent(pathname + event.url.search);
			redirect(303, `/login?redirectTo=${redirectTo}`);
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
