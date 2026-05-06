import React from 'react';
import { FaSort } from 'react-icons/fa';

const Table = ({ columns, data, id = 'ems-data-table', renderRow }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-responsive rounded-3 overflow-hidden border border-secondary border-opacity-25 p-3 text-center text-muted">
        No data available.
      </div>
    );
  }

  return (
    <div className="table-responsive rounded-3 overflow-hidden border border-secondary border-opacity-25">
      <table className="table table-hover mb-0" id={id}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={c.className || ''}>
                {c.label} {c.sortable && <FaSort className="text-muted small" />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => renderRow(row, index))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
