<script lang="ts">
	import { enhance } from '$app/forms';
	import { themeStore } from '$lib/stores/theme';
	import { Sun, Moon, KeyRound, Sparkles, Terminal } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Masuk - Dev Learning Tracker</title>
</svelte:head>

<div class="min-h-[85vh] flex flex-col items-center justify-center relative p-4">
	<!-- Top Right Theme Toggle -->
	<div class="absolute top-4 right-4">
		<button
			onclick={() => themeStore.toggle()}
			aria-label="Toggle Theme"
			class="p-2 border-3 border-black dark:border-white bg-white dark:bg-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
		>
			{#if $themeStore === 'dark'}
				<Sun class="w-5 h-5 text-yellow-400" />
			{:else}
				<Moon class="w-5 h-5 text-slate-900" />
			{/if}
		</button>
	</div>

	<!-- Login Card -->
	<div class="w-full max-w-md bg-white dark:bg-slate-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 sm:p-8">
		<!-- Header Banner -->
		<div class="inline-flex items-center gap-2 bg-yellow-300 dark:bg-yellow-500 text-black px-3 py-1 font-black text-xs uppercase tracking-wider border-2 border-black mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
			<Terminal class="w-3.5 h-3.5" />
			Personal Dev Hub
		</div>

		<h1 class="text-3xl font-black uppercase tracking-tight text-black dark:text-white mb-2 flex items-center gap-2">
			LEARN<span class="bg-cyan-400 text-black px-2 py-0.5 border-2 border-black">DEV</span>
		</h1>
		<p class="text-slate-600 dark:text-slate-300 text-sm font-bold mb-6">
			Masukkan access code untuk membuka tracker pembelajaran kamu.
		</p>

		{#if form?.error}
			<div class="bg-rose-400 border-3 border-black text-black font-extrabold text-sm p-3 mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
				⚠️ {form.error}
			</div>
		{/if}

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="code" class="block font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
					Access Code
				</label>
				<div class="relative">
					<input
						type="password"
						id="code"
						name="code"
						required
						placeholder="••••••••"
						class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-3 border-black dark:border-white text-black dark:text-white font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] outline-none focus:bg-yellow-50 dark:focus:bg-slate-950 transition-colors"
					/>
					<KeyRound class="w-5 h-5 absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-black uppercase text-sm border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
			>
				<Sparkles class="w-4 h-4" />
				{loading ? 'MEMERIKSA...' : 'MASUK KE TRACKER'}
			</button>
		</form>

		<div class="mt-6 pt-4 border-t-2 border-dashed border-black dark:border-slate-600 text-center">
			<span class="text-xs font-mono text-slate-500 dark:text-slate-400">
				Default access code dev: <strong class="text-black dark:text-white font-bold bg-slate-200 dark:bg-slate-700 px-1 py-0.5 border border-black">belajarcoding</strong>
			</span>
		</div>
	</div>
</div>
