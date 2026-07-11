package com.example.resumehelper.utils;

import java.io.File;
import java.util.Arrays;
import java.util.Comparator;

public class FileUtils {
    // 최신 생성된 WAV 또는 M4A 파일 찾기
    public static File getLatestAudioFile(String directory) {
        File dir = new File(directory);
        if (!dir.exists() || !dir.isDirectory()) {
            return null;
        }

        return Arrays.stream(dir.listFiles((d, name) -> name.endsWith(".wav") || name.endsWith(".m4a")))
                .max(Comparator.comparingLong(File::lastModified))
                .orElse(null);
    }

    // 최신 생성된 MP4 또는 WebM 파일 찾기 (비디오 파일)
    public static File getLatestVideoFile(String directory) {
        File dir = new File(directory);
        if (!dir.exists() || !dir.isDirectory()) {
            return null;
        }

        return Arrays.stream(dir.listFiles((d, name) -> name.endsWith(".mp4") || name.endsWith(".webm")))
                .max(Comparator.comparingLong(File::lastModified))
                .orElse(null);
    }


}

