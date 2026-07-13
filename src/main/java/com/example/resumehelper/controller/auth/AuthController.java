package com.example.resumehelper.controller.auth;

import com.example.resumehelper.domain.User;
import com.example.resumehelper.repository.UserRepository;
import com.example.resumehelper.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
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

    // 로그인 성공 시 SecurityContext를 HttpSession에 표준 방식으로 저장해주는 저장소
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    // ✅ 회원가입 처리 - 비밀번호를 BCrypt로 해싱해서 저장
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
        user.setPassword(passwordEncoder.encode(password)); // ✅ 평문 저장 금지, 해시만 저장
        user.setNickname(nickname);
        userRepository.save(user);

        return ResponseEntity.ok("회원가입 성공!");
    }

    // ✅ 로그인 API - AuthenticationManager에게 검증을 위임 (직접 비밀번호 비교하지 않음)
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        Map<String, Object> body = new HashMap<>();

        try {
            Authentication authRequest = new UsernamePasswordAuthenticationToken(
                    loginRequest.get("username"), loginRequest.get("password"));
            Authentication authResult = authenticationManager.authenticate(authRequest);

            // ✅ 인증 성공 → SecurityContext에 담아서 세션에 저장
            //    이후 요청부터는 Spring Security가 이 세션을 보고 "로그인된 사용자"임을 인식한다
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authResult);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            CustomUserDetails principal = (CustomUserDetails) authResult.getPrincipal();
            body.put("message", "로그인 성공");
            body.put("userId", principal.getId());
            body.put("nickname", principal.getNickname());
            return ResponseEntity.ok(body);

        } catch (BadCredentialsException e) {
            // AuthenticationManager는 "아이디가 없는 경우"와 "비밀번호가 틀린 경우"를
            // 일부러 구분해주지 않는다 (구분해주면 공격자가 아이디 존재 여부를 유추할 수 있음)
            body.put("message", "아이디 또는 비밀번호가 틀렸습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
    }

    // ✅ 로그아웃 - SecurityContext와 세션을 모두 정리
    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        request.getSession().invalidate();
        return ResponseEntity.ok().build();
    }

    // ✅ 로그인 상태 확인 - 클라이언트가 보낸 값이 아니라 SecurityContext에서 신원을 가져옴
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
}
