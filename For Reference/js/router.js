/**
 * Hash-based SPA router and dashboard/profile/settings views.
 */

const ROUTES = ['dashboard', 'employees', 'departments', 'leave-requests', 'my-department', 'my-leaves', 'profile', 'settings'];

function normalizeRoute(hash) {
  const raw = (hash || '').replace(/^#/, '').trim();
  const requested = raw.split('/')[0] || 'dashboard';
  const role = String(EMS.getState().user?.role || 'EMPLOYEE').toUpperCase();
  const route = requested === 'leaves' ? (role === 'ADMIN' ? 'leave-requests' : 'my-leaves') : requested;
  if (!ROUTES.includes(route)) return 'dashboard';
  if (role !== 'ADMIN' && (route === 'employees' || route === 'departments' || route === 'leave-requests')) {
    return 'dashboard';
  }
  return route;
}

function renderDashboard(root) {
  const { employees, departments, leaves } = EMS.getState();
  const totalEmp = employees.length;
  const totalDept = departments.length;
  const pending = leaves.filter((l) => l.status === 'Pending').length;
  const active = employees.filter((e) => e.status === 'Active').length;

  const byDept = departments.map((d) => ({
    label: d.name,
    value: EMS.countEmployeesInDepartment(d.id),
  }));

  const barLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const barVals = barLabels.map((_, i) => Math.max(0, leaves.filter((l) => Number(l.startDate?.slice(5, 7)) === i + 1).length));

  root.innerHTML = `
    <div class="container-fluid p-4 page-fade">
      <header class="mb-4">
        <h1 class="h2 mb-1">Dashboard</h1>
        <p class="text-secondary mb-0">Overview of employees, departments, and leave activity.</p>
      </header>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="card glass-card stats-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-users"></i>
              <h2 class="card-title mt-2"><span id="ctr_emp">0</span></h2>
              <p class="card-text">Total employees</p>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card glass-card stats-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-building"></i>
              <h2 class="card-title mt-2"><span id="ctr_dept">0</span></h2>
              <p class="card-text">Departments</p>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card glass-card stats-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-clock"></i>
              <h2 class="card-title mt-2"><span id="ctr_pending">0</span></h2>
              <p class="card-text">Pending leaves</p>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card glass-card stats-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-user-check"></i>
              <h2 class="card-title mt-2"><span id="ctr_active">0</span></h2>
              <p class="card-text">Active employees</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-lg-6">
          ${EMS.createCard({
            title: 'Headcount by department',
            subtitle: 'Pure SVG — no chart libraries',
            children: EMS.createDonutChart({ segments: byDept, title: '' }),
          })}
        </div>
        <div class="col-lg-6">
          ${EMS.createCard({
            title: 'Leave volume by month (start date)',
            subtitle: 'Based on recorded start dates in 2026',
            children: EMS.createBarChart({ labels: barLabels, values: barVals, title: '' }),
          })}
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    EMS.animateCounter(document.getElementById('ctr_emp'), totalEmp);
    EMS.animateCounter(document.getElementById('ctr_dept'), totalDept);
    EMS.animateCounter(document.getElementById('ctr_pending'), pending);
    EMS.animateCounter(document.getElementById('ctr_active'), active);
  });
}

function renderProfile(root) {
  const u = EMS.getState().user || { displayName: 'Admin', username: 'admin', email: 'admin@ems.local' };
  root.innerHTML = `
    <div class="container-fluid p-4 page-fade" style="max-width:720px">
      <h1 class="h2 mb-4">Profile</h1>
      ${EMS.createCard({
        title: 'Your account',
        subtitle: 'Your session profile is saved with the app data in this browser.',
        children: `
          <form id="ems_profile_form" class="mt-2">
            ${EMS.createFormInput({ id: 'prof_name', label: 'Display name', value: u.displayName || '', required: true })}
            ${EMS.createFormInput({ id: 'prof_email', label: 'Work email', type: 'email', value: u.email || '', required: true })}
            ${EMS.createFormInput({ id: 'prof_role', label: 'Role', value: u.role || 'Administrator', required: true })}
            <button type="submit" class="btn btn-primary ems-ripple">Save profile</button>
          </form>
        `,
      })}
    </div>
  `;
  root.querySelector('#ems_profile_form').addEventListener('submit', (e) => {
    e.preventDefault();
    EMS.clearFieldErrors(root);
    const fields = {
      prof_name: document.getElementById('prof_name').value,
      prof_email: document.getElementById('prof_email').value,
      prof_role: document.getElementById('prof_role').value,
    };
    if (
      !EMS.validateForm(fields, [
        { id: 'prof_name', rules: ['required'] },
        { id: 'prof_email', rules: ['required', 'email'] },
        { id: 'prof_role', rules: ['required'] },
      ])
    )
      return;
    EMS.setState((s) => ({
      ...s,
      user: {
        ...(s.user || {}),
        displayName: fields.prof_name.trim(),
        email: fields.prof_email.trim(),
        role: fields.prof_role.trim(),
        username: s.user?.username || 'admin',
      },
    }));
    EMS.showToast('Profile saved.', 'success');
    window.dispatchEvent(new CustomEvent('ems:user-changed'));
  });
}

function renderMyDepartment(root) {
  const user = EMS.getState().user || {};
  const employeeId = user.employeeId || null;
  const employee = employeeId ? EMS.getEmployeeById(employeeId) : null;
  const department = employee ? EMS.getDepartmentById(employee.departmentId) : null;

  if (!employee || !department) {
    root.innerHTML = `
      <div class="container-fluid p-4 page-fade">
        ${EMS.createCard({
          title: 'My Department',
          subtitle: 'Department details linked to your employee profile.',
          children: EMS.emptyState({
            icon: 'fa-building',
            title: 'Department details unavailable',
            message: 'Your employee profile is not linked to a department yet. Contact admin.',
          }),
        })}
      </div>
    `;
    return;
  }

  const teamCount = EMS.countEmployeesInDepartment(department.id);
  const peers = EMS.getState().employees
    .filter((e) => e.departmentId === department.id && e.id !== employee.id)
    .slice(0, 5)
    .map((e) => `<li class="text-secondary">${EMS.escapeHtml(e.name)} (${EMS.escapeHtml(e.status)})</li>`)
    .join('');

  root.innerHTML = `
    <div class="container-fluid p-4 page-fade">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="h2 mb-1">My Department</h1>
          <p class="text-secondary mb-0">Your assigned department information.</p>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-lg-8">
          ${EMS.createCard({
            title: department.name,
            subtitle: 'Department overview',
            children: `
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="p-3 rounded-3 border border-secondary border-opacity-25">
                    <p class="text-secondary small mb-1">Location</p>
                    <p class="mb-0 fw-semibold">${EMS.escapeHtml(department.location || 'Not specified')}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="p-3 rounded-3 border border-secondary border-opacity-25">
                    <p class="text-secondary small mb-1">Team Size</p>
                    <p class="mb-0 fw-semibold">${teamCount} member(s)</p>
                  </div>
                </div>
              </div>
            `,
          })}
        </div>
        <div class="col-lg-4">
          ${EMS.createCard({
            title: 'Your Role Context',
            subtitle: 'Employee snapshot',
            children: `
              <p class="mb-1"><span class="text-secondary">Name:</span> ${EMS.escapeHtml(employee.name)}</p>
              <p class="mb-1"><span class="text-secondary">Email:</span> ${EMS.escapeHtml(employee.email)}</p>
              <p class="mb-0"><span class="text-secondary">Status:</span> ${EMS.escapeHtml(employee.status)}</p>
            `,
          })}
        </div>
      </div>
      <div class="mt-3">
        ${EMS.createCard({
          title: 'Colleagues',
          subtitle: 'People in your department',
          children: peers
            ? `<ul class="mb-0 ps-3">${peers}</ul>`
            : `<p class="text-secondary mb-0">No additional colleagues listed yet.</p>`,
        })}
      </div>
    </div>
  `;
}

function renderSettings(root) {
  const prefs = EMS.getState().user?.preferences || { pageSize: 6, compactTables: false };
  root.innerHTML = `
    <div class="container-fluid p-4 page-fade" style="max-width:720px">
      <h1 class="h2 mb-4">Settings</h1>
      ${EMS.createCard({
        title: 'Workspace preferences',
        subtitle: 'Display density for tables. All data stays in this browser (localStorage).',
        children: `
          <form id="ems_settings_form">
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="set_compact" ${prefs.compactTables ? 'checked' : ''}>
              <label class="form-check-label" for="set_compact">Compact tables (visual density)</label>
            </div>
            <button type="submit" class="btn btn-primary ems-ripple">Save settings</button>
          </form>
        `,
      })}
    </div>
  `;
  root.querySelector('#ems_settings_form').addEventListener('submit', (e) => {
    e.preventDefault();
    const compact = document.getElementById('set_compact').checked;
    EMS.setState((s) => ({
      ...s,
      user: {
        ...(s.user || { username: 'admin', displayName: 'Admin' }),
        preferences: { ...prefs, compactTables: compact },
      },
    }));
    EMS.showToast('Settings saved.', 'success');
    document.body.classList.toggle('ems-compact', compact);
  });
}

/**
 * @param {string} route
 */
function renderPage(route) {
  const page = document.getElementById('ems-app-page');
  if (!page) return;
  const r = normalizeRoute(route);
  document.querySelectorAll('.ems-nav-hash').forEach((a) => {
    const id = a.getAttribute('data-route');
    a.classList.toggle('active', id === r);
  });
  page.classList.add('opacity-50');
  setTimeout(() => {
    switch (r) {
      case 'employees':
        EMS.renderEmployeesPage(page);
        break;
      case 'departments':
        EMS.renderDepartmentsPage(page);
        break;
      case 'leave-requests':
        EMS.renderLeaveRequestsPage(page);
        break;
      case 'my-department':
        renderMyDepartment(page);
        break;
      case 'my-leaves':
        EMS.renderMyLeavesPage(page);
        break;
      case 'profile':
        renderProfile(page);
        break;
      case 'settings':
        renderSettings(page);
        break;
      default:
        renderDashboard(page);
    }
    page.classList.remove('opacity-50');
  }, 100);
}

function getCurrentRoute() {
  return normalizeRoute(window.location.hash);
}

function navigate(hash) {
  window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
}

function initRouter() {
  const onHash = () => renderPage(window.location.hash);
  window.addEventListener('hashchange', onHash);
  if (!window.location.hash) {
    window.location.hash = 'dashboard';
  }
  onHash();
}

(function (global) {
  var EMS = global.EMS || (global.EMS = {});
  EMS.renderPage = renderPage;
  EMS.getCurrentRoute = getCurrentRoute;
  EMS.navigate = navigate;
  EMS.initRouter = initRouter;
})(typeof window !== 'undefined' ? window : this);
