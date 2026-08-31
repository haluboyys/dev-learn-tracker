<script lang="ts">
	import { enhance } from '$app/forms';
	import { KeyRound, Sparkles, Terminal } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<div class="min-h-[85vh] flex flex-col items-center justify-center relative p-4">
	<!-- Login Card -->
	<div class="w-full max-w-md neo-card p-6 sm:p-8 bg-[#1a1f2c]">
		<!-- Header Banner -->
		<div class="flex items-center gap-3 mb-6">
			<div class="w-10 h-10 bg-[#e2b342] border-2 border-[#384259] shadow-[3px_3px_0px_0px_#080a0f] flex items-center justify-center">
				<Terminal class="w-5 h-5 text-[#12151e] stroke-[3]" />
			</div>
			<div>
				<h1 class="text-xl font-black uppercase tracking-wider text-[#f1f5f9]">
					Personal Hub
				</h1>
				<p class="text-[#94a3b8] text-xs font-bold">
					Enter access code to continue
				</p>
			</div>
		</div>

		{#if form?.error}
			<div class="bg-[#e07a8b] border-2 border-[#384259] text-[#12151e] font-black text-xs uppercase p-3 mb-6 shadow-[3px_3px_0px_0px_#080a0f]">
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
				<label for="code" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
					Access Code
				</label>
				<div class="relative">
					<input
						type="password"
						id="code"
						name="code"
						required
						placeholder="••••••••"
						class="w-full px-4 py-3 neo-input font-mono font-bold text-[#f1f5f9]"
					/>
					<KeyRound class="w-5 h-5 absolute right-3.5 top-3.5 text-[#64748b] pointer-events-none" />
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

		<div class="mt-6 pt-4 border-t-2 border-dashed border-[#384259] text-center">
			<span class="text-xs font-mono text-[#94a3b8]">
				Default access code: <strong class="text-[#f1f5f9] font-black bg-[#222838] px-1.5 py-0.5 border border-[#384259]">belajarcoding</strong>
			</span>
		</div>
	</div>
</div>
