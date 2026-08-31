import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';

const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
	const validLang = lang && Prism.languages[lang] ? lang : null;
	const highlighted = validLang
		? Prism.highlight(text, Prism.languages[validLang], validLang)
		: text
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#039;');

	const langBadge = validLang
		? `<div class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 pb-1">${validLang}</div>`
		: '';

	return `<div class="my-4 border-3 border-black dark:border-white bg-slate-950 text-slate-100 p-4 font-mono text-sm overflow-x-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">${langBadge}<pre class="m-0 p-0 bg-transparent border-0 shadow-none"><code class="language-${lang || 'text'}">${highlighted}</code></pre></div>`;
};

marked.setOptions({
	renderer,
	gfm: true,
	breaks: true
});

export function renderMarkdown(markdown: string): string {
	if (!markdown || !markdown.trim()) return '<p class="text-slate-500 dark:text-slate-400 italic">No notes written yet for this topic.</p>';
	try {
		return marked.parse(markdown) as string;
	} catch (e) {
		console.error('Failed to parse markdown', e);
		return `<pre>${markdown}</pre>`;
	}
}
