import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSessionToken, setSessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/materials');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const { request, platform } = event;
		const data = await request.formData();
		const email = data.get('email')?.toString()?.trim().toLowerCase();
		const password = data.get('password')?.toString()?.trim();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const db = getDb(platform);
		const existingUserList = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (existingUserList.length === 0) {
			return fail(401, { error: 'Invalid email or password' });
		}

		const user = existingUserList[0];
		const passwordValid = await verifyPassword(password, user.passwordHash);

		if (!passwordValid) {
			return fail(401, { error: 'Invalid email or password' });
		}

		const token = await createSessionToken(
			{
				id: user.id,
				email: user.email,
				name: user.name
			},
			platform
		);

		setSessionCookie(event, token);
		throw redirect(303, '/materials');
	}
};
