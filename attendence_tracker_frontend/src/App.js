import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Layout, Icon } from "./components/Layout";
import { AttendanceForm } from "./components/AttendanceForm";
import { AttendanceTable } from "./components/AttendanceTable";
import {
  attachCrossTabListener,
  clearAll,
  createRecord,
  deleteRecord,
  getApiBaseUrl,
  listRecords,
  subscribe,
  tryApiSync,
  updateRecord,
} from "./services/attendanceStore";
import { statusMeta } from "./utils/format";

function summarizeForDay(records, isoDate) {
  const day = records.filter((r) => r.date === isoDate);
  const present = day.filter((r) => r.status === "present").length;
  const late = day.filter((r) => r.status === "late").length;
  const absent = day.filter((r) => r.status === "absent").length;
  return { total: day.length, present, late, absent };
}

function toLocalISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// PUBLIC_INTERFACE
function App() {
  const navItems = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: <Icon name="dashboard" /> },
      { id: "records", label: "Records", icon: <Icon name="records" /> },
      { id: "settings", label: "Settings", icon: <Icon name="settings" /> },
    ],
    []
  );

  const [activeNavId, setActiveNavId] = useState("dashboard");

  // Query/filter state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form modal-ish state (simple inline card)
  const [composerOpen, setComposerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Store-backed state
  const [records, setRecords] = useState(() => listRecords());

  // Settings view state
  const [apiMessage, setApiMessage] = useState("");
  const apiBase = getApiBaseUrl();

  useEffect(() => {
    attachCrossTabListener();
    const unsub = subscribe(() => setRecords(listRecords()));
    return () => unsub();
  }, []);

  const today = useMemo(() => toLocalISODate(new Date()), []);
  const todaySummary = useMemo(() => summarizeForDay(records, today), [records, today]);

  function openNew() {
    setEditTarget(null);
    setComposerOpen(true);
    setActiveNavId("records");
  }

  function onSaveNew(values) {
    createRecord(values);
    setComposerOpen(false);
  }

  function onSaveEdit(values) {
    if (!editTarget) return;
    updateRecord(editTarget.id, values);
    setComposerOpen(false);
    setEditTarget(null);
  }

  function onEditRecord(r) {
    setEditTarget(r);
    setComposerOpen(true);
    setActiveNavId("records");
  }

  function onDeleteRecord(r) {
    const ok = window.confirm(`Delete record for "${r.name}" on ${r.date}?`);
    if (!ok) return;
    deleteRecord(r.id);
  }

  async function runApiSync() {
    const res = await tryApiSync();
    setApiMessage(res.message);
  }

  function resetAllData() {
    const ok = window.confirm("This will permanently remove all local attendance records. Continue?");
    if (!ok) return;
    clearAll();
    setComposerOpen(false);
    setEditTarget(null);
  }

  const topbar = (
    <div className="topbarInner">
      <div className="topbarLeft">
        <div className="pageTitle">
          {activeNavId === "dashboard" ? "Dashboard" : activeNavId === "records" ? "Records" : "Settings"}
        </div>
        <div className="pageSub">
          {activeNavId === "dashboard"
            ? "Quick overview for today"
            : activeNavId === "records"
              ? "Create, search, and manage records"
              : "Environment + data controls"}
        </div>
      </div>

      <div className="topbarRight">
        {activeNavId !== "settings" ? (
          <div className="searchBar" role="search">
            <span className="searchIcon" aria-hidden="true">
              <Icon name="search" />
            </span>
            <input
              className="searchInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or note…"
              aria-label="Search records"
            />
          </div>
        ) : null}

        <button className="btn btnPrimary" type="button" onClick={openNew}>
          <span className="btnIcon" aria-hidden="true">
            <Icon name="plus" />
          </span>
          New
        </button>
      </div>
    </div>
  );

  return (
    <Layout navItems={navItems} activeNavId={activeNavId} onNavChange={setActiveNavId} topbar={topbar}>
      {activeNavId === "dashboard" ? (
        <div className="grid2">
          <div className="card heroCard">
            <div className="heroTop">
              <div>
                <div className="heroTitle">Today at a glance</div>
                <div className="heroSub">Track attendance with a clean, local-first workflow.</div>
              </div>
              <div className="heroPill">Local-first</div>
            </div>

            <div className="statsRow">
              <div className="stat">
                <div className="statLabel">Total marked</div>
                <div className="statValue">{todaySummary.total}</div>
              </div>
              <div className="stat">
                <div className="statLabel">Present</div>
                <div className="statValue statSuccess">{todaySummary.present}</div>
              </div>
              <div className="stat">
                <div className="statLabel">Late</div>
                <div className="statValue statWarning">{todaySummary.late}</div>
              </div>
              <div className="stat">
                <div className="statLabel">Absent</div>
                <div className="statValue statDanger">{todaySummary.absent}</div>
              </div>
            </div>

            <div className="heroActions">
              <button className="btn btnPrimary" type="button" onClick={openNew}>
                Add today's record
              </button>
              <button className="btn btnGhost" type="button" onClick={() => setActiveNavId("records")}>
                View all records
              </button>
            </div>
          </div>

          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Status distribution</div>
                <div className="cardSub">Across all saved records</div>
              </div>
            </div>

            <StatusBreakdown records={records} />
          </div>
        </div>
      ) : null}

      {activeNavId === "records" ? (
        <div className="stack">
          <div className="toolbarRow">
            <div className="filters">
              <label className="chipSelect">
                <span className="chipLabel">Status</span>
                <select
                  className="chipInput"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="">All</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </label>

              <button className="btn btnGhost" type="button" onClick={() => { setQuery(""); setStatusFilter(""); }}>
                Clear filters
              </button>
            </div>

            <div className="mutedText">
              Tip: Use the search box in the top bar to filter by name/note.
            </div>
          </div>

          {composerOpen ? (
            <AttendanceForm
              mode={editTarget ? "edit" : "new"}
              initialValues={editTarget || undefined}
              onCancel={() => {
                setComposerOpen(false);
                setEditTarget(null);
              }}
              onSubmit={editTarget ? onSaveEdit : onSaveNew}
            />
          ) : null}

          <AttendanceTable
            records={records}
            query={query}
            statusFilter={statusFilter}
            onEdit={onEditRecord}
            onDelete={onDeleteRecord}
          />
        </div>
      ) : null}

      {activeNavId === "settings" ? (
        <div className="stack">
          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Environment</div>
                <div className="cardSub">Optional API configuration for future integration.</div>
              </div>
            </div>

            <div className="kv">
              <div className="kvRow">
                <div className="kvKey">REACT_APP_API_BASE / REACT_APP_BACKEND_URL</div>
                <div className="kvVal">{apiBase || "Not set (localStorage mode)"}</div>
              </div>
              <div className="kvRow">
                <div className="kvKey">Storage</div>
                <div className="kvVal">localStorage (attendance-tracker:v1)</div>
              </div>
            </div>

            <div className="cardActions">
              <button className="btn btnGhost" type="button" onClick={runApiSync}>
                Attempt API sync
              </button>
              <button className="btn btnDanger" type="button" onClick={resetAllData}>
                Clear all local data
              </button>
            </div>

            {apiMessage ? <div className="hint">{apiMessage}</div> : null}
          </div>

          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">About</div>
                <div className="cardSub">Modern layout with sidebar + top bar.</div>
              </div>
            </div>
            <div className="prose">
              <p>
                This app is client-side and stores attendance records in your browser. You can export or integrate with a backend later.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}

function StatusBreakdown({ records }) {
  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0 };
    for (const r of records) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [records]);

  const total = counts.present + counts.late + counts.absent;

  const rows = [
    { status: "present", value: counts.present },
    { status: "late", value: counts.late },
    { status: "absent", value: counts.absent },
  ];

  return (
    <div className="breakdown">
      {rows.map((row) => {
        const meta = statusMeta(row.status);
        const pct = total ? Math.round((row.value / total) * 100) : 0;
        return (
          <div key={row.status} className="breakRow">
            <div className="breakLeft">
              <span className={`badge badge${meta.tone}`}>{meta.label}</span>
              <span className="mutedText">{row.value} records</span>
            </div>
            <div className="breakRight">
              <div className="meter" aria-label={`${meta.label} ${pct}%`}>
                <div className={`meterFill meter${meta.tone}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="pct">{pct}%</div>
            </div>
          </div>
        );
      })}
      <div className="hint">
        Total records: <strong>{total}</strong>
      </div>
    </div>
  );
}

export default App;
