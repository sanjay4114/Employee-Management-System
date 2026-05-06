-- =============================================================================
-- Employee Management System — MySQL schema
-- Run in MySQL Workbench: File → Open SQL Script → execute (lightning bolt)
-- Target: MySQL 8.0+ (uses JSON type; compatible with 5.7+ if you change JSON to TEXT)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS ems_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ems_db;

-- Drop views first (they reference tables)
DROP VIEW IF EXISTS v_leave_requests;
DROP VIEW IF EXISTS v_employee_directory;

-- -----------------------------------------------------------------------------
-- Departments (parent of employees)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE departments (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  manager       VARCHAR(150) NOT NULL DEFAULT '',
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Employees
-- -----------------------------------------------------------------------------
CREATE TABLE employees (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_id   BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(40) NOT NULL DEFAULT '',
  salary          DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status          ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_email (email),
  KEY idx_employees_department (department_id),
  KEY idx_employees_status (status),
  CONSTRAINT fk_employees_department
    FOREIGN KEY (department_id) REFERENCES departments (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Leave requests
-- -----------------------------------------------------------------------------
CREATE TABLE leaves (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id   BIGINT UNSIGNED NOT NULL,
  type          VARCHAR(50) NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_leaves_employee (employee_id),
  KEY idx_leaves_status (status),
  KEY idx_leaves_dates (start_date, end_date),
  CONSTRAINT fk_leaves_employee
    FOREIGN KEY (employee_id) REFERENCES employees (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- App users (login — mirror of localStorage `user`; hash passwords in real apps)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username        VARCHAR(64) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL COMMENT 'Demo: SHA-256 hex; production: bcrypt/argon2',
  display_name    VARCHAR(150) NOT NULL DEFAULT '',
  email           VARCHAR(255) NOT NULL DEFAULT '',
  role            VARCHAR(80) NOT NULL DEFAULT 'Administrator',
  preferences     JSON NULL COMMENT 'e.g. {"compactTables": false}',
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

-- =============================================================================
-- Optional seed data (same shape as the SPA defaults)
-- =============================================================================
INSERT INTO departments (id, name, manager, created_at) VALUES
  (1, 'Engineering', 'John Orion', NOW(3)),
  (2, 'Design', 'Jane Nebula', NOW(3)),
  (3, 'Finance', 'Mike Comet', NOW(3)),
  (4, 'HR', 'Sarah Void', NOW(3));

-- Reset auto-increment after fixed IDs (optional; remove fixed ids if you prefer AUTO only)
ALTER TABLE departments AUTO_INCREMENT = 5;

INSERT INTO employees (id, department_id, name, email, phone, salary, status, created_at) VALUES
  (1, 1, 'John Orion', 'john@stellar.io', '123-456-7890', 95000.00, 'Active', NOW(3)),
  (2, 2, 'Jane Nebula', 'jane@stellar.io', '987-654-3210', 85000.00, 'Active', NOW(3)),
  (3, 3, 'Mike Comet', 'mike@stellar.io', '555-123-4567', 75000.00, 'Active', NOW(3)),
  (4, 4, 'Sarah Void', 'sarah@stellar.io', '444-987-6543', 68000.00, 'Inactive', NOW(3));

ALTER TABLE employees AUTO_INCREMENT = 5;

INSERT INTO leaves (id, employee_id, type, start_date, end_date, status, created_at) VALUES
  (1, 1, 'Vacation', '2026-05-01', '2026-05-05', 'Pending', NOW(3)),
  (2, 2, 'Sick', '2026-05-10', '2026-05-11', 'Approved', NOW(3)),
  (3, 4, 'Personal', '2026-05-15', '2026-05-16', 'Rejected', NOW(3));

ALTER TABLE leaves AUTO_INCREMENT = 4;

-- Demo login: username admin, password Admin123!  (SHA-256 — verify in app/backend the same way)
INSERT INTO users (username, password_hash, display_name, email, role, preferences) VALUES
  ('admin', SHA2('Admin123!', 256), 'Administrator', 'admin@ems.local', 'Administrator', JSON_OBJECT('compactTables', false));

-- =============================================================================
-- Useful views (optional reporting)
-- =============================================================================
DROP VIEW IF EXISTS v_employee_directory;
CREATE VIEW v_employee_directory AS
SELECT
  e.id,
  e.name,
  e.email,
  e.phone,
  e.salary,
  e.status,
  e.created_at,
  d.id   AS department_id,
  d.name AS department_name,
  d.manager AS department_manager
FROM employees e
INNER JOIN departments d ON d.id = e.department_id;

DROP VIEW IF EXISTS v_leave_requests;
CREATE VIEW v_leave_requests AS
SELECT
  l.id,
  l.type,
  l.start_date,
  l.end_date,
  l.status,
  l.created_at,
  e.id   AS employee_id,
  e.name AS employee_name,
  e.email AS employee_email
FROM leaves l
INNER JOIN employees e ON e.id = l.employee_id;
