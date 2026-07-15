import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useMediaRecorder } from '../hooks/useMediaRecorder'

type Stage = 'ready' | 'recording' | 'uploading' | 'transcribing' | 'analyzing'

const stageLabel: Record<Stage, string> = {
  ready: '녹화 준비 완료',
  recording: '녹화 중',
  uploading: '영상 업로드 중...',
  transcribing: '답변 전사 중 (whisper.cpp)...',
  analyzing: 'AI 피드백 생성 중 (Gemma)...',
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function Simulation() {
  const navigate = useNavigate()
  const location = useLocation()
  const questions: string[] = (location.state as any)?.questions ?? []

  const videoRef = useRef<HTMLVideoElement>(null)
  const { isRecording, stream, startPreview, startRecording, stopRecording, stopPreview } =
    useMediaRecorder()

  const [stage, setStage] = useState<Stage>('ready')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/upload')
    }
  }, [questions, navigate])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    if (!isRecording) return
    setElapsed(0)
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [isRecording])

  useEffect(() => {
    return () => stopPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleStart() {
    setError('')
    const media = await startPreview()
    startRecording(media)
  }

  async function handleStopAndSubmit() {
    const blob = await stopRecording()
    stopPreview()

    try {
      setStage('uploading')
      const audioForm = new FormData()
      audioForm.append('audio', blob, 'simulation.webm')
      await api.post('/upload/audio', audioForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const videoForm = new FormData()
      videoForm.append('video', blob, 'simulation.webm')
      await api.post('/videos/upload', videoForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setStage('transcribing')
      await api.post('/process/transcribe-from-db')

      setStage('analyzing')
      const [feedbackRes, competencyRes] = await Promise.all([
        api.post('/feedback/generate'),
        api.post('/feedback/job-competency'),
      ])

      await api.post('/feedback/save-all', {
        feedbackText: feedbackRes.data.response,
        jobCompetency: competencyRes.data.response,
      })

      navigate('/feedback')
    } catch {
      setError('처리 중 오류가 발생했어요. Ollama와 whisper.cpp 서버가 켜져 있는지 확인해주세요.')
      setStage('ready')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1E2A4A]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#4A7CFF] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold font-mono">AI</span>
          </div>
          <span className="text-xs text-[#8A9BBF]">면접 시뮬레이션</span>
        </div>
        <div className="text-xs text-[#4A5880] font-mono">질문 {questions.length}개</div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* AI 질문 카드 */}
        <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#4A7CFF]" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#151D35] border border-[#253050] flex items-center justify-center">
              <span className="text-xs font-bold text-[#4A7CFF] font-mono">AI</span>
            </div>
            <div className="text-xs font-semibold text-[#E8EEFF]">AI가 준비한 질문</div>
          </div>
          <ol className="space-y-2.5">
            {questions.map((q, i) => (
              <li key={i} className="text-sm text-[#E8EEFF] leading-relaxed flex gap-2.5">
                <span className="text-[#4A7CFF] font-mono flex-shrink-0">Q{i + 1}</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 웹캠 영역 */}
        <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl overflow-hidden mb-4 relative aspect-video flex items-center justify-center">
          {stream ? (
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-[#4A5880]">녹화를 시작하면 웹캠 화면이 여기 표시돼요</span>
          )}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#080C18]/80 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#FF4D6A] animate-pulse" />
              <span className="text-xs font-mono text-[#E8EEFF]">{formatElapsed(elapsed)}</span>
            </div>
          )}
        </div>

        {stage !== 'ready' && stage !== 'recording' && (
          <div className="flex items-center gap-2 mb-4 text-sm text-[#8A9BBF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
            {stageLabel[stage]}
          </div>
        )}
        {error && <p className="text-sm text-[#FF4D6A] mb-4">{error}</p>}

        {!isRecording && stage === 'ready' && (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-[#4A7CFF] text-white rounded-lg font-semibold hover:bg-[#5A8CFF] transition-all"
          >
            녹화 시작하기
          </button>
        )}
        {isRecording && (
          <button
            onClick={handleStopAndSubmit}
            className="w-full py-4 bg-[#FF4D6A] text-white rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            녹화 종료하고 분석 요청하기
          </button>
        )}
        {stage !== 'ready' && stage !== 'recording' && (
          <button
            disabled
            className="w-full py-4 bg-[#0F1628] text-[#4A5880] border border-[#1E2A4A] rounded-lg font-semibold cursor-not-allowed"
          >
            {stageLabel[stage]}
          </button>
        )}
      </div>
    </div>
  )
}
