import { createContext, useContext, useState, type ReactNode } from 'react'
import { api } from '../api/client'

interface User {
  userId: number
  nickname: string
}

interface AuthContextValue {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, nickname: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): User | null {
  const raw = localStorage.getItem('interq_user')
  return raw ? (JSON.parse(raw) as User) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser())

  async function login(username: string, password: string) {
    const res = await api.post('/login', { username, password })
    const { token, userId, nickname } = res.data

    // ✅ JWT는 서버가 기억해주지 않으므로, 클라이언트가 직접 보관했다가 매 요청에 실어야 한다.
    localStorage.setItem('interq_token', token)
    localStorage.setItem('interq_user', JSON.stringify({ userId, nickname }))
    setUser({ userId, nickname })
  }

  async function signup(username: string, password: string, nickname: string) {
    await api.post('/signup', { username, password, nickname })
  }

  function logout() {
    localStorage.removeItem('interq_token')
    localStorage.removeItem('interq_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
