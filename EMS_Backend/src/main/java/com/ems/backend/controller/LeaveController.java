package com.ems.backend.controller;

import com.ems.backend.dto.LeaveRequestDto;
import com.ems.backend.dto.LeaveResponse;
import com.ems.backend.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveRequestDto request, Authentication authentication) {
        return ResponseEntity.ok(leaveService.applyLeave(authentication.getName(), request));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<LeaveResponse> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.approveLeave(id));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<LeaveResponse> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.rejectLeave(id));
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/me")
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(Authentication authentication) {
        return ResponseEntity.ok(leaveService.getMyLeaves(authentication.getName()));
    }
}
