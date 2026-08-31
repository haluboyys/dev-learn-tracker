import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const materials = sqliteTable('materials', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	category: text('category').notNull().default('Umum'),
	color: text('color').notNull().default('#facc15'),
	url: text('url'),
	status: text('status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
	notes: text('notes').notNull().default(''),
	order: integer('order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const projects = sqliteTable('projects', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	category: text('category').notNull().default('Project'),
	color: text('color').notNull().default('#22d3ee'),
	repoUrl: text('repo_url'),
	liveUrl: text('live_url'),
	status: text('status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
