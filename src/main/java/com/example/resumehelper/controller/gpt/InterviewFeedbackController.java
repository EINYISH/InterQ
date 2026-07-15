// InterviewFeedbackController.java
package com.example.resumehelper.controller.gpt;

import com.example.resumehelper.domain.InterviewFeedback;
import com.example.resumehelper.security.CustomUserDetails;
import com.example.resumehelper.service.InterviewFeedbackService;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class InterviewFeedbackController {

    private final InterviewFeedbackService interviewFeedbackService;

    public InterviewFeedbackController(InterviewFeedbackService interviewFeedbackService) {
        this.interviewFeedbackService = interviewFeedbackService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateFeedbackFromDb(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return unauthorized();
        }
        return interviewFeedbackService.generateFeedbackFromDb(principal.getId());
    }

    @PostMapping("/job-competency")
    public ResponseEntity<Map<String, Object>> generateJobCompetency(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return unauthorized();
        }
        return interviewFeedbackService.generateJobCompetency(principal.getId());
    }

    @PostMapping("/generate-direct")
    public ResponseEntity<Map<String, Object>> generateFeedbackDirect(@RequestBody Map<String, String> request) {
        return interviewFeedbackService.generateFeedbackDirect(request.get("text"));
    }

    @PostMapping("/save-all")
    public ResponseEntity<String> saveAllFeedback(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody Map<String, Object> request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        String feedbackText = nullify(request.get("feedbackText"));
        String jobCompetency = nullify(request.get("jobCompetency"));

        interviewFeedbackService.saveAllFeedback(principal.getId(), feedbackText, jobCompetency);

        return ResponseEntity.ok("모든 피드백 저장 완료");
    }

    private String nullify(Object val) {
        return "undefined".equals(val) ? null : (String) val;
    }

    // path variable로 userId를 받지 않고, 로그인한 "본인"의 최신 피드백만 조회
    @GetMapping("/latest")
    public ResponseEntity<InterviewFeedback> getLatestFeedback(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        InterviewFeedback feedback = interviewFeedbackService.getLatestFeedbackByUserId(principal.getId());
        if (feedback != null) {
            return ResponseEntity.ok(feedback);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private ResponseEntity<Map<String, Object>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "로그인이 필요합니다."));
    }
}
