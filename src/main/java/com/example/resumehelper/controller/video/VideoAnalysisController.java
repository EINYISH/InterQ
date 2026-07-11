package com.example.resumehelper.controller.video;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
public class VideoAnalysisController {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/video-analysis")
    public ResponseEntity<Map<String, Object>> analyzeVideo(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());

            // 🔍 최신 비디오 파일 조회
            String sql = "SELECT filename FROM video_files WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1";
            String fileName = jdbcTemplate.queryForObject(sql, String.class, userId);

            if (fileName == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "사용자의 최신 비디오 파일을 찾을 수 없습니다."));
            }

            String videoPath = "videos/compressed/" + fileName;
            File latestVideo = new File(videoPath);
            if (!latestVideo.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "비디오 파일이 존재하지 않습니다: " + videoPath));
            }

            List<File> frames = extractFramesFromVideo(latestVideo);
            if (frames.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "프레임 추출 실패"));
            }

            String gptContent = callGPTVisionAPI(frames);
            Map<String, Object> parsedResult = parseGptResponse(gptContent);

            // ✅ DB 저장
            String insertSql = "INSERT INTO interview_feedback (user_id, eye_tracking, facial_expression, created_at) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(insertSql,
                    userId,
                    parsedResult.get("eyeTracking"),
                    parsedResult.get("facialExpression"),
                    LocalDateTime.now()
            );

            // ✅ 프론트에 필요한 필드만 응답
            return ResponseEntity.ok(parsedResult);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Video 분석 실패: " + e.getMessage()));
        }
    }

    private List<File> extractFramesFromVideo(File videoFile) {
        List<File> frames = new ArrayList<>();
        try {
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            File frameDir = new File("videos/frames/" + timestamp);
            if (!frameDir.exists()) frameDir.mkdirs();

            String framePattern = frameDir.getAbsolutePath() + "/frame_%03d.jpg";
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-i", videoFile.getAbsolutePath(),
                    "-vf", "fps=1/10,scale=256:144", "-q:v", "5", framePattern
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor();

            File[] frameFiles = frameDir.listFiles((dir, name) -> name.endsWith(".jpg"));
            if (frameFiles != null) {
                Arrays.sort(frameFiles, Comparator.comparingLong(File::lastModified));
                for (int i = 0; i < Math.min(1, frameFiles.length); i++) {
                    frames.add(frameFiles[i]);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ [LOG] 프레임 추출 실패: " + e.getMessage());
        }
        return frames;
    }

    private String callGPTVisionAPI(List<File> imageFiles) {
        try {
            List<Map<String, Object>> content = new ArrayList<>();
            content.add(Map.of(
                    "type", "text",
                    "text", "당신은 면접 영상을 분석하는 AI입니다. " +
                            "각 프레임에서 시선 집중도 및 감정 점수를 분석하여 다음 형식의 **텍스트**로만 응답하세요:\n\n" +
                            "시선 집중도: (각 프레임별 집중도 0~100 숫자로만 나열, 쉼표로 구분)\n" +
                            "얼굴 표현 점수:\n" +
                            "- 자신감: (면접자의 전체 영상에서 평균 웃음점수를 0~100 정수 단일값으로 계산)\n" +
                            "- 호감도: (면접자의 전체 영상에서 평균 놀람점수를 0~100 정수 단일값으로 계산)\n" +
                            "- 긴장: (면접자의 전체 영상에서 평균 긴장점수를 0~100 정수 단일값으로 계산)\n" +
                            "- 편안함: (면접자의 전체 영상에서 평균 편안함점수를 0~100 정수 단일값으로 계산)\n" +
                            "- 집중력: (면접자의 전체 영상에서 평균 집중력점수를 0~100 정수 단일값으로 계산)\n" +
                            "다른 설명 없이 반드시 위 형식만 따르세요."
            ));

            for (File img : imageFiles) {
                byte[] imageBytes = Files.readAllBytes(img.toPath());
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                content.add(Map.of(
                        "type", "image_url",
                        "image_url", Map.of(
                                "url", "data:image/jpeg;base64," + base64Image,
                                "detail", "low"
                        )
                ));
            }

            Map<String, Object> requestBody = Map.of(
                    "model", "gpt-4-turbo",
                    "messages", List.of(
                            Map.of("role", "user", "content", content)
                    ),
                    "max_tokens", 1000
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + openaiApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.openai.com/v1/chat/completions",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (!choices.isEmpty() && choices.get(0).containsKey("message")) {
                    return (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private Map<String, Object> parseGptResponse(String content) {
        String[] lines = content.split("\n");

        String eyeTrackingLine = Arrays.stream(lines)
                .filter(l -> l.contains("시선 집중도"))
                .findFirst()
                .orElse("");
        String eyeTracking = extractNumbersAsJsonArray(eyeTrackingLine);

        String facialExpression = Arrays.stream(lines)
                .filter(l -> l.contains("자신감") || l.contains("호감도") || l.contains("긴장") || l.contains("편안함") || l.contains("집중력"))
                .collect(Collectors.joining("\n"));

        return Map.of(
                "eyeTracking", eyeTracking,
                "facialExpression", facialExpression
        );
    }

    private String extractNumbersAsJsonArray(String line) {
        List<String> numbers = Arrays.stream(line.replaceAll("[^0-9,]", "").split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        return "[" + String.join(", ", numbers) + "]";
    }
}