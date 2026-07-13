package com.example.resumehelper.controller.audio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.resumehelper.security.CustomUserDetails;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/upload")
public class AudioUploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/audio")
    public ResponseEntity<String> saveSimulationAudio(
            @RequestParam("audio") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails principal  // ✅ 세션에서 로그인된 사용자 확인
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body("❌ 로그인이 필요합니다.");
        }
        Long userId = principal.getId(); // ✅ 클라이언트가 보낸 값이 아니라 서버가 확인한 본인 ID

        System.out.println("🎙️ 음성 파일 업로드 요청: " + file.getOriginalFilename());
        System.out.println("📦 파일 크기: " + file.getSize());
        System.out.println("👤 사용자 ID: " + userId);

        try {
            File uploadFolder = new File(uploadDir);
            if (!uploadFolder.exists() && !uploadFolder.mkdirs()) {
                return ResponseEntity.status(500).body("❌ 업로드 디렉토리 생성 실패");
            }

            String originalFileName = file.getOriginalFilename();
            String sanitizedFileName = sanitizeFileName(originalFileName);
            String webmFileName = System.currentTimeMillis() + "_" + sanitizedFileName;
            Path webmFilePath = Paths.get(uploadDir, webmFileName);
            Files.write(webmFilePath, file.getBytes());

            String wavFileName = webmFileName.replace(".webm", ".wav");
            Path wavFilePath = Paths.get(uploadDir, wavFileName);
            convertWebmToWav(webmFilePath.toString(), wavFilePath.toString());

            saveAudioToDatabase(file, webmFileName, userId);

            System.out.println("✅ WAV 변환 및 DB 저장 완료: " + wavFileName);
            return ResponseEntity.ok("✅ 변환 및 저장 성공: " + wavFileName);

        } catch (IOException e) {
            System.err.println("❌ 파일 처리 실패: " + e.getMessage());
            return ResponseEntity.status(500).body("파일 처리 실패: " + e.getMessage());
        }
    }

    private void saveAudioToDatabase(MultipartFile file, String storedFileName, Long userId) throws IOException {
        String sql = "INSERT INTO audio_files (filename, file_data, content_type, user_id) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                storedFileName,
                file.getBytes(),
                file.getContentType(),
                userId
        );
    }

    private void convertWebmToWav(String inputPath, String outputPath) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", inputPath,
                    "-ac", "1", "-ar", "16000",
                    "-c:a", "pcm_s16le", "-sample_fmt", "s16",
                    "-af", "highpass=f=200, lowpass=f=3000",
                    outputPath
            );
            Process process = pb.start();
            process.waitFor();

            System.out.println("\u2705 WAV 변환 완료 (Whisper 최적화): " + outputPath);

            File webmFile = new File(inputPath);
            if (webmFile.exists() && webmFile.delete()) {
                System.out.println("\uD83D\uDDD1️ WebM 원본 삭제: " + inputPath);
            }
        } catch (Exception e) {
            System.err.println("\u274C WAV 변환 실패: " + e.getMessage());
        }
    }

    private String sanitizeFileName(String originalName) {
        return originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
