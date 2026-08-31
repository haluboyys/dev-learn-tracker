<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, ExternalLink, GitBranch, Trash2, FolderGit2, CheckCircle2, Clock, Circle, X } from 'lucide-svelte';

	let { data } = $props();

	let showModal = $state(false);
	let newTitle = $state('');
	let newDescription = $state('');
	let newRepoUrl = $state('');
	let newLiveUrl = $state('');
	let newTopicId = $state('none');
	let newStatus = $state<'todo' | 'in_progress' | 'done'>('todo');

	function getStatusBadge(status: string) {
		switch (status) {
			case 'done':
				return { label: 'Done', color: 'bg-green-400 text-black', icon: CheckCircle2 };
			case 'in_progress':
				return { label: 'In Progress', color: 'bg-cyan-400 text-black', icon: Clock };
			default:
				return { label: 'To Do', color: 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white', icon: Circle };
		}
	}

	function getNextStatus(current: string): 'todo' | 'in_progress' | 'done' {
		if (current === 'todo') return 'in_progress';
		if (current === 'in_progress') return 'done';
		return 'todo';
	}
</script>

<svelte:head>
	<title>Practice Projects - Dev Hub</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="inline-flex items-center gap-1.5 bg-cyan-400 text-black px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
				<FolderGit2 class="w-3.5 h-3.5" />
				Hands-on Practice & Portfolio
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Practice Projects
			</h1>
		</div>

		<button
			onclick={() => (showModal = true)}
			class="neo-btn px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-sm uppercase flex items-center gap-2 self-start md:self-auto"
		>
			<Plus class="w-4 h-4 stroke-[3]" />
			Tambah Project
		</button>
	</div>

	<!-- Stats Summary -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="neo-box p-4 bg-white dark:bg-slate-800">
			<span class="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Project</span>
			<div class="text-3xl font-black text-black dark:text-white mt-1">{data.stats.total}</div>
		</div>
		<div class="neo-box p-4 bg-yellow-100 dark:bg-yellow-950/40">
			<span class="text-xs font-black uppercase text-yellow-800 dark:text-yellow-300 tracking-wider">To Do</span>
			<div class="text-3xl font-black text-yellow-900 dark:text-yellow-200 mt-1">{data.stats.todo}</div>
		</div>
		<div class="neo-box p-4 bg-cyan-100 dark:bg-cyan-950/40">
			<span class="text-xs font-black uppercase text-cyan-800 dark:text-cyan-300 tracking-wider">In Progress</span>
			<div class="text-3xl font-black text-cyan-900 dark:text-cyan-200 mt-1">{data.stats.inProgress}</div>
		</div>
		<div class="neo-box p-4 bg-green-100 dark:bg-green-950/40">
			<span class="text-xs font-black uppercase text-green-800 dark:text-green-300 tracking-wider">Completed</span>
			<div class="text-3xl font-black text-green-900 dark:text-green-200 mt-1">{data.stats.done}</div>
		</div>
	</div>

	<!-- Projects Grid -->
	{#if data.projects.length === 0}
		<div class="neo-box p-8 text-center bg-white dark:bg-slate-800 my-8">
			<FolderGit2 class="w-12 h-12 mx-auto mb-3 text-slate-400" />
			<h3 class="text-lg font-black uppercase text-black dark:text-white">Belum ada Project Praktek</h3>
			<p class="text-slate-600 dark:text-slate-300 text-sm mt-1 max-w-md mx-auto">
				Catat project latihan, cloning repo, atau eksperimen kode yang sedang kamu bangun.
			</p>
			<button
				onclick={() => (showModal = true)}
				class="neo-btn mt-4 px-4 py-2 bg-cyan-400 text-black text-sm uppercase font-black"
			>
				+ Buat Project Pertama
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.projects as proj}
				{@const badge = getStatusBadge(proj.status)}
				<div class="neo-box bg-white dark:bg-slate-800 flex flex-col justify-between p-5 hover:-translate-y-1 transition-transform">
					<div>
						<!-- Header Badges -->
						<div class="flex items-center justify-between gap-2 mb-3">
							<form method="POST" action="?/updateStatus" use:enhance>
								<input type="hidden" name="id" value={proj.id} />
								<input type="hidden" name="status" value={getNextStatus(proj.status)} />
								<button
									type="submit"
									title="Klik untuk ubah status: {proj.status}"
									class="neo-badge {badge.color} cursor-pointer hover:scale-105 transition-transform flex items-center gap-1"
								>
									<badge.icon class="w-3 h-3" />
									{badge.label}
								</button>
							</form>

							{#if proj.topic}
								<span
									class="neo-badge text-black"
									style="background-color: {proj.topic.color};"
								>
									{proj.topic.title}
								</span>
							{/if}
						</div>

						<h3 class="text-xl font-black uppercase text-black dark:text-white mb-2 leading-tight">
							{proj.title}
						</h3>

						<p class="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-4 line-clamp-3">
							{proj.description || 'Tidak ada deskripsi.'}
						</p>
					</div>

					<div class="pt-4 border-t-2 border-black/10 dark:border-slate-700 flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if proj.repoUrl}
								<a
									href={proj.repoUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="neo-btn-sm bg-slate-100 dark:bg-slate-700 text-black dark:text-white hover:bg-yellow-200 dark:hover:bg-slate-600 flex items-center gap-1 text-xs"
								>
									<GitBranch class="w-3.5 h-3.5" />
									Repo
								</a>
							{/if}

							{#if proj.liveUrl}
								<a
									href={proj.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="neo-btn-sm bg-cyan-300 dark:bg-cyan-700 text-black dark:text-white hover:bg-cyan-200 flex items-center gap-1 text-xs"
								>
									<ExternalLink class="w-3.5 h-3.5" />
									Demo
								</a>
							{/if}
						</div>

						<form
							method="POST"
							action="?/deleteProject"
							use:enhance
							onsubmit={(e) => {
								if (!confirm(`Hapus project "${proj.title}"?`)) {
									e.preventDefault();
								}
							}}
						>
							<input type="hidden" name="id" value={proj.id} />
							<button
								type="submit"
								aria-label="Hapus Project"
								class="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded transition-colors"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Create Project -->
{#if showModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="neo-box w-full max-w-lg bg-white dark:bg-slate-800 p-6">
			<div class="flex items-center justify-between pb-3 border-b-2 border-black dark:border-slate-700 mb-4">
				<h3 class="font-black text-lg uppercase text-black dark:text-white">Tambah Project Baru</h3>
				<button onclick={() => (showModal = false)} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
					<X class="w-5 h-5 text-black dark:text-white" />
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
						newTopicId = 'none';
						await update();
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="proj-title" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
						Nama Project
					</label>
					<input
						type="text"
						id="proj-title"
						name="title"
						required
						bind:value={newTitle}
						placeholder="contoh: CLI Tool in Rust, Auth System SvelteKit"
						class="w-full px-3 py-2 neo-input text-black dark:text-white"
					/>
				</div>

				<div>
					<label for="proj-desc" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
						Deskripsi Ringkas
					</label>
					<textarea
						id="proj-desc"
						name="description"
						rows="3"
						bind:value={newDescription}
						placeholder="Eksperimen fitur X dan Y..."
						class="w-full px-3 py-2 neo-input text-black dark:text-white"
					></textarea>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="proj-repo" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
							GitHub Repo URL
						</label>
						<input
							type="url"
							id="proj-repo"
							name="repoUrl"
							bind:value={newRepoUrl}
							placeholder="https://github.com/..."
							class="w-full px-3 py-2 neo-input text-black dark:text-white text-xs font-mono"
						/>
					</div>

					<div>
						<label for="proj-demo" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
							Live Demo URL
						</label>
						<input
							type="url"
							id="proj-demo"
							name="liveUrl"
							bind:value={newLiveUrl}
							placeholder="https://..."
							class="w-full px-3 py-2 neo-input text-black dark:text-white text-xs font-mono"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="proj-topic" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
							Hubungkan ke Topik
						</label>
						<select
							id="proj-topic"
							name="topicId"
							bind:value={newTopicId}
							class="w-full px-3 py-2 neo-input text-black dark:text-white bg-white dark:bg-slate-900 text-xs font-bold"
						>
							<option value="none">-- Tanpa Topik --</option>
							{#each data.topics as top}
								<option value={top.id}>{top.title}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="proj-status" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
							Status Awal
						</label>
						<select
							id="proj-status"
							name="status"
							bind:value={newStatus}
							class="w-full px-3 py-2 neo-input text-black dark:text-white bg-white dark:bg-slate-900 text-xs font-bold"
						>
							<option value="todo">To Do</option>
							<option value="in_progress">In Progress</option>
							<option value="done">Done</option>
						</select>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-3">
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="neo-btn px-3 py-2 bg-slate-200 text-black text-xs uppercase"
					>
						Batal
					</button>
					<button
						type="submit"
						class="neo-btn px-4 py-2 bg-cyan-400 text-black text-xs uppercase font-black"
					>
						Simpan Project
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
