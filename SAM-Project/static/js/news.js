// SKZ AI - News panel
const News = (() => {
    let refreshInterval = null;

    async function init() {
        await loadNews();
        // Auto-refresh every 10 minutes
        refreshInterval = setInterval(loadNews, 10 * 60 * 1000);
    }

    async function loadNews() {
        try {
            const data = await API.getNews();
            renderBirthdays(data.birthdays || []);
            renderEvents(data.events || []);
            renderNews(data.news || []);
        } catch (e) {
            console.error('Failed to load news:', e);
        }
    }

    function renderBirthdays(birthdays) {
        const el = document.getElementById('birthday-list');
        if (!el) return;
        if (birthdays.length === 0) {
            el.innerHTML = '<div class="news-empty">생일 정보 없음</div>';
            return;
        }
        el.innerHTML = birthdays.map(b => `
            <div class="birthday-item">
                <span class="birthday-emoji">${b.emoji}</span>
                <span class="birthday-name">${b.name}</span>
                <span class="birthday-dday ${b.dday === 0 ? 'today' : ''}">
                    ${b.dday === 0 ? '🎉 오늘!' : `D-${b.dday}`}
                </span>
            </div>`
        ).join('');
    }

    function renderEvents(events) {
        const el = document.getElementById('events-list');
        if (!el) return;
        if (events.length === 0) {
            el.innerHTML = '<div class="news-empty">예정된 일정 없음</div>';
            return;
        }
        el.innerHTML = events.map(e => `
            <div class="event-item">
                <span class="event-emoji">${e.emoji}</span>
                <div class="event-info">
                    <span class="event-title">${e.title}</span>
                    <span class="event-date">${e.date}</span>
                </div>
                <span class="event-dday">D-${e.dday}</span>
            </div>`
        ).join('');
    }

    function renderNews(news) {
        const el = document.getElementById('news-list');
        if (!el) return;
        if (news.length === 0) {
            el.innerHTML = '<div class="news-empty">현재 Stray Kids 관련 뉴스가 없습니다</div>';
            return;
        }
        el.innerHTML = news.map(n => `
            <a class="news-item" href="${n.link}" target="_blank" rel="noopener">
                <span class="news-source">${n.source}</span>
                <span class="news-title">${n.title}</span>
            </a>`
        ).join('');
    }

    function togglePanel() {
        const panel = document.getElementById('news-panel');
        if (panel) panel.classList.toggle('open');
    }

    return { init, loadNews, togglePanel };
})();
