package com.example.resumehelper.config;

import com.example.resumehelper.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

/**
 * Spring Security의 진입점.
 *
 * - PasswordEncoder: 회원가입/로그인 시 비밀번호 해싱·검증에 사용
 * - AuthenticationManager: AuthController가 로그인 검증을 위임하는 대상
 * - SecurityFilterChain: 어떤 URL이 로그인 없이 접근 가능한지(permitAll),
 *   어떤 URL이 로그인을 요구하는지(authenticated) 정의
 *
 * 이 프로젝트는 SSR(Thymeleaf) 화면 + JSON API가 섞여 있어서:
 * - 화면(View) 라우트는 그대로 열어두고
 * - 실제 개인 데이터를 다루는 API(/api/upload, /api/videos, /api/feedback 등)만 인증을 요구한다.
 *
 * 로그인 방식은 Spring Security의 기본 formLogin(로그인 페이지로 리다이렉트)이 아니라,
 * 기존 프론트가 기대하는 JSON 응답 방식을 유지하기 위해 AuthController에서 수동으로 처리한다.
 * 그래서 formLogin/httpBasic은 꺼두고, 인증 실패 시에도 리다이렉트 대신 401을 반환하도록 설정했다.
 */
@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // JSON API + 세션 쿠키 조합이라 CSRF는 우선 비활성화 (프론트가 SPA로 전환되면 재검토 필요)
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 정적 리소스
                        .requestMatchers(
                                "/css/**", "/js/**", "/images/**", "/favicon.ico",
                                "/header.html", "/session-test.html"
                        ).permitAll()
                        // 화면(View) 라우트 - 실제 보호는 그 안의 API 호출 단에서 이루어짐
                        .requestMatchers(
                                "/", "/index", "/login", "/signup", "/signup-success",
                                "/notice", "/loading", "/upload", "/simulation", "/feedback",
                                "/settings", "/mypersonal", "/review-board", "/write-review"
                        ).permitAll()
                        // 로그인 없이 호출 가능한 API
                        .requestMatchers(
                                "/api/signup", "/api/login", "/api/session-info", "/api/logout",
                                "/api/reviews/**"
                        ).permitAll()
                        // 그 외 개인 데이터를 다루는 API는 전부 로그인 필요
                        .anyRequest().authenticated()
                )
                // 로그인 없이 보호된 API를 호출하면 로그인 페이지로 리다이렉트하는 대신 401 JSON을 반환
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                );

        return http.build();
    }
}
