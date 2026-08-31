import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const topics = sqliteTable('topics', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	color: text('color').notNull().default('#facc15'), // default yellow
	order: integer('order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const materials = sqliteTable('materials', {
	id: text('id').primaryKey(),
	topicId: text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
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
	repoUrl: text('repo_url'),
	liveUrl: text('live_url'),
	status: text('status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
	topicId: text('topic_id').references(() => topics.id, { onDelete: 'set null' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
