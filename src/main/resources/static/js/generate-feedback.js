document.getElementById("check-feedback").addEventListener("click", async function() {
    const checkFeedbackButton = document.getElementById("check-feedback");
    console.log("📌 [LOG] Check the Feedback 버튼 클릭됨.");
    alert("면접 피드백을 생성하는 중입니다. 잠시만 기다려 주세요...");

    // 버튼 비활성화
    updateButtonState(checkFeedbackButton, true, "음성 변환 중...");

    const userId = localStorage.getItem("userId");

    // 1️⃣ Whisper-1 API 호출 (최신 음성 파일 변환)
    console.log("📌 [LOG] Whisper-1 변환 요청 중...");
    let transcriptionResponse = await fetch("/api/process/transcribe-from-db", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `userId=${userId}`
    });

    let transcriptionData = await transcriptionResponse.json();

    if (!transcriptionData.text) {
        console.log("❌ [LOG] Whisper-1 변환 실패.");
        alert("❌ 음성 변환에 실패했습니다.");
        updateButtonState(checkFeedbackButton, false, "Check the Feedback");
        return;
    }

    console.log("✅ [LOG] Whisper-1 변환 완료: " + transcriptionData.text);

    updateButtonState(checkFeedbackButton, true, "AI 분석 중...");

    // 2️⃣ GPT API 호출 (면접 피드백 생성)
    console.log("📌 [LOG] GPT API 피드백 생성 요청 중...");
    let feedbackResponse = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userId: userId })
    });

    // 직무 역량 분석 요청
    const jobResponse = await fetch("/api/feedback/job-competency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
    });

    // 톤 분석 요청
    const toneResponse = await fetch("/api/feedback/tone-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
    });

    let feedbackData = await feedbackResponse.json();
    let jobData = await jobResponse.json();
    let toneData = await toneResponse.json();

    if (!feedbackData.response || !jobData.response || !toneData.response) {
        console.log("❌ [LOG] GPT 피드백 생성 실패 - response 필드 없음.");
        alert("❌ GPT 피드백 생성에 실패했습니다.");
        updateButtonState(checkFeedbackButton, false, "Check the Feedback");
        return;
    }

    console.log("✅ [LOG] GPT 피드백 생성 완료: " + feedbackData.response);

    updateButtonState(checkFeedbackButton, true, "영상 분석 중...");

    // GPT Vision API 요청
    console.log("📌 [LOG] GPT Vision API 요청 중...");
    let videoAnalysisResponse = await fetch("/api/feedback/video-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
    });

    // 응답 상태 확인
    if (!videoAnalysisResponse.ok) {
        console.log("❌ [LOG] 서버 응답 오류:", videoAnalysisResponse.status);
        alert("❌ 영상 분석 요청 실패.");
        updateButtonState(checkFeedbackButton, false, "Check the Feedback");
        return;
    }

    let videoAnalysisData = await videoAnalysisResponse.json();
    console.log("✅ [LOG] GPT Vision 응답 데이터:", videoAnalysisData);

    // 시선 집중도 및 얼굴 표현 점수 파싱
    let eyeTrackingRaw = videoAnalysisData.eyeTracking;
    let eyeTrackingFrames = Array.isArray(eyeTrackingRaw) ? eyeTrackingRaw : eyeTrackingRaw.split(",").map(val => parseInt(val.trim(), 10));

    let facialExpressionRaw = videoAnalysisData.facialExpression || "";
    let facialExpressionMatch = facialExpressionRaw.match(
        /자신감:\s*(\d+)[\s\S]*?호감도:\s*(\d+)[\s\S]*?긴장:\s*(\d+)[\s\S]*?편안함:\s*(\d+)[\s\S]*?집중력:\s*(\d+)/
    );

    if (!facialExpressionMatch || facialExpressionMatch.length < 6) {
        alert("❌ 얼굴 표현 분석 실패.");
        updateButtonState(checkFeedbackButton, false, "Check the Feedback");
        return;
    }

    let facialExpressions = {
        confidence: parseInt(facialExpressionMatch[1], 10),
        likability: parseInt(facialExpressionMatch[2], 10),
        tension: parseInt(facialExpressionMatch[3], 10),
        comfort: parseInt(facialExpressionMatch[4], 10),
        focus: parseInt(facialExpressionMatch[5], 10),
    };

    console.log("✅ [LOG] 시선 집중도:", eyeTrackingFrames);
    console.log("✅ [LOG] 얼굴 표현 점수:", facialExpressions);

    updateButtonState(checkFeedbackButton, false, "Check the FeedBack");

    // 3️⃣ 최종 피드백 저장
    const saveResponse = await fetch("/api/feedback/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: userId,
            feedbackText: feedbackData.response, // 피드백 내용
            jobCompetency: jobData.response,    // 직무 역량 분석
            toneAnalysis: toneData.response,    // 톤 분석
        })
    });

    if (!saveResponse.ok) {
        console.log("❌ [LOG] 면접 피드백 저장 실패!");
        alert("❌ GPT 피드백 저장 실패!");
    } else {
        console.log("✅ [LOG] GPT 피드백 DB 저장 완료");
    }

    alert("✅ GPT Vision 분석이 완료되었습니다!");
    window.location.href = "/loading";
});

// 버튼 상태 업데이트
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

// 페이지 이동 함수
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