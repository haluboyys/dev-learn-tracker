import { getDb } from '$lib/server/db';
import { materials, projects, topics } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);

	const allTopics = await db.select().from(topics).orderBy(asc(topics.order));
	const allMaterials = await db.select().from(materials).orderBy(asc(materials.order));
	const allProjects = await db.select().from(projects).orderBy(asc(projects.createdAt));

	// Enrich items
	const unifiedMaterials = allMaterials.map((m: any) => ({
		id: m.id,
		type: 'material' as const,
		title: m.title,
		status: m.status as 'todo' | 'in_progress' | 'done',
		url: m.url,
		notes: m.notes,
		topicId: m.topicId,
		topic: allTopics.find((t: any) => t.id === m.topicId)
	}));

	const unifiedProjects = allProjects.map((p: any) => ({
		id: p.id,
		type: 'project' as const,
		title: p.title,
		status: p.status as 'todo' | 'in_progress' | 'done',
		description: p.description,
		repoUrl: p.repoUrl,
		liveUrl: p.liveUrl,
		topicId: p.topicId,
		topic: allTopics.find((t: any) => t.id === p.topicId)
	}));

	return {
		topics: allTopics,
		items: [...unifiedMaterials, ...unifiedProjects]
	};
};

export const actions: Actions = {
	moveItem: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const type = data.get('type')?.toString();
		const newStatus = data.get('status')?.toString() as 'todo' | 'in_progress' | 'done';

		if (!id || !type || !['todo', 'in_progress', 'done'].includes(newStatus)) {
			return fail(400, { error: 'Payload tidak valid' });
		}

		const db = getDb(platform);

		if (type === 'material') {
			await db
				.update(materials)
				.set({ status: newStatus, updatedAt: new Date() })
				.where(eq(materials.id, id));
		} else if (type === 'project') {
			await db
				.update(projects)
				.set({ status: newStatus, updatedAt: new Date() })
				.where(eq(projects.id, id));
		}

		return { success: true };
	}
};
