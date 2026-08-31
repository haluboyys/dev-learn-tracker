<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import {
		Plus,
		ExternalLink,
		FileText,
		CheckCircle2,
		Clock,
		Circle,
		Trash2,
		BookOpen,
		Search,
		X,
		ArrowRight
	} from 'lucide-svelte';

	let { data } = $props();

	// Modal State
	let showModal = $state(false);
	let newTitle = $state('');
	let newCategory = $state('Backend');
	let newColor = $state('#f59e0b');
	let newUrl = $state('');
	let newNotes = $state('');

	// Delete Confirmation Modal State
	let showDeleteConfirm = $state(false);
	let itemToDelete = $state<{ id: string; title: string } | null>(null);

	// Search & Filter
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedStatus = $state('all');

	const colorOptions = [
		{ label: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
		{ label: 'Sky', value: '#0284c7', bg: 'bg-sky-600' },
		{ label: 'Purple', value: '#9333ea', bg: 'bg-purple-600' },
		{ label: 'Emerald', value: '#059669', bg: 'bg-emerald-600' },
		{ label: 'Rose', value: '#e11d48', bg: 'bg-rose-600' },
		{ label: 'Orange', value: '#ea580c', bg: 'bg-orange-600' }
	];

	const defaultCategories = ['Backend', 'Frontend', 'Database', 'DevOps', 'Mobile', 'Computer Science', 'General'];

	const categorySelectOptions = $derived([
		{ value: 'all', label: 'All Categories' },
		...data.categories.map((cat: string) => ({ value: cat, label: cat }))
	]);

	const statusSelectOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'todo', label: 'To Do' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'done', label: 'Done' }
	];

	function getStatusBadge(status: string) {
		switch (status) {
			case 'done':
				return {
					label: 'Done',
					classes: 'bg-emerald-600 text-white border-black dark:border-white',
					icon: CheckCircle2
				};
			case 'in_progress':
				return {
					label: 'In Progress',
					classes: 'bg-sky-600 text-white border-black dark:border-white',
					icon: Clock
				};
			default:
				return {
					label: 'To Do',
					classes: 'bg-amber-400 text-black border-black dark:border-white',
					icon: Circle
				};
		}
	}

	function getNextStatus(current: string): 'todo' | 'in_progress' | 'done' {
		if (current === 'todo') return 'in_progress';
		if (current === 'in_progress') return 'done';
		return 'todo';
	}

	const filteredMaterials = $derived(
		data.materials.filter((item: any) => {
			const matchesSearch =
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
			const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
			return matchesSearch && matchesCategory && matchesStatus;
		})
	);

	function promptDelete(item: { id: string; title: string }) {
		itemToDelete = item;
		showDeleteConfirm = true;
	}

	async function executeDelete() {
		if (!itemToDelete) return;
		const formData = new FormData();
		formData.append('id', itemToDelete.id);

		await fetch('?/deleteMaterial', {
			method: 'POST',
			body: formData
		});

		await invalidateAll();
		itemToDelete = null;
	}
</script>

<svelte:head>
	<title>Topics - DevTrack</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="neo-badge bg-amber-500 text-black mb-2">
				<BookOpen class="w-3.5 h-3.5" />
				Learning Curriculum & Notes
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Learning Topics
			</h1>
		</div>

		<button
			onclick={() => (showModal = true)}
			class="neo-btn neo-btn-primary flex items-center gap-2 self-start md:self-auto"
		>
			<Plus class="w-5 h-5 stroke-[3]" />
			Add Topic
		</button>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="neo-card-sm p-4 bg-white dark:bg-slate-900">
			<span class="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Total Topics</span>
			<div class="text-3xl font-black text-black dark:text-white mt-1">{data.stats.totalMaterials}</div>
		</div>
		<div class="neo-card-sm p-4 bg-amber-100 dark:bg-amber-950/40">
			<span class="text-xs font-black uppercase text-amber-900 dark:text-amber-300 tracking-wider">To Do</span>
			<div class="text-3xl font-black text-amber-950 dark:text-amber-200 mt-1">{data.stats.totalTodo}</div>
		</div>
		<div class="neo-card-sm p-4 bg-sky-100 dark:bg-sky-950/40">
			<span class="text-xs font-black uppercase text-sky-900 dark:text-sky-300 tracking-wider">In Progress</span>
			<div class="text-3xl font-black text-sky-950 dark:text-sky-200 mt-1">{data.stats.totalInProgress}</div>
		</div>
		<div class="neo-card-sm p-4 bg-emerald-100 dark:bg-emerald-950/40">
			<span class="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider">
				Completed ({data.stats.overallProgress}%)
			</span>
			<div class="text-3xl font-black text-emerald-950 dark:text-emerald-200 mt-1">{data.stats.totalDone}</div>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<input
				type="text"
				placeholder="Search topics or note content..."
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2.5 neo-input text-xs sm:text-sm font-bold"
			/>
			<Search class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
		</div>

		<div class="flex items-center gap-3 flex-wrap">
			<!-- Custom Select for Category -->
			<CustomSelect
				bind:value={selectedCategory}
				options={categorySelectOptions}
				class="min-w-[160px]"
			/>

			<!-- Custom Select for Status -->
			<CustomSelect
				bind:value={selectedStatus}
				options={statusSelectOptions}
				class="min-w-[150px]"
			/>
		</div>
	</div>

	<!-- Materials Grid -->
	{#if filteredMaterials.length === 0}
		<div class="neo-card p-10 text-center bg-white dark:bg-slate-900 my-8">
			<BookOpen class="w-12 h-12 mx-auto mb-3 text-slate-400" />
			<h3 class="text-lg font-black uppercase text-black dark:text-white">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'No topics match your filters' : 'No Learning Topics Yet'}
			</h3>
			<p class="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto font-medium">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Try adjusting your search query or filters.' : 'Start learning by creating a new topic (e.g., Golang Basics, SvelteKit 5, PostgreSQL Query).'}
			</p>
			{#if !searchQuery && selectedCategory === 'all' && selectedStatus === 'all'}
				<button
					onclick={() => (showModal = true)}
					class="neo-btn neo-btn-primary mt-5"
				>
					+ Create First Topic
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredMaterials as item (item.id)}
				{@const badge = getStatusBadge(item.status)}
				<div class="neo-card flex flex-col justify-between p-5 bg-white dark:bg-slate-900 hover:-translate-y-1 transition-transform">
					<div>
						<!-- Top Badges Row -->
						<div class="flex items-center justify-between gap-2 mb-3">
							<!-- Category Badge -->
							<span
								class="neo-badge text-black font-black"
								style="background-color: {item.color || '#f59e0b'};"
							>
								{item.category || 'General'}
							</span>

							<!-- Status Cycle Button -->
							<form method="POST" action="?/updateStatus" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="status" value={getNextStatus(item.status)} />
								<button
									type="submit"
									title="Click to cycle status: {item.status}"
									class="neo-badge {badge.classes} cursor-pointer hover:scale-105 transition-transform"
								>
									<badge.icon class="w-3.5 h-3.5 stroke-[2.5]" />
									{badge.label}
								</button>
							</form>
						</div>

						<!-- Material Title -->
						<h2 class="text-xl font-black uppercase text-black dark:text-white mb-2 leading-tight">
							{item.title}
						</h2>

						<!-- Doc URL Link -->
						{#if item.url}
							<div class="mb-3">
								<a
									href={item.url}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-xs font-mono font-bold text-sky-700 dark:text-sky-400 hover:underline"
								>
									<ExternalLink class="w-3.5 h-3.5" />
									Documentation / Reference
								</a>
							</div>
						{/if}

						<!-- Notes Preview / Status -->
						<div class="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white mb-4">
							{#if item.notes && item.notes.trim()}
								<p class="text-xs font-mono text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed font-semibold">
									{item.notes}
								</p>
							{:else}
								<p class="text-xs font-mono italic text-slate-500 dark:text-slate-400">
									No notes yet. Click the button below to start writing.
								</p>
							{/if}
						</div>
					</div>

					<!-- Bottom Action Buttons -->
					<div class="pt-3 border-t-2 border-dashed border-black/20 dark:border-white/20 flex items-center justify-between gap-3">
						<a
							href="/materials/{item.id}"
							class="flex-1 neo-btn-sm neo-btn-primary flex items-center justify-center gap-1.5 py-2"
						>
							<FileText class="w-4 h-4 stroke-[2.5]" />
							{item.notes && item.notes.trim() ? 'Open Notes' : 'Write Notes'}
							<ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
						</a>

						<button
							type="button"
							onclick={() => promptDelete({ id: item.id, title: item.title })}
							aria-label="Delete Topic"
							class="neo-btn-icon neo-btn-danger"
						>
							<Trash2 class="w-4 h-4 text-white stroke-[2.5]" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Create Material -->
{#if showModal}
	<div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-lg neo-card p-6 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-150">
			<div class="flex items-center justify-between pb-3 border-b-3 border-black dark:border-white mb-5">
				<h3 class="font-black text-xl uppercase text-black dark:text-white flex items-center gap-2">
					<BookOpen class="w-5 h-5" />
					Add New Topic
				</h3>
				<button
					onclick={() => (showModal = false)}
					class="neo-btn-icon neo-btn-neutral p-1.5"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form
				method="POST"
				action="?/createMaterial"
				use:enhance={() => {
					return async ({ update }) => {
						showModal = false;
						newTitle = '';
						newUrl = '';
						newNotes = '';
						await update();
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="mat-title" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
						Topic Title
					</label>
					<input
						type="text"
						id="mat-title"
						name="title"
						required
						bind:value={newTitle}
						placeholder="e.g., Golang Basics, SvelteKit 5, Docker Swarm"
						class="w-full px-3.5 py-2.5 neo-input"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="mat-category" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
							Category
						</label>
						<input
							type="text"
							id="mat-category"
							name="category"
							bind:value={newCategory}
							list="categories-list"
							placeholder="e.g., Backend"
							class="w-full px-3.5 py-2.5 neo-input text-xs"
						/>
						<datalist id="categories-list">
							{#each defaultCategories as cat}
								<option value={cat}></option>
							{/each}
						</datalist>
					</div>

					<div>
						<span class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
							Badge Color
						</span>
						<div class="flex gap-1.5 pt-1">
							{#each colorOptions as c}
								<label class="cursor-pointer">
									<input type="radio" name="color" value={c.value} bind:group={newColor} class="sr-only" />
									<div
										class="w-7 h-7 border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] {c.bg} {newColor === c.value ? 'ring-2 ring-black dark:ring-white scale-110' : 'opacity-60'}"
									></div>
								</label>
							{/each}
						</div>
					</div>
				</div>

				<div>
					<label for="mat-url" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
						Documentation / Resource URL (Optional)
					</label>
					<input
						type="url"
						id="mat-url"
						name="url"
						bind:value={newUrl}
						placeholder="https://go.dev/doc/tutorial/getting-started"
						class="w-full px-3.5 py-2.5 neo-input text-xs font-mono"
					/>
				</div>

				<div class="flex justify-end gap-3 pt-3 border-t-2 border-dashed border-black/20 dark:border-white/20">
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="neo-btn neo-btn-neutral text-xs"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="neo-btn neo-btn-primary text-xs font-black"
					>
						Save Topic
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Custom Delete Confirmation Modal -->
<ConfirmModal
	bind:open={showDeleteConfirm}
	title="Delete Topic?"
	message={`Are you sure you want to delete "${itemToDelete?.title || ''}" and all its notes? This action cannot be undone.`}
	confirmLabel="Yes, Delete Topic"
	cancelLabel="Cancel"
	variant="danger"
	onconfirm={executeDelete}
/>
