import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AppContext } from '../context/AppContext';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaUsers, FaChartLine } from 'react-icons/fa';

const Departments = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment, employees, user } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  
  const initialForm = { name: '', location: '' };
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  // For Employee: Find their specific department
  const userEmployee = employees.find(e => e.id === user?.employeeId);
  const myDepartment = departments.find(d => d.id === userEmployee?.departmentId);
  const colleagues = employees.filter(e => e.departmentId === myDepartment?.id && e.id !== userEmployee?.id);

  const handleShow = (dept = null) => {
    if (dept) {
      setCurrentDept(dept);
      setFormData({ name: dept.name, location: dept.location });
    } else {
      setCurrentDept(null);
      setFormData(initialForm);
    }
    setError(null);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let success = false;

    if (currentDept) {
      success = await updateDepartment(currentDept.id, formData);
    } else {
      success = await addDepartment(formData);
    }
    
    setLoading(false);
    if (success) {
      handleClose();
    } else {
      setError('Failed to save department. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    const linkedEmployees = employees.filter(e => e.departmentId === id).length;
    if (linkedEmployees > 0) {
      alert(`Cannot delete: ${linkedEmployees} employee(s) are assigned to this department.`);
      return;
    }
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      const success = await deleteDepartment(id);
      if (!success) alert('Failed to delete department.');
    }
  };

  const totalEmps = employees.length;
  const avg = departments.length ? (totalEmps / departments.length).toFixed(2) : '0';

  const columns = [
    { label: 'ID' },
    { label: 'NAME' },
    { label: 'LOCATION' },
    { label: 'EMPLOYEES' },
    { label: 'ACTIONS', className: 'text-end' }
  ];

  if (!isAdmin) {
    if (!userEmployee || !myDepartment) {
      return (
        <div className="container-fluid p-0 page-fade">
          <h1 className="h2 mb-4">My Department</h1>
          <Card title="Information Unavailable" subtitle="Profile link required">
            <div className="text-center py-5">
              <p className="text-secondary mb-0">Your employee profile is not linked to a department yet. Contact an administrator.</p>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="container-fluid p-0 page-fade">
        <header className="mb-4">
          <h1 className="h2 mb-1">My Department</h1>
          <p className="text-secondary mb-0">Your assigned department information.</p>
        </header>

        <div className="row g-3">
          <div className="col-lg-8">
            <Card title={myDepartment.name} subtitle="Department overview">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                    <p className="text-secondary small mb-1">Location</p>
                    <p className="mb-0 fw-semibold text-white">{myDepartment.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                    <p className="text-secondary small mb-1">Team Size</p>
                    <p className="mb-0 fw-semibold text-white">{colleagues.length + 1} member(s)</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-3">
              <Card title="Colleagues" subtitle="People in your department">
                {colleagues.length > 0 ? (
                  <ul className="mb-0 list-group list-group-flush bg-transparent">
                    {colleagues.map(col => (
                      <li key={col.id} className="list-group-item bg-transparent text-secondary border-secondary border-opacity-25 px-0">
                        <span className="text-white fw-medium">{col.name}</span> — {col.email}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-secondary mb-0">No additional colleagues listed yet.</p>
                )}
              </Card>
            </div>
          </div>

          <div className="col-lg-4">
            <Card title="Your Role Context" subtitle="Employee snapshot">
              <div className="mb-2">
                <span className="text-secondary">Name:</span> 
                <div className="text-white fw-medium">{userEmployee.name}</div>
              </div>
              <div className="mb-2">
                <span className="text-secondary">Email:</span> 
                <div className="text-white fw-medium">{userEmployee.email}</div>
              </div>
              <div className="mb-0">
                <span className="text-secondary">Status:</span> 
                <div className="text-white fw-medium">{userEmployee.status}</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Departments</h1>
          <p className="text-secondary mb-0">Org units drive reporting and employee assignment.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <FaPlus className="me-2" /> Add department
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="h-100">
            <div className="text-center py-2">
              <FaBuilding className="fa-2x text-primary mb-2" />
              <div className="display-6 fw-bold">{departments.length}</div>
              <p className="text-secondary mb-0 small text-uppercase">Departments</p>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <div className="text-center py-2">
              <FaUsers className="fa-2x text-info mb-2" />
              <div className="display-6 fw-bold">{totalEmps}</div>
              <p className="text-secondary mb-0 small text-uppercase">Total employees</p>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <div className="text-center py-2">
              <FaChartLine className="fa-2x text-success mb-2" />
              <div className="display-6 fw-bold">{avg}</div>
              <p className="text-secondary mb-0 small text-uppercase">Avg per department</p>
            </div>
          </Card>
        </div>
      </div>

      <Card
        title="Department directory"
        subtitle="Deletion is blocked while employees are linked to a department."
      >
        <Table
          columns={columns}
          data={departments}
          renderRow={(dept) => (
            <tr key={dept.id} className="align-middle">
              <td>{dept.id}</td>
              <td className="fw-semibold text-primary">{dept.name}</td>
              <td>{dept.location}</td>
              <td>
                <span className="badge ems-badge-soft">
                  {employees.filter(e => e.departmentId === dept.id).length} linked
                </span>
              </td>
              <td className="text-end">
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShow(dept)}><FaEdit /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(dept.id)}><FaTrash /></button>
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal
        show={showModal}
        onClose={handleClose}
        title={currentDept ? 'Edit department' : 'New department'}
      >
        <form onSubmit={handleSubmit} id="deptForm">
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Department name</label>
            <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Location</label>
            <textarea className="form-control" rows="3" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}></textarea>
          </div>
        </form>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
          <button type="submit" form="deptForm" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;
