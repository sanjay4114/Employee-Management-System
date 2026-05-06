import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaBuilding, FaCalendarCheck, FaUser, FaCog, FaCalendarAlt } from 'react-icons/fa';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const { user } = useContext(AppContext);
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = isAdmin ? [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/employees', icon: <FaUsers />, label: 'Employees' },
    { path: '/departments', icon: <FaBuilding />, label: 'Departments' },
    { path: '/leaves', icon: <FaCalendarCheck />, label: 'Leave Requests' },
    { path: '/calendar', icon: <FaCalendarAlt />, label: 'Leave Calendar' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ] : [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/departments', icon: <FaBuilding />, label: 'My Department' },
    { path: '/leaves', icon: <FaCalendarCheck />, label: 'My Leaves' },
    { path: '/calendar', icon: <FaCalendarAlt />, label: 'Leave Calendar' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <nav className="sidebar ems-sidebar">
      <div className="p-3">
        <h5 className="ems-sidebar-logo">EMS</h5>
      </div>
      <ul className="nav flex-column">
        {menuItems.map((item, index) => (
          <li className="nav-item" key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i>{item.icon}</i> {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
