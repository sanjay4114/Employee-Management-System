import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MyDepartment from './pages/MyDepartment';
import Calendar from './pages/Calendar';
import './styles/main.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="my-department" element={<MyDepartment />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
