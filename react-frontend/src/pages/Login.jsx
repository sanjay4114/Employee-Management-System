import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

import { FaEye, FaEyeSlash, FaUserTie, FaUser } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('ADMIN'); // Visual only or default
  const { loginUser, loading, error, clearError } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (error) clearError();
    
    // Call API logic through AppContext (backend determines actual role based on username, but UI looks cooler with toggle)
    const success = await loginUser({ username, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="login-card">
        <div className="text-center mb-4">
          <h2 className="h3 font-weight-bold" style={{ background: 'linear-gradient(135deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EMS Portal
          </h2>
          <p className="text-secondary mt-2">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="d-flex justify-content-center gap-3 mb-4">
            <button
              type="button"
              className={`btn flex-grow-1 ${role === 'ADMIN' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setRole('ADMIN')}
              style={{ borderRadius: '12px', padding: '10px' }}
            >
              <FaUserTie className="me-2" /> Admin
            </button>
            <button
              type="button"
              className={`btn flex-grow-1 ${role === 'EMPLOYEE' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setRole('EMPLOYEE')}
              style={{ borderRadius: '12px', padding: '10px' }}
            >
              <FaUser className="me-2" /> Employee
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder={role === 'ADMIN' ? 'admin' : 'username'}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ borderRight: 'none' }}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderLeft: 'none', background: 'rgba(0, 0, 0, 0.2)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
