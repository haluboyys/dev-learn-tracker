<script lang="ts">
	import { enhance } from '$app/forms';
	import { renderMarkdown } from '$lib/utils/markdown';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
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
		Sparkles,
		Columns,
		Maximize2,
		BookOpen,
		Bold,
		Italic,
		List,
		Link as LinkIcon
	} from 'lucide-svelte';

	let { data } = $props();

	let title = $state(data.material.title);
	let notes = $state(data.material.notes || '');
	let status = $state(data.material.status);
	let category = $state(data.material.category || 'General');
	let isSaving = $state(false);
	let saveSuccess = $state(false);
	let activeTab = $state<'split' | 'edit' | 'preview'>('split');
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	const statusOptions = [
		{ value: 'todo', label: 'To Do' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'done', label: 'Done' }
	];

	const htmlContent = $derived(renderMarkdown(notes));

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			const formEl = document.getElementById('notes-form') as HTMLFormElement;
			if (formEl) formEl.requestSubmit();
		}
	}

	function insertSnippet(before: string, after: string = '') {
		if (!textareaEl) return;
		const start = textareaEl.selectionStart;
		const end = textareaEl.selectionEnd;
		const selected = notes.substring(start, end);
		const replacement = before + (selected || 'text') + after;
		notes = notes.substring(0, start) + replacement + notes.substring(end);
		setTimeout(() => {
			if (textareaEl) {
				textareaEl.focus();
				textareaEl.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
			}
		}, 10);
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<svelte:head>
	<title>{title} - Notes</title>
</svelte:head>

<div class="space-y-6">
	<!-- Top Navigation & Actions Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<a
				href="/materials"
				class="neo-btn-sm neo-btn-neutral flex items-center gap-1.5"
			>
				<ArrowLeft class="w-4 h-4 stroke-[2.5]" />
				All Topics
			</a>

			<span
				class="neo-badge text-black font-black"
				style="background-color: {data.material.color || '#f59e0b'};"
			>
				{category}
			</span>
		</div>

		<!-- View Switcher (Desktop) -->
		<div class="flex items-center gap-2">
			<div class="flex border-3 border-black dark:border-white divide-x-3 divide-black dark:divide-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-slate-900">
				<button
					type="button"
					onclick={() => (activeTab = 'split')}
					class="px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors {activeTab === 'split' ? 'bg-amber-400 text-black' : 'text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}"
				>
					<span class="hidden sm:inline">Split View</span>
					<span class="sm:hidden">Split</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'edit')}
					class="px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors {activeTab === 'edit' ? 'bg-amber-400 text-black' : 'text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}"
				>
					Editor
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'preview')}
					class="px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors {activeTab === 'preview' ? 'bg-amber-400 text-black' : 'text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}"
				>
					Preview
				</button>
			</div>
		</div>
	</div>

	<!-- Form Header & Actions -->
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
		<!-- Header Card -->
		<div class="neo-card p-5 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-1">
					<label for="material-title-input" class="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
						Topic Title
					</label>
				</div>
				<input
					id="material-title-input"
					type="text"
					name="title"
					bind:value={title}
					class="w-full font-black text-xl sm:text-2xl uppercase bg-transparent text-black dark:text-white outline-none border-b-3 border-dashed border-black/30 dark:border-white/30 focus:border-black dark:focus:border-white pb-1"
					placeholder="Topic Title..."
				/>
				{#if data.material.url}
					<div class="mt-2">
						<a
							href={data.material.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-700 dark:text-sky-400 hover:underline"
						>
							<ExternalLink class="w-3.5 h-3.5" />
							{data.material.url}
						</a>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-3 self-end md:self-center flex-wrap">
				<!-- Status Custom Select -->
				<CustomSelect
					name="status"
					bind:value={status}
					options={statusOptions}
					class="min-w-[140px]"
				/>

				<!-- Save Button -->
				<button
					type="submit"
					disabled={isSaving}
					class="neo-btn {saveSuccess ? 'neo-btn-success' : 'neo-btn-primary'} text-xs font-black flex items-center gap-1.5"
				>
					<Save class="w-4 h-4 stroke-[3]" />
					{isSaving ? 'Saving...' : saveSuccess ? 'Saved! ✓' : 'Save (Cmd+S)'}
				</button>
			</div>
		</div>

		<!-- Workspace Panes -->
		<div class="grid grid-cols-1 {activeTab === 'split' ? 'lg:grid-cols-2' : ''} gap-6">
			<!-- Editor Panel -->
			{#if activeTab === 'split' || activeTab === 'edit'}
				<div class="neo-card bg-white dark:bg-slate-900 flex flex-col h-[680px] overflow-hidden">
					<!-- Editor Toolbar -->
					<div class="px-4 py-2.5 border-b-3 border-black dark:border-white bg-amber-100 dark:bg-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono font-black text-black dark:text-white">
						<span class="flex items-center gap-1.5 uppercase">
							<Edit3 class="w-4 h-4" />
							Markdown Editor
						</span>

						<!-- Formatting helpers -->
						<div class="flex items-center gap-1">
							<button
								type="button"
								onclick={() => insertSnippet('**', '**')}
								title="Bold Text"
								class="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-slate-600 text-black dark:text-white border border-black dark:border-white font-bold cursor-pointer"
							>
								B
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('*', '*')}
								title="Italic Text"
								class="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-slate-600 text-black dark:text-white border border-black dark:border-white italic font-bold cursor-pointer"
							>
								I
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('### ')}
								title="Heading 3"
								class="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-slate-600 text-black dark:text-white border border-black dark:border-white font-bold cursor-pointer"
							>
								H3
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('```typescript\n', '\n```')}
								title="Code Block"
								class="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-slate-600 text-black dark:text-white border border-black dark:border-white font-mono cursor-pointer"
							>
								&lt;/&gt;
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('- ')}
								title="Bulleted List"
								class="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-slate-600 text-black dark:text-white border border-black dark:border-white font-mono cursor-pointer"
							>
								• List
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('[', '](https://...)')}
								title="Hyperlink"
								class="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-slate-600 text-black dark:text-white border border-black dark:border-white font-mono cursor-pointer"
							>
								Link
							</button>
						</div>
					</div>

					<textarea
						bind:this={textareaEl}
						name="notes"
						bind:value={notes}
						placeholder="Write notes here in Markdown... (Supports GFM, lists, code blocks ```typescript ... ``` etc.)"
						class="flex-1 w-full p-4 sm:p-6 font-mono text-sm leading-relaxed bg-white dark:bg-slate-900 text-black dark:text-white outline-none resize-none font-medium"
					></textarea>
				</div>
			{/if}

			<!-- Preview Panel -->
			{#if activeTab === 'split' || activeTab === 'preview'}
				<div class="neo-card bg-white dark:bg-slate-900 flex flex-col h-[680px] overflow-hidden">
					<div class="px-4 py-2.5 border-b-3 border-black dark:border-white bg-sky-100 dark:bg-slate-800 flex items-center justify-between text-xs font-mono font-black text-black dark:text-white">
						<span class="flex items-center gap-1.5 uppercase">
							<Eye class="w-4 h-4" />
							Live Markdown Preview
						</span>
						<span class="text-[10px] font-mono opacity-70">Auto Synced</span>
					</div>

					<div class="flex-1 p-6 overflow-y-auto markdown-body text-black dark:text-white bg-white dark:bg-slate-900">
						{@html htmlContent}
					</div>
				</div>
			{/if}
		</div>
	</form>
</div>
