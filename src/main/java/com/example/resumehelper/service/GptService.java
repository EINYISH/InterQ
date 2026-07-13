package com.example.resumehelper.service;

import com.example.resumehelper.client.GptApiClient;
import com.example.resumehelper.domain.Resume;
import com.example.resumehelper.repository.ResumeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GptService {

    private final ResumeRepository resumeRepository;
    private final GptApiClient gptApiClient;

    public GptService(ResumeRepository resumeRepository, GptApiClient gptApiClient) {
        this.resumeRepository = resumeRepository;
        this.gptApiClient = gptApiClient;
    }

    public ResponseEntity<Map<String, Object>> generateQuestions(Map<String, String> resumeData, Long userId) {
        try {
            // 1. 유효성 검사
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "로그인이 필요합니다."));
            }

            // 2. Resume 저장
            Resume resume = new Resume();
            resume.setName(resumeData.get("name"));
            resume.setBirthday(resumeData.get("birthday"));
            resume.setContactInformation(resumeData.get("contactInformation"));

            resume.setEducationLevel(resumeData.get("educationLevel"));
            resume.setMajor(resumeData.get("major"));
            resume.setUniversity(resumeData.get("university"));
            resume.setGraduationDate(resumeData.get("graduationDate"));

            resume.setWorkExperience(resumeData.get("workExperience"));
            resume.setJobRoles(resumeData.get("jobRoles"));
            resume.setProjects(resumeData.get("projects"));

            resume.setTechnicalSkills(resumeData.get("technicalSkills"));
            resume.setCertifications(resumeData.get("certifications"));
            resume.setLanguageProficiency(resumeData.get("languageProficiency"));

            resume.setDesiredField(resumeData.get("desiredField"));
            resume.setDesiredPosition(resumeData.get("desiredPosition"));
            resume.setCareerGoals(resumeData.get("careerGoals"));

            resume.setSelfIntroduction(resumeData.get("selfIntroduction"));

            resume.setGptResponse("GPT 분석 전입니다.");
            resume.setUserId(userId);

            resumeRepository.save(resume);

            // 3. 프롬프트 구성
            String systemPrompt = " 당신은 인사 담당자의 역할을 수행합니다." +
                    "사용자의 이력서를 바탕으로 적절한 면접 질문을 생성합니다." +
                    "질문은 한글로 출력합니다." +
                    "이력서의 직무 역할 항목에 대해서 기술적인 질문 1개는 필수로 생성합니다. " +
                    "자기소개 항목 내용을 참고해서 사용자의 배경에 관련한 질문 1개는 필수로 생성합니다.";

            String userPrompt =
                    "이름: " + resume.getName() + "\n" +
                            "생년월일: " + resume.getBirthday() + "\n" +
                            "연락처: " + resume.getContactInformation() + "\n" +
                            "전공: " + resume.getMajor() + "\n" +
                            "학교: " + resume.getUniversity() + "\n" +
                            "최종 학력: " + resume.getEducationLevel() + "\n" +
                            "졸업 연도: " + resume.getGraduationDate() + "\n" +
                            "경력: " + resume.getWorkExperience() + "\n" +
                            "직무 역할: " + resume.getJobRoles() + "\n" +
                            "프로젝트 경험: " + resume.getProjects() + "\n" +
                            "기술: " + resume.getTechnicalSkills() + "\n" +
                            "자격증: " + resume.getCertifications() + "\n" +
                            "외국어 능력: " + resume.getLanguageProficiency() + "\n" +
                            "지원 분야: " + resume.getDesiredField() + "\n" +
                            "희망 직무: " + resume.getDesiredPosition() + "\n" +
                            "향후 경력 목표: " + resume.getCareerGoals() + "\n" +
                            "자기소개: " + resume.getSelfIntroduction() + "\n\n";

            // 4. GPT 호출 (GptApiClient 사용)
            String gptResponse = gptApiClient.send(
                    systemPrompt,
                    userPrompt
            );

            // 5. 응답 파싱
            List<String> questions = List.of(gptResponse.split("\n")).stream()
                    .map(q -> q.replaceAll("^\\d+\\.\\s*", "").trim())
                    .filter(q -> !q.isEmpty())
                    .toList();

            // 6. 결과 저장 및 응답 반환
            if (!questions.isEmpty()) {
                String json = new ObjectMapper().writeValueAsString(questions);
                resume.setGptResponse(json);
                resumeRepository.save(resume);

                return ResponseEntity.ok(Map.of("gptQuestions", questions));
            } else {
                return ResponseEntity.ok(Map.of("error", "GPT에서 질문이 생성되지 않았습니다."));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "GPT API 호출 중 서버 오류 발생"));
        }
    }
}