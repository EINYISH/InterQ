package com.example.resumehelper.controller.gpt;

import com.example.resumehelper.service.GptService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, Object>> generateQuestions(@RequestBody Map<String, String> resumeData) {
        return gptService.generateQuestions(resumeData);
    }
}