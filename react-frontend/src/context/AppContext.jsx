import React, { createContext, useState, useEffect } from 'react';
import {
  getEmployees, createEmployee as apiCreateEmployee, updateEmployee as apiUpdateEmployee, deleteEmployee as apiDeleteEmployee,
  getDepartments, createDepartment as apiCreateDepartment, updateDepartment as apiUpdateDepartment, deleteDepartment as apiDeleteDepartment,
  getLeaves, createLeave as apiCreateLeave, approveLeave, rejectLeave,
  login as apiLogin, register, getEmployeeUsername, updateEmployeeCredentials,
  getAnnouncements, createAnnouncement as apiCreateAnnouncement, deleteAnnouncement as apiDeleteAnnouncement
} from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ems_theme') || 'nebula';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ems_theme', theme);
  }, [theme]);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ems_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ems_user', JSON.stringify(user));
      fetchInitialData();
    } else {
      localStorage.removeItem('ems_user');
      localStorage.removeItem('ems_token');
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    
    try {
      const empRes = await getEmployees();
      setEmployees(empRes.data || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }

    try {
      const deptRes = await getDepartments();
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }

    try {
      const leavesRes = await getLeaves();
      setLeaves(leavesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    }

    try {
      const annRes = await getAnnouncements();
      setAnnouncements(annRes.data || []);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }

    setLoading(false);
  };

  const loginUser = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin(credentials);
      const { token, username, role, employeeId, departmentId } = res.data;
      const userData = { name: username, role, employeeId, departmentId };
      localStorage.setItem('ems_token', token);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login failed', err);
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      await register(userData);
      return true;
    } catch (err) {
      console.error('Registration failed', err);
      setError(err.response?.data?.message || 'Failed to create credentials for employee.');
      return false;
    }
  };

  const logoutUser = () => {
    setUser(null);
  };

  // Employee actions
  const addEmployee = async (emp) => {
    try {
      const res = await apiCreateEmployee(emp);
      setEmployees([...employees, res.data]);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
      return null;
    }
  };

  const updateEmployee = async (id, updatedEmp) => {
    try {
      const res = await apiUpdateEmployee(id, updatedEmp);
      setEmployees(employees.map(e => e.id === id ? res.data : e));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
      return false;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await apiDeleteEmployee(id);
      setEmployees(employees.filter(e => e.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
      return false;
    }
  };

  // Department actions
  const addDepartment = async (dept) => {
    try {
      const res = await apiCreateDepartment(dept);
      setDepartments([...departments, res.data]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department');
      return false;
    }
  };

  const updateDepartment = async (id, updatedDept) => {
    try {
      const res = await apiUpdateDepartment(id, updatedDept);
      setDepartments(departments.map(d => d.id === id ? res.data : d));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
      return false;
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await apiDeleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
      return false;
    }
  };

  // Leave actions
  const addLeave = async (leave) => {
    try {
      const res = await apiCreateLeave(leave);
      setLeaves([...leaves, res.data]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave');
      return false;
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const res = status.toUpperCase() === 'APPROVED' 
        ? await approveLeave(id) 
        : await rejectLeave(id);
      setLeaves(leaves.map(l => l.id === id ? res.data : l));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status');
      return false;
    }
  };

  const fetchEmployeeUsername = async (employeeId) => {
    try {
      const res = await getEmployeeUsername(employeeId);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch employee username', err);
      return '';
    }
  };

  const updateCredentials = async (employeeId, credentials) => {
    try {
      await updateEmployeeCredentials(employeeId, credentials);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee credentials');
      return false;
    }
  };

  const addAnnouncement = async (announcement) => {
    try {
      const res = await apiCreateAnnouncement(announcement);
      setAnnouncements([res.data, ...announcements]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement');
      return false;
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await apiDeleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
      return false;
    }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{
      employees, addEmployee, updateEmployee, deleteEmployee,
      departments, addDepartment, updateDepartment, deleteDepartment,
      leaves, addLeave, updateLeaveStatus,
      announcements, addAnnouncement, deleteAnnouncement,
      user, loginUser, registerUser, logoutUser,
      fetchEmployeeUsername, updateCredentials,
      theme, setTheme,
      loading, error, clearError
    }}>
      {children}
    </AppContext.Provider>
  );
};
