import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/upload')
    } catch {
      setError('아이디 또는 비밀번호가 틀렸습니다.')
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
          <h1 className="text-xl font-bold text-[#E8EEFF] mb-1">로그인</h1>
          <p className="text-sm text-[#8A9BBF] mb-6">다시 오신 걸 환영해요.</p>

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
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8A9BBF] mt-6">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-[#4A7CFF] hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
