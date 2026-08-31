<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Kanban,
		BookOpen,
		FolderGit2,
		ExternalLink,
		FileText,
		Github,
		ArrowRight,
		ArrowLeft,
		Filter
	} from 'lucide-svelte';

	let { data } = $props();

	// Local reactive copy for optimistic updates
	let items = $state([...data.items]);
	$effect(() => {
		items = [...data.items];
	});

	// Filter States
	let filterType = $state<'all' | 'material' | 'project'>('all');
	let filterTopic = $state<string>('all');

	const columns: { id: 'todo' | 'in_progress' | 'done'; title: string; color: string; badgeBg: string }[] = [
		{ id: 'todo', title: 'TO DO', color: 'bg-yellow-400', badgeBg: 'bg-yellow-100 dark:bg-yellow-950/50' },
		{ id: 'in_progress', title: 'IN PROGRESS', color: 'bg-cyan-400', badgeBg: 'bg-cyan-100 dark:bg-cyan-950/50' },
		{ id: 'done', title: 'DONE', color: 'bg-green-400', badgeBg: 'bg-green-100 dark:bg-green-950/50' }
	];

	const filteredItems = $derived(
		items.filter((item) => {
			if (filterType !== 'all' && item.type !== filterType) return false;
			if (filterTopic !== 'all' && item.topicId !== filterTopic) return false;
			return true;
		})
	);

	function getColumnItems(colId: 'todo' | 'in_progress' | 'done') {
		return filteredItems.filter((i) => i.status === colId);
	}

	// Optimistic move
	async function moveStatus(id: string, type: 'material' | 'project', newStatus: 'todo' | 'in_progress' | 'done') {
		// Update optimistic locally
		items = items.map((i) => (i.id === id ? { ...i, status: newStatus } : i));

		// Submit form
		const formData = new FormData();
		formData.append('id', id);
		formData.append('type', type);
		formData.append('status', newStatus);

		await fetch('?/moveItem', {
			method: 'POST',
			body: formData
		});
	}

	// Drag & Drop
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
	<!-- Header & Filters -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="inline-flex items-center gap-1.5 bg-purple-400 text-black px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
				<Kanban class="w-3.5 h-3.5" />
				Unified Workspace Board
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Kanban Board
			</h1>
		</div>

		<!-- Filters Bar -->
		<div class="flex flex-wrap items-center gap-3">
			<div class="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
				<Filter class="w-4 h-4 ml-1 text-slate-500" />
				<!-- Type Filter -->
				<select
					bind:value={filterType}
					class="text-xs font-black uppercase bg-transparent text-black dark:text-white outline-none px-2 py-1 cursor-pointer"
				>
					<option value="all">Semua Tipe</option>
					<option value="material">Hanya Materi</option>
					<option value="project">Hanya Project</option>
				</select>
			</div>

			<div class="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
				<!-- Topic Filter -->
				<select
					bind:value={filterTopic}
					class="text-xs font-black uppercase bg-transparent text-black dark:text-white outline-none px-2 py-1 cursor-pointer"
				>
					<option value="all">Semua Topik</option>
					{#each data.topics as top}
						<option value={top.id}>{top.title}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Kanban Columns Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
		{#each columns as col}
			{@const colItems = getColumnItems(col.id)}
			<div
				class="neo-box bg-white dark:bg-slate-800 flex flex-col min-h-[600px] overflow-hidden"
				ondragover={onDragOver}
				ondrop={() => onDrop(col.id)}
			>
				<!-- Column Header -->
				<div class="p-3 border-b-3 border-black dark:border-slate-700 {col.color} text-black flex items-center justify-between">
					<div class="flex items-center gap-2">
						<h2 class="font-black text-base uppercase tracking-wider">{col.title}</h2>
					</div>
					<span class="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-mono text-xs font-bold shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]">
						{colItems.length}
					</span>
				</div>

				<!-- Column Body / Card Container -->
				<div class="p-3 flex-1 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
					{#if colItems.length === 0}
						<div class="h-32 border-2 border-dashed border-black/20 dark:border-white/20 rounded flex items-center justify-center text-xs font-mono font-bold text-slate-400">
							Tarik kartu ke sini
						</div>
					{/if}

					{#each colItems as item (item.id)}
						<div
							draggable="true"
							ondragstart={() => onDragStart(item.id)}
							class="neo-box p-3 bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform group"
						>
							<!-- Top Card Badges -->
							<div class="flex items-center justify-between gap-1 mb-2">
								<div class="flex items-center gap-1.5">
									{#if item.type === 'material'}
										<span class="neo-badge bg-yellow-300 text-black text-[10px]">
											<BookOpen class="w-3 h-3 mr-1" />
											Materi
										</span>
									{:else}
										<span class="neo-badge bg-cyan-300 text-black text-[10px]">
											<FolderGit2 class="w-3 h-3 mr-1" />
											Project
										</span>
									{/if}
								</div>

								{#if item.topic}
									<span
										class="neo-badge text-black text-[10px] truncate max-w-[120px]"
										style="background-color: {item.topic.color};"
									>
										{item.topic.title}
									</span>
								{/if}
							</div>

							<!-- Card Title -->
							<h3 class="font-black text-sm uppercase text-black dark:text-white leading-tight mb-2">
								{item.title}
							</h3>

							{#if item.type === 'project' && item.description}
								<p class="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
									{item.description}
								</p>
							{/if}

							<!-- Card Footer / Actions -->
							<div class="pt-2 border-t border-black/10 dark:border-slate-700 flex items-center justify-between">
								<div class="flex items-center gap-2">
									{#if item.type === 'material'}
										<a
											href="/materials/{item.id}"
											class="text-[11px] font-bold text-black dark:text-white hover:text-yellow-500 flex items-center gap-1 underline underline-offset-2"
										>
											<FileText class="w-3 h-3" />
											Notes
										</a>
										{#if item.url}
											<a
												href={item.url}
												target="_blank"
												rel="noopener noreferrer"
												class="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
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
												class="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1"
											>
												<Github class="w-3 h-3" />
												Repo
											</a>
										{/if}
										{#if item.liveUrl}
											<a
												href={item.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
											>
												<ExternalLink class="w-3 h-3" />
												Demo
											</a>
										{/if}
									{/if}
								</div>

								<!-- Quick Move Buttons -->
								<div class="flex items-center gap-1">
									{#if col.id !== 'todo'}
										<button
											onclick={() => moveStatus(item.id, item.type, col.id === 'done' ? 'in_progress' : 'todo')}
											title="Mundur ke status sebelumnya"
											class="p-1 bg-slate-100 dark:bg-slate-700 hover:bg-yellow-200 text-black dark:text-white border border-black text-[10px] cursor-pointer"
										>
											<ArrowLeft class="w-3 h-3" />
										</button>
									{/if}

									{#if col.id !== 'done'}
										<button
											onclick={() => moveStatus(item.id, item.type, col.id === 'todo' ? 'in_progress' : 'done')}
											title="Maju ke status berikutnya"
											class="p-1 bg-slate-100 dark:bg-slate-700 hover:bg-green-200 text-black dark:text-white border border-black text-[10px] cursor-pointer"
										>
											<ArrowRight class="w-3 h-3" />
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
