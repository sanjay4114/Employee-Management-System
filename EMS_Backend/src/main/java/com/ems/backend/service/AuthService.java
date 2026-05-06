package com.ems.backend.service;

import com.ems.backend.dto.AuthRequest;
import com.ems.backend.dto.AuthResponse;
import com.ems.backend.dto.RegisterRequest;
import com.ems.backend.dto.UpdateCredentialsRequest;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.Role;
import com.ems.backend.entity.User;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.EmployeeRepository;
import com.ems.backend.repository.UserRepository;
import com.ems.backend.security.CustomUserDetailsService;
import com.ems.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        Employee linkedEmployee = null;
        if (request.getRole() == Role.EMPLOYEE) {
            if (request.getEmployeeId() == null) {
                throw new IllegalArgumentException("employeeId is required for EMPLOYEE role");
            }
            linkedEmployee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.getEmployeeId()));
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .employee(linkedEmployee)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getUsername()));
        return toAuthResponse(user, token);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getUsername()));
        return toAuthResponse(user, token);
    }

    public String getUsernameByEmployeeId(Long employeeId) {
        return userRepository.findByEmployeeId(employeeId)
                .map(User::getUsername)
                .orElse("");
    }

    public AuthResponse updateCredentials(Long employeeId, UpdateCredentialsRequest request) {
        User user = userRepository.findByEmployeeId(employeeId).orElse(null);

        if (user == null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            user = User.builder()
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.EMPLOYEE)
                    .employee(employee)
                    .build();
        } else {
            if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        return toAuthResponse(user, null);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .employeeId(user.getEmployee() != null ? user.getEmployee().getId() : null)
                .departmentId(
                        user.getEmployee() != null && user.getEmployee().getDepartment() != null
                                ? user.getEmployee().getDepartment().getId()
                                : null
                )
                .build();
    }
}
