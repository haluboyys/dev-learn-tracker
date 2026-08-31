import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

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
	const isAuth = sessionToken === 'authenticated';
	const pathname = event.url.pathname;

	// Public routes
	if (pathname === '/login') {
		if (isAuth) {
			throw redirect(303, '/materials');
		}
	} else if (!isAuth) {
		throw redirect(303, '/login');
	}

	const themeCookie = event.cookies.get('theme') || 'light';

	return resolve(event, {
		transformPageChunk: ({ html }) => {
			if (themeCookie === 'dark') {
				return html.replace('<html lang="en">', '<html lang="en" class="dark">');
			}
			return html;
		}
	});
};
