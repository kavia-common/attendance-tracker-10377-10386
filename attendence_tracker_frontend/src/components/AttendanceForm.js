import React, { useEffect, useMemo, useState } from "react";

function toLocalISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * PUBLIC_INTERFACE
 * Form for adding or editing an attendance record.
 */
export function AttendanceForm({ mode, initialValues, onCancel, onSubmit }) {
  const defaults = useMemo(() => {
    const today = toLocalISODate(new Date());
    return {
      date: today,
      name: "",
      status: "present",
      note: "",
      ...initialValues,
    };
  }, [initialValues]);

  const [values, setValues] = useState(defaults);
  const [error, setError] = useState("");

  useEffect(() => {
    setValues(defaults);
    setError("");
  }, [defaults]);

  function setField(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    try {
      onSubmit({
        date: values.date,
        name: values.name,
        status: values.status,
        note: values.note,
      });
    } catch (err) {
      setError(err?.message || "Unable to save.");
    }
  }

  return (
    <form className="card formCard" onSubmit={submit}>
      <div className="cardHeader">
        <div>
          <div className="cardTitle">{mode === "edit" ? "Edit record" : "New record"}</div>
          <div className="cardSub">Mark attendance and keep optional notes.</div>
        </div>
      </div>

      {error ? (
        <div className="alert alertDanger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="formGrid">
        <label className="field">
          <span className="fieldLabel">Date</span>
          <input
            className="input"
            type="date"
            value={values.date}
            onChange={(e) => setField("date", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="fieldLabel">Status</span>
          <select
            className="input"
            value={values.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </label>

        <label className="field fieldSpan2">
          <span className="fieldLabel">Name</span>
          <input
            className="input"
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g., Taylor Smith"
            required
          />
        </label>

        <label className="field fieldSpan2">
          <span className="fieldLabel">Note (optional)</span>
          <input
            className="input"
            type="text"
            value={values.note}
            onChange={(e) => setField("note", e.target.value)}
            placeholder="e.g., Doctor appointment"
          />
        </label>
      </div>

      <div className="formActions">
        <button className="btn btnGhost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btnPrimary" type="submit">
          {mode === "edit" ? "Save changes" : "Add record"}
        </button>
      </div>
    </form>
  );
}
