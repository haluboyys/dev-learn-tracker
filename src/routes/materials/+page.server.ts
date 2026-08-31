import { getDb } from '$lib/server/db';
import { topics, materials } from '$lib/server/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);

	const allTopics = await db.select().from(topics).orderBy(asc(topics.order), asc(topics.createdAt));
	const allMaterials = await db.select().from(materials).orderBy(asc(materials.order), asc(materials.createdAt));

	// Group materials by topic
	const grouped = allTopics.map((topic: any) => {
		const items = allMaterials.filter((m: any) => m.topicId === topic.id);
		const total = items.length;
		const doneCount = items.filter((m: any) => m.status === 'done').length;
		const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

		return {
			...topic,
			materials: items,
			total,
			doneCount,
			progress
		};
	});

	// Overall stats
	const totalMaterials = allMaterials.length;
	const totalDone = allMaterials.filter((m: any) => m.status === 'done').length;
	const totalInProgress = allMaterials.filter((m: any) => m.status === 'in_progress').length;
	const totalTodo = allMaterials.filter((m: any) => m.status === 'todo').length;
	const overallProgress = totalMaterials > 0 ? Math.round((totalDone / totalMaterials) * 100) : 0;

	return {
		topics: grouped,
		stats: {
			totalMaterials,
			totalDone,
			totalInProgress,
			totalTodo,
			overallProgress
		}
	};
};

export const actions: Actions = {
	createTopic: async ({ request, platform }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const color = data.get('color')?.toString()?.trim() || '#facc15';

		if (!title) {
			return fail(400, { error: 'Judul topik wajib diisi' });
		}

		const db = getDb(platform);
		await db.insert(topics).values({
			id: nanoid(10),
			title,
			color,
			order: 0,
			createdAt: new Date()
		});

		return { success: true };
	},

	deleteTopic: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID tidak valid' });

		const db = getDb(platform);
		await db.delete(topics).where(eq(topics.id, id));
		return { success: true };
	},

	createMaterial: async ({ request, platform }) => {
		const data = await request.formData();
		const topicId = data.get('topicId')?.toString();
		const title = data.get('title')?.toString()?.trim();
		const url = data.get('url')?.toString()?.trim() || null;
		const notes = data.get('notes')?.toString()?.trim() || '';

		if (!topicId || !title) {
			return fail(400, { error: 'Topik dan judul materi wajib diisi' });
		}

		const db = getDb(platform);
		await db.insert(materials).values({
			id: nanoid(10),
			topicId,
			title,
			url,
			status: 'todo',
			notes,
			order: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		return { success: true };
	},

	updateStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const status = data.get('status')?.toString() as 'todo' | 'in_progress' | 'done';

		if (!id || !['todo', 'in_progress', 'done'].includes(status)) {
			return fail(400, { error: 'Status tidak valid' });
		}

		const db = getDb(platform);
		await db
			.update(materials)
			.set({
				status,
				updatedAt: new Date()
			})
			.where(eq(materials.id, id));

		return { success: true };
	},

	deleteMaterial: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID tidak valid' });

		const db = getDb(platform);
		await db.delete(materials).where(eq(materials.id, id));
		return { success: true };
	}
};
