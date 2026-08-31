import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session_auth');
	const isAuth = sessionToken === 'authenticated';
	const pathname = event.url.pathname;

	// Public routes
	if (pathname === '/login') {
		if (isAuth) {
			throw redirect(303, '/materials');
		}
		return resolve(event);
	}

	// Protect all other routes
	if (!isAuth) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
