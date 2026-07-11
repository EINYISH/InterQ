let timerInterval = null;

export function startTimer(timerElement, onComplete) {
    let remainingTime = 180; // 3분 (초 단위) / 필요 시 300으로 변경

    timerInterval = setInterval(() => {
        const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
        const seconds = String(remainingTime % 60).padStart(2, "0");
        timerElement.textContent = `⏳ ${minutes}:${seconds} ⏳`;

        if (--remainingTime < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = `⏳ 00:00 ⏳`;
            alert("면접이 종료되었습니다.");
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    }, 1000);

    console.log("⏱️ [LOG] 타이머 시작됨");
}

export function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    console.log("🛑 [LOG] 타이머 정지됨");
}