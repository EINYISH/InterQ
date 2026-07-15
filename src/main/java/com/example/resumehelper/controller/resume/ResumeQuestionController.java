package com.example.resumehelper.controller.resume;

import com.example.resumehelper.domain.Resume;
import com.example.resumehelper.repository.ResumeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeQuestionController {

    private final ResumeRepository resumeRepository;

    public ResumeQuestionController(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    // 이력서 ID로 GPT 질문 리스트 반환
    @GetMapping("/{id}/questions")
    public ResponseEntity<List<String>> getGptQuestions(@PathVariable Long id) {
        try {
            Resume resume = resumeRepository.findById(id).orElseThrow();
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> questions = objectMapper.readValue(resume.getGptResponse(), List.class);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
