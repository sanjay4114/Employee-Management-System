package com.ems.backend.dto;

import com.ems.backend.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private Role role;
    private Long employeeId;
    private Long departmentId;
}
