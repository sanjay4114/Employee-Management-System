package com.ems.backend.dto;

import com.ems.backend.entity.LeaveStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveStatus status;
}
