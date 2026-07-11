package com.example.resumehelper.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // ✅ 로그인 관련 API 경로
                .allowedOriginPatterns("http://localhost:8080") // ✅ 프론트엔드 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true); // ✅ 세션/쿠키 주고받기 허용
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/favicon.ico");
    }
}