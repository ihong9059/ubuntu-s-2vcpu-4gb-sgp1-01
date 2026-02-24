// SKZ AI - Voice input (STT) + output (TTS)
const Voice = (() => {
    let recognition = null;
    let isListening = false;
    let currentAudio = null;

    function init() {
        // Check Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'ko-KR';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                const input = document.getElementById('chat-input');
                if (input) input.value = transcript;
            };

            recognition.onend = () => {
                isListening = false;
                updateMicButton();
            };

            recognition.onerror = (event) => {
                console.error('STT error:', event.error);
                isListening = false;
                updateMicButton();
            };
        }
    }

    function toggleListening() {
        if (!recognition) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return;
        }

        if (isListening) {
            recognition.stop();
            isListening = false;
        } else {
            recognition.start();
            isListening = true;
        }
        updateMicButton();
    }

    function updateMicButton() {
        const btn = document.getElementById('btn-mic');
        if (!btn) return;
        if (isListening) {
            btn.classList.add('listening');
            btn.title = '음성 인식 중지';
        } else {
            btn.classList.remove('listening');
            btn.title = '음성 입력';
        }
    }

    async function speak(btn) {
        // Get the text from the message bubble
        const bubble = btn.closest('.message-bubble');
        const textEl = bubble.querySelector('.message-text');
        if (!textEl) return;

        const text = textEl.innerText.substring(0, 500); // Limit
        if (!text.trim()) return;

        // Stop current audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        btn.textContent = '⏳';
        try {
            const memberId = Members.getCurrentMemberId();
            const result = await API.getTTS(text, null, memberId);
            if (result.audio_url) {
                currentAudio = new Audio(result.audio_url);
                currentAudio.onended = () => {
                    btn.textContent = '🔊';
                    currentAudio = null;
                };
                currentAudio.onerror = () => {
                    btn.textContent = '🔊';
                    currentAudio = null;
                };
                await currentAudio.play();
                btn.textContent = '⏸';
            }
        } catch (e) {
            console.error('TTS error:', e);
            btn.textContent = '🔊';
        }
    }

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    }

    return { init, toggleListening, speak, stopAudio };
})();
