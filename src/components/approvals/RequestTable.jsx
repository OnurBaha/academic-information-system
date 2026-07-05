import React from 'react';

export default function RequestTable({ headers = [], items = [], renderRow }) {
  return (
    <div className="app-table-wrap">
      <table className="app-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="app-th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, idx) => renderRow(item, idx))
          ) : (
            <tr>
              <td colSpan={headers.length} className="app-td text-center text-slate-400 py-8">
                Onay bekleyen kayıt bulunmamaktadır.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
