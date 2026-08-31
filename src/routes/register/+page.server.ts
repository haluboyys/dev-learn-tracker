import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { hashPassword, createSessionToken, setSessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/materials');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const { request, platform } = event;
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const email = data.get('email')?.toString()?.trim().toLowerCase();
		const password = data.get('password')?.toString()?.trim();

		if (!name || !email || !password) {
			return fail(400, { error: 'Name, email, and password are required' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters' });
		}

		const db = getDb(platform);
		const existingUserList = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (existingUserList.length > 0) {
			return fail(400, { error: 'Email is already registered. Please sign in.' });
		}

		const passwordHash = await hashPassword(password);
		const newUser = {
			id: nanoid(12),
			name,
			email,
			passwordHash,
			createdAt: new Date()
		};

		await db.insert(users).values(newUser);

		const token = await createSessionToken(
			{
				id: newUser.id,
				email: newUser.email,
				name: newUser.name
			},
			platform
		);

		setSessionCookie(event, token);
		throw redirect(303, '/materials');
	}
};
