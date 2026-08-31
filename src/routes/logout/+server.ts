import { clearSessionCookie } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	clearSessionCookie(event);
	throw redirect(303, '/login');
};

export const GET: RequestHandler = async (event) => {
	clearSessionCookie(event);
	throw redirect(303, '/login');
};
