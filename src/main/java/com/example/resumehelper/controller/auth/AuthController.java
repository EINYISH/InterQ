package com.example.resumehelper.controller.auth;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;


    // 회원가입 처리
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Map<String, String> signupRequest) {
        String username = signupRequest.get("username");
        String password = signupRequest.get("password");
        String nickname = signupRequest.get("nickname");

        try {
            String query = "SELECT COUNT(*) FROM users WHERE username = ?";
            Integer count = jdbcTemplate.queryForObject(query, new Object[]{username}, Integer.class);

            if (count != null && count > 0) {
                return ResponseEntity.badRequest().body("이미 존재하는 아이디입니다.");
            }

            String insertQuery = "INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)";
            jdbcTemplate.update(insertQuery, username, password, nickname);

            return ResponseEntity.ok("회원가입 성공!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("회원가입 중 오류 발생: " + e.getMessage());
        }
    }


    // ✅ 로그인 API (세션 기반, JSON 요청 지원)
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> loginRequest,
            HttpSession session) {

        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        Map<String, String> response = new HashMap<>();

        try {
            String query = "SELECT password FROM users WHERE username = ?";
            String storedPassword = jdbcTemplate.queryForObject(query, String.class, username);

            if (storedPassword != null && storedPassword.equals(password)) {
                session.setAttribute("loggedInUser", username);
                response.put("message", "로그인 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "아이디 또는 비밀번호가 틀렸습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (EmptyResultDataAccessException e) {
            response.put("message", "존재하지 않는 사용자입니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // ✅ 로그아웃 API (세션 제거)
    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    // ✅ 로그인 상태 확인 API
    @GetMapping("/session-info")
    public ResponseEntity<Map<String, String>> sessionInfo(HttpSession session) {
        Map<String, String> response = new HashMap<>();
        String username = (String) session.getAttribute("loggedInUser");

        if (username != null) {
            String query = "SELECT nickname FROM users WHERE username = ?";
            try{
                String nickname = jdbcTemplate.queryForObject(query, String.class, username);

                response.put("username", username);
                response.put(("nickname"), nickname);
                return ResponseEntity.ok(response);
            }catch (EmptyResultDataAccessException e){
                response.put("username", username);
                response.put("nickname", "");
                return ResponseEntity.ok(response);
            }

        } else {
            response.put("message", "로그인하지 않은 상태");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}

