package com.example.resumehelper.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audio_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "transcription", columnDefinition = "LONGTEXT")
    private String transcription;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}