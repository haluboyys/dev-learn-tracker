import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	const initial: Theme = browser
		? (localStorage.getItem('theme') as Theme) ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		: 'light';

	const { subscribe, set, update } = writable<Theme>(initial);

	return {
		subscribe,
		toggle: () => {
			update((current) => {
				const next = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', next);
					if (next === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
					// Also update cookie for server SSR consistency
					document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
				}
				return next;
			});
		},
		init: () => {
			if (browser) {
				const saved = localStorage.getItem('theme') as Theme | null;
				const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
				set(theme);
			}
		}
	};
}

export const themeStore = createThemeStore();
