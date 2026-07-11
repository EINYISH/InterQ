package com.example.resumehelper.repository;

import com.example.resumehelper.domain.AudioFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {
    Optional<AudioFile> findTopByUserIdAndTranscriptionIsNotNullOrderByCreatedAtDesc(Long userId);
}