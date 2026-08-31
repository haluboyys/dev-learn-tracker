<script lang="ts">
	import { enhance } from '$app/forms';
	import { themeStore } from '$lib/stores/theme';
	import { Sun, Moon, KeyRound, Sparkles, Terminal, Code } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In - DevTrack</title>
</svelte:head>

<div class="min-h-[85vh] flex flex-col items-center justify-center relative p-4">
	<!-- Top Right Theme Toggle -->
	<div class="absolute top-4 right-4">
		<button
			onclick={() => themeStore.toggle()}
			aria-label="Toggle Theme"
			class="neo-btn-icon neo-btn-neutral text-black dark:text-white"
		>
			{#if $themeStore === 'dark'}
				<Sun class="w-5 h-5 text-amber-400 stroke-[2.5]" />
			{:else}
				<Moon class="w-5 h-5 text-slate-900 stroke-[2.5]" />
			{/if}
		</button>
	</div>

	<!-- Login Card -->
	<div class="w-full max-w-md neo-card p-6 sm:p-8 bg-white dark:bg-slate-900">
		<!-- Header Banner -->
		<div class="neo-badge bg-amber-500 text-black mb-4">
			<Terminal class="w-3.5 h-3.5" />
			Personal Dev Hub
		</div>

		<h1 class="text-3xl font-black uppercase tracking-tight text-black dark:text-white mb-2 flex items-center gap-2">
			DEV<span class="bg-sky-600 text-white px-2 py-0.5 border-2 border-black dark:border-white">TRACK</span>
		</h1>
		<p class="text-slate-700 dark:text-slate-300 text-sm font-bold mb-6">
			Enter your access code to unlock your learning tracker.
		</p>

		{#if form?.error}
			<div class="bg-rose-400 border-3 border-black text-black font-black text-xs uppercase p-3 mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
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
			class="space-y-5"
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
						class="w-full px-4 py-3 neo-input font-mono font-bold"
					/>
					<KeyRound class="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full neo-btn neo-btn-primary py-3.5 text-sm font-black flex items-center justify-center gap-2"
			>
				<Sparkles class="w-4 h-4 stroke-[2.5]" />
				{loading ? 'VERIFYING...' : 'SIGN IN TO TRACKER'}
			</button>
		</form>

		<div class="mt-6 pt-4 border-t-2 border-dashed border-black/30 dark:border-white/30 text-center">
			<span class="text-xs font-mono text-slate-600 dark:text-slate-400">
				Default access code: <strong class="text-black dark:text-white font-black bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 border border-black dark:border-white">belajarcoding</strong>
			</span>
		</div>
	</div>
</div>
