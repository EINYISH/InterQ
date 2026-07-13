function renderFeedbackUI() {
    const data = window.feedbackData;
    if (!data) return;

    const feedbackContainer = document.getElementById("feedback-container");
    const jobContainer = document.getElementById("job-competency-container");

    // 종합 피드백
    const feedbackParagraphs = (data.feedbackText || "").split(/(?<=\.)\s+/);
    feedbackContainer.innerHTML = `<h2>면접 종합 피드백</h2>`;
    feedbackParagraphs.forEach(p => {
        const para = document.createElement("p");
        para.innerHTML = p.trim().replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        feedbackContainer.appendChild(para);
    });

    // 직무 역량
    const jobParagraphs = (data.jobCompetency || "").split("\n");
    jobContainer.innerHTML = `<h2>직무 역량 분석</h2>`;
    jobParagraphs.forEach(p => {
        const para = document.createElement("p");
        para.innerHTML = p.trim().replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        jobContainer.appendChild(para);
    });
}