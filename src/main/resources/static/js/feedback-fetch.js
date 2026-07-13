window.feedbackData = {};

document.addEventListener("DOMContentLoaded", async function () {
    const userId = 1;

    try {
        const res = await fetch(`/api/feedback/latest/${userId}`);
        const data = await res.json();
        window.feedbackData = data;

        console.log("✅ 서버에서 받은 데이터:", data);

        renderFeedbackUI(); // 텍스트 출력
        renderFeedbackCharts(); // 차트 렌더링

        console.log("✅ 피드백 데이터 로드 완료");
    } catch (e) {
        console.error("❌ 피드백 불러오기 실패:", e);
    }

    // 본인 다시보기용 시뮬레이션 영상 로드 (분석 없이 재생만)
    const playbackVideo = document.getElementById("playback-video");
    if (playbackVideo) {
        playbackVideo.src = `/api/videos/latest/${userId}`;
    }
});