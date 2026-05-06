import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPlane, FaBriefcaseMedical, FaUserAlt, FaInfoCircle } from 'react-icons/fa';

const Calendar = () => {
  const { leaves, employees } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to get employee name
  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : 'Unknown';
  };

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get Calendar days
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate calendar grid array
  const calendarDays = [];
  const prevMonthDays = getDaysInMonth(year, month - 1);

  // Add padding days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // Add current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Add padding days from next month to complete 42 cells (6 rows * 7 columns)
  const totalCells = 42;
  const nextMonthPadding = totalCells - calendarDays.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  // Check if a date has approved leaves
  const getLeavesForDate = (date) => {
    const dStr = date.toISOString().split('T')[0];
    return leaves.filter(l => {
      if ((l.status || '').toUpperCase() !== 'APPROVED') return false;
      const start = new Date(l.startDate).toISOString().split('T')[0];
      const end = new Date(l.endDate).toISOString().split('T')[0];
      return dStr >= start && dStr <= end;
    });
  };

  // Map Leave Type to Icon and Color
  const getLeaveIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('sick') || t.includes('medical')) return <FaBriefcaseMedical size="10" className="text-danger" />;
    return <FaPlane size="10" className="text-primary" />;
  };

  const getLeavePillStyle = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('sick') || t.includes('medical')) {
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        borderLeft: '3px solid #ef4444',
        color: '#f87171'
      };
    }
    return {
      background: 'rgba(59, 130, 246, 0.12)',
      borderLeft: '3px solid #3b82f6',
      color: '#60a5fa'
    };
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="container-fluid p-0 page-fade">
      <header className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="h2 mb-1">Shared Leave Calendar</h1>
          <p className="text-secondary mb-0">Monitor approved employee leaves and coordinate team availability.</p>
        </div>
        <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-10">
          <button className="btn btn-sm btn-link text-secondary p-1" onClick={handlePrevMonth}>
            <FaChevronLeft size="14" />
          </button>
          <span className="fw-bold px-3 text-white" style={{ minWidth: '130px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button className="btn btn-sm btn-link text-secondary p-1" onClick={handleNextMonth}>
            <FaChevronRight size="14" />
          </button>
        </div>
      </header>

      <div className="row">
        <div className="col-12">
          <Card title="Availability Grid" subtitle="Approved leaf spans across team departments.">
            <div className="table-responsive mt-3" style={{ border: 'none', overflowX: 'auto' }}>
              <table className="table border-0 w-100" style={{ tableLayout: 'fixed', minWidth: '800px' }}>
                <thead>
                  <tr>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <th key={idx} className="text-center py-3 border-0 bg-transparent text-primary fw-bold" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, rowIdx) => (
                    <tr key={rowIdx} className="border-0 bg-transparent">
                      {calendarDays.slice(rowIdx * 7, (rowIdx + 1) * 7).map((cell, cellIdx) => {
                        const dayLeaves = getLeavesForDate(cell.date);
                        const isCurrent = cell.isCurrentMonth;
                        const today = isToday(cell.date);

                        return (
                          <td
                            key={cellIdx}
                            className={`p-1 border border-secondary border-opacity-10`}
                            style={{
                              height: '115px',
                              background: today 
                                ? 'rgba(139, 92, 246, 0.05)' 
                                : isCurrent 
                                  ? 'transparent' 
                                  : 'rgba(255, 255, 255, 0.01)',
                              boxShadow: today ? 'inset 0 0 10px rgba(139, 92, 246, 0.15)' : 'none',
                              opacity: isCurrent ? 1 : 0.45,
                              verticalAlign: 'top',
                              transition: 'all 0.25s ease'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1 p-2">
                              <span 
                                className={`fw-bold small ${today ? 'bg-primary text-white rounded-circle d-flex align-items-center justify-content-center' : 'text-secondary'}`}
                                style={today ? { width: '22px', height: '22px', fontSize: '0.75rem', boxShadow: 'var(--shadow-glow)' } : {}}
                              >
                                {cell.dayNum}
                              </span>
                              {today && <span className="badge bg-primary bg-opacity-25 text-primary small" style={{ fontSize: '0.6rem' }}>TODAY</span>}
                            </div>
                            
                            <div className="d-flex flex-column gap-1 overflow-auto px-2" style={{ maxHeight: '72px' }}>
                              {dayLeaves.map((leave, idx) => (
                                <div
                                  key={idx}
                                  className="d-flex align-items-center gap-1 p-1 rounded small text-truncate position-relative hover-scale transition-all"
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '600',
                                    ...getLeavePillStyle(leave.type),
                                    cursor: 'pointer'
                                  }}
                                  title={`${leave.employeeName || getEmployeeName(leave.employeeId)}: ${leave.startDate} to ${leave.endDate} (${leave.type})`}
                                >
                                  {getLeaveIcon(leave.type)}
                                  <span className="text-truncate">{leave.employeeName || getEmployeeName(leave.employeeId)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
