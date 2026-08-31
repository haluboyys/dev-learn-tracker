<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import {
		Plus,
		ExternalLink,
		GitBranch,
		Trash2,
		FolderGit2,
		CheckCircle2,
		Clock,
		Circle,
		X,
		Search
	} from 'lucide-svelte';

	let { data } = $props();

	// Modal State
	let showModal = $state(false);
	let newTitle = $state('');
	let newDescription = $state('');
	let newCategory = $state('Fullstack');
	let newColor = $state('#64b5d6');
	let newRepoUrl = $state('');
	let newLiveUrl = $state('');
	let newStatus = $state<'todo' | 'in_progress' | 'done'>('todo');

	// Delete Confirmation Modal State
	let showDeleteConfirm = $state(false);
	let itemToDelete = $state<{ id: string; title: string } | null>(null);

	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedStatus = $state('all');

	const colorOptions = [
		{ label: 'Sky', value: '#64b5d6', bg: 'bg-[#64b5d6]' },
		{ label: 'Amber', value: '#e2b342', bg: 'bg-[#e2b342]' },
		{ label: 'Sage', value: '#7cb98f', bg: 'bg-[#7cb98f]' },
		{ label: 'Rose', value: '#e07a8b', bg: 'bg-[#e07a8b]' },
		{ label: 'Lavender', value: '#ab92bf', bg: 'bg-[#ab92bf]' },
		{ label: 'Orange', value: '#e59a68', bg: 'bg-[#e59a68]' }
	];

	const defaultCategories = ['Frontend', 'Backend', 'Fullstack', 'CLI Tool', 'DevOps', 'Mobile', 'Experiment'];

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
					classes: 'bg-[#7cb98f] text-[#12151e] border-[#384259]',
					icon: CheckCircle2
				};
			case 'in_progress':
				return {
					label: 'In Progress',
					classes: 'bg-[#64b5d6] text-[#12151e] border-[#384259]',
					icon: Clock
				};
			default:
				return {
					label: 'To Do',
					classes: 'bg-[#e2b342] text-[#12151e] border-[#384259]',
					icon: Circle
				};
		}
	}

	function getNextStatus(current: string): 'todo' | 'in_progress' | 'done' {
		if (current === 'todo') return 'in_progress';
		if (current === 'in_progress') return 'done';
		return 'todo';
	}

	const filteredProjects = $derived(
		data.projects.filter((proj: any) => {
			const matchesSearch =
				proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesCategory = selectedCategory === 'all' || proj.category === selectedCategory;
			const matchesStatus = selectedStatus === 'all' || proj.status === selectedStatus;
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

		await fetch('?/deleteProject', {
			method: 'POST',
			body: formData
		});

		await invalidateAll();
		itemToDelete = null;
	}
</script>

<svelte:head>
	<title>Projects - DevTrack</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="neo-badge bg-[#64b5d6] text-[#12151e] mb-2">
				<FolderGit2 class="w-3.5 h-3.5" />
				Hands-on Practice & Portfolio
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-[#f1f5f9] tracking-tight uppercase">
				Practice Projects
			</h1>
		</div>

		<button
			onclick={() => (showModal = true)}
			class="neo-btn neo-btn-secondary flex items-center gap-2 self-start md:self-auto"
		>
			<Plus class="w-5 h-5 stroke-[3]" />
			Add Project
		</button>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="neo-card-sm p-4 bg-[#1a1f2c]">
			<span class="text-xs font-black uppercase text-[#94a3b8] tracking-wider">Total Projects</span>
			<div class="text-3xl font-black text-[#f1f5f9] mt-1">{data.stats.total}</div>
		</div>
		<div class="neo-card-sm p-4 bg-[#23201a] border-[#4d4022]">
			<span class="text-xs font-black uppercase text-[#e2b342] tracking-wider">To Do</span>
			<div class="text-3xl font-black text-[#edd078] mt-1">{data.stats.todo}</div>
		</div>
		<div class="neo-card-sm p-4 bg-[#18232c] border-[#294458]">
			<span class="text-xs font-black uppercase text-[#64b5d6] tracking-wider">In Progress</span>
			<div class="text-3xl font-black text-[#84cce6] mt-1">{data.stats.inProgress}</div>
		</div>
		<div class="neo-card-sm p-4 bg-[#19241f] border-[#2a4a37]">
			<span class="text-xs font-black uppercase text-[#7cb98f] tracking-wider">Completed</span>
			<div class="text-3xl font-black text-[#96cca7] mt-1">{data.stats.done}</div>
		</div>
	</div>

	<!-- Search & Filter Toolbar -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<input
				type="text"
				placeholder="Search projects or description..."
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2.5 neo-input text-xs sm:text-sm font-bold text-[#f1f5f9]"
			/>
			<Search class="w-4 h-4 absolute left-3.5 top-3.5 text-[#64748b] pointer-events-none" />
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

	<!-- Projects Grid -->
	{#if filteredProjects.length === 0}
		<div class="neo-card p-10 text-center bg-[#1a1f2c] my-8">
			<FolderGit2 class="w-12 h-12 mx-auto mb-3 text-[#64748b]" />
			<h3 class="text-lg font-black uppercase text-[#f1f5f9]">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'No projects match your filters' : 'No Practice Projects Yet'}
			</h3>
			<p class="text-[#94a3b8] text-sm mt-1 max-w-md mx-auto font-medium">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Try changing your search query or status filter.' : 'Track hands-on practice, clone apps, or code experiments you are building.'}
			</p>
			{#if !searchQuery && selectedCategory === 'all' && selectedStatus === 'all'}
				<button
					onclick={() => (showModal = true)}
					class="neo-btn neo-btn-secondary mt-5"
				>
					+ Create First Project
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProjects as proj (proj.id)}
				{@const badge = getStatusBadge(proj.status)}
				<div class="neo-card flex flex-col justify-between p-5 bg-[#1a1f2c] hover:-translate-y-1 transition-transform">
					<div>
						<!-- Badges Row -->
						<div class="flex items-center justify-between gap-2 mb-3">
							<!-- Category Badge -->
							<span
								class="neo-badge text-[#12151e] font-black"
								style="background-color: {proj.color || '#64b5d6'};"
							>
								{proj.category || 'Project'}
							</span>

							<!-- Status Button -->
							<form method="POST" action="?/updateStatus" use:enhance>
								<input type="hidden" name="id" value={proj.id} />
								<input type="hidden" name="status" value={getNextStatus(proj.status)} />
								<button
									type="submit"
									title="Click to cycle status: {proj.status}"
									class="neo-badge {badge.classes} cursor-pointer hover:scale-105 transition-transform"
								>
									<badge.icon class="w-3.5 h-3.5 stroke-[2.5]" />
									{badge.label}
								</button>
							</form>
						</div>

						<h2 class="text-xl font-black uppercase text-[#f1f5f9] mb-2 leading-tight">
							{proj.title}
						</h2>

						<p class="text-[#cbd5e1] text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed font-semibold">
							{proj.description || 'No description provided.'}
						</p>
					</div>

					<div class="pt-3 border-t-2 border-dashed border-[#384259] flex items-center justify-between gap-2">
						<div class="flex items-center gap-2 flex-wrap">
							{#if proj.repoUrl}
								<a
									href={proj.repoUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="neo-btn-sm neo-btn-neutral flex items-center gap-1 text-xs"
								>
									<GitBranch class="w-3.5 h-3.5 stroke-[2.5]" />
									Repo
								</a>
							{/if}

							{#if proj.liveUrl}
								<a
									href={proj.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="neo-btn-sm neo-btn-secondary flex items-center gap-1 text-xs"
								>
									<ExternalLink class="w-3.5 h-3.5 stroke-[2.5]" />
									Demo
								</a>
							{/if}
						</div>

						<button
							type="button"
							onclick={() => promptDelete({ id: proj.id, title: proj.title })}
							aria-label="Delete Project"
							class="neo-btn-icon neo-btn-danger"
						>
							<Trash2 class="w-4 h-4 text-[#12151e] stroke-[2.5]" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Create Project -->
{#if showModal}
	<div class="fixed inset-0 z-50 bg-[#080a0f]/80 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-lg neo-card p-6 bg-[#1a1f2c] border-3 border-[#384259] animate-in zoom-in-95 duration-150">
			<div class="flex items-center justify-between pb-3 border-b-2 border-[#384259] mb-5">
				<h3 class="font-black text-xl uppercase text-[#f1f5f9] flex items-center gap-2">
					<FolderGit2 class="w-5 h-5 text-[#64b5d6]" />
					Add New Project
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
				action="?/createProject"
				use:enhance={() => {
					return async ({ update }) => {
						showModal = false;
						newTitle = '';
						newDescription = '';
						newRepoUrl = '';
						newLiveUrl = '';
						await update();
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="proj-title" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
						Project Title
					</label>
					<input
						type="text"
						id="proj-title"
						name="title"
						required
						bind:value={newTitle}
						placeholder="e.g., CLI URL Shortener, Auth Microservice"
						class="w-full px-3.5 py-2.5 neo-input"
					/>
				</div>

				<div>
					<label for="proj-desc" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
						Short Description
					</label>
					<textarea
						id="proj-desc"
						name="description"
						rows="3"
						bind:value={newDescription}
						placeholder="Building an authentication system with JWT and session cookies..."
						class="w-full px-3.5 py-2.5 neo-input text-xs"
					></textarea>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="proj-category" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
							Category / Tag
						</label>
						<input
							type="text"
							id="proj-category"
							name="category"
							bind:value={newCategory}
							list="proj-cat-list"
							placeholder="e.g., Fullstack"
							class="w-full px-3.5 py-2.5 neo-input text-xs"
						/>
						<datalist id="proj-cat-list">
							{#each defaultCategories as cat}
								<option value={cat}></option>
							{/each}
						</datalist>
					</div>

					<div>
						<span class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
							Badge Color
						</span>
						<div class="flex gap-1.5 pt-1">
							{#each colorOptions as c}
								<label class="cursor-pointer">
									<input type="radio" name="color" value={c.value} bind:group={newColor} class="sr-only" />
									<div
										class="w-7 h-7 border-2 border-[#384259] shadow-[1.5px_1.5px_0px_0px_#080a0f] {c.bg} {newColor === c.value ? 'ring-2 ring-[#f1f5f9] scale-110' : 'opacity-60'}"
									></div>
								</label>
							{/each}
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="proj-repo" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
							GitHub Repo URL
						</label>
						<input
							type="url"
							id="proj-repo"
							name="repoUrl"
							bind:value={newRepoUrl}
							placeholder="https://github.com/..."
							class="w-full px-3.5 py-2.5 neo-input text-xs font-mono"
						/>
					</div>

					<div>
						<label for="proj-demo" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
							Live Demo URL
						</label>
						<input
							type="url"
							id="proj-demo"
							name="liveUrl"
							bind:value={newLiveUrl}
							placeholder="https://..."
							class="w-full px-3.5 py-2.5 neo-input text-xs font-mono"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-3 border-t-2 border-dashed border-[#384259]">
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="neo-btn neo-btn-neutral text-xs"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="neo-btn neo-btn-secondary text-xs font-black"
					>
						Save Project
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Custom Delete Confirmation Modal -->
<ConfirmModal
	bind:open={showDeleteConfirm}
	title="Delete Project?"
	message={`Are you sure you want to delete "${itemToDelete?.title || ''}"? This action cannot be undone.`}
	confirmLabel="Yes, Delete Project"
	cancelLabel="Cancel"
	variant="danger"
	onconfirm={executeDelete}
/>
