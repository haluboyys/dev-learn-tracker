import { getDb } from '$lib/server/db';
import { materials } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const user = locals.user!;
	const db = getDb(platform);
	const materialList = await db
		.select()
		.from(materials)
		.where(and(eq(materials.id, params.id), eq(materials.userId, user.id)))
		.limit(1);

	if (!materialList || materialList.length === 0) {
		throw error(404, 'Material topic not found');
	}

	return {
		material: materialList[0]
	};
};

export const actions: Actions = {
	saveNotes: async ({ params, request, locals, platform }) => {
		const user = locals.user!;
		const data = await request.formData();
		const notes = data.get('notes')?.toString() ?? '';
		const title = data.get('title')?.toString()?.trim();
		const category = data.get('category')?.toString()?.trim();
		const status = data.get('status')?.toString() as 'todo' | 'in_progress' | 'done';

		const db = getDb(platform);
		await db
			.update(materials)
			.set({
				notes,
				...(title ? { title } : {}),
				...(category ? { category } : {}),
				...(status ? { status } : {}),
				updatedAt: new Date()
			})
			.where(and(eq(materials.id, params.id), eq(materials.userId, user.id)));

		return { success: true };
	}
};
