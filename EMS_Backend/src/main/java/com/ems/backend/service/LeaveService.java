package com.ems.backend.service;

import com.ems.backend.dto.LeaveRequestDto;
import com.ems.backend.dto.LeaveResponse;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.Leave;
import com.ems.backend.entity.LeaveStatus;
import com.ems.backend.entity.Role;
import com.ems.backend.entity.User;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRepository leaveRepository;
    private final EmployeeService employeeService;
    private final UserService userService;

    public LeaveResponse applyLeave(String username, LeaveRequestDto request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        User user = userService.getByUsername(username);
        Employee employee;
        if (user.getRole() == Role.EMPLOYEE) {
            if (user.getEmployee() == null) {
                throw new IllegalArgumentException("Employee account is not linked to an employee record");
            }
            employee = user.getEmployee();
        } else {
            if (request.getEmployeeId() == null) {
                throw new IllegalArgumentException("employeeId is required when admin applies leave");
            }
            employee = employeeService.getEntityById(request.getEmployeeId());
        }
        Leave leave = Leave.builder()
                .employee(employee)
                .type(request.getType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(LeaveStatus.PENDING)
                .build();
        return toResponse(leaveRepository.save(leave));
    }

    public LeaveResponse approveLeave(Long id) {
        Leave leave = getEntityById(id);
        leave.setStatus(LeaveStatus.APPROVED);
        return toResponse(leaveRepository.save(leave));
    }

    public LeaveResponse rejectLeave(Long id) {
        Leave leave = getEntityById(id);
        leave.setStatus(LeaveStatus.REJECTED);
        return toResponse(leaveRepository.save(leave));
    }

    public List<LeaveResponse> getAllLeaves() {
        return leaveRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<LeaveResponse> getMyLeaves(String username) {
        User user = userService.getByUsername(username);
        if (user.getEmployee() == null) {
            return List.of();
        }
        return leaveRepository.findByEmployeeId(user.getEmployee().getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private Leave getEntityById(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
    }

    private LeaveResponse toResponse(Leave leave) {
        return LeaveResponse.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployee().getId())
                .employeeName(leave.getEmployee().getName())
                .type(leave.getType())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .status(leave.getStatus())
                .build();
    }
}
