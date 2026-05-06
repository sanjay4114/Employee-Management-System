package com.ems.backend.dto;

import com.ems.backend.entity.EmployeeStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class EmployeeResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private BigDecimal salary;
    private EmployeeStatus status;
    private LocalDate joiningDate;
    private Long departmentId;
    private String departmentName;
}
