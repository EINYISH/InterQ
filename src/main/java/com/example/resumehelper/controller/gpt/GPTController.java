package com.example.resumehelper.controller.gpt;

import com.example.resumehelper.security.CustomUserDetails;
import com.example.resumehelper.service.GptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class GPTController {

    private final GptService gptService;

    public GPTController(GptService gptService) {
        this.gptService = gptService;
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<Map<String, Object>> generateQuestions(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody Map<String, String> resumeData) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요합니다."));
        }
        return gptService.generateQuestions(resumeData, principal.getId());
    }
}
