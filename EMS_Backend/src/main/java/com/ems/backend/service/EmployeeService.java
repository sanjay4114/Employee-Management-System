package com.ems.backend.service;

import com.ems.backend.dto.EmployeeRequest;
import com.ems.backend.dto.EmployeeResponse;
import com.ems.backend.entity.Department;
import com.ems.backend.entity.Employee;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentService departmentService;

    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        Department dep = departmentService.getEntityById(request.getDepartmentId());
        Employee employee = Employee.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .salary(request.getSalary())
                .status(request.getStatus())
                .joiningDate(request.getJoiningDate())
                .department(dep)
                .build();
        return toResponse(employeeRepository.save(employee));
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(getEntityById(id));
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = getEntityById(id);
        Department dep = departmentService.getEntityById(request.getDepartmentId());
        if (!employee.getEmail().equalsIgnoreCase(request.getEmail()) &&
                employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setSalary(request.getSalary());
        employee.setStatus(request.getStatus());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setDepartment(dep);
        return toResponse(employeeRepository.save(employee));
    }

    public void deleteEmployee(Long id) {
        employeeRepository.delete(getEntityById(id));
    }

    public Employee getEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .salary(employee.getSalary())
                .status(employee.getStatus())
                .joiningDate(employee.getJoiningDate())
                .departmentId(employee.getDepartment().getId())
                .departmentName(employee.getDepartment().getName())
                .build();
    }
}
