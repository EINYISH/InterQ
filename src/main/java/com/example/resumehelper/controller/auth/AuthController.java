package com.example.resumehelper.controller.auth;

import com.example.resumehelper.domain.User;
import com.example.resumehelper.repository.UserRepository;
import com.example.resumehelper.security.CustomUserDetails;
import com.example.resumehelper.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    //  회원가입 - 비밀번호를 BCrypt로 해싱해서 저장 (세션 방식과 동일)
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Map<String, String> signupRequest) {
        String username = signupRequest.get("username");
        String password = signupRequest.get("password");
        String nickname = signupRequest.get("nickname");

        if (username == null || password == null || nickname == null
                || username.isBlank() || password.isBlank() || nickname.isBlank()) {
            return ResponseEntity.badRequest().body("아이디/비밀번호/닉네임을 모두 입력해주세요.");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 아이디입니다.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setNickname(nickname);
        userRepository.save(user);

        return ResponseEntity.ok("회원가입 성공!");
    }

    // 로그인 - 세션에 저장하는 대신 JWT를 발급해서 클라이언트에게 돌려준다
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        Map<String, Object> body = new HashMap<>();

        try {
            Authentication authRequest = new UsernamePasswordAuthenticationToken(
                    loginRequest.get("username"), loginRequest.get("password"));
            Authentication authResult = authenticationManager.authenticate(authRequest);

            CustomUserDetails principal = (CustomUserDetails) authResult.getPrincipal();
            String token = jwtUtil.generateToken(principal.getUsername());

            body.put("token", token); // 클라이언트는 이걸 저장해뒀다가 이후 요청마다 Authorization 헤더에 실어 보냄
            body.put("userId", principal.getId());
            body.put("nickname", principal.getNickname());
            return ResponseEntity.ok(body);

        } catch (BadCredentialsException e) {
            body.put("message", "아이디 또는 비밀번호가 틀렸습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
    }

    // 로그인 상태 확인 (JWT가 유효하면 principal이 채워져 있음)
    @GetMapping("/session-info")
    public ResponseEntity<Map<String, String>> sessionInfo(@AuthenticationPrincipal CustomUserDetails principal) {
        Map<String, String> response = new HashMap<>();

        if (principal == null) {
            response.put("message", "로그인하지 않은 상태");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("username", principal.getUsername());
        response.put("nickname", principal.getNickname());
        return ResponseEntity.ok(response);
    }

    // 로그아웃 - stateless라 서버가 지울 세션이 없다. 클라이언트가 저장해둔 토큰을 지우는 게 로그아웃의 전부.
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}
