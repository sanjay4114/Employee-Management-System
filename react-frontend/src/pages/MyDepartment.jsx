import React, { useContext } from 'react';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';

const MyDepartment = () => {
  const { user, employees, departments } = useContext(AppContext);
  
  const employee = employees.find(e => e.id === user?.employeeId);
  const department = departments.find(d => d.id === employee?.departmentId);

  if (!employee || !department) {
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

  const colleagues = employees.filter(e => e.departmentId === department.id && e.id !== employee.id);

  return (
    <div className="container-fluid p-0 page-fade">
      <header className="mb-4">
        <h1 className="h2 mb-1">My Department</h1>
        <p className="text-secondary mb-0">Your assigned department information.</p>
      </header>

      <div className="row g-3">
        <div className="col-lg-8">
          <Card title={department.name} subtitle="Department overview">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                  <p className="text-secondary small mb-1">Location</p>
                  <p className="mb-0 fw-semibold text-white">{department.location || 'Not specified'}</p>
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
              <div className="text-white fw-medium">{employee.name}</div>
            </div>
            <div className="mb-2">
              <span className="text-secondary">Email:</span> 
              <div className="text-white fw-medium">{employee.email}</div>
            </div>
            <div className="mb-0">
              <span className="text-secondary">Status:</span> 
              <div className="text-white fw-medium">{employee.status}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyDepartment;
