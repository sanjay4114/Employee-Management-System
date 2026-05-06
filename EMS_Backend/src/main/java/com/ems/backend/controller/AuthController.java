package com.ems.backend.controller;

import com.ems.backend.dto.AuthRequest;
import com.ems.backend.dto.AuthResponse;
import com.ems.backend.dto.RegisterRequest;
import com.ems.backend.dto.UpdateCredentialsRequest;
import com.ems.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/employees/{employeeId}/username")
    public ResponseEntity<String> getUsernameByEmployeeId(@PathVariable Long employeeId) {
        return ResponseEntity.ok(authService.getUsernameByEmployeeId(employeeId));
    }

    @PutMapping("/employees/{employeeId}/credentials")
    public ResponseEntity<AuthResponse> updateCredentials(
            @PathVariable Long employeeId,
            @Valid @RequestBody UpdateCredentialsRequest request
    ) {
        return ResponseEntity.ok(authService.updateCredentials(employeeId, request));
    }
}
