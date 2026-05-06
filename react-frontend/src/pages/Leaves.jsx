import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AppContext } from '../context/AppContext';
import { FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaCalendar } from 'react-icons/fa';

const Leaves = () => {
  const { leaves, employees, addLeave, updateLeaveStatus, user } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = { type: 'Vacation', startDate: '', endDate: '' };
  const [formData, setFormData] = useState(initialForm);

  const isAdmin = user?.role === 'ADMIN';

  const handleShow = () => {
    setFormData(initialForm);
    setError(null);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be on or after start date.');
      setLoading(false);
      return;
    }

    const success = await addLeave({
      ...formData,
      employeeId: user.employeeId,
      status: 'Pending'
    });

    setLoading(false);
    if (success) {
      handleClose();
    } else {
      setError('Failed to submit leave request. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    const st = String(status || '').toUpperCase();
    switch (st) {
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  };

  const filteredLeaves = isAdmin 
    ? (filterStatus === 'all' ? leaves : leaves.filter(l => (l.status || '').toUpperCase() === filterStatus.toUpperCase()))
    : leaves.filter(l => l.employeeId === user.employeeId);

  const summary = {
    Pending: leaves.filter(l => (l.status || '').toUpperCase() === 'PENDING').length,
    Approved: leaves.filter(l => (l.status || '').toUpperCase() === 'APPROVED').length,
    Rejected: leaves.filter(l => (l.status || '').toUpperCase() === 'REJECTED').length,
    Total: leaves.length
  };

  const columns = isAdmin ? [
    { label: 'Employee' },
    { label: 'Type' },
    { label: 'Start' },
    { label: 'End' },
    { label: 'Status' },
    { label: 'Actions' }
  ] : [
    { label: 'Type' },
    { label: 'Start' },
    { label: 'End' },
    { label: 'Status' }
  ];

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h2 mb-1">{isAdmin ? 'Leave Requests' : 'My Leaves'}</h1>
          <p className="text-secondary mb-0">
            {isAdmin ? 'Admin review queue for employee leave requests.' : 'Track your leave requests and approval status.'}
          </p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={handleShow}>
            <FaPlus className="me-2" /> Apply leave
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Pending', val: summary.Pending, icon: <FaClock />, tone: 'warning' },
            { label: 'Approved', val: summary.Approved, icon: <FaCheckCircle />, tone: 'success' },
            { label: 'Rejected', val: summary.Rejected, icon: <FaTimesCircle />, tone: 'danger' },
            { label: 'Total', val: summary.Total, icon: <FaCalendar />, tone: 'info' }
          ].map((item, i) => (
            <div key={i} className="col-6 col-md-3">
              <Card className="h-100">
                <div className="text-center py-2">
                  <div className={`fa-2x text-${item.tone} mb-2`}>{item.icon}</div>
                  <div className="display-6 fw-bold">{item.val}</div>
                  <p className="text-secondary mb-0 small text-uppercase">{item.label}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Card
        title={isAdmin ? 'All requests' : 'My requests'}
        subtitle={isAdmin ? 'Filter and approve/reject pending items.' : 'Submitted by your employee account only.'}
      >
        {isAdmin && (
          <div className="mb-3 d-flex align-items-center gap-2 flex-wrap">
            <label className="form-label mb-0">Status</label>
            <select 
              className="form-select w-auto" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}

        <Table
          columns={columns}
          data={filteredLeaves}
          renderRow={(leave) => (
            <tr key={leave.id} className="fade-in align-middle">
              {isAdmin && <td className="fw-semibold">{getEmployeeName(leave.employeeId)}</td>}
              <td><span className="badge ems-badge-soft">{leave.type}</span></td>
              <td>{leave.startDate}</td>
              <td>{leave.endDate}</td>
              <td>
                <span className={`badge rounded-pill ${getStatusBadgeClass(leave.status)}`}>
                  {leave.status}
                </span>
              </td>
              {isAdmin && (
                <td>
                  {(leave.status || '').toUpperCase() === 'PENDING' ? (
                    <>
                      <button 
                        className="btn btn-sm btn-success me-2" 
                        onClick={() => updateLeaveStatus(leave.id, 'Approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => updateLeaveStatus(leave.id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-secondary small">No actions</span>
                  )}
                </td>
              )}
            </tr>
          )}
        />
      </Card>

      <Modal
        show={showModal}
        onClose={handleClose}
        title="Apply for leave"
      >
        <form onSubmit={handleSubmit} id="leaveForm">
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Leave type</label>
            <select 
              className="form-select" 
              required 
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Vacation">Vacation</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Start date</label>
              <input 
                type="date" 
                className="form-control" 
                required 
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">End date</label>
              <input 
                type="date" 
                className="form-control" 
                required 
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </form>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
          <button type="submit" form="leaveForm" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit request'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Leaves;
