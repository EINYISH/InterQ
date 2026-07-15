package com.example.resumehelper.controller.audio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.example.resumehelper.security.CustomUserDetails;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/process")
public class AudioProcessingController {

    @Value("${whisper.local-url:http://localhost:8081/inference}")
    private String whisperLocalUrl;

    @Value("${whisper.language:ko}")
    private String whisperLanguage;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/transcribe-from-db")
    public ResponseEntity<Map<String, Object>> transcribeFromDatabase(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "로그인이 필요합니다."));
        }
        Long userId = principal.getId(); // 클라이언트가 보낸 값이 아니라 서버가 확인한 본인 ID

        System.out.println("🔁 [LOG] DB에서 오디오 꺼내 로컬 Whisper(whisper.cpp) 요청 시작: userId=" + userId);

        try {
            // 1. DB에서 파일 데이터 가져오기
            String sql = "SELECT file_data, filename FROM audio_files " +
                    "WHERE user_id = ? AND transcription IS NULL " +
                    "ORDER BY created_at DESC LIMIT 1";
            Map<String, Object> audioRow = jdbcTemplate.queryForMap(sql, userId);

            byte[] fileData = (byte[]) audioRow.get("file_data");
            String originalFileName = (String) audioRow.get("filename");

            // 2. 원본 파일을 임시 저장
            File inputFile = File.createTempFile("input_", "_" + originalFileName);
            Files.write(inputFile.toPath(), fileData);
            System.out.println("📂 [LOG] 파일 저장 완료: " + inputFile.getAbsolutePath());

            // 3. FFmpeg로 wav 포맷으로 변환
            File convertedFile = File.createTempFile("converted_", ".wav");
            ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-y", "-i",
                    inputFile.getAbsolutePath(),
                    convertedFile.getAbsolutePath());
            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor();

            if (!convertedFile.exists() || convertedFile.length() == 0) {
                throw new IllegalStateException("❌ FFmpeg 변환 실패: 파일 생성 안됨");
            }

            System.out.println("[LOG] 변환 완료: " + convertedFile.getAbsolutePath());

            // 4. 로컬 whisper.cpp 서버로 요청 준비 (API 키 불필요, language 명시 필수 - 안 하면 한국어를 못 알아듣고 의성어만 반환함)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(convertedFile));
            body.add("language", whisperLanguage);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(
                    whisperLocalUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            // 5. 텍스트 추출 및 DB 저장
            String transcription = (String) response.getBody().get("text");

            if (transcription == null || transcription.trim().isEmpty()) {
                throw new IllegalStateException("Whisper 응답에 텍스트 없음");
            }

            String updateSql = "UPDATE audio_files SET transcription = ? " +
                    "WHERE filename = ? AND user_id = ? LIMIT 1";
            jdbcTemplate.update(updateSql, transcription, originalFileName, userId);

            System.out.println(" [LOG] Whisper 텍스트 저장 완료: " + transcription);

            // 6. 임시 파일 정리
            inputFile.delete();
            convertedFile.delete();

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            System.err.println(" [LOG] Whisper 변환 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Whisper 변환 실패: " + e.getMessage()));
        }
    }
}