/**
 * Application bootstrap: shell layout, router, global interactions.
 * No build step — load scripts in order from index.html (Live Server / Open in Browser).
 */

function buildShell() {
  const user = EMS.getState().user;
  const display = user?.displayName || user?.username || 'Admin';
  const role = user?.role || 'EMPLOYEE';
  const sidebar = EMS.createSidebar(EMS.getCurrentRoute(), role);
  const navbar = EMS.createNavbar({ userName: display });
  return `
    <div class="ems-app d-flex min-vh-100">
      ${sidebar}
      <div class="main-content flex-grow-1 d-flex flex-column" id="ems-main">
        ${navbar}
        <main class="flex-grow-1 position-relative" id="ems-app-page" aria-live="polite"></main>
      </div>
    </div>
    <div id="ems-modal-root"></div>
    <div id="ems-toast-host" class="ems-toast-host" aria-live="polite" aria-atomic="true"></div>
    <div id="ems-global-loader" class="ems-global-loader d-none" role="status" aria-busy="true">
      <div class="ems-spinner"></div>
    </div>
  `;
}

function wireChrome(root) {
  const sidebar = root.querySelector('#emsSidebar');
  const toggle = root.querySelector('.ems-sidebar-toggle');
  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar?.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 992) return;
    if (!sidebar?.classList.contains('show')) return;
    if (sidebar.contains(e.target) || toggle?.contains(e.target)) return;
    sidebar.classList.remove('show');
  });

  root.querySelectorAll('.ems-nav-hash').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 992) sidebar?.classList.remove('show');
    });
  });

  root.querySelectorAll('.ems-logout').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      EMS.setState((s) => ({ ...s, user: null }));
      window.location.href = 'login.html';
    });
  });

  window.addEventListener('ems:user-changed', () => {
    const u = EMS.getState().user;
    const label = u?.displayName || u?.username || 'Admin';
    const dropBtn = root.querySelector('.navbar .dropdown-toggle');
    if (dropBtn) dropBtn.innerHTML = `<i class="fas fa-user"></i> ${label.replace(/</g, '&lt;')}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  EMS.loadState();

  if (!EMS.getState().user) {
    window.location.href = 'login.html';
    return;
  }

  const app = document.getElementById('ems-root');
  if (!app) return;

  EMS.showGlobalLoading(true);
  app.innerHTML = buildShell();
  wireChrome(app);
  EMS.initRipple(app);
  if (EMS.getState().user?.preferences?.compactTables) {
    document.body.classList.add('ems-compact');
  }
  EMS.initRouter();
  setTimeout(() => EMS.showGlobalLoading(false), 220);
});
