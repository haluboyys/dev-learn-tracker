<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Kanban,
		BookOpen,
		FolderGit2,
		ExternalLink,
		FileText,
		GitBranch,
		ArrowRight,
		ArrowLeft,
		Filter,
		Search
	} from 'lucide-svelte';

	let { data } = $props();

	// Optimistic copy
	let items = $state([...data.items]);
	$effect(() => {
		items = [...data.items];
	});

	// Filters
	let filterType = $state<'all' | 'material' | 'project'>('all');
	let filterCategory = $state<string>('all');
	let searchQuery = $state<string>('');

	const columns: { id: 'todo' | 'in_progress' | 'done'; title: string; headerBg: string; textCol: string }[] = [
		{ id: 'todo', title: 'TO DO', headerBg: 'bg-amber-400', textCol: 'text-black' },
		{ id: 'in_progress', title: 'IN PROGRESS', headerBg: 'bg-cyan-400', textCol: 'text-black' },
		{ id: 'done', title: 'DONE', headerBg: 'bg-emerald-400', textCol: 'text-black' }
	];

	const filteredItems = $derived(
		items.filter((item) => {
			if (filterType !== 'all' && item.type !== filterType) return false;
			if (filterCategory !== 'all' && item.category !== filterCategory) return false;
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				const titleMatch = item.title.toLowerCase().includes(q);
				const contentStr = item.type === 'material' ? (item.notes || '') : (item.description || '');
				const noteMatch = contentStr.toLowerCase().includes(q);
				if (!titleMatch && !noteMatch) return false;
			}
			return true;
		})
	);

	function getColumnItems(colId: 'todo' | 'in_progress' | 'done') {
		return filteredItems.filter((i) => i.status === colId);
	}

	async function moveStatus(id: string, type: 'material' | 'project', newStatus: 'todo' | 'in_progress' | 'done') {
		// Local optimistic update
		items = items.map((i) => (i.id === id ? { ...i, status: newStatus } : i));

		const formData = new FormData();
		formData.append('id', id);
		formData.append('type', type);
		formData.append('status', newStatus);

		await fetch('?/moveItem', {
			method: 'POST',
			body: formData
		});
	}

	// Drag & drop
	let draggedItemId = $state<string | null>(null);

	function onDragStart(id: string) {
		draggedItemId = id;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDrop(targetColId: 'todo' | 'in_progress' | 'done') {
		if (!draggedItemId) return;
		const targetItem = items.find((i) => i.id === draggedItemId);
		if (targetItem && targetItem.status !== targetColId) {
			moveStatus(targetItem.id, targetItem.type, targetColId);
		}
		draggedItemId = null;
	}
</script>

<svelte:head>
	<title>Unified Kanban Board - Dev Hub</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header & Filters Toolbar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="neo-badge bg-purple-400 text-black mb-2">
				<Kanban class="w-3.5 h-3.5" />
				Unified Workspace Board
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Kanban Board
			</h1>
		</div>

		<!-- Filter Toolbar -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- Search -->
			<div class="relative">
				<input
					type="text"
					placeholder="Filter kartu..."
					bind:value={searchQuery}
					class="pl-8 pr-3 py-2 neo-input text-xs font-bold w-36 sm:w-44"
				/>
				<Search class="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500 pointer-events-none" />
			</div>

			<!-- Type Filter -->
			<select
				bind:value={filterType}
				class="neo-input px-3 py-2 text-xs font-black uppercase cursor-pointer"
			>
				<option value="all">Semua Tipe</option>
				<option value="material">Hanya Materi</option>
				<option value="project">Hanya Project</option>
			</select>

			<!-- Category Filter -->
			<select
				bind:value={filterCategory}
				class="neo-input px-3 py-2 text-xs font-black uppercase cursor-pointer"
			>
				<option value="all">Semua Kategori</option>
				{#each data.categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Kanban Columns Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
		{#each columns as col}
			{@const colItems = getColumnItems(col.id)}
			<div
				class="neo-card bg-white dark:bg-slate-900 flex flex-col min-h-[600px] overflow-hidden"
				role="region"
				aria-label="{col.title} Column"
				ondragover={onDragOver}
				ondrop={() => onDrop(col.id)}
			>
				<!-- Column Header -->
				<div class="p-3.5 border-b-3 border-black dark:border-white {col.headerBg} {col.textCol} flex items-center justify-between">
					<h2 class="font-black text-sm uppercase tracking-wider">{col.title}</h2>
					<span class="w-6 h-6 bg-black text-white font-mono text-xs font-black flex items-center justify-center border border-black shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,1)]">
						{colItems.length}
					</span>
				</div>

				<!-- Cards Column -->
				<div class="p-3.5 flex-1 space-y-3.5 bg-slate-50/70 dark:bg-slate-950/50">
					{#if colItems.length === 0}
						<div class="h-36 border-3 border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center p-4 text-center">
							<span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
								Tarik & letakkan kartu ke sini
							</span>
						</div>
					{/if}

					{#each colItems as item (item.id)}
						<div
							draggable="true"
							role="article"
							ondragstart={() => onDragStart(item.id)}
							class="neo-card-sm p-3.5 bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform"
						>
							<!-- Top Badges -->
							<div class="flex items-center justify-between gap-1 mb-2">
								<div class="flex items-center gap-1.5">
									{#if item.type === 'material'}
										<span class="neo-badge bg-amber-400 text-black text-[10px] py-0.5 px-1.5">
											<BookOpen class="w-3 h-3 stroke-[2.5]" />
											Materi
										</span>
									{:else}
										<span class="neo-badge bg-cyan-400 text-black text-[10px] py-0.5 px-1.5">
											<FolderGit2 class="w-3 h-3 stroke-[2.5]" />
											Project
										</span>
									{/if}
								</div>

								<span
									class="neo-badge text-black text-[10px] py-0.5 px-1.5 truncate max-w-[120px]"
									style="background-color: {item.color || '#facc15'};"
								>
									{item.category}
								</span>
							</div>

							<!-- Title -->
							<h3 class="font-black text-sm uppercase text-black dark:text-white leading-snug mb-2">
								{item.title}
							</h3>

							<!-- Description / Notes preview -->
							{#if item.type === 'project' && item.description}
								<p class="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
									{item.description}
								</p>
							{:else if item.type === 'material' && item.notes}
								<p class="text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
									{item.notes}
								</p>
							{/if}

							<!-- Card Actions Footer -->
							<div class="pt-2.5 border-t-2 border-dashed border-black/15 dark:border-white/15 flex items-center justify-between">
								<div class="flex items-center gap-2">
									{#if item.type === 'material'}
										<a
											href="/materials/{item.id}"
											class="text-xs font-black text-black dark:text-white hover:text-amber-500 flex items-center gap-1 underline underline-offset-2"
										>
											<FileText class="w-3.5 h-3.5 stroke-[2.5]" />
											Notes
										</a>
										{#if item.url}
											<a
												href={item.url}
												target="_blank"
												rel="noopener noreferrer"
												class="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
											>
												<ExternalLink class="w-3 h-3" />
											</a>
										{/if}
									{:else}
										{#if item.repoUrl}
											<a
												href={item.repoUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-xs font-black text-black dark:text-white hover:underline flex items-center gap-1"
											>
												<GitBranch class="w-3.5 h-3.5 stroke-[2.5]" />
												Repo
											</a>
										{/if}
										{#if item.liveUrl}
											<a
												href={item.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-xs font-black text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
											>
												<ExternalLink class="w-3.5 h-3.5 stroke-[2.5]" />
												Demo
											</a>
										{/if}
									{/if}
								</div>

								<!-- Quick Status Arrow Buttons -->
								<div class="flex items-center gap-1">
									{#if col.id !== 'todo'}
										<button
											onclick={() => moveStatus(item.id, item.type, col.id === 'done' ? 'in_progress' : 'todo')}
											title="Pindah ke kolom sebelumnya"
											class="neo-btn-icon neo-btn-neutral p-1 text-black dark:text-white cursor-pointer"
										>
											<ArrowLeft class="w-3 h-3 stroke-[3]" />
										</button>
									{/if}

									{#if col.id !== 'done'}
										<button
											onclick={() => moveStatus(item.id, item.type, col.id === 'todo' ? 'in_progress' : 'done')}
											title="Pindah ke kolom berikutnya"
											class="neo-btn-icon neo-btn-neutral p-1 text-black dark:text-white cursor-pointer"
										>
											<ArrowRight class="w-3 h-3 stroke-[3]" />
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
