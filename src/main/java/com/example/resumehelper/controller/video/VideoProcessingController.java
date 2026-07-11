package com.example.resumehelper.controller.video;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/videos")
public class VideoProcessingController {

    private static final String VIDEO_UPLOAD_DIR = "videos/";
    private static final String COMPRESSED_VIDEO_DIR = "videos/compressed/";

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadVideo(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam("userId") Long userId
    ) {
        System.out.println("🚀 STEP 0 - 업로드 진입 성공");

        try {
            System.out.println("👤 사용자 ID: " + userId);
            System.out.println("📦 파일 크기: " + videoFile.getSize());

            if (videoFile.getSize() == 0) {
                System.err.println("❌ 비디오 파일이 비어 있습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ 비디오 파일이 비어 있습니다.");
            }

            File uploadDir = new File(VIDEO_UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            File compressedDir = new File(COMPRESSED_VIDEO_DIR);
            if (!compressedDir.exists()) compressedDir.mkdirs();

            String originalFileName = videoFile.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                originalFileName = "simulation_" + System.currentTimeMillis() + ".webm";
            }

            String originalFilePath = VIDEO_UPLOAD_DIR + originalFileName;
            File originalFile = new File(originalFilePath);

            System.out.println("💾 STEP 1 - 원본 파일 저장 시작");
            try (FileOutputStream fos = new FileOutputStream(originalFile)) {
                fos.write(videoFile.getBytes());
                fos.flush();
            }
            System.out.println("✅ STEP 1 - 원본 파일 저장 완료");

            String compressedFilePath = COMPRESSED_VIDEO_DIR + originalFileName.replace(".webm", ".mp4");
            System.out.println("🎬 STEP 2 - FFmpeg 압축 시작");
            compressVideo(originalFilePath, compressedFilePath);
            System.out.println("✅ STEP 2 - FFmpeg 압축 완료");

            if (originalFile.exists()) {
                boolean deleted = originalFile.delete();
                System.out.println("🗑️ STEP 3 - 원본 삭제 완료 여부: " + deleted);
            }

            System.out.println("💽 STEP 4 - DB 저장 시도");
            saveVideoToDatabase(compressedFilePath, userId);
            System.out.println("✅ STEP 4 - DB 저장 완료");

            return ResponseEntity.ok("✅ 비디오 업로드 및 변환 완료: " + compressedFilePath);

        } catch (Exception e) {
            System.err.println("❌ [ERROR] 예외 발생: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ 업로드 실패: " + e.getMessage());
        }
    }

    private void compressVideo(String inputPath, String outputPath) {
        try {
            System.out.println("🛠 STEP 2 - FFmpeg 압축 시작 전, 입력 경로: " + inputPath + ", 출력 경로: " + outputPath);

            ProcessBuilder builder = new ProcessBuilder(
                    "ffmpeg", "-i", inputPath,
                    "-vcodec", "libx264", "-crf", "35", "-preset", "ultrafast",
                    "-b:v", "600k", "-maxrate", "800k", "-bufsize", "1200k",
                    "-vf", "scale=-2:720", "-an", "-movflags", "+faststart",
                    "-threads", "4", outputPath
            );
            builder.redirectErrorStream(true);
            Process process = builder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                System.err.println("❌ FFmpeg 압축 실패. exitCode: " + exitCode);
                throw new RuntimeException("FFmpeg 압축 실패. exitCode: " + exitCode);
            }
        } catch (Exception e) {
            System.err.println("❌ FFmpeg 실행 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("FFmpeg 실행 중 오류 발생: " + e.getMessage(), e);
        }
    }

    private void saveVideoToDatabase(String path, Long userId) throws IOException {
        File file = new File(path);
        String fileName = file.getName();
        byte[] videoBytes = java.nio.file.Files.readAllBytes(file.toPath());

        System.out.println("📤 저장할 파일명: " + fileName + ", 바이트 크기: " + videoBytes.length);

        String sql = "INSERT INTO video_files (filename, file_data, user_id) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, fileName, videoBytes, userId);
    }
}