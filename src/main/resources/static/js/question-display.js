// question-display.js

let questions = [];
let currentIndex = 0;
let questionInterval;

// 📌 질문 불러오기 함수 (시뮬레이션 시작 시 실행)
function loadQuestions() {
    const storedQuestions = localStorage.getItem('gptQuestions');
    if (!storedQuestions) {
        alert('저장된 질문이 없습니다. 질문을 먼저 생성해주세요.');
        return false;
    }
    questions = JSON.parse(storedQuestions);
    currentIndex = 0; // 인덱스 초기화
    return true;
}

// 📌 1분마다 질문 표시 (시뮬레이션 시작 시 실행)
function showNextQuestion() {
    const questionSection = document.getElementById('question-section');

    if (currentIndex < questions.length) {
        questionSection.innerHTML = `<p><strong>${currentIndex + 1}.${questions[currentIndex]}</strong></p>`;
        currentIndex++;
    } else {
        clearInterval(questionInterval);
        questionSection.innerHTML = '<p>모든 질문이 완료되었습니다.</p>';
    }
}

// 📌 질문 표시 시작 (시뮬레이션 버튼 클릭 시 실행)
function startQuestionDisplay() {
    if (!loadQuestions()) return;

    showNextQuestion(); // 첫 번째 질문 표시
    questionInterval = setInterval(showNextQuestion, 20000); // 1분 후 다음 질문 표시
}
