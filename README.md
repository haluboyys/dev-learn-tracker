# DEVTRACK

<div align="center">

[![Release](https://img.shields.io/badge/release-v0.1.0-e2b342?style=for-the-badge&logo=github&logoColor=12151e)](https://github.com/andrraa/learn-dev-tracker/releases/tag/v0.1.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-7cb98f?style=for-the-badge)](LICENSE)
[![SvelteKit 5](https://img.shields.io/badge/SvelteKit_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Pages & D1](https://img.shields.io/badge/Cloudflare_Pages_%26_D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**A lightweight, personal developer learning hub and practice tracker built with SvelteKit 5, TypeScript, Tailwind CSS v4, and Cloudflare D1 (SQLite).**

[Live Demo](https://learn-dev-tracker.pages.dev)

</div>

---

## Overview

DEVTRACK is a zero-maintenance web application designed for developers to organize personal coding curriculums, keep structured markdown notes, manage practice projects, and streamline study workflows using an integrated Kanban board.

Each developer registers and signs in to access an isolated personal workspace with complete data privacy. The entire application runs seamlessly on Cloudflare's serverless free tier (Pages + D1 Database) with zero ongoing hosting fees.

---

## Key Features

- **Multi-User Authentication**: Secure registration and sign-in powered by Web Crypto PBKDF2 password hashing and HMAC-SHA256 signed session cookies.
- **Strict Data Isolation**: Learning topics, notes, and practice projects are securely partitioned per user.
- **Topic & Curriculum Management**: Create, edit, and organize topics with custom categories, custom badge colors, documentation URLs, and three-state workflows (`To Do`, `In Progress`, `Done`).
- **Markdown Notes Workspace**: Dual-pane editor with live markdown preview, formatting toolbar, syntax highlighting via Prism.js, and quick-save shortcuts (`Cmd+S` / `Ctrl+S`).
- **Practice Projects Tracker**: Log hands-on experiments, side projects, repository links, and live deployment URLs.
- **Unified Kanban Board**: Drag-and-drop board consolidating study topics and practice projects into three status columns with instant optimistic UI updates.
- **Dark Pastel Neo-Brutalist UI**: High-contrast, tactile aesthetic featuring dark slate backgrounds, soft pastel accents, bold borders, and sharp offset drop shadows.

---

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Frontend / Meta-Framework**: [SvelteKit 5](https://svelte.dev) (Runes & TypeScript)
- **Deployment Target**: [Cloudflare Pages](https://pages.cloudflare.com) via `@sveltejs/adapter-cloudflare`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Database & ORM**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite) + [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: Web Crypto API (`PBKDF2` key derivation & `HMAC-SHA256` cookie signing)
- **Markdown & Code Highlighting**: [Marked](https://marked.js.org) + [PrismJS](https://prismjs.com)
- **Icons**: [Lucide Svelte](https://lucide.dev)

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) (v1.1+ recommended) or Node.js (v20+)

### Getting Started

1. Clone the repository:
   ```bash
   git clone git@github.com:andrraa/learn-dev-tracker.git
   cd learn-dev-tracker
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the local development server:
   ```bash
   bun run dev
   ```

4. Navigate to `http://localhost:5173` in your browser to register and create your account.

---

## Deployment (Cloudflare Pages + D1)

### 1. Initialize Cloudflare D1 Database

Log in to Cloudflare and create your D1 database:
```bash
bunx wrangler login
bunx wrangler d1 create learn-tracker-db
```

### 2. Configure `wrangler.toml`

Update `wrangler.toml` with the generated `database_id`:
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

Run the database migration on your remote D1 instance:
```bash
bunx wrangler d1 execute learn-tracker-db --remote --file=drizzle/0000_schema.sql
```

### 4. Build and Deploy

```bash
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name learn-dev-tracker
```

### 5. Configure Authentication Secret (Optional)

In your Cloudflare Dashboard:
1. Navigate to **Workers & Pages** > **learn-dev-tracker** > **Settings** > **Environment Variables**.
2. Add a custom signing secret:
   - **Name**: `AUTH_SECRET`
   - **Value**: `<your-random-strong-secret>`

---

## Project Structure

```
├── drizzle/                     # D1 SQL schemas & migrations
├── src/
│   ├── app.css                  # Tailwind CSS v4 setup & neo-brutalist theme tokens
│   ├── app.html                 # HTML shell and client-side setup
│   ├── hooks.server.ts          # Session authentication & route protection guards
│   ├── lib/
│   │   ├── components/          # Reusable UI components (CustomSelect, ConfirmModal)
│   │   ├── server/
│   │   │   ├── auth.ts          # PBKDF2 password hashing & HMAC-SHA256 session handling
│   │   │   └── db/              # Drizzle ORM schema & D1 client initialization
│   │   └── utils/               # Markdown renderer & syntax highlighting
│   └── routes/
│       ├── +layout.svelte       # Main layout with header navigation & profile state
│       ├── login/               # User login page
│       ├── register/            # New user account registration
│       ├── logout/              # Sign-out server endpoint
│       ├── materials/           # Learning topics list & topic management modals
│       │   └── [id]/            # Dual-pane Markdown notes editor & reader
│       ├── projects/            # Practice projects portfolio tracker
│       └── kanban/              # Drag-and-drop Kanban workflow board
├── static/                      # Static assets & icons
├── wrangler.toml                # Cloudflare Pages & D1 binding configuration
└── LICENSE                      # MIT License
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
