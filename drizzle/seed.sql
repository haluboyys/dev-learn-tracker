INSERT OR IGNORE INTO materials (id, title, category, color, url, status, notes, "order", created_at, updated_at) VALUES
('mat_golang_1', 'Golang Dasar & Concurrency', 'Backend', '#facc15', 'https://go.dev/doc/tutorial/getting-started', 'in_progress', '# Catatan Golang Dasar

## 1. Concurrency dengan Goroutines & Channels
Golang menggunakan model CSP (*Communicating Sequential Processes*).

```go
package main

import (
	"fmt"
	"time"
)

func worker(id int, ch chan string) {
	time.Sleep(100 * time.Millisecond)
	ch <- fmt.Sprintf("Worker %d selesai", id)
}

func main() {
	ch := make(chan string, 3)
	for i := 1; i <= 3; i++ {
		go worker(i, ch)
	}

	for i := 1; i <= 3; i++ {
		fmt.Println(<-ch)
	}
}
```

## 2. Key Takeaways
- Goroutine ringan (sekitar 2KB initial stack).
- Gunakan `sync.WaitGroup` atau *Buffered Channels* untuk sinkronisasi.
- Selalu tangani error dengan eksplisit: `if err != nil { return err }`.', 0, strftime('%s', 'now'), strftime('%s', 'now')),

('mat_svelte_2', 'SvelteKit 5 & Runes', 'Frontend', '#22d3ee', 'https://svelte.dev/docs/runes', 'done', '# SvelteKit 5 & Runes

## Runes Utama:
1. `$state` - Reaktif state variabel.
2. `$derived` - Computed state turunan.
3. `$effect` - Side effects saat state berubah.
4. `$props` - Komponen input props.

```typescript
let count = $state(0);
let double = $derived(count * 2);

function increment() {
  count += 1;
}
```', 1, strftime('%s', 'now'), strftime('%s', 'now')),

('mat_docker_3', 'Docker & Containerization', 'DevOps', '#c084fc', 'https://docs.docker.com/get-started/', 'todo', '# Docker Basics

Target pembelajaran:
- [ ] Multi-stage builds untuk memperkecil image
- [ ] Docker Compose untuk local development
- [ ] Bind mounts vs Named Volumes', 2, strftime('%s', 'now'), strftime('%s', 'now'));

INSERT OR IGNORE INTO projects (id, title, description, category, color, repo_url, live_url, status, created_at, updated_at) VALUES
('proj_cli_1', 'CLI URL Shortener & Analytics', 'Tool CLI cepat berbasis Golang untuk memperpendek tautan dan melacak jumlah klik.', 'CLI Tool', '#22d3ee', 'https://github.com/user/cli-shortener', 'https://short.dev', 'in_progress', strftime('%s', 'now'), strftime('%s', 'now')),
('proj_tracker_2', 'Personal Dev Learning Tracker', 'Aplikasi Neo-Brutalist tracker pembelajaran berbasis SvelteKit + Cloudflare D1.', 'Fullstack', '#4ade80', 'https://github.com/user/learn-tracker', 'https://learn-tracker.pages.dev', 'done', strftime('%s', 'now'), strftime('%s', 'now'));
