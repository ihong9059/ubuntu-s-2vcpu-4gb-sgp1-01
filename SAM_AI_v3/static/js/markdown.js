// Markdown rendering wrapper using marked.js + highlight.js
const MD = (() => {
    // Configure marked (v15+ uses marked.use() instead of setOptions)
    if (typeof marked !== 'undefined') {
        marked.use({
            breaks: true,
            gfm: true,
            renderer: {
                code({ text, lang }) {
                    let highlighted = text;
                    if (typeof hljs !== 'undefined') {
                        if (lang && hljs.getLanguage(lang)) {
                            highlighted = hljs.highlight(text, { language: lang }).value;
                        } else {
                            highlighted = hljs.highlightAuto(text).value;
                        }
                    } else {
                        // Escape HTML if no highlighter
                        highlighted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    }
                    const langClass = lang ? ` class="language-${lang}"` : '';
                    return `<pre><code${langClass}>${highlighted}</code></pre>`;
                }
            }
        });
    }

    function render(text) {
        if (!text) return '';
        if (typeof marked === 'undefined') {
            // Fallback: escape HTML and convert newlines
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
        }
        return marked.parse(text);
    }

    function addCopyButtons(container) {
        const pres = container.querySelectorAll('pre');
        pres.forEach(pre => {
            if (pre.querySelector('.code-block-header')) return;

            const code = pre.querySelector('code');
            const langClass = code ? Array.from(code.classList).find(c => c.startsWith('language-')) : null;
            const lang = langClass ? langClass.replace('language-', '') : '';

            const header = document.createElement('div');
            header.className = 'code-block-header';
            header.innerHTML = `
                <span>${lang}</span>
                <button class="btn-copy-code" onclick="MD.copyCode(this)">Copy</button>
            `;
            pre.insertBefore(header, pre.firstChild);
        });
    }

    function copyCode(btn) {
        const pre = btn.closest('pre');
        const code = pre.querySelector('code');
        if (code) {
            navigator.clipboard.writeText(code.textContent).then(() => {
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
            });
        }
    }

    return { render, addCopyButtons, copyCode };
})();
