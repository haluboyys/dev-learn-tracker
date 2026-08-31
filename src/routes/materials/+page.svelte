<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, ExternalLink, FileText, CheckCircle2, Clock, Circle, Trash2, Layers, BookOpen, ChevronRight, X } from 'lucide-svelte';

	let { data } = $props();

	// Topic Modal
	let showTopicModal = $state(false);
	let newTopicTitle = $state('');
	let newTopicColor = $state('#facc15');

	// Material Modal
	let showMaterialModal = $state(false);
	let selectedTopicId = $state('');
	let newMaterialTitle = $state('');
	let newMaterialUrl = $state('');

	const colorOptions = [
		{ label: 'Kuning', value: '#facc15', bg: 'bg-yellow-400' },
		{ label: 'Cyan', value: '#22d3ee', bg: 'bg-cyan-400' },
		{ label: 'Ungu', value: '#c084fc', bg: 'bg-purple-400' },
		{ label: 'Hijau', value: '#4ade80', bg: 'bg-green-400' },
		{ label: 'Rose', value: '#fb7185', bg: 'bg-rose-400' },
		{ label: 'Orange', value: '#fb923c', bg: 'bg-orange-400' }
	];

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
	<title>Materi Pembelajaran - Dev Hub</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header & Stats Summary -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="inline-flex items-center gap-1.5 bg-yellow-400 text-black px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
				<BookOpen class="w-3.5 h-3.5" />
				Learning Path & Curriculum
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Materi Pembelajaran
			</h1>
		</div>

		<div class="flex items-center gap-3">
			<button
				onclick={() => (showTopicModal = true)}
				class="neo-btn px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm uppercase flex items-center gap-2"
			>
				<Plus class="w-4 h-4 stroke-[3]" />
				Tambah Topik
			</button>
		</div>
	</div>

	<!-- Statistics Neo Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="neo-box p-4 bg-white dark:bg-slate-800">
			<span class="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Materi</span>
			<div class="text-3xl font-black text-black dark:text-white mt-1">{data.stats.totalMaterials}</div>
		</div>
		<div class="neo-box p-4 bg-yellow-100 dark:bg-yellow-950/40">
			<span class="text-xs font-black uppercase text-yellow-800 dark:text-yellow-300 tracking-wider">To Do</span>
			<div class="text-3xl font-black text-yellow-900 dark:text-yellow-200 mt-1">{data.stats.totalTodo}</div>
		</div>
		<div class="neo-box p-4 bg-cyan-100 dark:bg-cyan-950/40">
			<span class="text-xs font-black uppercase text-cyan-800 dark:text-cyan-300 tracking-wider">In Progress</span>
			<div class="text-3xl font-black text-cyan-900 dark:text-cyan-200 mt-1">{data.stats.totalInProgress}</div>
		</div>
		<div class="neo-box p-4 bg-green-100 dark:bg-green-950/40">
			<span class="text-xs font-black uppercase text-green-800 dark:text-green-300 tracking-wider">Done ({data.stats.overallProgress}%)</span>
			<div class="text-3xl font-black text-green-900 dark:text-green-200 mt-1">{data.stats.totalDone}</div>
		</div>
	</div>

	<!-- Topics List -->
	{#if data.topics.length === 0}
		<div class="neo-box p-8 text-center bg-white dark:bg-slate-800 my-8">
			<Layers class="w-12 h-12 mx-auto mb-3 text-slate-400" />
			<h3 class="text-lg font-black uppercase text-black dark:text-white">Belum ada Topik Belajar</h3>
			<p class="text-slate-600 dark:text-slate-300 text-sm mt-1 max-w-md mx-auto">
				Mulai dengan membuat topik baru (misalnya: <em>Frontend Svelte</em>, <em>Golang Backend</em>, <em>System Design</em>).
			</p>
			<button
				onclick={() => (showTopicModal = true)}
				class="neo-btn mt-4 px-4 py-2 bg-yellow-400 text-black text-sm uppercase"
			>
				+ Buat Topik Pertama
			</button>
		</div>
	{:else}
		<div class="space-y-6">
			{#each data.topics as topic}
				<div class="neo-box bg-white dark:bg-slate-800 overflow-hidden">
					<!-- Topic Header -->
					<div
						class="p-4 border-b-3 border-black dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
						style="background-color: {topic.color}20;"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-4 h-4 border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
								style="background-color: {topic.color};"
							></div>
							<h2 class="text-xl font-black uppercase text-black dark:text-white">
								{topic.title}
							</h2>
							<span class="neo-badge bg-white dark:bg-slate-900 text-black dark:text-white">
								{topic.doneCount} / {topic.total} Selesai
							</span>
						</div>

						<div class="flex items-center gap-2">
							<button
								onclick={() => {
									selectedTopicId = topic.id;
									showMaterialModal = true;
								}}
								class="neo-btn-sm bg-yellow-400 hover:bg-yellow-300 text-black flex items-center gap-1"
							>
								<Plus class="w-3.5 h-3.5 stroke-[3]" />
								Materi
							</button>

							<form
								method="POST"
								action="?/deleteTopic"
								use:enhance
								onsubmit={(e) => {
									if (!confirm(`Hapus topik "${topic.title}" beserta seluruh materinya?`)) {
										e.preventDefault();
									}
								}}
							>
								<input type="hidden" name="id" value={topic.id} />
								<button
									type="submit"
									aria-label="Hapus Topik"
									class="p-1.5 bg-rose-400 hover:bg-rose-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</form>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="w-full bg-slate-200 dark:bg-slate-700 h-2 border-b-2 border-black dark:border-slate-700">
						<div
							class="h-full bg-green-400 transition-all duration-300"
							style="width: {topic.progress}%;"
						></div>
					</div>

					<!-- Materials List in Topic -->
					{#if topic.materials.length === 0}
						<div class="p-6 text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
							Belum ada item materi di topik ini. Klik <strong>"+ Materi"</strong> di atas.
						</div>
					{:else}
						<div class="divide-y-2 divide-black/10 dark:divide-slate-700">
							{#each topic.materials as item}
								{@const badge = getStatusBadge(item.status)}
								<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
									<div class="flex items-start sm:items-center gap-3">
										<!-- Quick Toggle Status Button -->
										<form method="POST" action="?/updateStatus" use:enhance class="inline-block">
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="status" value={getNextStatus(item.status)} />
											<button
												type="submit"
												title="Klik untuk ubah status: {item.status}"
												class="neo-badge {badge.color} cursor-pointer hover:scale-105 transition-transform flex items-center gap-1"
											>
												<badge.icon class="w-3 h-3" />
												{badge.label}
											</button>
										</form>

										<div>
											<span class="font-black text-black dark:text-white text-base">
												{item.title}
											</span>
											{#if item.url}
												<a
													href={item.url}
													target="_blank"
													rel="noopener noreferrer"
													class="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline ml-2"
												>
													<ExternalLink class="w-3 h-3" />
													Sumber
												</a>
											{/if}
										</div>
									</div>

									<div class="flex items-center gap-2 self-end sm:self-auto">
										<!-- Notes Button -->
										<a
											href="/materials/{item.id}"
											class="neo-btn-sm bg-white dark:bg-slate-700 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-slate-600 flex items-center gap-1.5"
										>
											<FileText class="w-3.5 h-3.5" />
											{item.notes?.trim() ? 'Buka Catatan' : '+ Catatan'}
										</a>

										<!-- Delete Button -->
										<form method="POST" action="?/deleteMaterial" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<button
												type="submit"
												aria-label="Hapus Materi"
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
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Create Topic -->
{#if showTopicModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="neo-box w-full max-w-md bg-white dark:bg-slate-800 p-6">
			<div class="flex items-center justify-between pb-3 border-b-2 border-black dark:border-slate-700 mb-4">
				<h3 class="font-black text-lg uppercase text-black dark:text-white">Tambah Topik Baru</h3>
				<button onclick={() => (showTopicModal = false)} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
					<X class="w-5 h-5 text-black dark:text-white" />
				</button>
			</div>

			<form
				method="POST"
				action="?/createTopic"
				use:enhance={() => {
					return async ({ update }) => {
						showTopicModal = false;
						newTopicTitle = '';
						await update();
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="topic-title" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
						Nama Topik / Kategori
					</label>
					<input
						type="text"
						id="topic-title"
						name="title"
						required
						bind:value={newTopicTitle}
						placeholder="contoh: SvelteKit 5, TypeScript, Docker"
						class="w-full px-3 py-2 neo-input text-black dark:text-white"
					/>
				</div>

				<div>
					<label class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-2">
						Warna Label
					</label>
					<div class="flex gap-2">
						{#each colorOptions as c}
							<label class="cursor-pointer">
								<input type="radio" name="color" value={c.value} bind:group={newTopicColor} class="sr-only" />
								<div
									class="w-8 h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center {c.bg} {newTopicColor === c.value ? 'ring-3 ring-black dark:ring-white scale-110' : 'opacity-70'}"
								></div>
							</label>
						{/each}
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-3">
					<button
						type="button"
						onclick={() => (showTopicModal = false)}
						class="neo-btn px-3 py-2 bg-slate-200 text-black text-xs uppercase"
					>
						Batal
					</button>
					<button
						type="submit"
						class="neo-btn px-4 py-2 bg-yellow-400 text-black text-xs uppercase font-black"
					>
						Simpan Topik
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Create Material -->
{#if showMaterialModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="neo-box w-full max-w-md bg-white dark:bg-slate-800 p-6">
			<div class="flex items-center justify-between pb-3 border-b-2 border-black dark:border-slate-700 mb-4">
				<h3 class="font-black text-lg uppercase text-black dark:text-white">Tambah Materi Baru</h3>
				<button onclick={() => (showMaterialModal = false)} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
					<X class="w-5 h-5 text-black dark:text-white" />
				</button>
			</div>

			<form
				method="POST"
				action="?/createMaterial"
				use:enhance={() => {
					return async ({ update }) => {
						showMaterialModal = false;
						newMaterialTitle = '';
						newMaterialUrl = '';
						await update();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="topicId" value={selectedTopicId} />

				<div>
					<label for="mat-title" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
						Judul Materi
					</label>
					<input
						type="text"
						id="mat-title"
						name="title"
						required
						bind:value={newMaterialTitle}
						placeholder="contoh: Svelte 5 Runes & Snippets"
						class="w-full px-3 py-2 neo-input text-black dark:text-white"
					/>
				</div>

				<div>
					<label for="mat-url" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1">
						URL Referensi / Dokumentasi (Opsional)
					</label>
					<input
						type="url"
						id="mat-url"
						name="url"
						bind:value={newMaterialUrl}
						placeholder="https://svelte.dev/docs/runes"
						class="w-full px-3 py-2 neo-input text-black dark:text-white"
					/>
				</div>

				<div class="flex justify-end gap-2 pt-3">
					<button
						type="button"
						onclick={() => (showMaterialModal = false)}
						class="neo-btn px-3 py-2 bg-slate-200 text-black text-xs uppercase"
					>
						Batal
					</button>
					<button
						type="submit"
						class="neo-btn px-4 py-2 bg-yellow-400 text-black text-xs uppercase font-black"
					>
						Simpan Materi
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
