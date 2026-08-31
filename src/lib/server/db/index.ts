import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
	id text PRIMARY KEY NOT NULL,
	email text UNIQUE NOT NULL,
	password_hash text NOT NULL,
	name text NOT NULL,
	created_at integer NOT NULL
);

CREATE TABLE IF NOT EXISTS materials (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	title text NOT NULL,
	category text DEFAULT 'General' NOT NULL,
	color text DEFAULT '#e2b342' NOT NULL,
	url text,
	status text DEFAULT 'todo' NOT NULL,
	notes text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	created_at integer NOT NULL,
	updated_at integer NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS projects (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	title text NOT NULL,
	description text DEFAULT '' NOT NULL,
	category text DEFAULT 'Project' NOT NULL,
	color text DEFAULT '#64b5d6' NOT NULL,
	repo_url text,
	live_url text,
	status text DEFAULT 'todo' NOT NULL,
	created_at integer NOT NULL,
	updated_at integer NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
);
`;

const initializedDbs = new WeakSet<object>();

export function getDb(platform?: Readonly<App.Platform> | App.Platform) {
	if (!platform?.env?.DB) {
		throw new Error('Database binding DB not found in platform.env');
	}

	const d1 = platform.env.DB;

	// Auto ensure tables exist on local/first run
	if (!initializedDbs.has(d1)) {
		initializedDbs.add(d1);
		d1.exec(SCHEMA_SQL).catch((err: unknown) => {
			console.error('Error auto-migrating D1 schema:', err);
		});
	}

	return drizzleD1(d1, { schema });
}
