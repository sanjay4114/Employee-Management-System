import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Update this to your Spring Boot backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const register = (userData) => apiClient.post('/auth/register', userData);
export const getEmployeeUsername = (employeeId) => apiClient.get(`/auth/employees/${employeeId}/username`);
export const updateEmployeeCredentials = (employeeId, credentials) => apiClient.put(`/auth/employees/${employeeId}/credentials`, credentials);

// Employee APIs
export const getEmployees = () => apiClient.get('/employees');
export const getEmployeeById = (id) => apiClient.get(`/employees/${id}`);
export const createEmployee = (employeeData) => apiClient.post('/employees', employeeData);
export const updateEmployee = (id, employeeData) => apiClient.put(`/employees/${id}`, employeeData);
export const deleteEmployee = (id) => apiClient.delete(`/employees/${id}`);

// Department APIs
export const getDepartments = () => apiClient.get('/departments');
export const createDepartment = (departmentData) => apiClient.post('/departments', departmentData);
export const updateDepartment = (id, departmentData) => apiClient.put(`/departments/${id}`, departmentData);
export const deleteDepartment = (id) => apiClient.delete(`/departments/${id}`);

// Leave APIs
export const getLeaves = () => apiClient.get('/leaves');
export const createLeave = (leaveData) => apiClient.post('/leaves', leaveData);
export const approveLeave = (id) => apiClient.put(`/leaves/approve/${id}`);
export const rejectLeave = (id) => apiClient.put(`/leaves/reject/${id}`);

// Announcement APIs
export const getAnnouncements = () => apiClient.get('/announcements');
export const createAnnouncement = (data) => apiClient.post('/announcements', data);
export const deleteAnnouncement = (id) => apiClient.delete(`/announcements/${id}`);

export default apiClient;
