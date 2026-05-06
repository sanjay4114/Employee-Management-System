/**
 * Leave management split by role:
 * - EMPLOYEE -> my leaves + apply
 * - ADMIN -> leave requests + approve/reject
 */

let adminFilterStatus = 'all';

function empName(id) {
  const e = EMS.getEmployeeById(id);
  return e ? e.name : 'Unknown employee';
}

function statusClass(st) {
  if (st === 'Approved') return 'success';
  if (st === 'Rejected') return 'danger';
  return 'warning';
}

function getCurrentEmployeeId() {
  const user = EMS.getState().user || {};
  if (user.employeeId) return Number(user.employeeId);
  if (user.email) {
    const match = EMS.getState().employees.find((e) => e.email.toLowerCase() === String(user.email).toLowerCase());
    if (match) return match.id;
  }
  return null;
}

function mountApplyLeaveModal(root, employeeId) {
  if (!employeeId) {
    EMS.showToast('Employee profile is not linked.', 'error');
    return;
  }
  const modalId = 'ems_leave_apply_modal';
  const body = `
    <form novalidate>
      <p class="small text-secondary">Applying leave as <strong class="text-white">${EMS.escapeHtml(empName(employeeId))}</strong>.</p>
      ${EMS.createFormInput({
        id: 'leave_type',
        label: 'Leave type',
        required: true,
        value: 'Vacation',
        options: [
          { value: 'Vacation', label: 'Vacation' },
          { value: 'Sick', label: 'Sick' },
          { value: 'Personal', label: 'Personal' },
          { value: 'Other', label: 'Other' },
        ],
      })}
      <div class="row">
        <div class="col-md-6">${EMS.createFormInput({ id: 'leave_start', label: 'Start date', type: 'date', required: true })}</div>
        <div class="col-md-6">${EMS.createFormInput({ id: 'leave_end', label: 'End date', type: 'date', required: true })}</div>
      </div>
    </form>
  `;
  const footer = `
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-primary ems-leave-submit">Submit request</button>
  `;
  const host = document.getElementById('ems-modal-root');
  document.getElementById(modalId)?.remove();
  host.insertAdjacentHTML('beforeend', EMS.createModal({ id: modalId, title: 'Apply for leave', body, footer }));
  const el = document.getElementById(modalId);
  const modal = new bootstrap.Modal(el);
  el.querySelector('.ems-leave-submit').addEventListener('click', () => {
    EMS.clearFieldErrors(el);
    const fields = {
      leave_type: document.getElementById('leave_type').value,
      leave_start: document.getElementById('leave_start').value,
      leave_end: document.getElementById('leave_end').value,
    };
    const schema = [
      { id: 'leave_type', rules: ['required'] },
      { id: 'leave_start', rules: ['required'] },
      { id: 'leave_end', rules: ['required'] },
    ];
    if (!EMS.validateForm(fields, schema)) return;
    if (new Date(fields.leave_end) < new Date(fields.leave_start)) {
      EMS.showToast('End date must be on or after start date.', 'error');
      return;
    }
    const row = {
      id: EMS.nextLeaveId(),
      employeeId: Number(employeeId),
      type: fields.leave_type,
      startDate: fields.leave_start,
      endDate: fields.leave_end,
      status: 'Pending',
    };
    EMS.setState((s) => ({ ...s, leaves: [...s.leaves, row] }));
    EMS.showToast('Leave request submitted.', 'success');
    modal.hide();
    el.addEventListener('hidden.bs.modal', () => el.remove(), { once: true });
    renderMyLeavesPage(root);
  });
  modal.show();
}

function renderMyLeavesPage(root) {
  const employeeId = getCurrentEmployeeId();
  const leaves = EMS.getState().leaves.filter((l) => Number(l.employeeId) === Number(employeeId));

  const bodyHtml = leaves
    .map((leave) => {
      const sc = statusClass(leave.status);
      return `
      <tr class="fade-in">
        <td><span class="badge ems-badge-soft">${EMS.escapeHtml(leave.type)}</span></td>
        <td>${EMS.escapeHtml(leave.startDate)}</td>
        <td>${EMS.escapeHtml(leave.endDate)}</td>
        <td><span class="badge rounded-pill bg-${sc}">${EMS.escapeHtml(leave.status)}</span></td>
      </tr>`;
    })
    .join('');

  const tableBlock = leaves.length
    ? EMS.createTable({
        columns: [
          { key: 'type', label: 'Type' },
          { key: 'start', label: 'Start' },
          { key: 'end', label: 'End' },
          { key: 'status', label: 'Status' },
        ],
        bodyHtml,
      })
    : EMS.emptyState({
        icon: 'fa-calendar-check',
        title: 'No leave requests yet',
        message: 'Apply for leave to create your first request.',
      });

  root.innerHTML = `
    <div class="container-fluid p-4 page-fade">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
        <div>
          <h1 class="h2 mb-1">My Leaves</h1>
          <p class="text-secondary mb-0">Track your leave requests and approval status.</p>
        </div>
        <button type="button" class="btn btn-primary ems-leave-apply ems-ripple"><i class="fas fa-plus"></i> Apply leave</button>
      </div>
      ${EMS.createCard({
        title: 'My requests',
        subtitle: 'Submitted by your employee account only.',
        children: tableBlock,
      })}
    </div>
  `;

  root.querySelectorAll('.ems-leave-apply').forEach((b) => b.addEventListener('click', () => mountApplyLeaveModal(root, employeeId)));
}

function renderLeaveRequestsPage(root) {
  const allLeaves = EMS.getState().leaves;
  const leaves = adminFilterStatus === 'all' ? allLeaves : allLeaves.filter((l) => l.status === adminFilterStatus);

  const summary = {
    Pending: allLeaves.filter((l) => l.status === 'Pending').length,
    Approved: allLeaves.filter((l) => l.status === 'Approved').length,
    Rejected: allLeaves.filter((l) => l.status === 'Rejected').length,
    Total: allLeaves.length,
  };

  const bodyHtml = leaves
    .map((leave) => {
      const sc = statusClass(leave.status);
      const actions =
        leave.status === 'Pending'
          ? `<button type="button" class="btn btn-sm btn-success ems-leave-approve ems-ripple me-1" data-id="${leave.id}">Approve</button>
             <button type="button" class="btn btn-sm btn-outline-danger ems-leave-reject ems-ripple" data-id="${leave.id}">Reject</button>`
          : `<span class="text-secondary small">No actions</span>`;
      return `
      <tr class="fade-in">
        <td class="fw-semibold">${EMS.escapeHtml(empName(leave.employeeId))}</td>
        <td><span class="badge ems-badge-soft">${EMS.escapeHtml(leave.type)}</span></td>
        <td>${EMS.escapeHtml(leave.startDate)}</td>
        <td>${EMS.escapeHtml(leave.endDate)}</td>
        <td><span class="badge rounded-pill bg-${sc}">${EMS.escapeHtml(leave.status)}</span></td>
        <td>${actions}</td>
      </tr>`;
    })
    .join('');

  const tableBlock = leaves.length
    ? EMS.createTable({
        columns: [
          { key: 'emp', label: 'Employee' },
          { key: 'type', label: 'Type' },
          { key: 'start', label: 'Start' },
          { key: 'end', label: 'End' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' },
        ],
        bodyHtml,
      })
    : EMS.emptyState({ icon: 'fa-calendar-check', title: 'No leave records', message: 'No requests in this filter.' });

  root.innerHTML = `
    <div class="container-fluid p-4 page-fade">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
        <div>
          <h1 class="h2 mb-1">Leave Requests</h1>
          <p class="text-secondary mb-0">Admin review queue for employee leave requests.</p>
        </div>
      </div>
      <div class="row g-3 mb-4">
        ${['Pending', 'Approved', 'Rejected', 'Total']
          .map((label, i) => {
            const val = summary[label];
            const icon = ['fa-clock', 'fa-check-circle', 'fa-times-circle', 'fa-calendar'][i];
            const tone = ['warning', 'success', 'danger', 'info'][i];
            return `<div class="col-6 col-md-3">${EMS.createCard({
              title: '',
              children: `<div class="text-center py-2"><i class="fas ${icon} fa-2x text-${tone} mb-2"></i><div class="display-6 fw-bold">${val}</div><p class="text-secondary mb-0 small">${label}</p></div>`,
              className: 'h-100',
            })}</div>`;
          })
          .join('')}
      </div>
      ${EMS.createCard({
        title: 'All requests',
        subtitle: 'Filter and approve/reject pending items.',
        children: `
          <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
            <label class="form-label mb-0" for="ems_leave_filter_admin">Status</label>
            <select class="form-select w-auto" id="ems_leave_filter_admin">
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          ${tableBlock}
        `,
      })}
    </div>
  `;

  const sel = root.querySelector('#ems_leave_filter_admin');
  if (sel) {
    sel.value = adminFilterStatus;
    sel.addEventListener('change', () => {
      adminFilterStatus = sel.value;
      renderLeaveRequestsPage(root);
    });
  }

  root.querySelectorAll('.ems-leave-approve').forEach((b) =>
    b.addEventListener('click', () => {
      const id = Number(b.getAttribute('data-id'));
      EMS.setState((s) => ({ ...s, leaves: s.leaves.map((l) => (l.id === id ? { ...l, status: 'Approved' } : l)) }));
      EMS.showToast('Leave approved.', 'success');
      renderLeaveRequestsPage(root);
    })
  );

  root.querySelectorAll('.ems-leave-reject').forEach((b) =>
    b.addEventListener('click', async () => {
      const id = Number(b.getAttribute('data-id'));
      const ok = await EMS.confirmDialog({ title: 'Reject leave', message: 'Reject this leave request?', confirmText: 'Reject', danger: true });
      if (!ok) return;
      EMS.setState((s) => ({ ...s, leaves: s.leaves.map((l) => (l.id === id ? { ...l, status: 'Rejected' } : l)) }));
      EMS.showToast('Leave rejected.', 'info');
      renderLeaveRequestsPage(root);
    })
  );
}

(function (global) {
  var EMS = global.EMS || (global.EMS = {});
  EMS.renderMyLeavesPage = renderMyLeavesPage;
  EMS.renderLeaveRequestsPage = renderLeaveRequestsPage;
  EMS.renderLeavesPage = function (root) {
    const role = String(EMS.getState().user?.role || 'EMPLOYEE').toUpperCase();
    if (role === 'ADMIN') return renderLeaveRequestsPage(root);
    return renderMyLeavesPage(root);
  };
})(typeof window !== 'undefined' ? window : this);
