package com.example.resumehelper.controller.user;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MypageController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ 사용자 정보 수정
    @PostMapping("/update-user")
    public ResponseEntity<String> updateUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String nickname = request.get("nickname");
        String password = request.get("password");

        try {
            String updateQuery = "UPDATE users SET nickname = ?, password = ? WHERE username = ?";
            jdbcTemplate.update(updateQuery, nickname, password, username);
            return ResponseEntity.ok("정보 수정 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("정보 수정 실패");
        }
    }

    // ✅ 닉네임만 조회 (username 기준)
    @GetMapping("/user-info")
    public ResponseEntity<Map<String, String>> getUserInfo(@RequestParam String username) {
        try {
            String query = "SELECT nickname FROM users WHERE username = ?";
            Map<String, Object> user = jdbcTemplate.queryForMap(query, username);

            Map<String, String> response = new HashMap<>();
            response.put("nickname", (String) user.get("nickname"));
            return ResponseEntity.ok(response);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // ✅ 현재 로그인된 사용자 정보 조회
    @GetMapping("/mypage-info")
    public ResponseEntity<Map<String, Object>> getMyPageInfo(HttpSession session) {
        String loggedInUser = (String) session.getAttribute("loggedInUser");

        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        try {
            String query = "SELECT nickname, password FROM users WHERE username = ?";
            Map<String, Object> user = jdbcTemplate.queryForMap(query, loggedInUser);

            Map<String, Object> response = new HashMap<>();
            response.put("username", loggedInUser);
            response.put("nickname", user.get("nickname"));
            response.put("password", user.get("password"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}