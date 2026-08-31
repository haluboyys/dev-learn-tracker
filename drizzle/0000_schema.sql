CREATE TABLE IF NOT EXISTS materials (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	category text DEFAULT 'Umum' NOT NULL,
	color text DEFAULT '#facc15' NOT NULL,
	url text,
	status text DEFAULT 'todo' NOT NULL,
	notes text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	created_at integer NOT NULL,
	updated_at integer NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	description text DEFAULT '' NOT NULL,
	category text DEFAULT 'Project' NOT NULL,
	color text DEFAULT '#22d3ee' NOT NULL,
	repo_url text,
	live_url text,
	status text DEFAULT 'todo' NOT NULL,
	created_at integer NOT NULL,
	updated_at integer NOT NULL
);
