package com.example.resumehelper.repository;

import com.example.resumehelper.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, Long> {}