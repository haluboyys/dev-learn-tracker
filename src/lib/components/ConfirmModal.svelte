<script lang="ts">
	import { AlertTriangle, X } from 'lucide-svelte';

	let {
		open = $bindable(false),
		title = 'Konfirmasi Hapus',
		message = 'Apakah kamu yakin ingin melanjutkan tindakan ini? Tindakan ini tidak dapat dibatalkan.',
		confirmLabel = 'Ya, Hapus',
		cancelLabel = 'Batal',
		variant = 'danger',
		onconfirm = () => {},
		oncancel = () => {}
	}: {
		open: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'primary' | 'warning';
		onconfirm?: () => void | Promise<void>;
		oncancel?: () => void;
	} = $props();

	let loading = $state(false);

	function handleCancel() {
		if (loading) return;
		open = false;
		oncancel?.();
	}

	async function handleConfirm() {
		if (loading) return;
		loading = true;
		try {
			await onconfirm?.();
			open = false;
		} catch (e) {
			console.error('Error during confirm action:', e);
		} finally {
			loading = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			handleCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
	<!-- Backdrop Overlay -->
	<div
		class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleCancel();
		}}
	>
		<!-- Modal Box -->
		<div
			class="w-full max-w-md neo-card bg-white dark:bg-slate-900 p-6 relative animate-in zoom-in-95 duration-150"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
		>
			<!-- Top Bar -->
			<div class="flex items-center justify-between pb-3 border-b-3 border-black dark:border-white mb-4">
				<div class="flex items-center gap-2">
					<div class="p-1.5 bg-rose-600 text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
						<AlertTriangle class="w-4 h-4 stroke-[3]" />
					</div>
					<h3 id="modal-title" class="font-black text-lg uppercase tracking-tight text-black dark:text-white">
						{title}
					</h3>
				</div>

				<button
					type="button"
					onclick={handleCancel}
					disabled={loading}
					aria-label="Tutup Modal"
					class="neo-btn-icon neo-btn-neutral p-1 text-black dark:text-white"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Message Body -->
			<div class="py-2 mb-6">
				<p class="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
					{message}
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center justify-end gap-3 pt-3 border-t-2 border-dashed border-black/20 dark:border-white/20">
				<button
					type="button"
					onclick={handleCancel}
					disabled={loading}
					class="neo-btn-sm neo-btn-neutral px-4 py-2 text-xs font-black uppercase"
				>
					{cancelLabel}
				</button>

				<button
					type="button"
					onclick={handleConfirm}
					disabled={loading}
					class="neo-btn-sm neo-btn-danger px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5"
				>
					{#if loading}
						<span class="inline-block animate-spin">⏳</span>
						Memproses...
					{:else}
						{confirmLabel}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
