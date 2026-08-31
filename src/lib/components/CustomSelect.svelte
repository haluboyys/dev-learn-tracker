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
		placeholder = 'Select...',
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
		class="w-full flex items-center justify-between gap-2.5 bg-[#151924] text-[#f1f5f9] border-2 border-[#384259] shadow-[2.5px_2.5px_0px_0px_#080a0f] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-black uppercase {size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'}"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<div class="flex items-center gap-2 truncate">
			{#if selectedOption?.color}
				<span
					class="w-3 h-3 border border-[#384259] inline-block shrink-0 shadow-[1px_1px_0px_0px_#080a0f]"
					style="background-color: {selectedOption.color};"
				></span>
			{/if}
			<span class="truncate">
				{selectedOption ? selectedOption.label : placeholder}
			</span>
		</div>

		<ChevronDown
			class="w-4 h-4 shrink-0 transition-transform duration-150 stroke-[3] text-[#94a3b8] {isOpen ? 'rotate-180 text-[#e2b342]' : ''}"
		/>
	</button>

	<!-- Options Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute left-0 right-0 mt-1.5 z-50 min-w-[160px] max-h-60 overflow-y-auto bg-[#1a1f2c] border-2 border-[#384259] shadow-[4px_4px_0px_0px_#080a0f] divide-y divide-[#2a3246] animate-in fade-in zoom-in-95 duration-100"
			role="listbox"
		>
			{#each normalizedOptions as opt (opt.value)}
				{@const isSelected = opt.value === value}
				<button
					type="button"
					onclick={(e) => selectOption(opt.value, e)}
					role="option"
					aria-selected={isSelected}
					class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-black uppercase transition-colors cursor-pointer {isSelected ? 'bg-[#e2b342] text-[#12151e] font-black' : 'text-[#f1f5f9] hover:bg-[#222838]'}"
				>
					<div class="flex items-center gap-2 truncate">
						{#if opt.color}
							<span
								class="w-3 h-3 border border-[#384259] inline-block shrink-0 shadow-[1px_1px_0px_0px_#080a0f]"
								style="background-color: {opt.color};"
							></span>
						{/if}
						<span class="truncate">{opt.label}</span>
					</div>

					{#if isSelected}
						<Check class="w-4 h-4 shrink-0 stroke-[3] text-[#12151e]" />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
