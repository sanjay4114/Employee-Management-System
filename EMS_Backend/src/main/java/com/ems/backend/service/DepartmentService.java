package com.ems.backend.service;

import com.ems.backend.dto.DepartmentRequest;
import com.ems.backend.dto.DepartmentResponse;
import com.ems.backend.entity.Department;
import com.ems.backend.entity.User;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final UserService userService;

    public DepartmentResponse create(DepartmentRequest request) {
        Department dep = Department.builder()
                .name(request.getName())
                .location(request.getLocation())
                .build();
        return toResponse(departmentRepository.save(dep));
    }

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DepartmentResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department dep = getEntityById(id);
        dep.setName(request.getName());
        dep.setLocation(request.getLocation());
        return toResponse(departmentRepository.save(dep));
    }

    public void delete(Long id) {
        Department dep = getEntityById(id);
        departmentRepository.delete(dep);
    }

    public Department getEntityById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    public DepartmentResponse getMyDepartment(String username) {
        User user = userService.getByUsername(username);
        if (user.getEmployee() == null || user.getEmployee().getDepartment() == null) {
            throw new ResourceNotFoundException("No department linked for user: " + username);
        }
        return toResponse(user.getEmployee().getDepartment());
    }

    private DepartmentResponse toResponse(Department dep) {
        return DepartmentResponse.builder()
                .id(dep.getId())
                .name(dep.getName())
                .location(dep.getLocation())
                .build();
    }
}
