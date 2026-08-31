import { getDb } from '$lib/server/db';
import { materials } from '$lib/server/db/schema';
import { desc, asc, eq, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const user = locals.user!;
	const db = getDb(platform);

	const allMaterials = await db
		.select()
		.from(materials)
		.where(eq(materials.userId, user.id))
		.orderBy(asc(materials.order), desc(materials.createdAt));

	const totalMaterials = allMaterials.length;
	const totalDone = allMaterials.filter((m: any) => m.status === 'done').length;
	const totalInProgress = allMaterials.filter((m: any) => m.status === 'in_progress').length;
	const totalTodo = allMaterials.filter((m: any) => m.status === 'todo').length;
	const overallProgress = totalMaterials > 0 ? Math.round((totalDone / totalMaterials) * 100) : 0;

	// Extract unique categories for filtering
	const categories = Array.from(new Set(allMaterials.map((m: any) => m.category || 'General')));

	return {
		materials: allMaterials,
		categories,
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
	createMaterial: async ({ request, locals, platform }) => {
		const user = locals.user!;
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const category = data.get('category')?.toString()?.trim() || 'General';
		const color = data.get('color')?.toString()?.trim() || '#e2b342';
		const url = data.get('url')?.toString()?.trim() || null;
		const notes = data.get('notes')?.toString()?.trim() || '';

		if (!title) {
			return fail(400, { error: 'Material title is required' });
		}

		const db = getDb(platform);
		await db.insert(materials).values({
			id: nanoid(10),
			userId: user.id,
			title,
			category,
			color,
			url,
			status: 'todo',
			notes,
			order: 0,
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
			.update(materials)
			.set({
				status,
				updatedAt: new Date()
			})
			.where(and(eq(materials.id, id), eq(materials.userId, user.id)));

		return { success: true };
	},

	deleteMaterial: async ({ request, locals, platform }) => {
		const user = locals.user!;
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Invalid ID' });

		const db = getDb(platform);
		await db
			.delete(materials)
			.where(and(eq(materials.id, id), eq(materials.userId, user.id)));

		return { success: true };
	}
};
