// 메타인지 테스트 메인 JavaScript

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('메타인지 테스트 시스템 로드 완료');

    // 세션 체크 (테스트 중간에 새로고침 방지)
    checkSession();
});

// 세션 체크
function checkSession() {
    const currentPath = window.location.pathname;

    // 테스트 페이지인 경우
    if (currentPath.includes('/test')) {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo && currentPath !== '/') {
            alert('학생 정보가 없습니다. 처음부터 시작해 주세요.');
            window.location.href = '/';
        }
    }
}

// 로컬 스토리지 초기화
function clearStorage() {
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('testResults');
}

// 진행률 계산
function calculateProgress() {
    const testResults = JSON.parse(localStorage.getItem('testResults') || '{}');
    const completedTests = Object.keys(testResults).length;
    return (completedTests / 5) * 100;
}

// 숫자 애니메이션
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// 폼 유효성 검사
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const requiredInputs = form.querySelectorAll('[required]');
    for (let input of requiredInputs) {
        if (!input.value.trim()) {
            input.focus();
            return false;
        }
    }
    return true;
}

// 스크롤 애니메이션
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 날짜 포맷
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// JSON 다운로드
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 결과 인쇄
function printResults() {
    window.print();
}
