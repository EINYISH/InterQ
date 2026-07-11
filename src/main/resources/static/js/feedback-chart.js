function renderFeedbackCharts() {
    const data = window.feedbackData;
    if (!data) return;

    const overallChartElement = document.getElementById("overallChart");
    const competencyChartElement = document.getElementById("competencyChart");
    const toneChartElement = document.getElementById("toneChart");
    const facialCtx = document.getElementById("facialEngagementChart")?.getContext("2d");
    const eyeTrackingCtx = document.getElementById("eyeTrackingGraph")?.getContext("2d");

    // ✅ 점수 추출 함수 (디비에서 받아온 텍스트 데이터를 기반으로 점수 추출)
    const extractScore = (text) => {
        // 텍스트에서 점수 추출: 'xx점' 형식의 숫자 추출
        const match = text?.match(/(\d+)\s*점/);
        return match ? parseInt(match[1]) : 0; // 점수 없으면 0 리턴
    };

    // feedbackText, jobCompetency, toneAnalysis에서 점수를 추출
    const overallScore = extractScore(data.feedbackText); // feedbackText에서 종합 점수 추출
    const competencyScore = extractScore(data.jobCompetency); // jobCompetency에서 직무 역량 점수 추출
    const toneScore = extractScore(data.toneAnalysis); // toneAnalysis에서 톤 분석 점수 추출


    console.log("종합 점수:", overallScore);
    console.log("직무 역량 점수:", competencyScore);
    console.log("톤 분석 점수:", toneScore);


    // ✅ 표정 분석 데이터 파싱
    const emotionScores = { confidence: 0, likability: 0, tension: 0, comfort: 0, focus: 0 };
    if (typeof data.facialExpression === "string") {
        const matches = data.facialExpression.match(/(자신감|호감도|긴장|편안함|집중력):\s*(\d+)/g);
        if (matches) {
            matches.forEach(match => {
                const [key, value] = match.split(":");
                const val = parseInt(value);
                if (key.includes("자신감")) emotionScores.confidence = val;
                if (key.includes("호감도")) emotionScores.likability = val;
                if (key.includes("긴장")) emotionScores.tension = val;
                if (key.includes("편안함")) emotionScores.comfort = val;
                if (key.includes("집중력")) emotionScores.focus = val;
            });
        } else if (!isNaN(parseInt(data.facialExpression))) {
            const val = parseInt(data.facialExpression);
            Object.keys(emotionScores).forEach(key => emotionScores[key] = val);
        }
    }

    // ✅ 얼굴 표정 분석 차트
    if (facialCtx) {
        Chart.register(ChartDataLabels);
        new Chart(facialCtx, {
            type: "radar",
            data: {
                labels: ["자신감", "호감도", "긴장", "편안함", "집중력"],
                datasets: [{
                    label: "표정 점수 (%)",
                    data: [
                        emotionScores.confidence,
                        emotionScores.likability,
                        emotionScores.tension,
                        emotionScores.comfort,
                        emotionScores.focus
                    ],
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 2,
                    pointBackgroundColor: "rgba(255, 99, 132, 1)",
                    pointRadius: 6,
                    pointHoverRadius: 8
                }],
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        pointLabels: { font: { size: 12 } },
                        ticks: { font: { size: 10 } }
                    }
                },
                plugins: {
                    datalabels: {
                        color: "#333",
                        font: { size: 14 },
                        formatter: (value) => `${value}%`
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
        console.log("✅ [LOG] 얼굴표현 그래프 생성 완료.");
    }

    // ✅ 시선 분석 데이터 파싱
    let eyeFrames = [];
    try {
        if (typeof data.eyeTracking === "string") {
            const parsed = JSON.parse(data.eyeTracking);
            if (Array.isArray(parsed)) eyeFrames = parsed;
            else if (!isNaN(parseInt(data.eyeTracking))) eyeFrames = Array(10).fill(parseInt(data.eyeTracking));
        } else if (Array.isArray(data.eyeTracking)) {
            eyeFrames = data.eyeTracking;
        }
    } catch (e) {
        console.warn("❌ 시선 데이터 파싱 실패:", e);
        if (!isNaN(parseInt(data.eyeTracking))) {
            eyeFrames = Array(10).fill(parseInt(data.eyeTracking));
        }
    }

    // ✅ 시선 분석 차트
    if (eyeTrackingCtx) {
        new Chart(eyeTrackingCtx, {
            type: "line",
            data: {
                labels: eyeFrames.map((_, i) => `프레임 ${i + 1}`),
                datasets: [{
                    label: "시선 처리능력 (%)",
                    data: eyeFrames,
                    borderColor: "#3498db",
                    backgroundColor: "rgba(52, 152, 219, 0.5)",
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#154360",
                }],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        ticks: { maxTicksLimit: 10, font: { size: 12 } },
                        title: {
                            display: true,
                            text: "시간 (초)",
                            font: { size: 14, weight: "bold" }
                        }
                    },
                    y: {
                        title: { display: true, text: "비율 (%)" },
                        min: 0,
                        max: 100
                    }
                },
                elements: {
                    line: { tension: 0.4 },
                    point: { radius: 2 }
                }
            }
        });
        console.log("✅ [LOG] 시선 집중도 그래프 생성 완료.");
    }


    // 종합결과, 직무역량, 톤분석 차트 생성 함수
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
    createChartWithText(
        toneChartElement.getContext("2d"),
        toneScore,
        ["#4BC0C0", "#DDDDDD"],
        toneScore
    );



    console.log("✅ 모든 차트가 생성되었습니다.");
}