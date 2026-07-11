// InterviewFeedbackController.java
package com.example.resumehelper.controller.gpt;

import com.example.resumehelper.domain.InterviewFeedback;
import com.example.resumehelper.service.InterviewFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class InterviewFeedbackController {

    private final InterviewFeedbackService interviewFeedbackService;

    public InterviewFeedbackController(InterviewFeedbackService interviewFeedbackService) {
        this.interviewFeedbackService = interviewFeedbackService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateFeedbackFromDb(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        return interviewFeedbackService.generateFeedbackFromDb(userId);
    }

    @PostMapping("/job-competency")
    public ResponseEntity<Map<String, Object>> generateJobCompetency(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        return interviewFeedbackService.generateJobCompetency(userId);
    }

    @PostMapping("/tone-analysis")
    public ResponseEntity<Map<String, Object>> generateToneAnalysis(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        return interviewFeedbackService.generateToneAnalysis(userId);
    }

    @PostMapping("/generate-direct")
    public ResponseEntity<Map<String, Object>> generateFeedbackDirect(@RequestBody Map<String, String> request) {
        return interviewFeedbackService.generateFeedbackDirect(request.get("text"));
    }

    @PostMapping("/save-all")
    public ResponseEntity<String> saveAllFeedback(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());

        String feedbackText = nullify(request.get("feedbackText"));
        String jobCompetency = nullify(request.get("jobCompetency"));
        String toneAnalysis = nullify(request.get("toneAnalysis"));

        interviewFeedbackService.saveAllFeedback(userId, feedbackText, jobCompetency, toneAnalysis);

        return ResponseEntity.ok("모든 피드백 저장 완료");
    }

    private String nullify(Object val) {
        return "undefined".equals(val) ? null : (String) val;
    }

    @GetMapping("/latest/{userId}")
    public ResponseEntity<InterviewFeedback> getLatestFeedback(@PathVariable Long userId) {
        InterviewFeedback feedback = interviewFeedbackService.getLatestFeedbackByUserId(userId);
        if (feedback != null) {
            return ResponseEntity.ok(feedback);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}