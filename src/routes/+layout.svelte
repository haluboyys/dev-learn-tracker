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

<div class="min-h-screen flex flex-col transition-colors duration-200">
	{#if !isAuthPage}
		<header class="border-b-4 border-black dark:border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<!-- Brand -->
				<a href="/materials" class="flex items-center gap-2 font-black text-xl tracking-wider text-black dark:text-white uppercase group">
					<div class="w-9 h-9 bg-yellow-400 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center group-hover:rotate-6 transition-transform">
						<Code class="w-5 h-5 text-black" />
					</div>
					<span>LEARN<span class="bg-cyan-400 text-black px-1.5 py-0.5 ml-1 border-2 border-black">DEV</span></span>
				</a>

				<!-- Navigation -->
				<nav class="hidden md:flex items-center gap-4">
					<a
						href="/materials"
						class="px-3 py-1.5 font-bold text-sm border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1.5 transition-all {$page.url.pathname.startsWith('/materials') ? 'bg-yellow-400 text-black font-extrabold -translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-yellow-100'}"
					>
						<BookOpen class="w-4 h-4" />
						Materi
					</a>
					<a
						href="/projects"
						class="px-3 py-1.5 font-bold text-sm border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1.5 transition-all {$page.url.pathname.startsWith('/projects') ? 'bg-cyan-400 text-black font-extrabold -translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-cyan-100'}"
					>
						<FolderGit2 class="w-4 h-4" />
						Projects
					</a>
					<a
						href="/kanban"
						class="px-3 py-1.5 font-bold text-sm border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1.5 transition-all {$page.url.pathname.startsWith('/kanban') ? 'bg-purple-400 text-black font-extrabold -translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-purple-100'}"
					>
						<Kanban class="w-4 h-4" />
						Kanban
					</a>
				</nav>

				<!-- Controls -->
				<div class="flex items-center gap-3">
					<button
						onclick={() => themeStore.toggle()}
						aria-label="Toggle Dark Mode"
						class="p-2 border-2 border-black dark:border-white bg-slate-100 dark:bg-slate-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
					>
						{#if $themeStore === 'dark'}
							<Sun class="w-5 h-5 text-yellow-400" />
						{:else}
							<Moon class="w-5 h-5 text-slate-900" />
						{/if}
					</button>

					<form method="POST" action="/login?/logout">
						<button
							type="submit"
							class="px-3 py-1.5 font-bold text-xs bg-rose-400 hover:bg-rose-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
						>
							<LogOut class="w-3.5 h-3.5" />
							Keluar
						</button>
					</form>
				</div>
			</div>

			<!-- Mobile Navigation Bar -->
			<div class="md:hidden flex border-t-2 border-black dark:border-slate-700 divide-x-2 divide-black dark:divide-slate-700 bg-white dark:bg-slate-900">
				<a
					href="/materials"
					class="flex-1 py-2 text-center font-bold text-xs flex items-center justify-center gap-1 {$page.url.pathname.startsWith('/materials') ? 'bg-yellow-400 text-black' : 'text-black dark:text-white'}"
				>
					<BookOpen class="w-3.5 h-3.5" />
					Materi
				</a>
				<a
					href="/projects"
					class="flex-1 py-2 text-center font-bold text-xs flex items-center justify-center gap-1 {$page.url.pathname.startsWith('/projects') ? 'bg-cyan-400 text-black' : 'text-black dark:text-white'}"
				>
					<FolderGit2 class="w-3.5 h-3.5" />
					Projects
				</a>
				<a
					href="/kanban"
					class="flex-1 py-2 text-center font-bold text-xs flex items-center justify-center gap-1 {$page.url.pathname.startsWith('/kanban') ? 'bg-purple-400 text-black' : 'text-black dark:text-white'}"
				>
					<Kanban class="w-3.5 h-3.5" />
					Kanban
				</a>
			</div>
		</header>
	{/if}

	<main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
		{@render children()}
	</main>
</div>
