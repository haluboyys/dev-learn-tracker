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
