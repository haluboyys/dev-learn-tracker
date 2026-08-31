import { getDb } from '$lib/server/db';
import { materials, projects } from '$lib/server/db/schema';
import { desc, asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);

	const allMaterials = await db
		.select()
		.from(materials)
		.orderBy(asc(materials.order), desc(materials.createdAt));

	const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));

	// Enrich items
	const unifiedMaterials = allMaterials.map((m: any) => ({
		id: m.id,
		type: 'material' as const,
		title: m.title,
		category: m.category || 'Topic',
		color: m.color || '#facc15',
		status: m.status as 'todo' | 'in_progress' | 'done',
		url: m.url,
		notes: m.notes
	}));

	const unifiedProjects = allProjects.map((p: any) => ({
		id: p.id,
		type: 'project' as const,
		title: p.title,
		category: p.category || 'Project',
		color: p.color || '#22d3ee',
		status: p.status as 'todo' | 'in_progress' | 'done',
		description: p.description,
		repoUrl: p.repoUrl,
		liveUrl: p.liveUrl
	}));

	const allItems = [...unifiedMaterials, ...unifiedProjects];
	const categories = Array.from(new Set(allItems.map((i) => i.category)));

	return {
		items: allItems,
		categories
	};
};

export const actions: Actions = {
	moveItem: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const type = data.get('type')?.toString();
		const newStatus = data.get('status')?.toString() as 'todo' | 'in_progress' | 'done';

		if (!id || !type || !['todo', 'in_progress', 'done'].includes(newStatus)) {
			return fail(400, { error: 'Invalid payload' });
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
