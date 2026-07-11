package com.example.resumehelper.repository;

import com.example.resumehelper.domain.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    Optional<InterviewFeedback> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}