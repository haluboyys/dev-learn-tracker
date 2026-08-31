import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { verifySessionToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize / ensure DB schema
	if (event.platform?.env?.DB) {
		try {
			getDb(event.platform);
		} catch (e) {
			console.error('Failed to initialize DB', e);
		}
	}

	const sessionToken = event.cookies.get('session_auth');
	let user = null;

	if (sessionToken) {
		const payload = await verifySessionToken(sessionToken, event.platform);
		if (payload) {
			user = {
				id: payload.userId,
				email: payload.email,
				name: payload.name
			};
		}
	}

	event.locals.user = user;
	const isAuth = !!user;
	const pathname = event.url.pathname;

	// Public routes
	const isPublicRoute = pathname === '/login' || pathname === '/register';

	if (isPublicRoute) {
		if (isAuth) {
			throw redirect(303, '/materials');
		}
	} else if (!isAuth) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
