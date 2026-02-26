import React, { useMemo } from "react";
import { initials, statusMeta, formatDateLong } from "../utils/format";

/**
 * PUBLIC_INTERFACE
 * Table for viewing attendance records.
 */
export function AttendanceTable({ records, query, statusFilter, onEdit, onDelete }) {
  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return records.filter((r) => {
      const matchQ = !q || r.name.toLowerCase().includes(q) || (r.note || "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [records, query, statusFilter]);

  return (
    <div className="card">
      <div className="cardHeader cardHeaderRow">
        <div>
          <div className="cardTitle">Attendance records</div>
          <div className="cardSub">{filtered.length} shown</div>
        </div>
      </div>

      <div className="tableWrap" role="region" aria-label="Attendance records table">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Status</th>
              <th className="hideSm">Note</th>
              <th aria-label="Actions" className="actionsCol" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="emptyCell">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const meta = statusMeta(r.status);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="nameCell">
                        <div className="avatar" aria-hidden="true">
                          {initials(r.name)}
                        </div>
                        <div className="nameMeta">
                          <div className="nameText">{r.name}</div>
                          <div className="subText showSm">{r.note || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{formatDateLong(r.date)}</td>
                    <td>
                      <span className={`badge badge${meta.tone}`}>{meta.label}</span>
                    </td>
                    <td className="hideSm">{r.note || "—"}</td>
                    <td className="actionsCol">
                      <div className="rowActions">
                        <button className="btn btnTiny btnGhost" type="button" onClick={() => onEdit(r)}>
                          Edit
                        </button>
                        <button
                          className="btn btnTiny btnDangerGhost"
                          type="button"
                          onClick={() => onDelete(r)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
