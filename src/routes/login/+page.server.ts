import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const isAuth = cookies.get('session_auth') === 'authenticated';
	if (isAuth) {
		throw redirect(303, '/materials');
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies, platform }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString()?.trim();

		const expectedCode = platform?.env?.ACCESS_CODE || process.env.ACCESS_CODE || 'belajarcoding';

		if (!code) {
			return fail(400, { error: 'Access code is required!' });
		}

		if (code !== expectedCode) {
			return fail(401, { error: 'Invalid access code!' });
		}

		// Set cookie
		cookies.set('session_auth', 'authenticated', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			secure: process.env.NODE_ENV === 'production'
		});

		throw redirect(303, '/materials');
	},
	logout: async ({ cookies }) => {
		cookies.delete('session_auth', { path: '/' });
		throw redirect(303, '/login');
	}
};
