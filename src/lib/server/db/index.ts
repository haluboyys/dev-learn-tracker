import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'node:fs';
import path from 'node:path';

let localDbInstance: ReturnType<typeof drizzleSqlite> | null = null;

function getLocalDevDb() {
	if (!localDbInstance) {
		const dbDir = path.resolve(process.cwd(), '.data');
		if (!fs.existsSync(dbDir)) {
			fs.mkdirSync(dbDir, { recursive: true });
		}
		const sqlite = new Database(path.join(dbDir, 'local.sqlite'));
		
		// Run initial migrations if table doesn't exist
		sqlite.exec(`
			CREATE TABLE IF NOT EXISTS topics (
				id text PRIMARY KEY NOT NULL,
				title text NOT NULL,
				color text DEFAULT '#facc15' NOT NULL,
				"order" integer DEFAULT 0 NOT NULL,
				created_at integer NOT NULL
			);
			CREATE TABLE IF NOT EXISTS materials (
				id text PRIMARY KEY NOT NULL,
				topic_id text NOT NULL,
				title text NOT NULL,
				url text,
				status text DEFAULT 'todo' NOT NULL,
				notes text DEFAULT '' NOT NULL,
				"order" integer DEFAULT 0 NOT NULL,
				created_at integer NOT NULL,
				updated_at integer NOT NULL,
				FOREIGN KEY (topic_id) REFERENCES topics(id) ON UPDATE no action ON DELETE cascade
			);
			CREATE TABLE IF NOT EXISTS projects (
				id text PRIMARY KEY NOT NULL,
				title text NOT NULL,
				description text DEFAULT '' NOT NULL,
				repo_url text,
				live_url text,
				status text DEFAULT 'todo' NOT NULL,
				topic_id text,
				created_at integer NOT NULL,
				updated_at integer NOT NULL,
				FOREIGN KEY (topic_id) REFERENCES topics(id) ON UPDATE no action ON DELETE set null
			);
		`);

		localDbInstance = drizzleSqlite(sqlite, { schema });
	}
	return localDbInstance;
}

export function getDb(platform?: Readonly<App.Platform> | App.Platform) {
	if (platform?.env?.DB) {
		return drizzleD1(platform.env.DB, { schema });
	}
	// Fallback to local SQLite when running locally in development mode
	return getLocalDevDb() as any;
}
