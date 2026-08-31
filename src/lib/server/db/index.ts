import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

const SCHEMA_SQL = `
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
`;

const initializedDbs = new WeakSet<D1Database>();

export function getDb(platform?: Readonly<App.Platform> | App.Platform) {
	if (!platform?.env?.DB) {
		throw new Error('Database binding DB not found in platform.env');
	}

	const d1 = platform.env.DB;

	// Auto ensure tables exist on local/first run
	if (!initializedDbs.has(d1)) {
		initializedDbs.add(d1);
		d1.exec(SCHEMA_SQL).catch((err) => {
			console.error('Error auto-migrating D1 schema:', err);
		});
	}

	return drizzleD1(d1, { schema });
}
