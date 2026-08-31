<script lang="ts">
	import { ChevronDown, Check } from 'lucide-svelte';

	interface OptionItem {
		value: string;
		label: string;
		color?: string;
	}

	let {
		value = $bindable(''),
		options = [],
		name = '',
		placeholder = 'Pilih...',
		class: customClass = '',
		size = 'md',
		onchange
	}: {
		value?: string;
		options: (OptionItem | string)[];
		name?: string;
		placeholder?: string;
		class?: string;
		size?: 'sm' | 'md';
		onchange?: (val: string) => void;
	} = $props();

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);

	// Normalize options
	const normalizedOptions = $derived<OptionItem[]>(
		options.map((opt) => {
			if (typeof opt === 'string') {
				return { value: opt, label: opt };
			}
			return opt;
		})
	);

	const selectedOption = $derived(
		normalizedOptions.find((opt) => opt.value === value)
	);

	function toggleOpen(e: MouseEvent) {
		e.stopPropagation();
		isOpen = !isOpen;
	}

	function selectOption(optValue: string, e: MouseEvent) {
		e.stopPropagation();
		value = optValue;
		isOpen = false;
		onchange?.(optValue);
	}

	function handleWindowClick(e: MouseEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			isOpen = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeyDown} />

<div
	bind:this={containerEl}
	class="relative inline-block text-left select-none {customClass}"
>
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}

	<!-- Select Trigger Button -->
	<button
		type="button"
		onclick={toggleOpen}
		class="w-full flex items-center justify-between gap-2.5 bg-white dark:bg-slate-900 text-black dark:text-white border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-black uppercase {size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'}"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<div class="flex items-center gap-2 truncate">
			{#if selectedOption?.color}
				<span
					class="w-3 h-3 border border-black inline-block shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
					style="background-color: {selectedOption.color};"
				></span>
			{/if}
			<span class="truncate">
				{selectedOption ? selectedOption.label : placeholder}
			</span>
		</div>

		<ChevronDown
			class="w-4 h-4 shrink-0 transition-transform duration-150 stroke-[3] text-black dark:text-white {isOpen ? 'rotate-180' : ''}"
		/>
	</button>

	<!-- Options Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute left-0 right-0 mt-1.5 z-50 min-w-[160px] max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border-3 border-black dark:border-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] divide-y-2 divide-black/15 dark:divide-white/15 animate-in fade-in zoom-in-95 duration-100"
			role="listbox"
		>
			{#each normalizedOptions as opt (opt.value)}
				{@const isSelected = opt.value === value}
				<button
					type="button"
					onclick={(e) => selectOption(opt.value, e)}
					role="option"
					aria-selected={isSelected}
					class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-black uppercase transition-colors cursor-pointer {isSelected ? 'bg-amber-400 text-black font-extrabold' : 'text-black dark:text-white hover:bg-amber-100 dark:hover:bg-slate-800'}"
				>
					<div class="flex items-center gap-2 truncate">
						{#if opt.color}
							<span
								class="w-3 h-3 border border-black inline-block shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
								style="background-color: {opt.color};"
							></span>
						{/if}
						<span class="truncate">{opt.label}</span>
					</div>

					{#if isSelected}
						<Check class="w-4 h-4 shrink-0 stroke-[3] text-black" />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
