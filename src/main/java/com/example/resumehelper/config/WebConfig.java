package com.example.resumehelper.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CORS 설정은 SecurityConfig의 CorsConfigurationSource로 일원화함
    //    (두 곳에서 따로 설정하면 어느 게 적용되는지 헷갈리고 충돌 위험도 있음)

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/favicon.ico");
    }
}