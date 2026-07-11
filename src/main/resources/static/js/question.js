let questions = [];
let currentIndex = 0;

export function loadQuestions() {
    const storedQuestions = localStorage.getItem("gptQuestions");
    if (!storedQuestions) {
        alert("저장된 질문이 없습니다. 질문을 먼저 생성해주세요.");
        return false;
    }

    questions = JSON.parse(storedQuestions);
    currentIndex = 0;
    return true;
}

export function showNextQuestion() {
    const questionSection = document.getElementById("question-section");

    if (currentIndex >= questions.length) {
        alert("모든 질문이 완료되었습니다.");
        return;
    }

    questionSection.innerHTML = `${currentIndex + 1}. ${questions[currentIndex]}`;
    currentIndex++;
}

export function resetQuestionState() {
    questions = [];
    currentIndex = 0;
}