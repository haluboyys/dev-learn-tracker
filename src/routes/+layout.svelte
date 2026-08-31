<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/theme';
	import { page } from '$app/stores';
	import { Sun, Moon, BookOpen, FolderGit2, Kanban, LogOut, Code } from 'lucide-svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});

	const isAuthPage = $derived($page.url.pathname === '/login');
</script>

<div class="min-h-screen flex flex-col transition-colors duration-150">
	{#if !isAuthPage}
		<header class="border-b-4 border-black dark:border-white bg-white dark:bg-slate-900 sticky top-0 z-40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<!-- Brand -->
				<a href="/materials" class="flex items-center gap-2.5 font-black text-xl tracking-wider text-black dark:text-white uppercase group">
					<div class="w-10 h-10 bg-amber-500 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center group-hover:rotate-6 transition-transform">
						<Code class="w-6 h-6 text-black stroke-[3]" />
					</div>
					<span class="text-xl">LEARN<span class="bg-sky-600 text-white px-2 py-0.5 ml-1.5 border-2 border-black dark:border-white">DEV</span></span>
				</a>

				<!-- Desktop Navigation -->
				<nav class="hidden md:flex items-center gap-3">
					<a
						href="/materials"
						class="neo-btn-sm {$page.url.pathname.startsWith('/materials') ? 'neo-btn-primary' : 'neo-btn-neutral'}"
					>
						<BookOpen class="w-4 h-4 stroke-[2.5]" />
						Materi
					</a>
					<a
						href="/projects"
						class="neo-btn-sm {$page.url.pathname.startsWith('/projects') ? 'neo-btn-secondary' : 'neo-btn-neutral'}"
					>
						<FolderGit2 class="w-4 h-4 stroke-[2.5]" />
						Projects
					</a>
					<a
						href="/kanban"
						class="neo-btn-sm {$page.url.pathname.startsWith('/kanban') ? 'neo-btn-purple' : 'neo-btn-neutral'}"
					>
						<Kanban class="w-4 h-4 stroke-[2.5]" />
						Kanban
					</a>
				</nav>

				<!-- Controls -->
				<div class="flex items-center gap-3">
					<button
						onclick={() => themeStore.toggle()}
						aria-label="Toggle Theme"
						class="neo-btn-icon neo-btn-neutral text-black dark:text-white"
					>
						{#if $themeStore === 'dark'}
							<Sun class="w-4 h-4 text-amber-400 stroke-[2.5]" />
						{:else}
							<Moon class="w-4 h-4 text-slate-900 stroke-[2.5]" />
						{/if}
					</button>

					<form method="POST" action="/login?/logout">
						<button
							type="submit"
							class="neo-btn-sm neo-btn-danger"
						>
							<LogOut class="w-3.5 h-3.5 stroke-[2.5]" />
							Keluar
						</button>
					</form>
				</div>
			</div>

			<!-- Mobile Navigation Bar -->
			<div class="md:hidden flex border-t-3 border-black dark:border-white divide-x-3 divide-black dark:divide-white bg-white dark:bg-slate-900">
				<a
					href="/materials"
					class="flex-1 py-2.5 text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 {$page.url.pathname.startsWith('/materials') ? 'bg-amber-400 text-black' : 'text-black dark:text-white'}"
				>
					<BookOpen class="w-4 h-4 stroke-[2.5]" />
					Materi
				</a>
				<a
					href="/projects"
					class="flex-1 py-2.5 text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 {$page.url.pathname.startsWith('/projects') ? 'bg-sky-600 text-white' : 'text-black dark:text-white'}"
				>
					<FolderGit2 class="w-4 h-4 stroke-[2.5]" />
					Projects
				</a>
				<a
					href="/kanban"
					class="flex-1 py-2.5 text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 {$page.url.pathname.startsWith('/kanban') ? 'bg-purple-600 text-white' : 'text-black dark:text-white'}"
				>
					<Kanban class="w-4 h-4 stroke-[2.5]" />
					Kanban
				</a>
			</div>
		</header>
	{/if}

	<main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
		{@render children()}
	</main>
</div>
