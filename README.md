# DEVTRACK

A personal developer learning hub and practice tracker built with SvelteKit 5, TypeScript, Tailwind CSS v4, and Cloudflare D1 (SQLite).

Designed with a high-contrast Dark Pastel Neo-Brutalism interface and multi-user authentication support.

---

## Overview

DEVTRACK is a lightweight, zero-maintenance web application for organizing personal coding studies, tracking reference notes, managing practice projects, and prioritizing learning workflows using an integrated Kanban board.

Each user registers and signs in to access their own isolated workspace of learning topics, notes, and practice projects.

The application is architected to run entirely on Cloudflare's free tier (Pages + D1 Database) with zero ongoing hosting costs.

---

## Key Features

- **Multi-User Authentication**: Register & Sign In system with Web Crypto PBKDF2 password hashing and HMAC-SHA256 signed session cookies.
- **User Data Isolation**: Learning topics, markdown notes, and practice projects are securely scoped per user.
- **Topic & Material Management**: Direct topic tracking with status workflows (`To Do`, `In Progress`, `Done`), external documentation links, and categorized tags.
- **Markdown Notes Workspace**: Split-screen editor with live preview, keyboard shortcuts (`Cmd+S` / `Ctrl+S`), and Prism.js syntax highlighting across multiple programming languages.
- **Practice Projects Tracker**: Portfolio and experiment log with links to source repositories and live deployments.
- **Unified Kanban Board**: Drag-and-drop workflow consolidating both study topics and practice projects into three status columns with instant optimistic UI updates.
- **Neo-Brutalism UI**: Dark Pastel aesthetic with soft slate surfaces, muted pastel accents (amber, sky, sage, rose, lavender), crisp borders, and solid hard offset shadows.

---

## Tech Stack

- **Runtime & Package Manager**: Bun
- **Framework**: SvelteKit 5 (TypeScript)
- **Deployment Adapter**: `@sveltejs/adapter-cloudflare`
- **Styling**: Tailwind CSS v4
- **Database & ORM**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Authentication**: Web Crypto API (PBKDF2 + HMAC-SHA256)
- **Markdown & Highlighting**: Marked + PrismJS
- **Icons**: Lucide Svelte

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) (v1.1+ recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:andrraa/learn-dev-tracker.git
   cd learn-dev-tracker
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open `http://localhost:5173` in your browser to register and create your account.

---

## Deployment (Cloudflare Pages + D1)

### 1. Initialize Cloudflare D1 Database

Create a D1 database instance using the Wrangler CLI:
```bash
bunx wrangler login
bunx wrangler d1 create learn-tracker-db
```

### 2. Configure `wrangler.toml`

Update the `database_id` in `wrangler.toml` with the ID generated from step 1:
```toml
name = "learn-tracker"
pages_build_output_dir = ".svelte-kit/cloudflare"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "learn-tracker-db"
database_id = "<YOUR_DATABASE_ID>"
```

### 3. Apply Remote Database Schema

Run the migration script on your remote D1 instance:
```bash
bunx wrangler d1 execute learn-tracker-db --remote --file=drizzle/0000_schema.sql
```

### 4. Build and Deploy to Cloudflare Pages

```bash
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name learn-dev-tracker
```

### 5. Set Auth Secret (Optional)

In the Cloudflare Dashboard:
1. Navigate to **Workers & Pages** > **learn-dev-tracker** > **Settings** > **Environment Variables**.
2. Add an optional secret for token signing:
   - **Name**: `AUTH_SECRET`
   - **Value**: `<your-random-strong-secret>`

---

## Project Structure

```
├── drizzle/                     # Database migrations & SQL schema
├── src/
│   ├── app.css                  # Tailwind v4 configuration & theme tokens
│   ├── app.html                 # Base HTML shell with theme initialization script
│   ├── hooks.server.ts          # Multi-user session verification & route guards
│   ├── lib/
│   │   ├── components/          # Reusable components (CustomSelect, ConfirmModal)
│   │   ├── server/
│   │   │   ├── auth.ts          # Web Crypto PBKDF2 hashing & HMAC session tokens
│   │   │   └── db/              # Drizzle schema definitions & D1 connection
│   │   └── utils/               # Markdown renderer & syntax highlighting setup
│   └── routes/
│       ├── +layout.svelte       # Main layout, user profile badge & navigation header
│       ├── login/               # Email/password login page
│       ├── register/            # New user registration page
│       ├── logout/              # Sign-out server endpoint
│       ├── materials/           # User-scoped learning topics & list view
│       │   └── [id]/            # Markdown notes editor & viewer
│       ├── projects/            # User-scoped practice projects tracker
│       └── kanban/              # User-scoped drag-and-drop Kanban board
├── static/                      # Static assets & favicon
└── wrangler.toml                # Cloudflare deployment & D1 binding configuration
```

---

## License

MIT License.
