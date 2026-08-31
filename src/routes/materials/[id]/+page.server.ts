import { getDb } from '$lib/server/db';
import { materials, topics } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const materialList = await db.select().from(materials).where(eq(materials.id, params.id)).limit(1);

	if (!materialList || materialList.length === 0) {
		throw error(404, 'Materi tidak ditemukan');
	}

	const material = materialList[0];
	const topicList = await db.select().from(topics).where(eq(topics.id, material.topicId)).limit(1);
	const topic = topicList.length > 0 ? topicList[0] : null;

	return {
		material,
		topic
	};
};

export const actions: Actions = {
	saveNotes: async ({ params, request, platform }) => {
		const data = await request.formData();
		const notes = data.get('notes')?.toString() ?? '';
		const title = data.get('title')?.toString()?.trim();
		const status = data.get('status')?.toString() as 'todo' | 'in_progress' | 'done';

		const db = getDb(platform);
		await db
			.update(materials)
			.set({
				notes,
				...(title ? { title } : {}),
				...(status ? { status } : {}),
				updatedAt: new Date()
			})
			.where(eq(materials.id, params.id));

		return { success: true };
	}
};
