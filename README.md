# ⚡ DevTrack (Neo-Brutalist Developer Learning Tracker)

A personal programming learning hub and knowledge tracker designed with a sharp **Neo-Brutalism aesthetic (Dark Mode support)**, built using **SvelteKit + TypeScript**, styled with **Tailwind CSS v4**, and backed by serverless **Cloudflare D1 (SQLite)**.

---

## 🚀 Features

1. **Access Code Authentication**: Fast single access code gate without needing third-party auth providers.
2. **Learning Topics & Curriculum Tracker**: Organizes learning items, categories, external documentation links, and status progression (`To Do`, `In Progress`, `Done`).
3. **Markdown Notes with Syntax Highlighting**: Full GitHub Flavored Markdown (GFM) notes editor with live split-preview and Prism syntax highlighting for TypeScript, Go, Rust, Python, Bash, SQL, etc.
4. **Practice Projects Showcase**: Tracks hands-on practice projects with direct links to GitHub repositories and live demos.
5. **Unified Kanban Board**: Drag-and-drop / quick-switch Kanban board unifying both Learning Topics and Practice Projects with instant optimistic UI updates and filters.
6. **Neo-Brutalism Theme**: High-contrast borders, bold offset shadows, vibrant accents, and zero-FOUC dark mode toggle.
7. **100% Free Hosting on Cloudflare**: Runs effortlessly on Cloudflare Pages + D1 SQLite free tier (5,000,000 reads/day, 100,000 writes/day, 10 GB storage).

---

## 🛠 Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Framework**: [SvelteKit](https://kit.svelte.dev) + `@sveltejs/adapter-cloudflare`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (Modern `@import` & `@theme` setup)
- **Database & ORM**: [Cloudflare D1](https://developers.cloudflare.com/d1/) + [Drizzle ORM](https://orm.drizzle.team)
- **Markdown & Code Highlighting**: `marked` + `prismjs`
- **Icons**: `lucide-svelte`

---

## 💻 Local Development

### 1. Install Dependencies
```bash
bun install
```

### 2. Run Local Dev Server
```bash
bun run dev
```
Open `http://localhost:5173`.

Default local access code: `belajarcoding` (Configurable via `ACCESS_CODE` environment variable).

---

## ☁️ Cloudflare Free Deployment (Step-by-step)

### 1. Create Cloudflare D1 Database
```bash
bunx wrangler d1 create learn-tracker-db
```
Copy the generated `database_id` into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "learn-tracker-db"
database_id = "<YOUR_DATABASE_ID>"
```

### 2. Apply Migrations to Remote D1
```bash
bunx wrangler d1 migrations apply learn-tracker-db --remote
```

### 3. Deploy to Cloudflare Pages
```bash
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name learn-tracker
```

### 4. Set Environment Secret (Access Code)
In the Cloudflare Dashboard under **Pages > learn-tracker > Settings > Environment Variables**:
- `ACCESS_CODE`: *Your custom secret password*
