// SKZ AI - Markdown rendering (marked v15+ compatible)
const Markdown = (() => {
    // Configure marked v15+ using marked.use()
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
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
        }
        return marked.parse(text);
    }

    return { render };
})();
