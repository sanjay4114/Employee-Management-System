import React, { useContext, useEffect, useRef, useState } from 'react';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { FaUsers, FaBuilding, FaClock, FaUserCheck, FaBullhorn, FaTrash, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const { employees, departments, leaves, announcements, addAnnouncement, deleteAnnouncement, user } = useContext(AppContext);
  const isAdmin = user?.role === 'ADMIN';

  const totalEmp = employees.length;
  const totalDept = departments.length;
  const pending = leaves.filter((l) => (l.status || '').toUpperCase() === 'PENDING').length;
  const active = employees.filter((e) => (e.status || '').toUpperCase() === 'ACTIVE').length;

  const ctrEmpRef = useRef(null);
  const ctrDeptRef = useRef(null);
  const ctrPendingRef = useRef(null);
  const ctrActiveRef = useRef(null);

  // Announcement Form states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  // Interactive tooltip states
  const [activeBar, setActiveBar] = useState(null);
  const [activePie, setActivePie] = useState(null);

  useEffect(() => {
    const animate = (ref, target) => {
      if (!ref.current) return;
      let start = 0;
      const duration = 1000;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        ref.current.innerText = Math.floor(progress * target);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    animate(ctrEmpRef, totalEmp);
    animate(ctrDeptRef, totalDept);
    animate(ctrPendingRef, pending);
    animate(ctrActiveRef, active);
  }, [totalEmp, totalDept, pending, active]);

  const handlePostAnn = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setAnnLoading(true);
    const success = await addAnnouncement({ title: annTitle, content: annContent });
    if (success) {
      setAnnTitle('');
      setAnnContent('');
    }
    setAnnLoading(false);
  };

  // Aggregate Department Data for Bar Chart
  const deptData = departments.map(d => {
    const count = employees.filter(e => e.departmentId === d.id).length;
    return { name: d.name, count };
  });

  const maxDeptCount = Math.max(...deptData.map(d => d.count), 1);

  // Aggregate Leave Types Data for Donut Chart
  const leaveTypes = ['Vacation', 'Sick', 'Personal', 'Other'];
  const leaveData = leaveTypes.map(type => {
    const count = leaves.filter(l => (l.type || '').toLowerCase() === type.toLowerCase()).length;
    return { name: type, count };
  });

  const totalLeaves = leaves.length || 1;
  const colors = {
    Vacation: '#3b82f6', // Bright Blue
    Sick: '#ef4444',     // Coral Red
    Personal: '#10b981', // Emerald Green
    Other: '#a855f7'     // Purple Glow
  };

  // Calculate donut segment offsets
  let accumulatedPercent = 0;

  return (
    <div className="container-fluid p-0 page-fade">
      <header className="mb-4">
        <h1 className="h2 mb-1">Dashboard</h1>
        <p className="text-secondary mb-0">Overview of employees, departments, and leave activity.</p>
      </header>

      {/* Dynamic Announcement Banner */}
      {announcements.length > 0 && (
        <div className="mb-4 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25 p-3 position-relative overflow-hidden fade-in" style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)' }}>
          <div className="position-absolute top-0 start-0 h-100 bg-primary" style={{ width: '4px' }} />
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded bg-primary bg-opacity-10 text-primary">
              <FaBullhorn className="fa-lg animate-bounce" />
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1 text-white small text-uppercase tracking-wider fw-bold d-flex align-items-center gap-2">
                Company Announcement
                <span className="badge bg-primary bg-opacity-25 text-primary" style={{ fontSize: '0.65rem' }}>NEW</span>
              </h5>
              <p className="mb-0 text-white fw-bold">{announcements[0].title}</p>
              <p className="mb-0 small text-secondary">{announcements[0].content}</p>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <Card className="stats-card h-100">
            <div className="text-center py-2">
              <FaUsers className="fa-2x text-primary mb-2 animate-pulse" />
              <h2 className="card-title mt-2"><span ref={ctrEmpRef}>0</span></h2>
              <p className="card-text text-secondary">Total employees</p>
            </div>
          </Card>
        </div>
        <div className="col-6 col-lg-3">
          <Card className="stats-card h-100">
            <div className="text-center py-2">
              <FaBuilding className="fa-2x text-info mb-2 animate-pulse" />
              <h2 className="card-title mt-2"><span ref={ctrDeptRef}>0</span></h2>
              <p className="card-text text-secondary">Departments</p>
            </div>
          </Card>
        </div>
        <div className="col-6 col-lg-3">
          <Card className="stats-card h-100">
            <div className="text-center py-2">
              <FaClock className="fa-2x text-warning mb-2 animate-pulse" />
              <h2 className="card-title mt-2"><span ref={ctrPendingRef}>0</span></h2>
              <p className="card-text text-secondary">Pending leaves</p>
            </div>
          </Card>
        </div>
        <div className="col-6 col-lg-3">
          <Card className="stats-card h-100">
            <div className="text-center py-2">
              <FaUserCheck className="fa-2x text-success mb-2 animate-pulse" />
              <h2 className="card-title mt-2"><span ref={ctrActiveRef}>0</span></h2>
              <p className="card-text text-secondary">Active employees</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="row g-3">
        {/* Department Headcount Bar Chart */}
        <div className="col-lg-6">
          <Card title="Headcount by department" subtitle="Interactive department distribution overview">
            {deptData.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-secondary mb-0">No department data available.</p>
              </div>
            ) : (
              <div className="position-relative py-3">
                <svg viewBox="0 0 500 240" className="w-100 h-auto">
                  <defs>
                    <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="100%" stopColor="#4facfe" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff0844" />
                      <stop offset="100%" stopColor="#ffb199" stopOpacity={0.6} />
                    </linearGradient>
                    <filter id="neonShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#4facfe" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.5, 1].map((ratio, i) => {
                    const y = 20 + ratio * 160;
                    return (
                      <g key={i}>
                        <line x1="40" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                        <text x="15" y={y + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="middle">
                          {Math.round((1 - ratio) * maxDeptCount)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Columns */}
                  {deptData.map((item, index) => {
                    const colWidth = Math.min(350 / deptData.length, 60);
                    const gap = (440 - colWidth * deptData.length) / (deptData.length + 1);
                    const x = 50 + index * (colWidth + gap);
                    const barHeight = (item.count / maxDeptCount) * 160;
                    const y = 180 - barHeight;

                    return (
                      <g 
                        key={index} 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setActiveBar(item)}
                        onMouseLeave={() => setActiveBar(null)}
                      >
                        <rect
                          x={x}
                          y={y}
                          width={colWidth}
                          height={barHeight || 4} // small height for 0 count
                          rx="4"
                          fill={activeBar?.name === item.name ? "url(#barActive)" : "url(#barGlow)"}
                          filter={activeBar?.name === item.name ? "" : "url(#neonShadow)"}
                          style={{ transition: 'all 0.3s ease' }}
                        />
                        {/* Text label underneath */}
                        <text
                          x={x + colWidth / 2}
                          y="205"
                          fill={activeBar?.name === item.name ? "var(--text-primary)" : "var(--text-secondary)"}
                          fontSize="9.5"
                          textAnchor="middle"
                          fontWeight={activeBar?.name === item.name ? "bold" : "normal"}
                        >
                          {item.name.length > 10 ? `${item.name.substring(0, 8)}..` : item.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Live Tooltip */}
                {activeBar && (
                  <div 
                    className="position-absolute translate-middle-x p-2 rounded shadow border small animate-fade-in"
                    style={{
                      top: '10px',
                      left: '50%',
                      background: 'rgba(21, 16, 36, 0.95)',
                      borderColor: 'var(--card-border)',
                      zIndex: 10,
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <span className="fw-bold text-white">{activeBar.name}:</span>{' '}
                    <span className="text-info fw-bold">{activeBar.count} {activeBar.count === 1 ? 'Employee' : 'Employees'}</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Leave Distribution Donut Chart */}
        <div className="col-lg-6">
          <Card title="Leave distribution" subtitle="Live breakdown of leave request categories">
            {leaves.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-secondary mb-0">No leave requests available.</p>
              </div>
            ) : (
              <div className="row align-items-center py-3">
                <div className="col-sm-6 position-relative text-center">
                  <svg viewBox="0 0 160 160" width="100%" height="150">
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    
                    {leaveData.map((item, index) => {
                      const percent = (item.count / totalLeaves);
                      if (percent === 0) return null;

                      const circumference = 2 * Math.PI * 50; // ~314.16
                      const strokeDasharray = `${percent * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulatedPercent * circumference;
                      accumulatedPercent += percent;

                      const isHovered = activePie?.name === item.name;

                      return (
                        <circle
                          key={index}
                          cx="80"
                          cy="80"
                          r="50"
                          fill="transparent"
                          stroke={colors[item.name]}
                          strokeWidth={isHovered ? "15" : "12"}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform="rotate(-90 80 80)"
                          style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                          onMouseEnter={() => setActivePie(item)}
                          onMouseLeave={() => setActivePie(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Centered Total Text */}
                  <div className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none">
                    <div className="display-6 fw-bold mb-0" style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{leaves.length}</div>
                    <div className="text-secondary small" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Leaves</div>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="col-sm-6">
                  <div className="d-flex flex-column gap-2">
                    {leaveData.map((item, index) => {
                      const percent = Math.round((item.count / totalLeaves) * 100);
                      const isHovered = activePie?.name === item.name;

                      return (
                        <div 
                          key={index}
                          className="d-flex align-items-center justify-content-between p-2 rounded-2 border border-transparent"
                          style={{
                            background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderColor: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={() => setActivePie(item)}
                          onMouseLeave={() => setActivePie(null)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: colors[item.name] }} />
                            <span className="small" style={{ fontWeight: isHovered ? 'bold' : 'normal', color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.name}</span>
                          </div>
                          <span className="small fw-semibold" style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {item.count} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Admin Announcement Creator panel */}
      {isAdmin && (
        <div className="row g-3 mt-4">
          <div className="col-lg-6">
            <Card title="Publish announcement" subtitle="Broadcast a new system notification to all profiles">
              <form onSubmit={handlePostAnn} className="mt-2">
                <div className="mb-3">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g., Scheduled System Upgrade"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content Description</label>
                  <textarea
                    className="form-control"
                    required
                    rows="3"
                    placeholder="Type details and notes here..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary px-4 d-flex align-items-center gap-2" disabled={annLoading}>
                  <FaPlus /> {annLoading ? 'Publishing...' : 'Publish'}
                </button>
              </form>
            </Card>
          </div>

          <div className="col-lg-6">
            <Card title="Manage announcements" subtitle="Review active notices and remove obsolete items">
              {announcements.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-secondary mb-0">No active announcements posted.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 mt-2" style={{ maxHeight: '275px', overflowY: 'auto' }}>
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25 d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h6 className="mb-1 text-white fw-bold">{ann.title}</h6>
                        <p className="mb-1 small text-secondary">{ann.content}</p>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(ann.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger p-2"
                        onClick={() => deleteAnnouncement(ann.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
