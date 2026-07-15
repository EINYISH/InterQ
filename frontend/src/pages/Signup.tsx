import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(username, password, nickname)
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data ?? '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-7 h-7 rounded-md bg-[#4A7CFF] flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono">AI</span>
          </div>
          <span className="font-semibold text-[#E8EEFF] tracking-tight">InterviewLab</span>
        </div>

        <div className="bg-[#0F1628] border border-[#1E2A4A] rounded-xl p-8">
          <h1 className="text-xl font-bold text-[#E8EEFF] mb-1">회원가입</h1>
          <p className="text-sm text-[#8A9BBF] mb-6">몇 초면 시작할 수 있어요.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8A9BBF] mb-1.5">아이디</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#080C18] border border-[#1E2A4A] rounded-lg px-4 py-2.5 text-sm text-[#E8EEFF] focus:outline-none focus:border-[#4A7CFF] focus:ring-1 focus:ring-[#4A7CFF]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8A9BBF] mb-1.5">닉네임</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full bg-[#080C18] border border-[#1E2A4A] rounded-lg px-4 py-2.5 text-sm text-[#E8EEFF] focus:outline-none focus:border-[#4A7CFF] focus:ring-1 focus:ring-[#4A7CFF]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8A9BBF] mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#080C18] border border-[#1E2A4A] rounded-lg px-4 py-2.5 text-sm text-[#E8EEFF] focus:outline-none focus:border-[#4A7CFF] focus:ring-1 focus:ring-[#4A7CFF]/30 transition-all"
              />
            </div>

            {error && <p className="text-xs text-[#FF4D6A]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4A7CFF] text-white rounded-lg font-semibold text-sm hover:bg-[#5A8CFF] transition-all disabled:opacity-50"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8A9BBF] mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-[#4A7CFF] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
