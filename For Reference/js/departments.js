/**
 * Departments CRUD with employee linkage and safe delete.
 */

function mountDepartmentModal(root, { department } = {}) {
  const isEdit = Boolean(department);
  const modalId = 'ems_dept_modal';
  const body = `
    <form id="ems_dept_form" novalidate>
      ${EMS.createFormInput({ id: 'dept_name', label: 'Department name', value: department?.name ?? '', required: true })}
      ${EMS.createFormInput({ id: 'dept_manager', label: 'Manager', value: department?.manager ?? '', placeholder: 'Manager name', required: true })}
    </form>
  `;
  const footer = `
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-primary ems-dept-save">${isEdit ? 'Save' : 'Create department'}</button>
  `;
  const host = document.getElementById('ems-modal-root');
  document.getElementById(modalId)?.remove();
  host.insertAdjacentHTML(
    'beforeend',
    EMS.createModal({
      id: modalId,
      title: isEdit ? 'Edit department' : 'New department',
      body,
      footer,
    })
  );
  const el = document.getElementById(modalId);
  const modal = new bootstrap.Modal(el);
  el.querySelector('.ems-dept-save').addEventListener('click', () => {
    EMS.clearFieldErrors(el);
    const fields = {
      dept_name: document.getElementById('dept_name').value,
      dept_manager: document.getElementById('dept_manager').value,
    };
    const schema = [
      { id: 'dept_name', rules: ['required'] },
      { id: 'dept_manager', rules: ['required'] },
    ];
    if (!EMS.validateForm(fields, schema)) return;
    if (isEdit) {
      const newName = fields.dept_name.trim();
      EMS.setState((s) => ({
        ...s,
        departments: s.departments.map((d) =>
          d.id === department.id ? { ...d, name: newName, manager: fields.dept_manager.trim() } : d
        ),
      }));
      EMS.showToast('Department updated.', 'success');
    } else {
      const row = {
        id: EMS.nextDepartmentId(),
        name: fields.dept_name.trim(),
        manager: fields.dept_manager.trim(),
        createdAt: new Date().toISOString(),
      };
      EMS.setState((s) => ({ ...s, departments: [...s.departments, row] }));
      EMS.showToast('Department created.', 'success');
    }
    modal.hide();
    el.addEventListener('hidden.bs.modal', () => el.remove(), { once: true });
    renderDepartmentsPage(root);
  });
  modal.show();
}

function renderDepartmentsPage(root) {
  const { departments, employees } = EMS.getState();
  const rows = departments.map((d) => ({
    ...d,
    headcount: EMS.countEmployeesInDepartment(d.id),
  }));

  const bodyHtml =
    rows.length === 0
      ? ''
      : rows
          .map(
            (d) => `
    <tr class="fade-in">
      <td>${d.id}</td>
      <td class="fw-semibold text-primary">${EMS.escapeHtml(d.name)}</td>
      <td>${EMS.escapeHtml(d.manager)}</td>
      <td><span class="badge ems-badge-soft">${d.headcount} linked</span></td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-primary ems-dept-edit ems-ripple me-1" data-id="${d.id}"><i class="fas fa-edit"></i></button>
        <button type="button" class="btn btn-sm btn-outline-danger ems-dept-del ems-ripple" data-id="${d.id}"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`
          )
          .join('');

  const totalEmps = employees.length;
  const avg = departments.length ? (totalEmps / departments.length).toFixed(2) : '0';

  const tableBlock =
    rows.length === 0
      ? EMS.emptyState({
          icon: 'fa-building',
          title: 'No departments yet',
          message: 'Create departments, then assign employees from the Employees screen.',
          actionHtml: `<button type="button" class="btn btn-primary ems-dept-add ems-ripple"><i class="fas fa-plus"></i> Add department</button>`,
        })
      : EMS.createTable({
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'manager', label: 'Manager' },
            { key: 'headcount', label: 'Employees' },
            { key: 'actions', label: 'Actions' },
          ],
          bodyHtml,
        });

  root.innerHTML = `
    <div class="container-fluid p-4 page-fade">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="h2 mb-1">Departments</h1>
          <p class="text-secondary mb-0">Org units drive reporting and employee assignment.</p>
        </div>
        <button type="button" class="btn btn-primary ems-dept-add ems-ripple"><i class="fas fa-plus"></i> Add department</button>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          ${EMS.createCard({
            title: '',
            children: `<div class="text-center py-2"><i class="fas fa-building fa-2x text-primary mb-2"></i><div class="display-6 fw-bold">${departments.length}</div><p class="text-secondary mb-0 small text-uppercase">Departments</p></div>`,
            className: 'h-100',
          })}
        </div>
        <div class="col-md-4">
          ${EMS.createCard({
            title: '',
            children: `<div class="text-center py-2"><i class="fas fa-users fa-2x text-info mb-2"></i><div class="display-6 fw-bold">${totalEmps}</div><p class="text-secondary mb-0 small text-uppercase">Total employees</p></div>`,
            className: 'h-100',
          })}
        </div>
        <div class="col-md-4">
          ${EMS.createCard({
            title: '',
            children: `<div class="text-center py-2"><i class="fas fa-chart-line fa-2x text-success mb-2"></i><div class="display-6 fw-bold">${avg}</div><p class="text-secondary mb-0 small text-uppercase">Avg per department</p></div>`,
            className: 'h-100',
          })}
        </div>
      </div>
      ${EMS.createCard({
        title: 'Department directory',
        subtitle: 'Deletion is blocked while employees are linked to a department.',
        children: tableBlock,
      })}
    </div>
  `;

  root.querySelectorAll('.ems-dept-add').forEach((b) => b.addEventListener('click', () => mountDepartmentModal(root, {})));

  root.querySelectorAll('.ems-dept-edit').forEach((b) =>
    b.addEventListener('click', () => {
      const id = Number(b.getAttribute('data-id'));
      const dep = EMS.getState().departments.find((d) => d.id === id);
      if (dep) mountDepartmentModal(root, { department: dep });
    })
  );

  root.querySelectorAll('.ems-dept-del').forEach((b) =>
    b.addEventListener('click', async () => {
      const id = Number(b.getAttribute('data-id'));
      const used = EMS.countEmployeesInDepartment(id);
      if (used > 0) {
        EMS.showToast(`Cannot delete: ${used} employee(s) are assigned to this department.`, 'error');
        return;
      }
      const ok = await EMS.confirmDialog({
        title: 'Delete department',
        message: 'This action cannot be undone.',
        confirmText: 'Delete',
        danger: true,
      });
      if (!ok) return;
      EMS.setState((s) => ({ ...s, departments: s.departments.filter((d) => d.id !== id) }));
      EMS.showToast('Department removed.', 'success');
      renderDepartmentsPage(root);
    })
  );
}

(function (global) {
  var EMS = global.EMS || (global.EMS = {});
  EMS.renderDepartmentsPage = renderDepartmentsPage;
})(typeof window !== 'undefined' ? window : this);
