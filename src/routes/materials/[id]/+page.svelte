<script lang="ts">
	import { enhance } from '$app/forms';
	import { renderMarkdown } from '$lib/utils/markdown';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import {
		ArrowLeft,
		Save,
		ExternalLink,
		Eye,
		Edit3
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
				class="neo-badge text-[#12151e] font-black"
				style="background-color: {data.material.color || '#e2b342'};"
			>
				{category}
			</span>
		</div>

		<!-- View Switcher (Desktop) -->
		<div class="flex items-center gap-2">
			<div class="flex border-2 border-[#384259] divide-x-2 divide-[#384259] shadow-[2.5px_2.5px_0px_0px_#080a0f] bg-[#1a1f2c]">
				<button
					type="button"
					onclick={() => (activeTab = 'split')}
					class="px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors {activeTab === 'split' ? 'bg-[#e2b342] text-[#12151e]' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
				>
					<span class="hidden sm:inline">Split View</span>
					<span class="sm:hidden">Split</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'edit')}
					class="px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors {activeTab === 'edit' ? 'bg-[#e2b342] text-[#12151e]' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
				>
					Editor
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'preview')}
					class="px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors {activeTab === 'preview' ? 'bg-[#e2b342] text-[#12151e]' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
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
		<div class="neo-card p-5 bg-[#1a1f2c] flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-1">
					<label for="material-title-input" class="text-[10px] font-mono font-black uppercase tracking-wider text-[#94a3b8]">
						Topic Title
					</label>
				</div>
				<input
					id="material-title-input"
					type="text"
					name="title"
					bind:value={title}
					class="w-full font-black text-xl sm:text-2xl uppercase bg-transparent text-[#f1f5f9] outline-none border-b-2 border-dashed border-[#384259] focus:border-[#64b5d6] pb-1"
					placeholder="Topic Title..."
				/>
				{#if data.material.url}
					<div class="mt-2">
						<a
							href={data.material.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#64b5d6] hover:text-[#84cce6] hover:underline"
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
				<div class="neo-card bg-[#1a1f2c] flex flex-col h-[680px] overflow-hidden">
					<!-- Editor Toolbar -->
					<div class="px-4 py-2.5 border-b-2 border-[#384259] bg-[#222838] flex items-center justify-between flex-wrap gap-2 text-xs font-mono font-black text-[#f1f5f9]">
						<span class="flex items-center gap-1.5 uppercase text-[#e2b342]">
							<Edit3 class="w-4 h-4" />
							Markdown Editor
						</span>

						<!-- Formatting helpers -->
						<div class="flex items-center gap-1">
							<button
								type="button"
								onclick={() => insertSnippet('**', '**')}
								title="Bold Text"
								class="px-2 py-1 bg-[#151924] hover:bg-[#e2b342] hover:text-[#12151e] text-[#f1f5f9] border border-[#384259] font-bold cursor-pointer transition-colors"
							>
								B
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('*', '*')}
								title="Italic Text"
								class="px-2 py-1 bg-[#151924] hover:bg-[#e2b342] hover:text-[#12151e] text-[#f1f5f9] border border-[#384259] italic font-bold cursor-pointer transition-colors"
							>
								I
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('### ')}
								title="Heading 3"
								class="px-2 py-1 bg-[#151924] hover:bg-[#e2b342] hover:text-[#12151e] text-[#f1f5f9] border border-[#384259] font-bold cursor-pointer transition-colors"
							>
								H3
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('```typescript\n', '\n```')}
								title="Code Block"
								class="px-2 py-1 bg-[#151924] hover:bg-[#e2b342] hover:text-[#12151e] text-[#f1f5f9] border border-[#384259] font-mono cursor-pointer transition-colors"
							>
								&lt;/&gt;
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('- ')}
								title="Bulleted List"
								class="px-2 py-1 bg-[#151924] hover:bg-[#e2b342] hover:text-[#12151e] text-[#f1f5f9] border border-[#384259] font-mono cursor-pointer transition-colors"
							>
								• List
							</button>
							<button
								type="button"
								onclick={() => insertSnippet('[', '](https://...)')}
								title="Hyperlink"
								class="px-2 py-1 bg-[#151924] hover:bg-[#e2b342] hover:text-[#12151e] text-[#f1f5f9] border border-[#384259] font-mono cursor-pointer transition-colors"
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
						class="flex-1 w-full p-4 sm:p-6 font-mono text-sm leading-relaxed bg-[#151924] text-[#f1f5f9] outline-none resize-none font-medium"
					></textarea>
				</div>
			{/if}

			<!-- Preview Panel -->
			{#if activeTab === 'split' || activeTab === 'preview'}
				<div class="neo-card bg-[#1a1f2c] flex flex-col h-[680px] overflow-hidden">
					<div class="px-4 py-2.5 border-b-2 border-[#384259] bg-[#222838] flex items-center justify-between text-xs font-mono font-black text-[#f1f5f9]">
						<span class="flex items-center gap-1.5 uppercase text-[#64b5d6]">
							<Eye class="w-4 h-4" />
							Live Markdown Preview
						</span>
						<span class="text-[10px] font-mono text-[#94a3b8]">Auto Synced</span>
					</div>

					<div class="flex-1 p-6 overflow-y-auto markdown-body text-[#f1f5f9] bg-[#1a1f2c]">
						{@html htmlContent}
					</div>
				</div>
			{/if}
		</div>
	</form>
</div>
