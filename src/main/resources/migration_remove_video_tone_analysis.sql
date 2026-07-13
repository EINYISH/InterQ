-- ============================================================
-- 마이그레이션: 영상분석(시선/표정) + 톤분석 기능 제거
-- 작성일: 2026-07-13
--
-- 배경: GPT Vision으로 정지 프레임만 보고 시선/감정을 분석하거나,
--       전사된 텍스트만으로 "목소리 톤"을 판단하는 기능은
--       실제 근거가 부족해 완전히 제거함.
--       핵심 기능을 (1) 이력서 기반 질문 생성, (2) 답변 내용/직무역량
--       분석 두 가지로 재편.
--
-- 주의: spring.jpa.hibernate.ddl-auto=update 는 컬럼을 자동으로
--       삭제해주지 않으므로 아래 스크립트를 수동으로 1회 실행해야 함.
-- ============================================================

ALTER TABLE interview_feedback
    DROP COLUMN IF EXISTS eye_tracking,
    DROP COLUMN IF EXISTS facial_expression,
    DROP COLUMN IF EXISTS tone_analysis;

-- video_files 테이블은 "본인 다시보기" 용도로 계속 사용하므로 삭제하지 않음.
