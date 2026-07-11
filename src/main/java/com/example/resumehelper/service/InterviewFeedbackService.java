package com.example.resumehelper.service;

import com.example.resumehelper.client.GptApiClient;
import com.example.resumehelper.config.FeedbackPrompt;
import com.example.resumehelper.domain.AudioFile;
import com.example.resumehelper.domain.InterviewFeedback;
import com.example.resumehelper.repository.AudioFileRepository;
import com.example.resumehelper.repository.InterviewFeedbackRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class InterviewFeedbackService {

    private final InterviewFeedbackRepository feedbackRepository;
    private final AudioFileRepository audioFileRepository;
    private final GptApiClient gptApiClient;

    public InterviewFeedbackService(
            InterviewFeedbackRepository feedbackRepository,
            AudioFileRepository audioFileRepository,
            GptApiClient gptApiClient
    ) {
        this.feedbackRepository = feedbackRepository;
        this.audioFileRepository = audioFileRepository;
        this.gptApiClient = gptApiClient;
    }

    // 1. GPT 피드백 생성
    public ResponseEntity<Map<String, Object>> generateFeedbackFromDb(Long userId) {
        try {
            Optional<AudioFile> optionalAudio = audioFileRepository
                    .findTopByUserIdAndTranscriptionIsNotNullOrderByCreatedAtDesc(userId);

            if (optionalAudio.isEmpty() || optionalAudio.get().getTranscription().trim().isEmpty()) {
                return error("분석할 텍스트가 없습니다.");
            }

            String content = gptApiClient.send(FeedbackPrompt.SYSTEM_PROMPT, optionalAudio.get().getTranscription());
            return ResponseEntity.ok(Map.of("response", content));

        } catch (Exception e) {
            return error("GPT 피드백 생성 실패: " + e.getMessage());
        }
    }

    // 2. 직무 역량 분석
    public ResponseEntity<Map<String, Object>> generateJobCompetency(Long userId) {
        try {
            Optional<AudioFile> optionalAudio = audioFileRepository
                    .findTopByUserIdAndTranscriptionIsNotNullOrderByCreatedAtDesc(userId);

            if (optionalAudio.isEmpty() || optionalAudio.get().getTranscription().trim().isEmpty()) {
                return error("분석할 텍스트가 없습니다.");
            }

            String content = gptApiClient.send(FeedbackPrompt.JOB_PROMPT, optionalAudio.get().getTranscription());
            return ResponseEntity.ok(Map.of("response", content));

        } catch (Exception e) {
            return error("직무 역량 분석 실패: " + e.getMessage());
        }
    }

    // 3. 톤 분석
    public ResponseEntity<Map<String, Object>> generateToneAnalysis(Long userId) {
        try {
            Optional<AudioFile> optionalAudio = audioFileRepository
                    .findTopByUserIdAndTranscriptionIsNotNullOrderByCreatedAtDesc(userId);

            if (optionalAudio.isEmpty() || optionalAudio.get().getTranscription().trim().isEmpty()) {
                return error("분석할 텍스트가 없습니다.");
            }

            String content = gptApiClient.send(FeedbackPrompt.TONE_PROMPT, optionalAudio.get().getTranscription());
            return ResponseEntity.ok(Map.of("response", content));

        } catch (Exception e) {
            return error("톤 분석 실패: " + e.getMessage());
        }
    }

    // 4. 직접 텍스트 입력해서 피드백 생성
    public ResponseEntity<Map<String, Object>> generateFeedbackDirect(String text) {
        try {
            if (text == null || text.trim().isEmpty()) {
                return error("입력된 텍스트가 없습니다.");
            }

            String content = gptApiClient.send(FeedbackPrompt.SYSTEM_PROMPT, text);
            return ResponseEntity.ok(Map.of("response", content));

        } catch (Exception e) {
            return error("GPT 직접 피드백 생성 실패: " + e.getMessage());
        }
    }

    // 5. 최신 인터뷰 피드백 가져오기
    public InterviewFeedback getLatestFeedbackByUserId(Long userId) {
        return feedbackRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);
    }

    // 6. 피드백 저장
    public void saveAllFeedback(Long userId, String feedbackText, String jobCompetency, String toneAnalysis) {
        InterviewFeedback latest = feedbackRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        if (latest != null) {
            latest.setFeedbackText(feedbackText);
            latest.setJobCompetency(jobCompetency);
            latest.setToneAnalysis(toneAnalysis);

            feedbackRepository.save(latest); //
        }
    }

    private ResponseEntity<Map<String, Object>> error(String message) {
        System.err.println("❌ [ERROR] " + message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Collections.singletonMap("error", message));
    }
}