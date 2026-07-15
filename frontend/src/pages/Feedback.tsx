import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface FeedbackData {
  feedbackText: string
  jobCompetency: string
}

function extractScore(text: string | undefined): number {
  const match = text?.match(/(\d+)\s*점/)
  return match ? parseInt(match[1], 10) : 0
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#151D35" strokeWidth="7" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="absolute text-xl font-bold font-mono" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

function scoreColor(score: number) {
  return score >= 80 ? '#22D27F' : score >= 60 ? '#4A7CFF' : score >= 40 ? '#F5A623' : '#FF4D6A'
}

export default function Feedback() {
  const navigate = useNavigate()
  const [data, setData] = useState<FeedbackData | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let objectUrl: string | null = null

    async function load() {
      try {
        const res = await api.get('/feedback/latest')
        setData(res.data)
      } catch {
        // 아직 피드백이 없을 수 있음
      }

      // ✅ <video src="..."> 는 Authorization 헤더를 실어보낼 수 없어서,
      //    axios로 직접 받아온 뒤 blob URL로 바꿔서 넣어준다.
      try {
        const videoRes = await api.get('/videos/latest', { responseType: 'blob' })
        objectUrl = URL.createObjectURL(videoRes.data)
        setVideoUrl(objectUrl)
      } catch {
        // 영상이 없을 수도 있음
      }

      setLoading(false)
    }

    load()
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#8A9BBF] text-sm">
        피드백을 불러오는 중...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#8A9BBF] text-sm">아직 완료된 피드백이 없어요.</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-3 bg-[#4A7CFF] text-white rounded-lg font-semibold text-sm"
        >
          면접 다시 시작하기
        </button>
      </div>
    )
  }

  const overallScore = extractScore(data.feedbackText)
  const competencyScore = extractScore(data.jobCompetency)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1E2A4A]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#4A7CFF] flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono">AI</span>
          </div>
          <span className="font-semibold text-[#E8EEFF] tracking-tight">InterviewLab</span>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-1.5 bg-[#4A7CFF] text-white rounded-md text-sm font-medium hover:bg-[#5A8CFF] transition-colors"
        >
          다시 연습하기
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold text-[#E8EEFF] tracking-tight mb-10">결과 리포트</h1>

        {/* 점수 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-6 flex flex-col items-center justify-center">
            <ScoreRing score={overallScore} color={scoreColor(overallScore)} />
            <div className="mt-3 text-xs text-[#8A9BBF]">답변 내용 점수</div>
          </div>
          <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-6 flex flex-col items-center justify-center">
            <ScoreRing score={competencyScore} color={scoreColor(competencyScore)} />
            <div className="mt-3 text-xs text-[#8A9BBF]">직무 역량 점수</div>
          </div>
        </div>

        {/* 영상 다시보기 */}
        {videoUrl && (
          <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#4A7CFF] rounded-full" />
              <span className="text-sm font-semibold text-[#E8EEFF]">면접 영상 다시보기</span>
            </div>
            <video src={videoUrl} controls className="w-full rounded-lg max-w-lg mx-auto" />
            <p className="text-xs text-[#4A5880] text-center mt-3">분석 없이 본인 다시보기 용도로만 제공돼요.</p>
          </div>
        )}

        {/* 답변 내용 피드백 */}
        <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#4A7CFF] rounded-full" />
            <span className="text-sm font-semibold text-[#E8EEFF]">답변 내용 피드백</span>
          </div>
          <p className="text-sm text-[#8A9BBF] leading-relaxed whitespace-pre-line">{data.feedbackText}</p>
        </div>

        {/* 직무 역량 분석 */}
        <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#4A7CFF] rounded-full" />
            <span className="text-sm font-semibold text-[#E8EEFF]">직무 역량 분석</span>
          </div>
          <p className="text-sm text-[#8A9BBF] leading-relaxed whitespace-pre-line">{data.jobCompetency}</p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="w-full py-3.5 bg-[#4A7CFF] text-white rounded-lg font-semibold hover:bg-[#5A8CFF] transition-all text-sm"
        >
          다시 연습하기 →
        </button>
      </div>
    </div>
  )
}
