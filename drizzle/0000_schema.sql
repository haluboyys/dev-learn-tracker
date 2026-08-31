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
