import { getDb } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const user = locals.user!;
	const db = getDb(platform);

	const allProjects = await db
		.select()
		.from(projects)
		.where(eq(projects.userId, user.id))
		.orderBy(desc(projects.createdAt));

	const stats = {
		total: allProjects.length,
		done: allProjects.filter((p: any) => p.status === 'done').length,
		inProgress: allProjects.filter((p: any) => p.status === 'in_progress').length,
		todo: allProjects.filter((p: any) => p.status === 'todo').length
	};

	const categories = Array.from(new Set(allProjects.map((p: any) => p.category || 'Project')));

	return {
		projects: allProjects,
		categories,
		stats
	};
};

export const actions: Actions = {
	createProject: async ({ request, locals, platform }) => {
		const user = locals.user!;
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const description = data.get('description')?.toString()?.trim() || '';
		const category = data.get('category')?.toString()?.trim() || 'Project';
		const color = data.get('color')?.toString()?.trim() || '#64b5d6';
		const repoUrl = data.get('repoUrl')?.toString()?.trim() || null;
		const liveUrl = data.get('liveUrl')?.toString()?.trim() || null;
		const status = (data.get('status')?.toString() as 'todo' | 'in_progress' | 'done') || 'todo';

		if (!title) {
			return fail(400, { error: 'Project title is required' });
		}

		const db = getDb(platform);
		await db.insert(projects).values({
			id: nanoid(10),
			userId: user.id,
			title,
			description,
			category,
			color,
			repoUrl,
			liveUrl,
			status,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		return { success: true };
	},

	updateStatus: async ({ request, locals, platform }) => {
		const user = locals.user!;
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const status = data.get('status')?.toString() as 'todo' | 'in_progress' | 'done';

		if (!id || !['todo', 'in_progress', 'done'].includes(status)) {
			return fail(400, { error: 'Invalid status' });
		}

		const db = getDb(platform);
		await db
			.update(projects)
			.set({
				status,
				updatedAt: new Date()
			})
			.where(and(eq(projects.id, id), eq(projects.userId, user.id)));

		return { success: true };
	},

	deleteProject: async ({ request, locals, platform }) => {
		const user = locals.user!;
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Invalid ID' });

		const db = getDb(platform);
		await db
			.delete(projects)
			.where(and(eq(projects.id, id), eq(projects.userId, user.id)));

		return { success: true };
	}
};
