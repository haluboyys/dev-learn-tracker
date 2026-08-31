# ⚡ DEVTRACK

> A high-performance personal developer learning hub & practice tracker designed with a bold **Neo-Brutalism aesthetic (Light & Dark Mode)**, built on **SvelteKit 5 + TypeScript**, styled with **Tailwind CSS v4**, and backed by serverless **Cloudflare D1 (SQLite)**.

---

## ✨ Features

- **🔐 Single Access Code Gate**: Quick, lightweight passcode authentication without third-party OAuth overhead or database user management.
- **📚 Direct Learning Topics & Materials**: Fast topic management with status badges (`To Do`, `In Progress`, `Done`), external documentation links, and custom category badges.
- **📝 Split-Screen Markdown Notes Editor**: Built-in GitHub Flavored Markdown (GFM) workspace with live preview, keyboard shortcuts (`Cmd+S` / `Ctrl+S`), and Prism code syntax highlighting (TypeScript, Go, Rust, Python, Bash, SQL, and more).
- **🛠 Practice Projects Showcase**: Track coding experiments, repositories, and live demo URLs.
- **📋 Unified Neo-Brutal Kanban Board**: Effortless drag-and-drop & quick status switching uniting both Learning Materials and Practice Projects with instant optimistic updates and filters.
- **🎨 Neo-Brutalism Design System**: High-contrast borders, solid offset shadows, tactile interaction states, and 100% flicker-free (zero FOUC) Dark Mode.
- **☁️ 100% Free Cloudflare Hosting**: Designed to run at zero cost on Cloudflare Pages + Cloudflare D1 free tier (5M reads/day, 100k writes/day, 10GB storage).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime & Package Manager** | [Bun](https://bun.sh) |
| **Frontend & Fullstack Framework** | [SvelteKit 5](https://kit.svelte.dev) + TypeScript |
| **Deployment Adapter** | `@sveltejs/adapter-cloudflare` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) (`@import "tailwindcss"` & `@theme`) |
| **Database & ORM** | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) + [Drizzle ORM](https://orm.drizzle.team) |
| **Markdown & Syntax Highlighting** | `marked` + `prismjs` |
| **Icons** | `lucide-svelte` |

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
Ensure you have [Bun](https://bun.sh) installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone and Install Dependencies
```bash
git clone <your-repo-url> devtrack
cd devtrack
bun install
```

### 3. Run the Development Server
```bash
bun run dev
```
Open your browser at `http://localhost:5173`.

> **Default Access Code:** `belajarcoding` (Configurable via `ACCESS_CODE` environment variable or secret).

---

## ☁️ Deployment to Cloudflare Pages (100% Free)

### Step 1: Create a Cloudflare D1 Database
Log in with Wrangler CLI and create your remote D1 instance:
```bash
bunx wrangler login
bunx wrangler d1 create learn-tracker-db
```

### Step 2: Configure `wrangler.toml`
Paste the returned `database_id` into your `wrangler.toml`:
```toml
name = "learn-tracker"
pages_build_output_dir = ".svelte-kit/cloudflare"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "learn-tracker-db"
database_id = "<YOUR_DATABASE_ID_HERE>"
```

### Step 3: Run Database Migrations on Remote D1
```bash
bunx wrangler d1 execute learn-tracker-db --remote --file=drizzle/0000_schema.sql
```

### Step 4: Build & Deploy
```bash
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name devtrack
```

### Step 5: Set Your Secret Access Code
In your **Cloudflare Dashboard**:
1. Go to **Workers & Pages** > **devtrack** > **Settings** > **Environment Variables**.
2. Add a variable/secret:
   - Variable Name: `ACCESS_CODE`
   - Value: `your-secret-passcode`

---

## 📁 Project Structure

```
├── drizzle/                     # SQL migration files
├── src/
│   ├── app.css                  # Tailwind v4 & Neo-Brutalist design tokens
│   ├── app.html                 # HTML shell with anti-FOUC theme blocker
│   ├── hooks.server.ts          # Auth guard & SSR dark mode theme injector
│   ├── lib/
│   │   ├── components/          # Reusable Neo-Brutalist components (ConfirmModal, CustomSelect)
│   │   ├── server/db/           # Drizzle ORM schema & Cloudflare D1 client
│   │   ├── stores/              # Svelte stores (Dark/Light theme store)
│   │   └── utils/               # Markdown & Prism syntax highlighter
│   └── routes/
│       ├── +layout.svelte       # App shell & Neo-Brutalist navigation header
│       ├── login/               # Access code login gate
│       ├── materials/           # Learning topics & notes directory
│       │   └── [id]/            # Split-screen Markdown notes editor
│       ├── projects/            # Practice projects showcase
│       └── kanban/              # Unified drag-and-drop Kanban board
├── static/                      # Static assets (Favicon, etc.)
├── wrangler.toml                # Cloudflare Pages & D1 binding configuration
└── package.json
```

---

## 📜 License

MIT License. Free to use, modify, and deploy for your personal learning workflow!
