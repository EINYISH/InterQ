// simulation.js

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-simulation");
    const stopButton = document.getElementById("stop-simulation");
    const videoElement = document.getElementById("camera");
    const timerElement = document.getElementById("timer");
    const questionSection = document.getElementById("question-section");

    let questions = [];
    let currentIndex = 0;
    let timerInterval;
    let questionInterval;
    let stream;

    //음성 레코드
    let mediaRecorder;
    let recordedChunks = [];

    // 질문 가져오기 (localStorage)
    function loadQuestions() {
        const storedQuestions = localStorage.getItem("gptQuestions");
        if (!storedQuestions) {
            alert("저장된 질문이 없습니다. 질문을 먼저 생성해주세요.");
            return false;
        }
        questions = JSON.parse(storedQuestions);
        return true;
    }

    // 1분마다 질문 표시하기
    function showNextQuestion() {
        if (currentIndex >= questions.length) {
            alert("모든 질문이 완료되었습니다.");
            stopSimulation();
            return;
        }
        questionSection.innerHTML = `${currentIndex + 1}. ${questions[currentIndex]}`;
        currentIndex++;
    }

    // 5분 타이머 실행
    function startTimer() {
        let remainingTime = 100; // 5분(300초)
        timerInterval = setInterval(() => {
            const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
            const seconds = String(remainingTime % 60).padStart(2, "0");
            timerElement.textContent = `⏳ ${minutes}:${seconds} ⏳`;

            if (--remainingTime < 0) {
                clearInterval(timerInterval);
                alert("면접이 종료되었습니다.");
                stopSimulation();
            }
        }, 1000);
    }

    // 카메라 및 음성 활성화
    async function startCameraAndAudio() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true, audio: {
                    sampleRate: 16000, // Whisper-1 최적화
                    channelCount: 1, // 모노 설정
                    echoCancellation: true, // 에코 제거
                    noiseSuppression: true, // 잡음 제거
                }
            });
            videoElement.srcObject = stream;
            videoElement.muted = true; // 🔇 사용자가 자신의 목소리를 듣지 않도록 음소거
            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.start();
            videoMediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
            videoChunks = [];
            videoMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) videoChunks.push(event.data);
            };
            videoMediaRecorder.start();
        } catch (error) {
            console.error("카메라 및 마이크 활성화 오류:", error);
            alert("카메라 및 마이크를 사용할 수 없습니다. 권한을 확인하세요.");
        }
    }

    // 시뮬레이션 시작하기
    function startSimulation() {
        if (!loadQuestions()) return;
        alert("시뮬레이션을 시작합니다. 카메라 및 음성이 켜지고 면접 질문이 시작됩니다.");
        startCameraAndAudio();
        startTimer();
        showNextQuestion();
        questionInterval = setInterval(showNextQuestion, 20000);
        startButton.style.display = "none";
        stopButton.style.display = "inline-block";
    }

    // 시뮬레이션 종료하기
    function stopSimulation() {
        clearInterval(timerInterval);
        clearInterval(questionInterval);
        questionSection.textContent = "면접이 종료되었습니다. AI가 분석중에 있습니다..";
        timerElement.textContent = "⏳ 00:00 ⏳";

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        videoElement.srcObject = null;

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recordedChunks, {type: "audio/webm"});
                uploadAudioToServer(audioBlob);
            };
        }

        if (videoMediaRecorder && videoMediaRecorder.state !== "inactive") {
            videoMediaRecorder.stop();
            videoMediaRecorder.onstop = () => {
                const videoBlob = new Blob(videoChunks, { type: "video/webm" });
                uploadVideoToServer(videoBlob);
            };
        }

        startButton.style.display = "inline-block";
        stopButton.style.display = "none";
    }

    // 음성 업로드
    function uploadAudioToServer(audioBlob) {
        if (!audioBlob.type.includes("webm")) {
            alert("🚨 잘못된 파일 형식입니다! WebM 파일만 업로드 가능합니다.");
            return;
        }
        const formData = new FormData();
        formData.append("audio", audioBlob, "simulation.webm");

        const userId = localStorage.getItem(("userId"));
        formData.append("userId", userId)

        fetch("/api/upload/audio", {
            method: "POST",
            body: formData,
        })
            .then(response => response.text())
            .then(data => {
                console.log("✅ 서버 응답:", data);
                alert("음성 저장 완료: " + data);
            })
            .catch(error => {
                console.error("❌ 오류 발생:", error);
                alert("🚨 음성 저장 실패! 서버 로그를 확인하세요.");
            });
    }

    // 영상 업로드
    function uploadVideoToServer(videoBlob) {
        if (!videoBlob || videoBlob.size === 0) {
            console.error("❌ 비디오 데이터가 없습니다.");
            return;
        }

        const timestamp = Date.now();
        const fileName = `simulation_${timestamp}.webm`;

        const formData = new FormData();
        formData.append("video", videoBlob, fileName);

        const userId = localStorage.getItem("userId");
        formData.append("userId", userId)

        fetch("/api/videos/upload", {
            method: "POST",
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("❌ 비디오 업로드 실패: " + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                console.log("✅ [LOG] 비디오 업로드 완료:", data)
                alert("✅ 영상 변환이 완료되었습니다!");
            })
            .catch(error => console.error("❌ [LOG] 비디오 업로드 중 오류 발생:", error));
    }

    startButton.addEventListener("click", startSimulation);
    stopButton.addEventListener("click", stopSimulation);
});

//버튼 상태 업데이트
function updateButtonState(button, isProcessing, message) {
    button.disabled = isProcessing; // 버튼 활성화/비활성화
    button.textContent = message;   // 버튼 텍스트 변경
    if (isProcessing) {
        button.style.backgroundColor = "#ccc"; // 비활성화 스타일
        button.style.cursor = "not-allowed";   // 커서 변경
    } else {
        button.style.backgroundColor = "#ffcc00"; // 기본 스타일로 복원
        button.style.cursor = "pointer";
    }
}




function goToPage(page) {
    if (page === 'home') {
        alert('현재 페이지입니다.');
    } else if (page === 'upload') {
        window.location.href = '/upload.html';
    } else if (page === 'feedback') {
        window.location.href = 'feedback.html';
    } else if (page === 'contact') {
        alert('문의하기 페이지는 준비 중입니다.');
    } else if (page === 'services') {
        window.location.href = '/login';
    }
}
