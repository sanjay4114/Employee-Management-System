/**
 * Reusable UI components, toasts, modals, validation, and table helpers.
 */

/** @type {number|null} */
let toastSeq = 0;

/**
 * @param {object} [opts]
 * @param {string|null} [opts.userName]
 */
function createNavbar({ userName = 'Admin' } = {}) {
  const name = userName || 'Admin';
  const nav = (hash, label, icon) =>
    `<li><a class="dropdown-item ems-nav-hash" href="#${hash}" data-route="${hash}"><i class="fas ${icon}"></i> ${label}</a></li>`;
  return `
    <nav class="navbar navbar-expand-lg ems-navbar">
      <div class="container-fluid">
        <button class="btn btn-outline-secondary d-lg-none ems-sidebar-toggle" type="button" aria-label="Open menu">
          <i class="fas fa-bars"></i>
        </button>
        <span class="navbar-brand d-lg-none ems-brand-sm">EMS</span>
        <div class="ms-auto d-flex align-items-center gap-2">
          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-user"></i> ${escapeHtml(name)}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              ${nav('profile', 'Profile', 'fa-user')}
              ${nav('settings', 'Settings', 'fa-cog')}
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item ems-logout" href="#"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `;
}

/**
 * @param {string} activeRoute — route id without hash
 * @param {string} role
 */
function createSidebar(activeRoute, role) {
  const isAdmin = String(role || '').toUpperCase() === 'ADMIN';
  const items = isAdmin
    ? [
        ['dashboard', 'fa-tachometer-alt', 'Dashboard'],
        ['employees', 'fa-users', 'Employees'],
        ['departments', 'fa-building', 'Departments'],
        ['leave-requests', 'fa-calendar-check', 'Leave Requests'],
        ['profile', 'fa-user', 'Profile'],
        ['settings', 'fa-cog', 'Settings'],
      ]
    : [
        ['dashboard', 'fa-tachometer-alt', 'Dashboard'],
        ['my-department', 'fa-building-user', 'My Department'],
        ['my-leaves', 'fa-calendar-plus', 'My Leaves'],
        ['profile', 'fa-user', 'Profile'],
        ['settings', 'fa-cog', 'Settings'],
      ];
  const links = items
    .map(
      ([id, icon, label]) => `
      <li class="nav-item">
        <a class="nav-link ems-nav-hash ${activeRoute === id ? 'active' : ''}" href="#${id}" data-route="${id}">
          <i class="fas ${icon}"></i> ${label}
        </a>
      </li>
    `
    )
    .join('');
  return `
    <nav class="sidebar ems-sidebar" id="emsSidebar">
      <div class="p-3">
        <h5 class="ems-sidebar-logo">EMS</h5>
      </div>
      <ul class="nav flex-column">${links}</ul>
    </nav>
  `;
}

/**
 * @param {{ title?: string, subtitle?: string, children: string, className?: string, bodyClass?: string }} opts
 */
function createCard({ title = '', subtitle = '', children = '', className = '', bodyClass = '' }) {
  const head =
    title || subtitle
      ? `<div class="card-header glass-card-header">
          ${title ? `<h2 class="h5 card-title mb-0">${escapeHtml(title)}</h2>` : ''}
          ${subtitle ? `<p class="text-secondary small mb-0 mt-1">${escapeHtml(subtitle)}</p>` : ''}
        </div>`
      : '';
  return `
    <div class="card glass-card ${className}">
      ${head}
      <div class="card-body ${bodyClass}">${children}</div>
    </div>
  `;
}

/**
 * Advanced table: columns, row html fragments, optional toolbar.
 * @param {{ id?: string, columns: { key: string, label: string, sortable?: boolean, className?: string }[], headExtra?: string, bodyHtml: string, empty?: boolean }} opts
 */
function createTable({ id = 'ems-data-table', columns, headExtra = '', bodyHtml, empty = false }) {
  const th = columns
    .map((c) => {
      const sort = c.sortable
        ? ` data-sort-key="${escapeHtml(c.key)}" role="button" tabindex="0" class="ems-th-sort ${c.className || ''}"`
        : ` class="${c.className || ''}"`;
      return `<th${sort}>${escapeHtml(c.label)}${c.sortable ? ' <i class="fas fa-sort text-muted small"></i>' : ''}</th>`;
    })
    .join('');
  if (empty) {
    return `<div class="table-responsive rounded-3 overflow-hidden border border-secondary border-opacity-25">${bodyHtml}</div>`;
  }
  return `
    <div class="table-responsive rounded-3 overflow-hidden border border-secondary border-opacity-25">
      <table class="table table-hover mb-0" id="${escapeHtml(id)}">
        <thead><tr>${th}${headExtra}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>
  `;
}

/**
 * Bootstrap modal shell (insert into #ems-modal-root).
 */
function createModal({ id, title, body, footer = '', sizeClass = '' }) {
  return `
    <div class="modal fade" id="${escapeHtml(id)}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered ${sizeClass}">
        <div class="modal-content glass-modal">
          <div class="modal-header">
            <h2 class="modal-title h5">${escapeHtml(title)}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">${body}</div>
          ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Labeled input with validation hook target.
 * @param {{ id: string, name?: string, label: string, type?: string, value?: string|number, placeholder?: string, required?: boolean, options?: { value: string, label: string }[], wrapperClass?: string }} p
 */
function createFormInput(p) {
  const {
    id,
    name = id,
    label,
    type = 'text',
    value = '',
    placeholder = '',
    required = false,
    options,
    wrapperClass = 'mb-3',
  } = p;
  const errId = `${id}_error`;
  let control = '';
  if (options) {
    const opts = options
      .map((o) => `<option value="${escapeHtml(o.value)}" ${String(value) === String(o.value) ? 'selected' : ''}>${escapeHtml(o.label)}</option>`)
      .join('');
    control = `<select class="form-select" id="${escapeHtml(id)}" name="${escapeHtml(name)}" ${required ? 'required' : ''}>${opts}</select>`;
  } else if (type === 'textarea') {
    control = `<textarea class="form-control" id="${escapeHtml(id)}" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" ${required ? 'required' : ''}>${escapeHtml(String(value))}</textarea>`;
  } else {
    control = `<input type="${escapeHtml(type)}" class="form-control" id="${escapeHtml(id)}" name="${escapeHtml(name)}" value="${escapeHtml(String(value))}" placeholder="${escapeHtml(placeholder)}" ${required ? 'required' : ''}>`;
  }
  return `
    <div class="${wrapperClass} ems-field" data-field="${escapeHtml(id)}">
      <label class="form-label" for="${escapeHtml(id)}">${escapeHtml(label)}${required ? ' <span class="text-danger">*</span>' : ''}</label>
      ${control}
      <div class="invalid-feedback d-block" id="${escapeHtml(errId)}" role="alert"></div>
    </div>
  `;
}

function setFieldError(fieldId, message) {
  const el = document.getElementById(`${fieldId}_error`);
  const input = document.getElementById(fieldId);
  if (el) {
    el.textContent = message || '';
    el.style.minHeight = message ? '1.25rem' : '';
  }
  if (input) {
    input.classList.toggle('is-invalid', Boolean(message));
  }
}

function clearFieldErrors(root = document) {
  root.querySelectorAll('.invalid-feedback').forEach((n) => {
    n.textContent = '';
  });
  root.querySelectorAll('.is-invalid').forEach((n) => n.classList.remove('is-invalid'));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Digits-only length >= 10 after stripping separators */
function validatePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10;
}

function validateEmail(value) {
  return EMAIL_RE.test(String(value || '').trim());
}

function validateRequired(value) {
  return String(value ?? '').trim().length > 0;
}

function validateSalary(value) {
  const n = Number(value);
  return !Number.isNaN(n) && n > 0 && n < 1e9;
}

/**
 * @param {Record<string, string>} fields — id -> value
 * @param {{ id: string, rules: ('required'|'email'|'phone'|'salary')[] }[]} schema
 * @returns {boolean}
 */
function validateForm(fields, schema) {
  let ok = true;
  schema.forEach(({ id, rules }) => {
    setFieldError(id, '');
    const val = fields[id];
    for (const rule of rules) {
      if (rule === 'required' && !validateRequired(val)) {
        setFieldError(id, 'This field is required.');
        ok = false;
        break;
      }
      if (rule === 'email' && String(val || '').trim() && !validateEmail(val)) {
        setFieldError(id, 'Enter a valid email address.');
        ok = false;
        break;
      }
      if (rule === 'phone' && String(val || '').trim() && !validatePhone(val)) {
        setFieldError(id, 'Enter a valid phone number (at least 10 digits).');
        ok = false;
        break;
      }
      if (rule === 'salary' && !validateSalary(val)) {
        setFieldError(id, 'Salary must be a positive number.');
        ok = false;
        break;
      }
    }
  });
  return ok;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info', duration = 3200) {
  const host = document.getElementById('ems-toast-host');
  if (!host) return;
  const id = `toast_${++toastSeq}`;
  const icon =
    type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  const wrap = document.createElement('div');
  wrap.className = `ems-toast ems-toast--${type} fade-in`;
  wrap.id = id;
  wrap.innerHTML = `<i class="fas ${icon} ems-toast__icon"></i><span class="ems-toast__msg">${escapeHtml(message)}</span>`;
  host.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('ems-toast--show'));
  setTimeout(() => {
    wrap.classList.remove('ems-toast--show');
    setTimeout(() => wrap.remove(), 400);
  }, duration);
}

/**
 * @returns {Promise<boolean>}
 */
function confirmDialog({ title, message, confirmText = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    const id = 'ems_confirm_modal';
    const root = document.getElementById('ems-modal-root');
    if (!root) {
      resolve(window.confirm(message));
      return;
    }
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const btnClass = danger ? 'btn-danger' : 'btn-primary';
    root.insertAdjacentHTML(
      'beforeend',
      createModal({
        id,
        title,
        body: `<p class="mb-0 text-secondary">${escapeHtml(message)}</p>`,
        footer: `
          <button type="button" class="btn btn-outline-secondary" data-ems-confirm="0">Cancel</button>
          <button type="button" class="btn ${btnClass}" data-ems-confirm="1">${escapeHtml(confirmText)}</button>
        `,
      })
    );
    const el = document.getElementById(id);
    // @ts-ignore bootstrap global from CDN
    const modal = new bootstrap.Modal(el);
    /** @type {boolean|null} */
    let choice = null;
    el.addEventListener('click', (e) => {
      const t = e.target.closest('[data-ems-confirm]');
      if (!t) return;
      choice = t.getAttribute('data-ems-confirm') === '1';
      modal.hide();
    });
    el.addEventListener(
      'hidden.bs.modal',
      () => {
        resolve(choice === null ? false : choice);
        el.remove();
      },
      { once: true }
    );
    modal.show();
  });
}

function showGlobalLoading(show) {
  const el = document.getElementById('ems-global-loader');
  if (!el) return;
  el.classList.toggle('d-none', !show);
}

function emptyState({ icon = 'fa-inbox', title, message, actionHtml = '' }) {
  return `
    <div class="ems-empty text-center py-5 px-3">
      <div class="ems-empty__icon mb-3"><i class="fas ${icon}"></i></div>
      <h3 class="h5 text-white mb-2">${escapeHtml(title)}</h3>
      <p class="text-secondary mb-4">${escapeHtml(message)}</p>
      ${actionHtml}
    </div>
  `;
}

/**
 * Pagination controls HTML.
 */
function createPagination({ page, pageSize, total, id = 'ems-pagination' }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(current * pageSize, total);
  let lis = '';
  if (pages <= 12) {
    for (let i = 1; i <= pages; i++) {
      lis += `<li class="page-item ${i === current ? 'active' : ''}"><button type="button" class="page-link ems-page-btn" data-page="${i}">${i}</button></li>`;
    }
  } else {
    lis = `<li class="page-item"><span class="page-link bg-transparent border-0 text-secondary">Page ${current} / ${pages}</span></li>`;
  }
  return `
    <nav class="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2" aria-label="Pagination" id="${escapeHtml(id)}">
      <span class="text-secondary small">Showing ${start}–${end} of ${total}</span>
      <ul class="pagination mb-0">
        <li class="page-item ${current <= 1 ? 'disabled' : ''}">
          <button type="button" class="page-link ems-page-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>Previous</button>
        </li>
        ${lis}
        <li class="page-item ${current >= pages ? 'disabled' : ''}">
          <button type="button" class="page-link ems-page-btn" data-page="${current + 1}" ${current >= pages ? 'disabled' : ''}>Next</button>
        </li>
      </ul>
    </nav>
  `;
}

/** Simple bar chart SVG */
function createBarChart({ labels, values, title }) {
  const max = Math.max(1, ...values);
  const w = 400;
  const h = 200;
  const barW = (w - 40) / values.length - 8;
  const bars = values
    .map((v, i) => {
      const bh = (v / max) * (h - 50);
      const x = 20 + i * ((w - 40) / values.length) + 4;
      const y = h - 30 - bh;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="4" fill="url(#emsBarGrad)"/>`;
    })
    .join('');
  const lbls = labels
    .map((lab, i) => {
      const x = 20 + i * ((w - 40) / labels.length) + barW / 2;
      return `<text x="${x + 4}" y="${h - 8}" text-anchor="middle" class="ems-chart-label">${escapeHtml(lab.slice(0, 8))}</text>`;
    })
    .join('');
  const defs = `<defs>
    <linearGradient id="emsBarGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>`;
  return `
    <div class="ems-chart-wrap">
      ${title ? `<p class="small text-secondary mb-2">${escapeHtml(title)}</p>` : ''}
      <svg viewBox="0 0 ${w} ${h}" class="ems-chart-svg" role="img" aria-label="Bar chart">${defs}${bars}${lbls}</svg>
    </div>
  `;
}

/** Donut-style department distribution */
function createDonutChart({ segments, title }) {
  const cx = 100;
  const cy = 100;
  const r = 70;
  const ir = 45;
  let start = -Math.PI / 2;
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return `<p class="text-secondary mb-0">No employees assigned to departments yet.</p>`;
  }
  const pathParts = [];
  segments.forEach((seg, idx) => {
    const angle = (seg.value / total) * Math.PI * 2;
    if (angle <= 0) return;
    const end = start + angle;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const ix1 = cx + ir * Math.cos(end);
    const iy1 = cy + ir * Math.sin(end);
    const ix2 = cx + ir * Math.cos(start);
    const iy2 = cy + ir * Math.sin(start);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`;
    start = end;
    const color = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'][idx % 5];
    pathParts.push(`<path d="${d}" fill="${color}" opacity="0.9"/>`);
  });
  const paths = pathParts;
  const legend = segments
    .map(
      (seg, idx) =>
        `<span class="ems-legend-item"><span class="ems-dot" style="background:${['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'][idx % 5]}"></span>${escapeHtml(seg.label)} (${seg.value})</span>`
    )
    .join('');
  return `
    <div class="ems-donut-wrap d-flex flex-column flex-md-row align-items-center gap-3">
      <svg viewBox="0 0 200 200" class="ems-donut-svg" role="img" aria-label="Distribution">${paths.join('') || '<circle cx="100" cy="100" r="35" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>'}</svg>
      <div>
        ${title ? `<p class="small text-secondary mb-2">${escapeHtml(title)}</p>` : ''}
        <div class="ems-legend d-flex flex-column gap-1">${legend}</div>
      </div>
    </div>
  `;
}

/**
 * Animate number in element.
 */
function animateCounter(el, target, duration = 900) {
  if (!el) return;
  const start = performance.now();
  const from = 0;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = String(Math.round(from + (target - from) * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initRipple(root = document) {
  root.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('.btn, .ems-ripple');
      if (!btn || btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ems-ripple-fx';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    },
    true
  );
}

(function (global) {
  var EMS = global.EMS || (global.EMS = {});
  EMS.createNavbar = createNavbar;
  EMS.createSidebar = createSidebar;
  EMS.createCard = createCard;
  EMS.createTable = createTable;
  EMS.createModal = createModal;
  EMS.createFormInput = createFormInput;
  EMS.setFieldError = setFieldError;
  EMS.clearFieldErrors = clearFieldErrors;
  EMS.validatePhone = validatePhone;
  EMS.validateEmail = validateEmail;
  EMS.validateRequired = validateRequired;
  EMS.validateSalary = validateSalary;
  EMS.validateForm = validateForm;
  EMS.escapeHtml = escapeHtml;
  EMS.showToast = showToast;
  EMS.confirmDialog = confirmDialog;
  EMS.showGlobalLoading = showGlobalLoading;
  EMS.emptyState = emptyState;
  EMS.createPagination = createPagination;
  EMS.createBarChart = createBarChart;
  EMS.createDonutChart = createDonutChart;
  EMS.animateCounter = animateCounter;
  EMS.initRipple = initRipple;
})(typeof window !== 'undefined' ? window : this);
