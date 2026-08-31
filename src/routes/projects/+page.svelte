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
	let newColor = $state('#0284c7');
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
		{ label: 'Sky', value: '#0284c7', bg: 'bg-sky-600' },
		{ label: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
		{ label: 'Purple', value: '#9333ea', bg: 'bg-purple-600' },
		{ label: 'Emerald', value: '#059669', bg: 'bg-emerald-600' },
		{ label: 'Rose', value: '#e11d48', bg: 'bg-rose-600' },
		{ label: 'Orange', value: '#ea580c', bg: 'bg-orange-600' }
	];

	const defaultCategories = ['Frontend', 'Backend', 'Fullstack', 'CLI Tool', 'DevOps', 'Mobile', 'Experiment'];

	const categorySelectOptions = $derived([
		{ value: 'all', label: 'Semua Kategori' },
		...data.categories.map((cat: string) => ({ value: cat, label: cat }))
	]);

	const statusSelectOptions = [
		{ value: 'all', label: 'Semua Status' },
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
	<title>Practice Projects - Dev Hub</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="neo-badge bg-sky-600 text-white mb-2">
				<FolderGit2 class="w-3.5 h-3.5" />
				Hands-on Practice & Portfolio
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Practice Projects
			</h1>
		</div>

		<button
			onclick={() => (showModal = true)}
			class="neo-btn neo-btn-secondary flex items-center gap-2 self-start md:self-auto"
		>
			<Plus class="w-5 h-5 stroke-[3]" />
			Tambah Project
		</button>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="neo-card-sm p-4 bg-white dark:bg-slate-900">
			<span class="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Total Project</span>
			<div class="text-3xl font-black text-black dark:text-white mt-1">{data.stats.total}</div>
		</div>
		<div class="neo-card-sm p-4 bg-amber-100 dark:bg-amber-950/40">
			<span class="text-xs font-black uppercase text-amber-900 dark:text-amber-300 tracking-wider">To Do</span>
			<div class="text-3xl font-black text-amber-950 dark:text-amber-200 mt-1">{data.stats.todo}</div>
		</div>
		<div class="neo-card-sm p-4 bg-sky-100 dark:bg-sky-950/40">
			<span class="text-xs font-black uppercase text-sky-900 dark:text-sky-300 tracking-wider">In Progress</span>
			<div class="text-3xl font-black text-sky-950 dark:text-sky-200 mt-1">{data.stats.inProgress}</div>
		</div>
		<div class="neo-card-sm p-4 bg-emerald-100 dark:bg-emerald-950/40">
			<span class="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider">Selesai</span>
			<div class="text-3xl font-black text-emerald-950 dark:text-emerald-200 mt-1">{data.stats.done}</div>
		</div>
	</div>

	<!-- Search & Filter Toolbar -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<input
				type="text"
				placeholder="Cari project atau deskripsi..."
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

	<!-- Projects Grid -->
	{#if filteredProjects.length === 0}
		<div class="neo-card p-10 text-center bg-white dark:bg-slate-900 my-8">
			<FolderGit2 class="w-12 h-12 mx-auto mb-3 text-slate-400" />
			<h3 class="text-lg font-black uppercase text-black dark:text-white">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Tidak ada project yang sesuai filter' : 'Belum ada Project Praktek'}
			</h3>
			<p class="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto font-medium">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Coba ubah kata kunci atau filter status.' : 'Catat project latihan, cloning aplikasi, atau eksperimen kode yang sedang kamu bangun.'}
			</p>
			{#if !searchQuery && selectedCategory === 'all' && selectedStatus === 'all'}
				<button
					onclick={() => (showModal = true)}
					class="neo-btn neo-btn-secondary mt-5"
				>
					+ Buat Project Pertama
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProjects as proj (proj.id)}
				{@const badge = getStatusBadge(proj.status)}
				<div class="neo-card flex flex-col justify-between p-5 bg-white dark:bg-slate-900 hover:-translate-y-1 transition-transform">
					<div>
						<!-- Badges Row -->
						<div class="flex items-center justify-between gap-2 mb-3">
							<!-- Category Badge -->
							<span
								class="neo-badge text-black font-black"
								style="background-color: {proj.color || '#0284c7'};"
							>
								{proj.category || 'Project'}
							</span>

							<!-- Status Button -->
							<form method="POST" action="?/updateStatus" use:enhance>
								<input type="hidden" name="id" value={proj.id} />
								<input type="hidden" name="status" value={getNextStatus(proj.status)} />
								<button
									type="submit"
									title="Klik untuk ubah status: {proj.status}"
									class="neo-badge {badge.classes} cursor-pointer hover:scale-105 transition-transform"
								>
									<badge.icon class="w-3.5 h-3.5 stroke-[2.5]" />
									{badge.label}
								</button>
							</form>
						</div>

						<h2 class="text-xl font-black uppercase text-black dark:text-white mb-2 leading-tight">
							{proj.title}
						</h2>

						<p class="text-slate-800 dark:text-slate-200 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed font-semibold">
							{proj.description || 'Tidak ada deskripsi.'}
						</p>
					</div>

					<div class="pt-3 border-t-2 border-dashed border-black/20 dark:border-white/20 flex items-center justify-between gap-2">
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
							aria-label="Hapus Project"
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

<!-- Modal Create Project -->
{#if showModal}
	<div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-lg neo-card p-6 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-150">
			<div class="flex items-center justify-between pb-3 border-b-3 border-black dark:border-white mb-5">
				<h3 class="font-black text-xl uppercase text-black dark:text-white flex items-center gap-2">
					<FolderGit2 class="w-5 h-5" />
					Tambah Project Baru
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
					<label for="proj-title" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
						Nama Project
					</label>
					<input
						type="text"
						id="proj-title"
						name="title"
						required
						bind:value={newTitle}
						placeholder="contoh: CLI URL Shortener, Auth Microservice"
						class="w-full px-3.5 py-2.5 neo-input"
					/>
				</div>

				<div>
					<label for="proj-desc" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
						Deskripsi Ringkas
					</label>
					<textarea
						id="proj-desc"
						name="description"
						rows="3"
						bind:value={newDescription}
						placeholder="Membangun sistem authentication dengan JWT dan session cookie..."
						class="w-full px-3.5 py-2.5 neo-input text-xs"
					></textarea>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="proj-category" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
							Kategori / Tag
						</label>
						<input
							type="text"
							id="proj-category"
							name="category"
							bind:value={newCategory}
							list="proj-cat-list"
							placeholder="contoh: Fullstack"
							class="w-full px-3.5 py-2.5 neo-input text-xs"
						/>
						<datalist id="proj-cat-list">
							{#each defaultCategories as cat}
								<option value={cat}></option>
							{/each}
						</datalist>
					</div>

					<div>
						<span class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
							Warna Label
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

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="proj-repo" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
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
						<label for="proj-demo" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
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

				<div class="flex justify-end gap-3 pt-3 border-t-2 border-dashed border-black/20 dark:border-white/20">
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="neo-btn neo-btn-neutral text-xs"
					>
						Batal
					</button>
					<button
						type="submit"
						class="neo-btn neo-btn-secondary text-xs font-black"
					>
						Simpan Project
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Custom Delete Confirmation Modal -->
<ConfirmModal
	bind:open={showDeleteConfirm}
	title="Hapus Project?"
	message={`Apakah kamu yakin ingin menghapus project "${itemToDelete?.title || ''}"? Tindakan ini tidak dapat dibatalkan.`}
	confirmLabel="Ya, Hapus Project"
	cancelLabel="Batal"
	variant="danger"
	onconfirm={executeDelete}
/>
