package com.example.resumehelper.controller.user;

import com.example.resumehelper.domain.User;
import com.example.resumehelper.repository.UserRepository;
import com.example.resumehelper.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MypageController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ 로그인한 "본인" 정보만 수정 가능 (username을 body로 받지 않고 인증정보에서 가져옴)
    @PostMapping("/update-user")
    public ResponseEntity<String> updateUser(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody Map<String, String> request) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            User user = userRepository.findByUsername(principal.getUsername())
                    .orElseThrow();

            String nickname = request.get("nickname");
            if (nickname != null && !nickname.isBlank()) {
                user.setNickname(nickname);
            }

            String newPassword = request.get("password");
            if (newPassword != null && !newPassword.isBlank()) {
                user.setPassword(passwordEncoder.encode(newPassword)); // ✅ 해싱해서 저장
            }

            userRepository.save(user);
            return ResponseEntity.ok("정보 수정 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("정보 수정 실패");
        }
    }

    // ✅ 현재 로그인된 사용자 정보 조회 - 비밀번호(해시값이라도)는 응답에 절대 포함하지 않음
    @GetMapping("/mypage-info")
    public ResponseEntity<Map<String, Object>> getMyPageInfo(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("username", principal.getUsername());
        response.put("nickname", principal.getNickname());
        return ResponseEntity.ok(response);
    }
}
