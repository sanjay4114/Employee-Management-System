import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex w-100">
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>
      <div className="main-content flex-grow-1">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
