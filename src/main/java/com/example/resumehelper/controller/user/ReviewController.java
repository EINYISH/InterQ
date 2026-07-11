package com.example.resumehelper.controller.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ 리뷰 전체 목록 조회
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getReviews() {
        String query = "SELECT id, author, text, rating, created_at, is_private FROM reviews ORDER BY created_at DESC";
        List<Map<String, Object>> reviews = jdbcTemplate.queryForList(query);
        return ResponseEntity.ok(reviews);
    }

    // ✅ 리뷰 작성
    @PostMapping
    public ResponseEntity<String> addReview(@RequestBody Map<String, Object> payload) {
        String author = (String) payload.get("author");
        String text = (String) payload.get("text");
        int rating = (int) payload.get("rating");
        boolean isPrivate = (boolean) payload.get("is_private");
        String password = isPrivate ? (String) payload.get("password") : null;

        if (isPrivate && (password == null || password.length() != 4)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비공개 리뷰는 4자리 비밀번호가 필요합니다.");
        }

        String sql = "INSERT INTO reviews (author, text, rating, is_private, password) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, author, text, rating, isPrivate, password);

        return ResponseEntity.ok("리뷰가 성공적으로 추가되었습니다.");
    }

    // ✅ 비공개 리뷰 조회
    @PostMapping("/private")
    public ResponseEntity<Map<String, Object>> getPrivateReview(@RequestBody Map<String, Object> payload) {
        int reviewId = (int) payload.get("review_id");
        String inputPassword = (String) payload.get("password");

        try {
            String sql = "SELECT * FROM reviews WHERE id = ? AND is_private = TRUE";
            Map<String, Object> review = jdbcTemplate.queryForMap(sql, reviewId);

            if (review != null && review.get("password").equals(inputPassword)) {
                review.remove("password"); // 비밀번호 클라이언트에 노출 안 되게 제거
                return ResponseEntity.ok(review);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
