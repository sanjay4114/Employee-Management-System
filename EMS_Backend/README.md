# Employee Management System Backend (Spring Boot)

This folder contains a complete Spring Boot backend for the Employee Management System frontend.

## Tech Stack

- Java 17
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- Spring Security + JWT
- MySQL
- Lombok
- Jakarta Validation
- DevTools

## Package Structure

Base package: `com.ems.backend`

- `controller`
- `service`
- `repository`
- `entity`
- `dto`
- `security`
- `config`
- `exception`

## 1) Open in Eclipse

1. Open Eclipse
2. Go to **File -> Import -> Existing Maven Project**
3. Select the `backend` folder
4. Finish import and wait for Maven dependencies to download

## 2) Configure MySQL

1. Open MySQL Workbench
2. Create DB (if not exists):

```sql
CREATE DATABASE ems_db;
```

3. Update credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

## 3) Run Project

In Eclipse:

- Right click `BackendApplication` -> **Run As -> Spring Boot App**

Default URL:

- `http://localhost:8080`

## 4) Security / Authentication

### Register

- `POST /api/auth/register`

Body:

```json
{
  "username": "admin2",
  "password": "Admin123!",
  "role": "ADMIN"
}
```

### Login

- `POST /api/auth/login`

Body:

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

Response includes JWT:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

Use token in Postman headers:

```text
Authorization: Bearer <token>
```

## 5) API Endpoints

## Employees

- `POST /api/employees`
- `GET /api/employees`
- `GET /api/employees/{id}`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}`

Sample create payload:

```json
{
  "name": "John Orion",
  "email": "john@stellar.io",
  "phone": "123-456-7890",
  "salary": 95000,
  "status": "ACTIVE",
  "joiningDate": "2026-05-04",
  "departmentId": 1
}
```

## Departments

- `POST /api/departments`
- `GET /api/departments`
- `GET /api/departments/{id}`
- `PUT /api/departments/{id}`
- `DELETE /api/departments/{id}`

Sample payload:

```json
{
  "name": "Engineering",
  "location": "HQ"
}
```

## Leave Management

- `POST /api/leaves` (apply)
- `GET /api/leaves`
- `PUT /api/leaves/approve/{id}`
- `PUT /api/leaves/reject/{id}`

Sample apply payload:

```json
{
  "employeeId": 1,
  "type": "Vacation",
  "startDate": "2026-06-01",
  "endDate": "2026-06-05"
}
```

## CORS

Allowed origins are already configured:

- `http://localhost:3000`
- `http://localhost:5500`

## Notes

- A default admin user is auto-created at startup:
  - username: `admin`
  - password: `Admin123!`
  - role: `ADMIN`
- `spring.jpa.hibernate.ddl-auto=update` keeps schema in sync with entities.
- For production:
  - use a strong JWT secret
  - disable `show-sql`
  - move credentials to environment variables
