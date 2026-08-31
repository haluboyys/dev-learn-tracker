import { getDb } from '$lib/server/db';
import { materials } from '$lib/server/db/schema';
import { desc, asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);

	const allMaterials = await db
		.select()
		.from(materials)
		.orderBy(asc(materials.order), desc(materials.createdAt));

	const totalMaterials = allMaterials.length;
	const totalDone = allMaterials.filter((m: any) => m.status === 'done').length;
	const totalInProgress = allMaterials.filter((m: any) => m.status === 'in_progress').length;
	const totalTodo = allMaterials.filter((m: any) => m.status === 'todo').length;
	const overallProgress = totalMaterials > 0 ? Math.round((totalDone / totalMaterials) * 100) : 0;

	// Extract unique categories for filtering
	const categories = Array.from(new Set(allMaterials.map((m: any) => m.category || 'Umum')));

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
	createMaterial: async ({ request, platform }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const category = data.get('category')?.toString()?.trim() || 'Umum';
		const color = data.get('color')?.toString()?.trim() || '#facc15';
		const url = data.get('url')?.toString()?.trim() || null;
		const notes = data.get('notes')?.toString()?.trim() || '';

		if (!title) {
			return fail(400, { error: 'Judul materi wajib diisi' });
		}

		const db = getDb(platform);
		await db.insert(materials).values({
			id: nanoid(10),
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
