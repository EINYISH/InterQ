package com.example.resumehelper.service;

import com.example.resumehelper.domain.Resume;
import com.example.resumehelper.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 이거 import 필요!

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ResumeService {
    private final ResumeRepository resumeRepository;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    @Transactional
    public Resume saveResume(Map<String, String> resumeData, Long userId) {
        Resume resumes = new Resume();

        // 기본 정보
        resumes.setName(resumeData.get("name"));
        resumes.setBirthday(resumeData.get("birthday"));
        resumes.setContactInformation(resumeData.get("contactInformation"));

        // 학력
        resumes.setEducationLevel(resumeData.get("educationLevel"));
        resumes.setMajor(resumeData.get("major"));
        resumes.setUniversity(resumeData.get("university"));
        resumes.setGraduationDate(resumeData.get("graduationDate"));

        // 경력
        resumes.setWorkExperience(resumeData.get("workExperience"));
        resumes.setJobRoles(resumeData.get("jobRoles"));
        resumes.setProjects(resumeData.get("projects"));

        // 역량
        resumes.setTechnicalSkills(resumeData.get("technicalSkills"));
        resumes.setCertifications(resumeData.get("certifications"));
        resumes.setLanguageProficiency(resumeData.get("languageProficiency"));

        // 목표
        resumes.setDesiredField(resumeData.get("desiredField"));
        resumes.setDesiredPosition(resumeData.get("desiredPosition"));
        resumes.setCareerGoals(resumeData.get("careerGoals"));

        // 자기소개 & 기타
        resumes.setSelfIntroduction(resumeData.get("selfIntroduction"));
        resumes.setGptResponse(resumeData.getOrDefault("gptResponse", ""));
        resumes.setUserId(userId); // ✅ 인증된 사용자의 실제 id
        resumes.setCreatedAt(LocalDateTime.now());

        System.out.println("🔥 저장 시작!");
        Resume saved = resumeRepository.save(resumes);
        System.out.println("✅ 저장된 ID: " + saved.getId());

        return saved;
    }
}