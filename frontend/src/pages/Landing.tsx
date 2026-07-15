import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const stats = [
  { value: '12,400+', label: '연습 완료' },
  { value: '94%', label: '만족도' },
  { value: '38개', label: '직군 지원' },
]

const features = [
  {
    icon: '◈',
    title: 'AI 맞춤형 질문',
    desc: '이력서를 분석해 실전과 동일한 면접 질문을 생성합니다.',
  },
  {
    icon: '◉',
    title: '실시간 답변 분석',
    desc: '녹음된 답변을 전사하고, 내용과 직무 역량을 분석해 점수를 제공합니다.',
  },
  {
    icon: '◎',
    title: '상세 피드백 리포트',
    desc: '강점과 개선점을 정리하고, 면접 영상도 다시 확인할 수 있습니다.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleStart() {
    navigate(user ? '/upload' : '/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1E2A4A]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#4A7CFF] flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono">AI</span>
          </div>
          <span className="font-semibold text-[#E8EEFF] tracking-tight">InterviewLab</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#8A9BBF]">
          {user ? (
            <>
              <span className="text-[#8A9BBF]">{user.nickname}님</span>
              <button
                onClick={logout}
                className="hover:text-[#E8EEFF] transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hover:text-[#E8EEFF] transition-colors"
            >
              로그인
            </button>
          )}
          <button
            onClick={handleStart}
            className="px-4 py-1.5 bg-[#4A7CFF] text-white rounded-md text-sm font-medium hover:bg-[#5A8CFF] transition-colors"
          >
            시작하기
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(74,124,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#4A7CFF] opacity-[0.04] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0F1628] border border-[#1E2A4A] rounded-full text-xs text-[#8A9BBF] font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D27F] animate-pulse" />
            AI 면접관 온라인
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[#E8EEFF] leading-tight tracking-tight mb-6">
            실전처럼 연습하고
            <br />
            <span className="text-[#4A7CFF]">확신을 얻으세요</span>
          </h1>

          <p className="text-lg text-[#8A9BBF] leading-relaxed mb-10 max-w-xl mx-auto">
            이력서를 올리면 AI가 맞춤 질문을 만들고, 답변을 녹음하면 내용과 직무 역량을 분석해
            구체적인 피드백을 제공합니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStart}
              className="group px-8 py-3.5 bg-[#4A7CFF] text-white rounded-lg font-semibold text-base hover:bg-[#5A8CFF] transition-all hover:shadow-[0_0_32px_rgba(74,124,255,0.3)] active:scale-[0.98]"
            >
              무료로 시작하기
              <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-12 mt-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-[#E8EEFF] font-mono">{s.value}</div>
              <div className="text-xs text-[#4A5880] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#1E2A4A] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#E8EEFF] text-center mb-14 tracking-tight">
            왜 InterviewLab인가요?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-[#0F1628] border border-[#1E2A4A] rounded-xl hover:border-[#253050] transition-colors group"
              >
                <div className="text-2xl text-[#4A7CFF] mb-4 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#E8EEFF] mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-[#8A9BBF] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#1E2A4A] px-6 py-16 text-center">
        <p className="text-[#8A9BBF] text-sm mb-4">지금 바로 연습을 시작해보세요</p>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-[#4A7CFF] text-white rounded-lg font-semibold hover:bg-[#5A8CFF] transition-all hover:shadow-[0_0_24px_rgba(74,124,255,0.25)]"
        >
          면접 시작하기
        </button>
      </section>

      <footer className="border-t border-[#1E2A4A] px-8 py-5 flex items-center justify-between text-xs text-[#4A5880]">
        <span>© 2026 InterviewLab</span>
        <span className="font-mono">v1.0</span>
      </footer>
    </div>
  )
}
