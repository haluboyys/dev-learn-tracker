<script lang="ts">
	import { enhance } from '$app/forms';
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
		Filter,
		X,
		ArrowRight
	} from 'lucide-svelte';

	let { data } = $props();

	// Modal State
	let showModal = $state(false);
	let newTitle = $state('');
	let newCategory = $state('Backend');
	let newColor = $state('#facc15');
	let newUrl = $state('');
	let newNotes = $state('');

	// Search & Filter
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedStatus = $state('all');

	const colorOptions = [
		{ label: 'Kuning', value: '#facc15', bg: 'bg-amber-400' },
		{ label: 'Cyan', value: '#22d3ee', bg: 'bg-cyan-400' },
		{ label: 'Ungu', value: '#c084fc', bg: 'bg-purple-400' },
		{ label: 'Hijau', value: '#4ade80', bg: 'bg-emerald-400' },
		{ label: 'Rose', value: '#fb7185', bg: 'bg-rose-400' },
		{ label: 'Orange', value: '#fb923c', bg: 'bg-orange-400' }
	];

	const defaultCategories = ['Backend', 'Frontend', 'Database', 'DevOps', 'Mobile', 'Computer Science', 'Umum'];

	function getStatusBadge(status: string) {
		switch (status) {
			case 'done':
				return {
					label: 'Done',
					classes: 'bg-emerald-300 text-black border-black dark:border-white',
					icon: CheckCircle2
				};
			case 'in_progress':
				return {
					label: 'In Progress',
					classes: 'bg-cyan-300 text-black border-black dark:border-white',
					icon: Clock
				};
			default:
				return {
					label: 'To Do',
					classes: 'bg-amber-300 text-black border-black dark:border-white',
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
			const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
			const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
			return matchesSearch && matchesCategory && matchesStatus;
		})
	);
</script>

<svelte:head>
	<title>Materi Pembelajaran - Dev Hub</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="neo-badge bg-amber-400 text-black mb-2">
				<BookOpen class="w-3.5 h-3.5" />
				Materi Belajar & Catatan
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
				Materi Pembelajaran
			</h1>
		</div>

		<button
			onclick={() => (showModal = true)}
			class="neo-btn neo-btn-primary flex items-center gap-2 self-start md:self-auto"
		>
			<Plus class="w-5 h-5 stroke-[3]" />
			Tambah Materi
		</button>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="neo-card-sm p-4 bg-white dark:bg-slate-900">
			<span class="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Total Materi</span>
			<div class="text-3xl font-black text-black dark:text-white mt-1">{data.stats.totalMaterials}</div>
		</div>
		<div class="neo-card-sm p-4 bg-amber-100 dark:bg-amber-950/40">
			<span class="text-xs font-black uppercase text-amber-900 dark:text-amber-300 tracking-wider">To Do</span>
			<div class="text-3xl font-black text-amber-950 dark:text-amber-200 mt-1">{data.stats.totalTodo}</div>
		</div>
		<div class="neo-card-sm p-4 bg-cyan-100 dark:bg-cyan-950/40">
			<span class="text-xs font-black uppercase text-cyan-900 dark:text-cyan-300 tracking-wider">In Progress</span>
			<div class="text-3xl font-black text-cyan-950 dark:text-cyan-200 mt-1">{data.stats.totalInProgress}</div>
		</div>
		<div class="neo-card-sm p-4 bg-emerald-100 dark:bg-emerald-950/40">
			<span class="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider">
				Selesai ({data.stats.overallProgress}%)
			</span>
			<div class="text-3xl font-black text-emerald-950 dark:text-emerald-200 mt-1">{data.stats.totalDone}</div>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<input
				type="text"
				placeholder="Cari materi atau isi catatan..."
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2.5 neo-input text-xs sm:text-sm font-bold"
			/>
			<Search class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
		</div>

		<div class="flex items-center gap-3">
			<select
				bind:value={selectedCategory}
				class="neo-input px-3 py-2.5 text-xs font-black uppercase cursor-pointer"
			>
				<option value="all">Semua Kategori</option>
				{#each data.categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>

			<select
				bind:value={selectedStatus}
				class="neo-input px-3 py-2.5 text-xs font-black uppercase cursor-pointer"
			>
				<option value="all">Semua Status</option>
				<option value="todo">To Do</option>
				<option value="in_progress">In Progress</option>
				<option value="done">Done</option>
			</select>
		</div>
	</div>

	<!-- Materials Grid -->
	{#if filteredMaterials.length === 0}
		<div class="neo-card p-10 text-center bg-white dark:bg-slate-900 my-8">
			<BookOpen class="w-12 h-12 mx-auto mb-3 text-slate-400" />
			<h3 class="text-lg font-black uppercase text-black dark:text-white">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Tidak ada materi yang sesuai filter' : 'Belum ada Materi Pembelajaran'}
			</h3>
			<p class="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto font-medium">
				{searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Coba ubah filter atau kata kunci pencarian kamu.' : 'Mulai belajar dengan membuat materi baru (misalnya: Golang Dasar, SvelteKit 5, PostgreSQL Query).'}
			</p>
			{#if !searchQuery && selectedCategory === 'all' && selectedStatus === 'all'}
				<button
					onclick={() => (showModal = true)}
					class="neo-btn neo-btn-primary mt-5"
				>
					+ Buat Materi Pertama
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
								style="background-color: {item.color || '#facc15'};"
							>
								{item.category || 'Umum'}
							</span>

							<!-- Status Cycle Button -->
							<form method="POST" action="?/updateStatus" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="status" value={getNextStatus(item.status)} />
								<button
									type="submit"
									title="Klik untuk ubah status: {item.status}"
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
									class="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
								>
									<ExternalLink class="w-3.5 h-3.5" />
									Dokumentasi / Referensi
								</a>
							</div>
						{/if}

						<!-- Notes Preview / Status -->
						<div class="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white mb-4">
							{#if item.notes && item.notes.trim()}
								<p class="text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
									{item.notes}
								</p>
							{:else}
								<p class="text-xs font-mono italic text-slate-500 dark:text-slate-400">
									Belum ada catatan. Klik tombol di bawah untuk menulis catatan.
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
							{item.notes && item.notes.trim() ? 'Buka Catatan' : 'Tulis Catatan'}
							<ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
						</a>

						<form
							method="POST"
							action="?/deleteMaterial"
							use:enhance
							onsubmit={(e) => {
								if (!confirm(`Hapus materi "${item.title}" beserta catatannya?`)) {
									e.preventDefault();
								}
							}}
						>
							<input type="hidden" name="id" value={item.id} />
							<button
								type="submit"
								aria-label="Hapus Materi"
								class="neo-btn-icon neo-btn-danger"
							>
								<Trash2 class="w-4 h-4 text-black stroke-[2.5]" />
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Create Material -->
{#if showModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-lg neo-card p-6 bg-white dark:bg-slate-900">
			<div class="flex items-center justify-between pb-3 border-b-3 border-black dark:border-white mb-5">
				<h3 class="font-black text-xl uppercase text-black dark:text-white flex items-center gap-2">
					<BookOpen class="w-5 h-5" />
					Tambah Materi Baru
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
						Judul Materi (Besar)
					</label>
					<input
						type="text"
						id="mat-title"
						name="title"
						required
						bind:value={newTitle}
						placeholder="contoh: Golang Dasar, SvelteKit 5, Docker Swarm"
						class="w-full px-3.5 py-2.5 neo-input"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="mat-category" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
							Kategori
						</label>
						<input
							type="text"
							id="mat-category"
							name="category"
							bind:value={newCategory}
							list="categories-list"
							placeholder="contoh: Backend"
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

				<div>
					<label for="mat-url" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
						URL Dokumentasi / Belajar (Opsional)
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

				<div class="flex justify-end gap-3 pt-3">
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="neo-btn neo-btn-neutral text-xs"
					>
						Batal
					</button>
					<button
						type="submit"
						class="neo-btn neo-btn-primary text-xs font-black"
					>
						Simpan Materi
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
