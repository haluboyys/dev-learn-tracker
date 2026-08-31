<script lang="ts">
	import { enhance } from '$app/forms';
	import { renderMarkdown } from '$lib/utils/markdown';
	import {
		ArrowLeft,
		Save,
		ExternalLink,
		CheckCircle2,
		Clock,
		Circle,
		Eye,
		Edit3,
		Code,
		Sparkles
	} from 'lucide-svelte';

	let { data, form } = $props();

	let title = $state(data.material.title);
	let notes = $state(data.material.notes || '');
	let status = $state(data.material.status);
	let isSaving = $state(false);
	let saveSuccess = $state(false);
	let activeTab = $state<'split' | 'edit' | 'preview'>('split');

	const htmlContent = $derived(renderMarkdown(notes));

	function handleKeyDown(e: KeyboardEvent) {
		// Quick save Ctrl+S / Cmd+S
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			const formEl = document.getElementById('notes-form') as HTMLFormElement;
			if (formEl) formEl.requestSubmit();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<svelte:head>
	<title>{title} - Catatan Pembelajaran</title>
</svelte:head>

<div class="space-y-6">
	<!-- Top Navigation & Actions -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<a
				href="/materials"
				class="neo-btn-sm bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-yellow-200 flex items-center gap-1"
			>
				<ArrowLeft class="w-4 h-4" />
				Kembali
			</a>

			{#if data.topic}
				<span
					class="neo-badge text-black"
					style="background-color: {data.topic.color};"
				>
					{data.topic.title}
				</span>
			{/if}
		</div>

		<!-- View Switcher (Desktop) -->
		<div class="flex items-center gap-2">
			<div class="hidden md:flex border-2 border-black dark:border-white divide-x-2 divide-black dark:divide-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-800">
				<button
					type="button"
					onclick={() => (activeTab = 'split')}
					class="px-2.5 py-1 text-xs font-bold {activeTab === 'split' ? 'bg-yellow-400 text-black' : 'text-black dark:text-white'}"
				>
					Split
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'edit')}
					class="px-2.5 py-1 text-xs font-bold {activeTab === 'edit' ? 'bg-yellow-400 text-black' : 'text-black dark:text-white'}"
				>
					Editor
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'preview')}
					class="px-2.5 py-1 text-xs font-bold {activeTab === 'preview' ? 'bg-yellow-400 text-black' : 'text-black dark:text-white'}"
				>
					Preview
				</button>
			</div>

			<!-- Mobile Tabs -->
			<div class="flex md:hidden border-2 border-black divide-x-2 divide-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-800">
				<button
					type="button"
					onclick={() => (activeTab = 'edit')}
					class="px-2 py-1 text-xs font-bold {activeTab === 'edit' ? 'bg-yellow-400 text-black' : 'text-black dark:text-white'}"
				>
					Edit
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'preview')}
					class="px-2 py-1 text-xs font-bold {activeTab === 'preview' ? 'bg-yellow-400 text-black' : 'text-black dark:text-white'}"
				>
					Preview
				</button>
			</div>
		</div>
	</div>

	<!-- Form Header Details -->
	<form
		id="notes-form"
		method="POST"
		action="?/saveNotes"
		use:enhance={() => {
			isSaving = true;
			saveSuccess = false;
			return async ({ update }) => {
				isSaving = false;
				saveSuccess = true;
				setTimeout(() => (saveSuccess = false), 2500);
				await update({ reset: false });
			};
		}}
		class="space-y-6"
	>
		<div class="neo-box p-4 bg-white dark:bg-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex-1">
				<input
					type="text"
					name="title"
					bind:value={title}
					class="w-full font-black text-xl sm:text-2xl uppercase bg-transparent text-black dark:text-white outline-none border-b-2 border-dashed border-black/30 dark:border-white/30 focus:border-black dark:focus:border-white pb-1"
					placeholder="Judul Materi..."
				/>
				{#if data.material.url}
					<a
						href={data.material.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline mt-2"
					>
						<ExternalLink class="w-3.5 h-3.5" />
						{data.material.url}
					</a>
				{/if}
			</div>

			<div class="flex items-center gap-3">
				<!-- Status Selector -->
				<select
					name="status"
					bind:value={status}
					class="neo-input px-3 py-1.5 font-bold text-xs uppercase cursor-pointer text-black dark:text-white bg-white dark:bg-slate-900"
				>
					<option value="todo">To Do</option>
					<option value="in_progress">In Progress</option>
					<option value="done">Done</option>
				</select>

				<!-- Save Button -->
				<button
					type="submit"
					disabled={isSaving}
					class="neo-btn px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs uppercase font-black flex items-center gap-1.5"
				>
					<Save class="w-4 h-4 stroke-[2.5]" />
					{isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan! ✓' : 'Simpan'}
				</button>
			</div>
		</div>

		<!-- Editor Workspace -->
		<div class="grid grid-cols-1 {activeTab === 'split' ? 'md:grid-cols-2' : ''} gap-6">
			<!-- Editor Panel -->
			{#if activeTab === 'split' || activeTab === 'edit'}
				<div class="neo-box bg-white dark:bg-slate-800 flex flex-col h-[650px] overflow-hidden">
					<div class="px-4 py-2 border-b-3 border-black dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-between text-xs font-mono font-bold">
						<span class="flex items-center gap-1 text-black dark:text-white uppercase">
							<Edit3 class="w-3.5 h-3.5" />
							Markdown Editor (Cmd+S untuk simpan)
						</span>
						<span class="text-slate-500">GFM + Code Highlight</span>
					</div>

					<textarea
						name="notes"
						bind:value={notes}
						placeholder="Tulis catatan di sini menggunakan Markdown... (Contoh: ```typescript ... ```)"
						class="flex-1 w-full p-4 font-mono text-sm leading-relaxed bg-transparent text-black dark:text-white outline-none resize-none"
					></textarea>
				</div>
			{/if}

			<!-- Preview Panel -->
			{#if activeTab === 'split' || activeTab === 'preview'}
				<div class="neo-box bg-white dark:bg-slate-800 flex flex-col h-[650px] overflow-hidden">
					<div class="px-4 py-2 border-b-3 border-black dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-between text-xs font-mono font-bold">
						<span class="flex items-center gap-1 text-black dark:text-white uppercase">
							<Eye class="w-3.5 h-3.5" />
							Live Markdown Preview
						</span>
					</div>

					<div class="flex-1 p-6 overflow-y-auto markdown-body text-black dark:text-white">
						{@html htmlContent}
					</div>
				</div>
			{/if}
		</div>
	</form>
</div>
