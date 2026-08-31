<script lang="ts">
	import { enhance } from '$app/forms';
	import { Mail, Lock, Sparkles, Terminal, ArrowRight } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In - DevTrack</title>
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
					Sign in to your learning account
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
			class="space-y-4"
		>
			<div>
				<label for="email" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
					Email Address
				</label>
				<div class="relative">
					<input
						type="email"
						id="email"
						name="email"
						required
						placeholder="you@example.com"
						class="w-full px-4 py-3 neo-input font-bold text-[#f1f5f9]"
					/>
					<Mail class="w-4 h-4 absolute right-3.5 top-4 text-[#64748b] pointer-events-none" />
				</div>
			</div>

			<div>
				<label for="password" class="block font-black text-xs uppercase tracking-wider text-[#f1f5f9] mb-1.5">
					Password
				</label>
				<div class="relative">
					<input
						type="password"
						id="password"
						name="password"
						required
						placeholder="••••••••"
						class="w-full px-4 py-3 neo-input font-mono font-bold text-[#f1f5f9]"
					/>
					<Lock class="w-4 h-4 absolute right-3.5 top-4 text-[#64748b] pointer-events-none" />
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full neo-btn neo-btn-primary py-3.5 text-sm font-black flex items-center justify-center gap-2 mt-2"
			>
				<Sparkles class="w-4 h-4 stroke-[2.5]" />
				{loading ? 'AUTHENTICATING...' : 'SIGN IN'}
			</button>
		</form>

		<div class="mt-6 pt-4 border-t-2 border-dashed border-[#384259] text-center">
			<span class="text-xs text-[#94a3b8]">
				Don't have an account?
				<a href="/register" class="text-[#e2b342] font-black hover:underline ml-1 inline-flex items-center gap-1">
					Create account <ArrowRight class="w-3 h-3" />
				</a>
			</span>
		</div>
	</div>
</div>
