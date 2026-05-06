/**
 * Login — demo credentials; pairs with Spring Boot auth later.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const roleSelect = document.getElementById('loginRole');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  if (!form) return;

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const showing = passwordInput.type === 'text';
      passwordInput.type = showing ? 'password' : 'text';
      const icon = togglePasswordBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye', showing);
        icon.classList.toggle('fa-eye-slash', !showing);
      }
      togglePasswordBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';
    const selectedRole = (roleSelect?.value || 'ADMIN').toUpperCase();

    EMS.loadState();
    const uname = username.toLowerCase();
    const isAdminCreds = uname === 'admin' && password === 'Admin123!';
    const isEmployeeCreds = uname === 'employee' && password === 'Employee123!';

    if (selectedRole === 'ADMIN' && isAdminCreds) {
      EMS.setState((s) => ({
        ...s,
        user: {
          username: 'admin',
          displayName: 'Administrator',
          email: 'admin@ems.local',
          role: 'ADMIN',
          preferences: { compactTables: false },
        },
      }));
      EMS.showToast('Signed in as admin.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html#dashboard';
      }, 450);
      return;
    }

    if (selectedRole === 'EMPLOYEE' && isEmployeeCreds) {
      const firstEmployee = EMS.getState().employees[0];
      EMS.setState((s) => ({
        ...s,
        user: {
          username: 'employee',
          displayName: firstEmployee?.name || 'Employee User',
          email: firstEmployee?.email || 'employee@ems.local',
          role: 'EMPLOYEE',
          employeeId: firstEmployee?.id || null,
          preferences: { compactTables: false },
        },
      }));
      EMS.showToast('Signed in as employee.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html#my-leaves';
      }, 450);
      return;
    }

    if (isAdminCreds || isEmployeeCreds) {
      EMS.showToast('Selected role does not match these credentials.', 'error');
      return;
    }

    EMS.showToast('Invalid username or password.', 'error');
  });
});
