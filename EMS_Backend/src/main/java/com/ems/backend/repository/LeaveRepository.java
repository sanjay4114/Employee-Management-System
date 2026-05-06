package com.ems.backend.repository;

import com.ems.backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    java.util.List<Leave> findByEmployeeId(Long employeeId);
}
