package com.example.resumehelper.controller.resume;

import com.example.resumehelper.domain.Resume;
import com.example.resumehelper.repository.ResumeRepository;
import com.example.resumehelper.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeApiController {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ResumeService resumeService;

    // ✅ 전체 이력서 조회
    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes() {
        List<Resume> resumes = resumeRepository.findAll();
        return ResponseEntity.ok(resumes);
    }

    // ✅ 이력서 저장
    @PostMapping
    public ResponseEntity<Resume> saveResume(@RequestBody Map<String, String> resumeData) {
        System.out.println("📥 저장 요청 데이터: " + resumeData);
        Resume savedResume = resumeService.saveResume(resumeData);
        System.out.println("✅ 저장 완료: " + savedResume.getId());
        return ResponseEntity.ok(savedResume);
    }

    // ✅ 질문 처리 (업로드 후)
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> handleQuestions(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("Request Body: " + requestBody);
            List<String> userQuestions = (List<String>) requestBody.get("userQuestions");
            if (userQuestions == null || userQuestions.isEmpty()) {
                throw new IllegalArgumentException("userQuestions is missing or empty.");
            }
            System.out.println("Received Questions: " + userQuestions);
            response.put("gptQuestions", userQuestions);
            response.put("message", "질문이 성공적으로 처리되었습니다!");
        } catch (Exception e) {
            System.err.println("Error during question processing: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "질문 처리 중 오류가 발생했습니다. 이유: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}