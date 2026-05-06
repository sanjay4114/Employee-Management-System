import React, { useContext } from 'react';
import { FaBars, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg ems-navbar">
      <div className="container-fluid">
        <button className="btn btn-outline-secondary d-lg-none ems-sidebar-toggle" type="button" aria-label="Open menu">
          <FaBars />
        </button>
        <span className="navbar-brand d-lg-none ems-brand-sm">EMS</span>
        <div className="ms-auto d-flex align-items-center gap-2">
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <FaUser /> {user?.name || 'Admin'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
                  <FaUser className="me-2" /> Profile
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
                  <FaCog className="me-2" /> Settings
                </a>
              </li>
              <li><hr className="dropdown-divider border-secondary opacity-25" /></li>
              <li>
                <a className="dropdown-item text-danger" href="#logout" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
