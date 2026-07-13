// FeedbackRequest.java
package com.example.resumehelper.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long userId;
    private String feedbackText;
    private String jobCompetency;
}