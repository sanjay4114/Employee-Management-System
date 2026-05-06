/**
 * Centralized application state with localStorage persistence.
 * Legacy keys (ems_employees, ems_departments, ems_leaves) are migrated once.
 */

const STORAGE_KEY = 'ems_app_state_v2';
const LEGACY_KEYS = ['ems_employees', 'ems_departments', 'ems_leaves'];

/** @type {{ employees: object[], departments: object[], leaves: object[], user: object|null }} */
let state = {
  employees: [],
  departments: [],
  leaves: [],
  user: null,
};

function defaultDepartments() {
  const now = new Date().toISOString();
  return [
    { id: 1, name: 'Engineering', manager: 'John Orion', createdAt: now },
    { id: 2, name: 'Design', manager: 'Jane Nebula', createdAt: now },
    { id: 3, name: 'Finance', manager: 'Mike Comet', createdAt: now },
    { id: 4, name: 'HR', manager: 'Sarah Void', createdAt: now },
  ];
}

function defaultEmployees(depts) {
  const now = new Date().toISOString();
  const byName = (n) => depts.find((d) => d.name === n)?.id ?? depts[0].id;
  return [
    {
      id: 1,
      name: 'John Orion',
      email: 'john@stellar.io',
      phone: '123-456-7890',
      departmentId: byName('Engineering'),
      salary: 95000,
      status: 'Active',
      createdAt: now,
    },
    {
      id: 2,
      name: 'Jane Nebula',
      email: 'jane@stellar.io',
      phone: '987-654-3210',
      departmentId: byName('Design'),
      salary: 85000,
      status: 'Active',
      createdAt: now,
    },
    {
      id: 3,
      name: 'Mike Comet',
      email: 'mike@stellar.io',
      phone: '555-123-4567',
      departmentId: byName('Finance'),
      salary: 75000,
      status: 'Active',
      createdAt: now,
    },
    {
      id: 4,
      name: 'Sarah Void',
      email: 'sarah@stellar.io',
      phone: '444-987-6543',
      departmentId: byName('HR'),
      salary: 68000,
      status: 'Inactive',
      createdAt: now,
    },
  ];
}

function defaultLeaves(employees) {
  const findId = (name) => employees.find((e) => e.name === name)?.id ?? employees[0]?.id ?? 1;
  return [
    {
      id: 1,
      employeeId: findId('John Orion'),
      type: 'Vacation',
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      status: 'Pending',
    },
    {
      id: 2,
      employeeId: findId('Jane Nebula'),
      type: 'Sick',
      startDate: '2026-05-10',
      endDate: '2026-05-11',
      status: 'Approved',
    },
    {
      id: 3,
      employeeId: findId('Sarah Void'),
      type: 'Personal',
      startDate: '2026-05-15',
      endDate: '2026-05-16',
      status: 'Rejected',
    },
  ];
}

function seedState() {
  const departments = defaultDepartments();
  const employees = defaultEmployees(departments);
  const leaves = defaultLeaves(employees);
  return { employees, departments, leaves, user: null };
}

/**
 * Migrate flat legacy records into the v2 shape.
 */
function migrateFromLegacy() {
  const rawEmp = localStorage.getItem('ems_employees');
  const rawDept = localStorage.getItem('ems_departments');
  const rawLeave = localStorage.getItem('ems_leaves');
  if (!rawEmp && !rawDept && !rawLeave) return null;

  const legacyDepts = rawDept ? JSON.parse(rawDept) : [];
  const departments = legacyDepts.length
    ? legacyDepts.map((d) => ({
        id: d.id,
        name: d.name,
        manager: d.manager ?? '',
        createdAt: new Date().toISOString(),
      }))
    : defaultDepartments();

  const deptByName = (name) => departments.find((x) => x.name === name)?.id ?? departments[0]?.id;

  const legacyEmps = rawEmp ? JSON.parse(rawEmp) : [];
  const employees = legacyEmps.length
    ? legacyEmps.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        departmentId: e.departmentId ?? deptByName(e.department),
        salary: Number(e.salary) || 0,
        status: e.status === 'Inactive' ? 'Inactive' : 'Active',
        createdAt: e.createdAt || new Date().toISOString(),
      }))
    : defaultEmployees(departments);

  const empByName = (name) => employees.find((x) => x.name === name)?.id ?? employees[0]?.id;

  const legacyLeaves = rawLeave ? JSON.parse(rawLeave) : [];
  const leaves = legacyLeaves.length
    ? legacyLeaves.map((l) => ({
        id: l.id,
        employeeId: l.employeeId ?? empByName(l.name),
        type: l.type,
        startDate: l.startDate ?? l.start,
        endDate: l.endDate ?? l.end,
        status: l.status,
      }))
    : defaultLeaves(employees);

  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  return { employees, departments, leaves, user: null };
}

function getState() {
  return state;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        employees: Array.isArray(parsed.employees) ? parsed.employees : [],
        departments: Array.isArray(parsed.departments) ? parsed.departments : [],
        leaves: Array.isArray(parsed.leaves) ? parsed.leaves : [],
        user: parsed.user ?? null,
      };
      return;
    }
    const migrated = migrateFromLegacy();
    if (migrated) {
      state = migrated;
      saveState();
      return;
    }
    state = seedState();
    saveState();
  } catch {
    state = seedState();
    saveState();
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        employees: state.employees,
        departments: state.departments,
        leaves: state.leaves,
        user: state.user,
      })
    );
  } catch (e) {
    console.error('saveState failed', e);
  }
}

/**
 * @param {(prev: typeof state) => typeof state | void} updater
 */
function setState(updater) {
  const next = updater({ ...state, employees: [...state.employees], departments: [...state.departments], leaves: [...state.leaves] });
  if (next && typeof next === 'object') {
    state = {
      employees: next.employees ?? state.employees,
      departments: next.departments ?? state.departments,
      leaves: next.leaves ?? state.leaves,
      user: next.user !== undefined ? next.user : state.user,
    };
  }
  saveState();
}

function nextEmployeeId() {
  const ids = state.employees.map((e) => e.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function nextDepartmentId() {
  const ids = state.departments.map((d) => d.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function nextLeaveId() {
  const ids = state.leaves.map((l) => l.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function getDepartmentById(id) {
  return state.departments.find((d) => d.id === Number(id));
}

function getEmployeeById(id) {
  return state.employees.find((e) => e.id === Number(id));
}

function countEmployeesInDepartment(departmentId) {
  return state.employees.filter((e) => e.departmentId === Number(departmentId)).length;
}

(function (global) {
  var EMS = global.EMS || (global.EMS = {});
  EMS.getState = getState;
  EMS.loadState = loadState;
  EMS.saveState = saveState;
  EMS.setState = setState;
  EMS.nextEmployeeId = nextEmployeeId;
  EMS.nextDepartmentId = nextDepartmentId;
  EMS.nextLeaveId = nextLeaveId;
  EMS.getDepartmentById = getDepartmentById;
  EMS.getEmployeeById = getEmployeeById;
  EMS.countEmployeesInDepartment = countEmployeesInDepartment;
})(typeof window !== 'undefined' ? window : this);
