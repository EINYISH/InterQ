package com.example.resumehelper.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 기본 정보
    private String name;
    private String birthday;
    private String contactInformation;

    // 학력
    private String educationLevel;
    private String major;
    private String university;
    private String graduationDate;

    // 경력
    @Column(columnDefinition = "TEXT")
    private String workExperience;
    @Column(columnDefinition = "TEXT")
    private String jobRoles;
    @Column(columnDefinition = "TEXT")
    private String projects;

    // 역량
    @Column(columnDefinition = "TEXT")
    private String technicalSkills;
    @Column(columnDefinition = "TEXT")
    private String certifications;
    @Column(columnDefinition = "TEXT")
    private String languageProficiency;

    // 목표/희망
    private String desiredField;
    private String desiredPosition;
    @Column(columnDefinition = "TEXT")
    private String careerGoals;

    // 자기소개
    @Column(columnDefinition = "TEXT")
    private String selfIntroduction;

    // GPT 분석 결과
    @Column(columnDefinition = "TEXT")
    private String gptResponse;

    private Long userId;

    private LocalDateTime createdAt = LocalDateTime.now();
}