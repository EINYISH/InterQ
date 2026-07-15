# InterQ React 프론트엔드

업로드해주신 디자인(InterviewLab 다크 테마)을 기반으로, 실제 InterQ 백엔드와 연동되는 React 앱으로 만들었습니다.

## 디자인에서 바뀐 부분 (실제 백엔드 기능에 맞춘 조정)

업로드하신 프로토타입은 role/level/type 선택 → 타이핑 답변 → 로컬 가짜 채점 흐름이었는데,
실제 InterQ 백엔드는 **이력서 기반 질문 생성 + 오디오·영상 녹화 + Whisper 전사 + Gemma 피드백**
구조라서 아래 페이지들을 실제 동작에 맞게 다시 짰습니다. 시각 디자인(색상, 타이포그래피, 카드 스타일)은 그대로 유지했습니다.

| 원본 디자인 | 이 프로젝트 | 변경 이유 |
|---|---|---|
| Setup.tsx (직군/경력/유형 선택) | `Upload.tsx` | 실제로는 이력서 텍스트를 기반으로 Gemma가 질문을 생성함 |
| Interview.tsx (텍스트 타이핑 답변) | `Simulation.tsx` | 실제로는 웹캠·마이크로 녹화 → Whisper 전사 |
| Results.tsx (질문별 로컬 채점) | `Feedback.tsx` | 실제로는 전체 답변에 대한 종합 피드백 + 직무역량 분석 (질문별 개별 채점 아님) + 영상 다시보기 |
| (없음) | `Login.tsx`, `Signup.tsx` | 실제 서비스엔 로그인이 필요해서 새로 추가 |

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 열립니다. **백엔드(Spring Boot, localhost:8080)가 먼저 실행 중이어야 하고**,
로컬 LLM(Ollama)과 whisper.cpp 서버도 함께 떠 있어야 질문 생성/피드백까지 정상 동작합니다.

## 프로젝트 구조

```
src/
  api/client.ts          # axios 인스턴스 - 요청마다 JWT 자동 첨부
  context/AuthContext.tsx # 로그인 상태 전역 관리 (토큰은 localStorage에 저장)
  routes/PrivateRoute.tsx # 로그인 필요한 페이지 가드
  hooks/useMediaRecorder.ts # 웹캠+마이크 녹화 훅
  pages/
    Landing.tsx
    Login.tsx
    Signup.tsx
    Upload.tsx      # 이력서 입력 폼 → POST /api/generate-questions
    Simulation.tsx  # 녹화 → 오디오/영상 업로드 → 전사 → 피드백 생성
    Feedback.tsx    # 결과 리포트 + 영상 다시보기
```

## 알아두면 좋은 것들

- **JWT는 localStorage에 저장**돼요. 로그인하면 토큰을 받아서 저장해두고, 이후 모든 API 호출에 `Authorization: Bearer {token}` 헤더로 자동 첨부됩니다 (`api/client.ts`의 axios interceptor).
- **영상 재생이 fetch 기반인 이유**: `<video src="...">`는 브라우저가 자동으로 붙여주는 헤더 외에 커스텀 헤더(Authorization)를 실어 보낼 수 없어요. 그래서 `Feedback.tsx`에서 axios로 영상을 blob으로 받아온 다음 `URL.createObjectURL()`로 변환해서 재생합니다.
- **녹화는 오디오+영상을 하나의 webm으로 녹화**해서, 같은 파일을 `/api/upload/audio`와 `/api/videos/upload`에 각각 보내요. 백엔드의 ffmpeg가 오디오 트랙만 뽑아서 wav로 변환해주기 때문에 이렇게 해도 문제없습니다.
- 백엔드 CORS 설정이 `http://localhost:5173`만 허용하고 있어서, 포트를 바꾸면 `SecurityConfig.java`의 `corsConfigurationSource()`도 같이 수정해야 해요.

## 남은 작업 (다음에 이어서 할 만한 것)

- 로딩/에러 상태 UI를 좀 더 다듬기 (지금은 기능 위주로 최소한만 구현)
- Simulation 페이지에 질문별 타이머나 진행 표시 추가하고 싶다면 논의 필요
- 마이페이지(닉네임/비밀번호 변경), 리뷰 게시판 페이지는 아직 미포함 — 필요하면 이어서 작업 가능
