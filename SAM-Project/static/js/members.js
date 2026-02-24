// SKZ AI - Member selection
const Members = (() => {
    let members = [];
    let currentMemberId = 'bangchan';
    let onMemberChange = null;

    async function init(callback) {
        onMemberChange = callback;
        try {
            members = await API.getMembers();
        } catch (e) {
            console.error('Failed to load members:', e);
            return;
        }
        render();
        selectMember(currentMemberId);
    }

    function render() {
        const bar = document.getElementById('member-bar');
        if (!bar) return;
        bar.innerHTML = '';
        members.forEach(m => {
            const btn = document.createElement('button');
            btn.className = 'member-btn';
            btn.dataset.memberId = m.id;
            btn.innerHTML = `<span class="member-emoji">${m.emoji}</span><span class="member-name">${m.name}</span>`;
            btn.onclick = () => selectMember(m.id);
            bar.appendChild(btn);
        });
    }

    function selectMember(memberId) {
        currentMemberId = memberId;
        const member = getMember(memberId);
        if (!member) return;

        // Update active button
        document.querySelectorAll('.member-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.memberId === memberId);
        });

        // Update CSS custom properties for theme
        document.documentElement.style.setProperty('--member-color', member.color);
        document.documentElement.style.setProperty('--member-color-light', member.color_light);

        // Update chat header
        const header = document.getElementById('chat-member-info');
        if (header) {
            header.innerHTML = `${member.emoji} ${member.name} <span class="member-position">${member.position}</span>`;
        }

        if (onMemberChange) onMemberChange(memberId);
    }

    function getMember(memberId) {
        return members.find(m => m.id === memberId);
    }

    function getCurrentMemberId() {
        return currentMemberId;
    }

    function setCurrentMemberId(id) {
        currentMemberId = id;
    }

    return { init, selectMember, getMember, getCurrentMemberId, setCurrentMemberId };
})();
