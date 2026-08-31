<script lang="ts">
	import { enhance } from '$app/forms';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import {
		Kanban,
		BookOpen,
		FolderGit2,
		ExternalLink,
		FileText,
		GitBranch,
		ArrowRight,
		ArrowLeft,
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

	const typeSelectOptions = [
		{ value: 'all', label: 'All Types' },
		{ value: 'material', label: 'Topics Only' },
		{ value: 'project', label: 'Projects Only' }
	];

	const categorySelectOptions = $derived([
		{ value: 'all', label: 'All Categories' },
		...data.categories.map((cat: string) => ({ value: cat, label: cat }))
	]);

	const columns: { id: 'todo' | 'in_progress' | 'done'; title: string; headerBg: string; textCol: string }[] = [
		{ id: 'todo', title: 'TO DO', headerBg: 'bg-[#e2b342]', textCol: 'text-[#12151e]' },
		{ id: 'in_progress', title: 'IN PROGRESS', headerBg: 'bg-[#64b5d6]', textCol: 'text-[#12151e]' },
		{ id: 'done', title: 'DONE', headerBg: 'bg-[#7cb98f]', textCol: 'text-[#12151e]' }
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
	<title>Kanban Board</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header & Filters Toolbar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="neo-badge bg-[#ab92bf] text-[#12151e] mb-2">
				<Kanban class="w-3.5 h-3.5" />
				Unified Workspace Board
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-[#f1f5f9] tracking-tight uppercase">
				Kanban Board
			</h1>
		</div>

		<!-- Filter Toolbar -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- Search -->
			<div class="relative">
				<input
					type="text"
					placeholder="Filter cards..."
					bind:value={searchQuery}
					class="pl-8 pr-3 py-2 neo-input text-xs font-bold w-36 sm:w-44 text-[#f1f5f9]"
				/>
				<Search class="w-3.5 h-3.5 absolute left-2.5 top-3 text-[#64748b] pointer-events-none" />
			</div>

			<!-- Type Filter Custom Select -->
			<CustomSelect
				bind:value={filterType}
				options={typeSelectOptions}
				class="min-w-[145px]"
			/>

			<!-- Category Filter Custom Select -->
			<CustomSelect
				bind:value={filterCategory}
				options={categorySelectOptions}
				class="min-w-[160px]"
			/>
		</div>
	</div>

	<!-- Kanban Columns Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
		{#each columns as col}
			{@const colItems = getColumnItems(col.id)}
			<div
				class="neo-card bg-[#1a1f2c] flex flex-col min-h-[600px] overflow-hidden"
				role="region"
				aria-label="{col.title} Column"
				ondragover={onDragOver}
				ondrop={() => onDrop(col.id)}
			>
				<!-- Column Header -->
				<div class="p-3.5 border-b-2 border-[#384259] {col.headerBg} {col.textCol} flex items-center justify-between font-black">
					<h2 class="font-black text-sm uppercase tracking-wider">{col.title}</h2>
					<span class="w-6 h-6 bg-[#12151e] text-[#f1f5f9] font-mono text-xs font-black flex items-center justify-center border border-[#384259] shadow-[1px_1px_0px_0px_#080a0f]">
						{colItems.length}
					</span>
				</div>

				<!-- Cards Column -->
				<div class="p-3.5 flex-1 space-y-3.5 bg-[#151924]">
					{#if colItems.length === 0}
						<div class="h-36 border-2 border-dashed border-[#384259] flex flex-col items-center justify-center p-4 text-center">
							<span class="text-xs font-mono font-bold text-[#64748b]">
								Drag & drop cards here
							</span>
						</div>
					{/if}

					{#each colItems as item (item.id)}
						<div
							draggable="true"
							role="article"
							ondragstart={() => onDragStart(item.id)}
							class="neo-card-sm p-3.5 bg-[#1a1f2c] cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform"
						>
							<!-- Top Badges -->
							<div class="flex items-center justify-between gap-1 mb-2">
								<div class="flex items-center gap-1.5">
									{#if item.type === 'material'}
										<span class="neo-badge bg-[#e2b342] text-[#12151e] text-[10px] py-0.5 px-1.5">
											<BookOpen class="w-3 h-3 stroke-[2.5]" />
											Topic
										</span>
									{:else}
										<span class="neo-badge bg-[#64b5d6] text-[#12151e] text-[10px] py-0.5 px-1.5">
											<FolderGit2 class="w-3 h-3 stroke-[2.5]" />
											Project
										</span>
									{/if}
								</div>

								<span
									class="neo-badge text-[#12151e] text-[10px] py-0.5 px-1.5 truncate max-w-[120px] font-black"
									style="background-color: {item.color || '#e2b342'};"
								>
									{item.category}
								</span>
							</div>

							<!-- Title -->
							<h3 class="font-black text-sm uppercase text-[#f1f5f9] leading-tight mb-2">
								{item.title}
							</h3>

							{#if item.type === 'project' && item.description}
								<p class="text-[11px] text-[#cbd5e1] line-clamp-2 mb-3 leading-relaxed font-semibold">
									{item.description}
								</p>
							{/if}

							<!-- Card Footer / Actions -->
							<div class="pt-2.5 border-t border-[#384259] flex items-center justify-between">
								<div class="flex items-center gap-2">
									{#if item.type === 'material'}
										<a
											href="/materials/{item.id}"
											class="text-[11px] font-black text-[#f1f5f9] hover:text-[#e2b342] flex items-center gap-1 underline underline-offset-2"
										>
											<FileText class="w-3.5 h-3.5" />
											Notes
										</a>
										{#if item.url}
											<a
												href={item.url}
												target="_blank"
												rel="noopener noreferrer"
												class="text-[11px] font-mono text-[#64b5d6] hover:text-[#84cce6] hover:underline flex items-center gap-0.5"
												title="Open Reference"
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
												class="text-[11px] font-black text-[#f1f5f9] hover:text-[#e2b342] hover:underline flex items-center gap-1"
											>
												<GitBranch class="w-3.5 h-3.5" />
												Repo
											</a>
										{/if}
										{#if item.liveUrl}
											<a
												href={item.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-[11px] font-black text-[#64b5d6] hover:text-[#84cce6] hover:underline flex items-center gap-1"
											>
												<ExternalLink class="w-3.5 h-3.5" />
												Demo
											</a>
										{/if}
									{/if}
								</div>

								<!-- Move Buttons -->
								<div class="flex items-center gap-1">
									{#if col.id !== 'todo'}
										<button
											onclick={() => moveStatus(item.id, item.type, col.id === 'done' ? 'in_progress' : 'todo')}
											title="Move back"
											class="neo-btn-icon neo-btn-neutral p-1 text-[10px]"
										>
											<ArrowLeft class="w-3 h-3 stroke-[2.5]" />
										</button>
									{/if}

									{#if col.id !== 'done'}
										<button
											onclick={() => moveStatus(item.id, item.type, col.id === 'todo' ? 'in_progress' : 'done')}
											title="Move forward"
											class="neo-btn-icon neo-btn-primary p-1 text-[10px]"
										>
											<ArrowRight class="w-3 h-3 stroke-[2.5]" />
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
