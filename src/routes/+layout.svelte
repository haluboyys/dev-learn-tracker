<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { BookOpen, FolderGit2, Kanban, LogOut, Code } from 'lucide-svelte';

	let { children } = $props();

	const isAuthPage = $derived($page.url.pathname === '/login');
</script>

<div class="min-h-screen flex flex-col bg-[#12151e] text-[#f1f5f9]">
	{#if !isAuthPage}
		<header class="border-b-3 border-[#384259] bg-[#161a26] sticky top-0 z-40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<!-- Brand -->
				<a href="/materials" class="flex items-center gap-2.5 font-black text-xl tracking-wider text-[#f1f5f9] uppercase group">
					<div class="w-9 h-9 bg-[#e2b342] border-2 border-[#384259] shadow-[2.5px_2.5px_0px_0px_#080a0f] flex items-center justify-center group-hover:rotate-6 transition-transform">
						<Code class="w-5 h-5 text-[#12151e] stroke-[3]" />
					</div>
					<span class="text-xl">DEV<span class="bg-[#64b5d6] text-[#12151e] px-2 py-0.5 ml-1.5 border-2 border-[#384259] font-black">TRACK</span></span>
				</a>

				<!-- Desktop Navigation -->
				<nav class="hidden md:flex items-center gap-3">
					<a
						href="/materials"
						class="neo-btn-sm {$page.url.pathname.startsWith('/materials') ? 'neo-btn-primary' : 'neo-btn-neutral'}"
					>
						<BookOpen class="w-4 h-4 stroke-[2.5]" />
						Topics
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
					<form method="POST" action="/login?/logout">
						<button
							type="submit"
							class="neo-btn-sm neo-btn-danger"
						>
							<LogOut class="w-3.5 h-3.5 stroke-[2.5]" />
							Sign Out
						</button>
					</form>
				</div>
			</div>

			<!-- Mobile Navigation Bar -->
			<div class="md:hidden flex border-t-2 border-[#384259] divide-x-2 divide-[#384259] bg-[#161a26]">
				<a
					href="/materials"
					class="flex-1 py-2.5 text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 {$page.url.pathname.startsWith('/materials') ? 'bg-[#e2b342] text-[#12151e]' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
				>
					<BookOpen class="w-4 h-4 stroke-[2.5]" />
					Topics
				</a>
				<a
					href="/projects"
					class="flex-1 py-2.5 text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 {$page.url.pathname.startsWith('/projects') ? 'bg-[#64b5d6] text-[#12151e]' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
				>
					<FolderGit2 class="w-4 h-4 stroke-[2.5]" />
					Projects
				</a>
				<a
					href="/kanban"
					class="flex-1 py-2.5 text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 {$page.url.pathname.startsWith('/kanban') ? 'bg-[#ab92bf] text-[#12151e]' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
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
