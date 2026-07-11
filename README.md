# InterQ

AI가 이력서를 분석해 맞춤형 면접 질문을 생성하고, 음성/영상으로 답변하면 말투·직무 역량·시선 처리까지 분석해 피드백을 제공하는 AI 모의면접 웹 서비스입니다.

## 배경

취업 준비 과정에서 자신의 이력서에 맞춘 예상 질문을 미리 받아보고, 실제 면접처럼 "말하는 연습"과 표정·시선 같은 비언어적 요소까지 점검할 수 있는 도구가 마땅치 않다는 문제에서 시작한 프로젝트입니다.

## 주요 기능

- **이력서 기반 질문 생성**: 업로드한 이력서 내용을 바탕으로 GPT가 기술 질문 1개, 자기소개 기반 질문 1개를 포함한 맞춤형 면접 질문 생성
- **음성 답변 분석**: 녹음된 답변을 Whisper API로 텍스트 변환 후, 종합 피드백 / 직무 역량 분석 / 말투(톤) 분석을 각각 생성
- **영상 답변 분석**: 업로드된 영상에서 프레임을 추출해 GPT Vision으로 시선 처리, 표정 분석
- **피드백 시각화**: Chart.js를 이용한 분석 결과 대시보드
- **회원 기능**: 로그인/회원가입, 마이페이지, 면접 후기 게시판

## 기술 스택

**Backend**
- Java 21, Spring Boot 3.4.1
- Spring Data JPA, MySQL
- Spring Session

**Frontend**
- Thymeleaf, Chart.js

**External API / Tools**
- OpenAI GPT API (질문 생성, 피드백 생성)
- OpenAI Whisper API (음성 텍스트 변환)
- OpenAI GPT Vision API (영상 프레임 분석)
- FFmpeg (오디오 포맷 변환, 영상 프레임 추출)

## 아키텍처 개요

```
[이력서 업로드] → GPT API → 맞춤 면접 질문 생성
                                    ↓
                          [음성/영상 답변 녹화]
                     ↓                        ↓
          [FFmpeg 변환 → Whisper]    [FFmpeg 프레임 추출 → GPT Vision]
                     ↓                        ↓
              텍스트 트랜스크립션        시선/표정 분석 결과
                     ↓                        ↓
                     └────── GPT 피드백 생성 ──────┘
                                    ↓
                        피드백 대시보드 (Chart.js)
```

## 프로젝트 구조

```
src/main/java/com/example/resumehelper
├── controller
│   ├── audio      # 음성 업로드/처리
│   ├── auth       # 로그인/회원가입
│   ├── gpt        # GPT 질문/피드백 API
│   ├── resume     # 이력서 등록/조회
│   ├── user       # 마이페이지, 리뷰
│   ├── video      # 영상 업로드/분석
│   └── view       # 페이지 라우팅
├── service        # 비즈니스 로직 (GPT 연동, 피드백 생성 등)
├── client         # 외부 API 클라이언트
├── domain         # JPA 엔티티
├── repository     # JPA Repository
├── dto            # 요청/응답 DTO
├── config         # 프롬프트, 웹 설정
└── utils          # 공통 유틸
```

## 실행 방법

### 사전 요구사항
- Java 21
- MySQL
- FFmpeg (시스템 PATH에 등록되어 있어야 함)
- OpenAI API 키

### 환경 변수 설정
```bash
export DB_PASSWORD=your_db_password
export OPENAI_API_KEY=your_openai_api_key
```

### 실행
```bash
./gradlew bootRun
```

## 향후 개선 계획

- [ ] 서비스 계층 리팩토링 (중복 로직 정리)
- [ ] 예외 처리 일원화
- [ ] 프론트엔드 구조 개선
- [ ] 테스트 코드 보강
