package com.example.resumehelper.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * 로컬 Ollama(Gemma) 서버를 호출하는 클라이언트.
 *
 * Ollama는 OpenAI와 동일한 /v1/chat/completions 스펙을 지원해서
 * 기존 OpenAI 연동 코드의 요청/응답 구조(messages, choices[0].message.content)를
 * 거의 그대로 재사용할 수 있다. 바뀐 건 주소와 인증 방식뿐이다.
 * (로컬 서버라 API 키 자체가 필요 없음)
 */
@Component
public class GptApiClient {

    @Value("${llm.base-url:http://localhost:11434/v1/chat/completions}")
    private String baseUrl;

    @Value("${llm.model:gemma3:4b}")
    private String model;

    private WebClient webClient;

    private WebClient client() {
        if (webClient == null) {
            webClient = WebClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();
        }
        return webClient;
    }

    public String send(String systemPrompt, String userPrompt) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "max_tokens", 1000
        );

        try {
            Map<String, Object> response = client().post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, String> message = (Map<String, String>) choices.get(0).get("message");
            return message.get("content");

        } catch (Exception e) {
            throw new RuntimeException("로컬 LLM(Gemma) 호출 실패: " + e.getMessage()
                    + " - Ollama가 " + baseUrl + " 에서 실행 중인지 확인하세요.", e);
        }
    }
}
