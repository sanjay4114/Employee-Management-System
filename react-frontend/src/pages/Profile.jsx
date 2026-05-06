import React, { useContext, useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { AppContext } from '../context/AppContext';
import { FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';

const Profile = () => {
  const { user, employees } = useContext(AppContext);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);

  useEffect(() => {
    if (user) {
      const isEmp = user.role === 'EMPLOYEE';
      const matchedEmp = isEmp ? employees.find(e => e.id === user.employeeId) : null;
      
      setFormData({
        displayName: matchedEmp ? matchedEmp.name : (user.displayName || user.name || 'Admin'),
        email: matchedEmp ? matchedEmp.email : (user.email || 'admin@ems.local'),
        role: user.role || 'Administrator'
      });
    }
  }, [user, employees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate updating
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 500);
  };

  const matchedEmp = user?.role === 'EMPLOYEE' ? employees.find(e => e.id === user.employeeId) : null;

  // Salary calculations (Monthly Breakdown)
  const salaryVal = matchedEmp ? Number(matchedEmp.salary || 0) : 0;
  const monthlyGross = Math.round(salaryVal / 12);
  const basicPay = Math.round(monthlyGross * 0.60);
  const hra = Math.round(monthlyGross * 0.25);
  const allowance = Math.round(monthlyGross * 0.15);
  const providentFund = Math.round(monthlyGross * 0.12);
  const netTakeHome = monthlyGross - providentFund;

  const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-area').innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Inject print-only styling and content
    document.body.innerHTML = `
      <style>
        body { background: white !important; color: black !important; font-family: sans-serif !important; padding: 20px !important; }
        .no-print { display: none !important; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
      ${printContent}
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // restore React context safely
  };

  return (
    <div className="container-fluid p-0 page-fade" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 className="h2 mb-4">Profile</h1>
      
      <Card
        title="Your account"
        subtitle="Your session profile is saved with the app data in this browser."
      >
        <form onSubmit={handleSubmit} className="mt-2">
          {success && <div className="alert alert-success">Profile updated successfully!</div>}
          
          <div className="mb-3">
            <label className="form-label">Display name</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              value={formData.displayName} 
              onChange={e => setFormData({ ...formData, displayName: e.target.value })} 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Work email</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input 
              type="text" 
              className="form-control" 
              readOnly 
              value={formData.role} 
            />
            <div className="form-text text-secondary">Role is managed by system administrators.</div>
          </div>
          
          <button type="submit" className="btn btn-primary px-4" disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        {matchedEmp && (
          <div className="mt-4">
            <hr className="border-secondary opacity-25 my-4" />
            <h5 className="mb-3 text-primary">Employment Snapshot</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                  <p className="text-secondary small mb-1">Phone</p>
                  <p className="mb-0 fw-semibold text-white">{matchedEmp.phone || 'Not specified'}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                  <p className="text-secondary small mb-1">Department</p>
                  <p className="mb-0 fw-semibold text-white">{matchedEmp.departmentName || 'Not specified'}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                  <p className="text-secondary small mb-1">Status</p>
                  <p className="mb-0 fw-semibold text-success">{matchedEmp.status || 'Active'}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                  <p className="text-secondary small mb-1">Joining Date</p>
                  <p className="mb-0 fw-semibold text-white">{matchedEmp.joiningDate || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <hr className="border-secondary opacity-25 my-4" />
            
            {/* Salary & Payslip Generator module */}
            <div className="p-3 rounded-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h5 className="text-white mb-1">Monthly Payslip</h5>
                <p className="text-secondary small mb-0">Generate and print your official payroll statement for {currentMonthYear}.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowPayslip(true)}
              >
                <FaFileInvoiceDollar /> Generate Payslip
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Payslip Print Modal */}
      {matchedEmp && (
        <Modal
          show={showPayslip}
          onClose={() => setShowPayslip(false)}
          title="Official Payslip Review"
        >
          <div id="payslip-print-area" className="p-2">
            <div className="text-center mb-4">
              <h4 className="fw-bold text-white mb-1">EMPLOYEE MANAGEMENT SYSTEM</h4>
              <p className="text-secondary mb-0 small">Official Payroll Statement & Earnings Ledger</p>
              <hr className="border-secondary opacity-25 my-3" />
            </div>

            {/* Metadata Ledger */}
            <div className="row g-3 small text-white-50 mb-4">
              <div className="col-6">
                <p className="mb-1"><strong className="text-white">Employee Name:</strong> {matchedEmp.name}</p>
                <p className="mb-1"><strong className="text-white">Employee ID:</strong> EMS-{matchedEmp.id}</p>
                <p className="mb-1"><strong className="text-white">Department:</strong> {matchedEmp.departmentName}</p>
              </div>
              <div className="col-6 text-end">
                <p className="mb-1"><strong className="text-white">Pay Period:</strong> {currentMonthYear}</p>
                <p className="mb-1"><strong className="text-white">Currency:</strong> INR (₹)</p>
                <p className="mb-1"><strong className="text-white">Bank Settlement:</strong> Direct Deposit</p>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="text-primary border-bottom border-secondary pb-1 mb-2">Earnings</h6>
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Basic Pay</span>
                  <span className="text-white">₹{basicPay.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>HRA Allowance</span>
                  <span className="text-white">₹{hra.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Special Allowance</span>
                  <span className="text-white">₹{allowance.toLocaleString()}</span>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="text-danger border-bottom border-secondary pb-1 mb-2">Deductions</h6>
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Provident Fund (PF)</span>
                  <span className="text-white">₹{providentFund.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Professional Tax</span>
                  <span className="text-white">₹200</span>
                </div>
              </div>
            </div>

            <hr className="border-secondary opacity-25 my-3" />

            {/* Net pay summary */}
            <div className="p-3 rounded-2 bg-dark bg-opacity-25 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0 text-white fw-bold">Net Salary (Take-home)</h6>
                <span className="small text-muted">Transferred on last business day of {currentMonthYear}</span>
              </div>
              <div className="text-end">
                <h4 className="mb-0 text-success fw-bold">₹{(netTakeHome - 200).toLocaleString()}</h4>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 no-print">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPayslip(false)}>Close</button>
            <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={handlePrint}>
              <FaPrint /> Print / Save as PDF
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Profile;
