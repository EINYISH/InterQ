import axios from 'axios'

// 백엔드(Spring Boot)는 localhost:8080에서 실행 중이어야 함
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// ✅ 요청마다 localStorage에 저장된 JWT를 Authorization 헤더에 자동으로 실어 보낸다.
//    이전(세션 방식)에는 브라우저가 쿠키를 자동으로 붙여줬지만,
//    JWT 방식에서는 이렇게 매 요청마다 직접 헤더에 넣어줘야 한다.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('interq_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ 토큰이 만료되었거나 유효하지 않으면 서버가 401을 준다 - 그러면 로그인 정보를 지우고 로그인 페이지로 보낸다.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('interq_token')
      localStorage.removeItem('interq_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
