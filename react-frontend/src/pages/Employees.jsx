import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AppContext } from '../context/AppContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Employees = () => {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee, registerUser, fetchEmployeeUsername, updateCredentials } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);
  
  const initialForm = { 
    name: '', email: '', phone: '', salary: '', 
    status: 'Active', joiningDate: new Date().toISOString().split('T')[0], 
    departmentId: '', username: '', password: '' 
  };
  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleShow = async (emp = null) => {
    if (emp) {
      setCurrentEmp(emp);
      setFormData({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        salary: emp.salary,
        status: emp.status === 'ACTIVE' ? 'Active' : 'Inactive', // Format to match original
        joiningDate: emp.joiningDate,
        departmentId: emp.departmentId,
        username: '',
        password: ''
      });
      const existingUsername = await fetchEmployeeUsername(emp.id);
      setFormData(prev => ({ ...prev, username: existingUsername }));
    } else {
      setCurrentEmp(null);
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
    
    // Convert 'Active' back to 'ACTIVE' for backend if needed, assuming backend accepts 'ACTIVE'
    const statusVal = formData.status.toUpperCase();

    if (currentEmp) {
      success = await updateEmployee(currentEmp.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        salary: parseFloat(formData.salary),
        status: statusVal,
        joiningDate: formData.joiningDate,
        departmentId: parseInt(formData.departmentId)
      });
      
      if (success && formData.username && formData.password) {
        success = await updateCredentials(currentEmp.id, {
          username: formData.username,
          password: formData.password
        });
      }
    } else {
      const newEmp = await addEmployee({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        salary: parseFloat(formData.salary),
        status: statusVal,
        joiningDate: formData.joiningDate,
        departmentId: parseInt(formData.departmentId)
      });

      if (newEmp && newEmp.id && formData.username) {
        success = await registerUser({
          username: formData.username,
          password: formData.password,
          role: 'EMPLOYEE',
          employeeId: newEmp.id
        });
      } else if (newEmp) {
        success = true; // Added but no credentials
      }
    }
    
    setLoading(false);
    if (success) {
      handleClose();
    } else {
      setError(currentEmp ? 'Failed to update employee.' : 'Failed to save employee or credentials.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const success = await deleteEmployee(id);
      if (!success) alert('Failed to delete employee.');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.phone && emp.phone.includes(searchTerm)) ||
    (emp.departmentName && emp.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const total = filteredEmployees.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(currentPage * pageSize, total);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatSalary = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const columns = [
    { label: 'ID' },
    { label: 'NAME' },
    { label: 'EMAIL' },
    { label: 'PHONE' },
    { label: 'DEPARTMENT' },
    { label: 'SALARY' },
    { label: 'STATUS' },
    { label: 'ACTIONS', className: 'text-end' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Employees</h1>
          <p className="text-secondary mb-0">Manage roster, org links, and employment status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <FaPlus className="me-2" /> Add employee
        </button>
      </div>

      <Card
        title="Directory"
        subtitle="Search and sort update results instantly. Data persists in the browser."
      >
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, phone, department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: '400px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)' }}
          />
        </div>

        <Table
          columns={columns}
          data={currentEmployees}
          renderRow={(emp) => (
            <tr key={emp.id} className="align-middle">
              <td>{emp.id}</td>
              <td className="fw-semibold">{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>
                <span className="badge rounded-pill ems-badge-soft">
                  {emp.departmentName}
                </span>
              </td>
              <td className="text-success fw-medium">{formatSalary(emp.salary)}</td>
              <td>
                <span className={`badge rounded-pill border ${emp.status === 'ACTIVE' ? 'border-success text-success' : 'border-secondary text-secondary'}`} style={{background: 'transparent', padding: '0.4rem 0.6rem'}}>
                  {emp.status === 'ACTIVE' ? 'Active' : emp.status === 'INACTIVE' ? 'Inactive' : emp.status}
                </span>
              </td>
              <td className="text-end">
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShow(emp)}><FaEdit /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(emp.id)}><FaTrash /></button>
              </td>
            </tr>
          )}
        />

        {/* Pagination Footer */}
        <nav className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span className="text-secondary small">Showing {start}–{end} of {total}</span>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)'}}>Previous</button>
            </li>
            
            {Array.from({ length: Math.min(pages, 5) }).map((_, idx) => {
              const p = idx + 1;
              return (
                <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setCurrentPage(p)} style={p === currentPage ? {} : {background: 'transparent', border: 'none', color: 'var(--text-secondary)'}}>{p}</button>
                </li>
              );
            })}
            
            <li className={`page-item ${currentPage >= pages ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= pages} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)'}}>Next</button>
            </li>
          </ul>
        </nav>
      </Card>

      <Modal
        show={showModal}
        onClose={handleClose}
        title={currentEmp ? 'Edit Employee' : 'Add Employee'}
        sizeClass="modal-lg"
      >
        <form onSubmit={handleSubmit} id="employeeForm">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <h5 className="mb-3 text-primary">Employee Details</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input type="text" className="form-control" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Salary</label>
              <input type="number" step="0.01" className="form-control" required value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Joining Date</label>
              <input type="date" className="form-control" required value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Status</label>
              <select className="form-select" required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Department</label>
              <select className="form-select" required value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-secondary my-4" />
          <h5 className="mb-3 text-primary">{currentEmp ? 'Login Credentials (Update/Reset)' : 'Login Credentials (Optional)'}</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">{currentEmp ? 'New Password' : 'Password'}</label>
              <input type="text" className="form-control" placeholder={currentEmp ? 'Enter new password to reset' : 'Enter password'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>

        </form>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
          <button type="submit" form="employeeForm" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
