package com.example.resumehelper.domain;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    @JsonProperty("userId")
    private Long userId;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    @JsonProperty("feedbackText")
    private String feedbackText;

    @Column(name = "job_competency", columnDefinition = "TEXT")
    @JsonProperty("jobCompetency")
    private String jobCompetency;

    @Column(name = "created_at")
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
}