/**
 * Employees module: full CRUD, search, sort, pagination, status toggle.
 */

const PAGE_SIZE = 6;

let ui = {
  page: 1,
  sortKey: 'name',
  sortDir: 'asc',
  search: '',
};

function deptName(id) {
  const d = EMS.getDepartmentById(id);
  return d ? d.name : '—';
}

function sortedFiltered() {
  const { employees } = EMS.getState();
  const q = ui.search.trim().toLowerCase();
  let list = employees.map((e) => ({ ...e }));
  if (q) {
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        deptName(e.departmentId).toLowerCase().includes(q) ||
        String(e.phone).includes(q)
    );
  }
  const mult = ui.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (ui.sortKey === 'salary') return (Number(a.salary) - Number(b.salary)) * mult;
    const av = String(a[ui.sortKey] ?? '').toLowerCase();
    const bv = String(b[ui.sortKey] ?? '').toLowerCase();
    return av.localeCompare(bv) * mult;
  });
  return list;
}

function mountEmployeeModal(root, { employee } = {}) {
  const isEdit = Boolean(employee);
  const modalId = 'ems_employee_modal';
  const depts = EMS.getState().departments.map((d) => ({ value: String(d.id), label: d.name }));
  const body = `
    <form id="ems_employee_form" novalidate>
      <div class="row">
        <div class="col-md-6">${EMS.createFormInput({ id: 'emp_name', label: 'Full Name', value: employee?.name ?? '', required: true })}</div>
        <div class="col-md-6">${EMS.createFormInput({ id: 'emp_email', label: 'Email', type: 'email', value: employee?.email ?? '', required: true })}</div>
        <div class="col-md-6">${EMS.createFormInput({ id: 'emp_phone', label: 'Phone', value: employee?.phone ?? '', required: true })}</div>
        <div class="col-md-6">${EMS.createFormInput({ id: 'emp_dept', label: 'Department', required: true, value: employee ? String(employee.departmentId) : '', options: depts })}</div>
        <div class="col-md-6">${EMS.createFormInput({ id: 'emp_salary', label: 'Salary', type: 'number', value: employee?.salary ?? '', required: true })}</div>
        <div class="col-md-6">${EMS.createFormInput({ id: 'emp_status', label: 'Status', value: employee?.status ?? 'Active', options: [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
        ] })}</div>
      </div>
    </form>
  `;
  const footer = `
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-primary ems-emp-save">${isEdit ? 'Save changes' : 'Add employee'}</button>
  `;
  const host = document.getElementById('ems-modal-root');
  document.getElementById(modalId)?.remove();
  host.insertAdjacentHTML(
    'beforeend',
    EMS.createModal({
      id: modalId,
      title: isEdit ? 'Edit employee' : 'Add employee',
      body,
      footer,
    })
  );
  const el = document.getElementById(modalId);
  // @ts-ignore
  const modal = new bootstrap.Modal(el);
  el.querySelector('.ems-emp-save').addEventListener('click', () => {
    EMS.clearFieldErrors(el);
    const fields = {
      emp_name: document.getElementById('emp_name').value,
      emp_email: document.getElementById('emp_email').value,
      emp_phone: document.getElementById('emp_phone').value,
      emp_dept: document.getElementById('emp_dept').value,
      emp_salary: document.getElementById('emp_salary').value,
    };
    const schema = [
      { id: 'emp_name', rules: ['required'] },
      { id: 'emp_email', rules: ['required', 'email'] },
      { id: 'emp_phone', rules: ['required', 'phone'] },
      { id: 'emp_dept', rules: ['required'] },
      { id: 'emp_salary', rules: ['required', 'salary'] },
    ];
    if (!EMS.validateForm(fields, schema)) return;
    const status = document.getElementById('emp_status').value;
    const departmentId = Number(document.getElementById('emp_dept').value);
    if (isEdit) {
      EMS.setState((s) => {
        const emps = s.employees.map((e) =>
          e.id === employee.id
            ? {
                ...e,
                name: fields.emp_name.trim(),
                email: fields.emp_email.trim(),
                phone: fields.emp_phone.trim(),
                departmentId,
                salary: Number(fields.emp_salary),
                status,
              }
            : e
        );
        return { ...s, employees: emps };
      });
      EMS.showToast('Employee updated.', 'success');
    } else {
      const row = {
        id: EMS.nextEmployeeId(),
        name: fields.emp_name.trim(),
        email: fields.emp_email.trim(),
        phone: fields.emp_phone.trim(),
        departmentId,
        salary: Number(fields.emp_salary),
        status,
        createdAt: new Date().toISOString(),
      };
      EMS.setState((s) => ({ ...s, employees: [...s.employees, row] }));
      EMS.showToast('Employee added.', 'success');
    }
    modal.hide();
    el.addEventListener('hidden.bs.modal', () => el.remove(), { once: true });
    renderEmployeesPage(root);
  });
  modal.show();
}

function renderEmployeesPage(root) {
  const list = sortedFiltered();
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (ui.page > pages) ui.page = pages;
  const start = (ui.page - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'department', label: 'Department' },
    { key: 'salary', label: 'Salary', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const bodyHtml =
    slice.length === 0
      ? ''
      : slice
          .map((emp) => {
            const st = emp.status === 'Active' ? 'success' : 'secondary';
            return `
        <tr class="fade-in">
          <td>${emp.id}</td>
          <td class="fw-semibold">${EMS.escapeHtml(emp.name)}</td>
          <td>${EMS.escapeHtml(emp.email)}</td>
          <td>${EMS.escapeHtml(emp.phone)}</td>
          <td><span class="badge rounded-pill ems-badge-soft">${EMS.escapeHtml(deptName(emp.departmentId))}</span></td>
          <td class="text-success fw-medium">$${Number(emp.salary).toLocaleString()}</td>
          <td>
            <button type="button" class="btn btn-sm ems-status-toggle ems-ripple btn-outline-${st === 'success' ? 'success' : 'secondary'}" data-id="${emp.id}" title="Toggle status">
              ${EMS.escapeHtml(emp.status)}
            </button>
          </td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-primary ems-emp-edit ems-ripple me-1" data-id="${emp.id}" aria-label="Edit"><i class="fas fa-edit"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger ems-emp-del ems-ripple" data-id="${emp.id}" aria-label="Delete"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
          })
          .join('');

  const tableBlock =
    slice.length === 0
      ? EMS.emptyState({
          icon: 'fa-user-astronaut',
          title: 'No employees match',
          message: ui.search ? 'Try a different search term.' : 'Add your first team member to get started.',
          actionHtml: `<button type="button" class="btn btn-primary ems-emp-add ems-ripple"><i class="fas fa-plus"></i> Add employee</button>`,
        })
      : EMS.createTable({
          columns,
          headExtra: '',
          bodyHtml,
          empty: false,
        });

  root.innerHTML = `
    <div class="container-fluid p-4 page-fade">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="h2 mb-1">Employees</h1>
          <p class="text-secondary mb-0">Manage roster, org links, and employment status.</p>
        </div>
        <button type="button" class="btn btn-primary ems-emp-add ems-ripple"><i class="fas fa-plus"></i> Add employee</button>
      </div>
      ${EMS.createCard({
        title: 'Directory',
        subtitle: 'Search and sort update results instantly. Data persists in the browser.',
        children: `
          <div class="row g-2 mb-3">
            <div class="col-md-6">
              <label class="form-label visually-hidden" for="ems_emp_search">Search</label>
              <input type="search" class="form-control" id="ems_emp_search" placeholder="Search by name, email, phone, department…" value="${EMS.escapeHtml(ui.search)}">
            </div>
          </div>
          ${tableBlock}
          ${slice.length ? EMS.createPagination({ page: ui.page, pageSize: PAGE_SIZE, total }) : ''}
        `,
      })}
    </div>
  `;

  const searchEl = root.querySelector('#ems_emp_search');
  searchEl?.addEventListener('input', () => {
    ui.search = searchEl.value;
    ui.page = 1;
    renderEmployeesPage(root);
  });

  root.querySelectorAll('.ems-th-sort').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort-key');
      if (key === ui.sortKey) ui.sortDir = ui.sortDir === 'asc' ? 'desc' : 'asc';
      else {
        ui.sortKey = key;
        ui.sortDir = 'asc';
      }
      renderEmployeesPage(root);
    });
  });

  root.querySelectorAll('.ems-page-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = Number(btn.getAttribute('data-page'));
      if (!Number.isNaN(p)) {
        ui.page = p;
        renderEmployeesPage(root);
      }
    });
  });

  root.querySelectorAll('.ems-emp-add').forEach((b) => b.addEventListener('click', () => mountEmployeeModal(root, {})));

  root.querySelectorAll('.ems-emp-edit').forEach((b) =>
    b.addEventListener('click', () => {
      const id = Number(b.getAttribute('data-id'));
      const emp = EMS.getState().employees.find((e) => e.id === id);
      if (emp) mountEmployeeModal(root, { employee: emp });
    })
  );

  root.querySelectorAll('.ems-emp-del').forEach((b) =>
    b.addEventListener('click', async () => {
      const id = Number(b.getAttribute('data-id'));
      const ok = await EMS.confirmDialog({
        title: 'Delete employee',
        message: 'This removes the employee record permanently.',
        confirmText: 'Delete',
        danger: true,
      });
      if (!ok) return;
      EMS.setState((s) => ({ ...s, employees: s.employees.filter((e) => e.id !== id) }));
      EMS.showToast('Employee removed.', 'success');
      renderEmployeesPage(root);
    })
  );

  root.querySelectorAll('.ems-status-toggle').forEach((b) =>
    b.addEventListener('click', () => {
      const id = Number(b.getAttribute('data-id'));
      EMS.setState((s) => ({
        ...s,
        employees: s.employees.map((e) =>
          e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e
        ),
      }));
      EMS.showToast('Status updated.', 'info');
      renderEmployeesPage(root);
    })
  );
}

(function (global) {
  var EMS = global.EMS || (global.EMS = {});
  EMS.renderEmployeesPage = renderEmployeesPage;
})(typeof window !== 'undefined' ? window : this);
