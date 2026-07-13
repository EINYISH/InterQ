function renderFeedbackCharts() {
    const data = window.feedbackData;
    if (!data) return;

    const overallChartElement = document.getElementById("overallChart");
    const competencyChartElement = document.getElementById("competencyChart");

    // ✅ 점수 추출 함수 (디비에서 받아온 텍스트 데이터를 기반으로 점수 추출)
    const extractScore = (text) => {
        // 텍스트에서 점수 추출: 'xx점' 형식의 숫자 추출
        const match = text?.match(/(\d+)\s*점/);
        return match ? parseInt(match[1]) : 0; // 점수 없으면 0 리턴
    };

    // feedbackText, jobCompetency에서 점수를 추출
    const overallScore = extractScore(data.feedbackText); // feedbackText에서 종합 점수 추출
    const competencyScore = extractScore(data.jobCompetency); // jobCompetency에서 직무 역량 점수 추출

    console.log("종합 점수:", overallScore);
    console.log("직무 역량 점수:", competencyScore);

    // 종합결과, 직무역량 차트 생성 함수
    const createChartWithText = (ctx, score, colors, text) => {
        const chart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["획득 점수", "남은 점수"],
                datasets: [
                    {
                        data: [score, 100 - score],
                        backgroundColor: colors,
                    },
                ],
            },
            options: {
                responsive: false,
                cutout: "50%", // 내부 원 크기를 조정
                animation: {
                    animateScale: true, // 크기 확대 애니메이션
                    animateRotate: true, // 회전 애니메이션
                },
                plugins: {
                    legend: { display: false }, // 범례 비활성화
                },
            },
            plugins: [
                {
                    id: "center-text",
                    beforeDraw: (chart) => {
                        const { width } = chart;
                        const { height } = chart;
                        const ctx = chart.ctx;
                        ctx.save();
                        ctx.font = "bold 20px Arial"; // 텍스트 스타일
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillStyle = colors[0]; // 텍스트 색상
                        ctx.fillText(`${text}점`, width / 2, height / 2); // 중앙에 점수 표시
                    },
                },
            ],
        });
        return chart;
    };

    // 점수 차트 생성 (내부 텍스트 포함)
    createChartWithText(
        overallChartElement.getContext("2d"),
        overallScore,
        ["#36A2EB", "#DDDDDD"],
        overallScore
    );
    createChartWithText(
        competencyChartElement.getContext("2d"),
        competencyScore,
        ["#FF6384", "#DDDDDD"],
        competencyScore
    );

    console.log("✅ 모든 차트가 생성되었습니다.");
}
