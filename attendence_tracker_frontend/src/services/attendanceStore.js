const STORAGE_KEY = "attendance-tracker:v1";

/**
 * @typedef {Object} AttendanceRecord
 * @property {string} id Unique record id
 * @property {string} date ISO date string (YYYY-MM-DD) in local time
 * @property {string} name Person name
 * @property {"present"|"absent"|"late"} status Attendance status
 * @property {string} note Optional note
 * @property {string} createdAt ISO timestamp
 * @property {string} updatedAt ISO timestamp
 */

/**
 * @typedef {Object} AttendanceStoreSnapshot
 * @property {AttendanceRecord[]} records
 */

/**
 * Returns ISO date (YYYY-MM-DD) for the user's local timezone.
 * @param {Date} d
 * @returns {string}
 */
function toLocalISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @returns {AttendanceStoreSnapshot}
 */
function defaultSnapshot() {
  const today = toLocalISODate(new Date());
  const now = new Date().toISOString();
  return {
    records: [
      {
        id: crypto?.randomUUID ? crypto.randomUUID() : `seed_${Date.now()}`,
        date: today,
        name: "Alex Johnson",
        status: "present",
        note: "On time",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto?.randomUUID ? crypto.randomUUID() : `seed_${Date.now() + 1}`,
        date: today,
        name: "Jamie Rivera",
        status: "late",
        note: "Traffic",
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

/**
 * Safe JSON parse.
 * @param {string} raw
 * @returns {any|null}
 */
function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @returns {AttendanceStoreSnapshot}
 */
function loadSnapshot() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSnapshot();
  const parsed = safeJsonParse(raw);
  if (!parsed || !Array.isArray(parsed.records)) return defaultSnapshot();
  return { records: parsed.records };
}

/**
 * @param {AttendanceStoreSnapshot} snapshot
 */
function saveSnapshot(snapshot) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

/**
 * Simple event mechanism for in-app updates (tabs are handled by the `storage` event separately).
 */
const subscribers = new Set();

/**
 * @returns {AttendanceStoreSnapshot}
 */
function getState() {
  return loadSnapshot();
}

/**
 * @param {AttendanceStoreSnapshot} next
 */
function setState(next) {
  saveSnapshot(next);
  subscribers.forEach((fn) => fn());
}

/**
 * PUBLIC_INTERFACE
 * Subscribe to store changes.
 * @param {() => void} listener
 * @returns {() => void} unsubscribe
 */
export function subscribe(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

/**
 * PUBLIC_INTERFACE
 * Get all records.
 * @returns {AttendanceRecord[]}
 */
export function listRecords() {
  return getState().records.slice();
}

/**
 * @param {Partial<AttendanceRecord>} record
 * @returns {AttendanceRecord}
 */
function normalizeNewRecord(record) {
  const now = new Date().toISOString();
  const date = record.date || toLocalISODate(new Date());
  const name = String(record.name || "").trim();
  const status = record.status || "present";
  const note = record.note ? String(record.note) : "";

  if (!name) {
    throw new Error("Name is required.");
  }
  if (!["present", "absent", "late"].includes(status)) {
    throw new Error("Invalid status.");
  }

  return {
    id: crypto?.randomUUID ? crypto.randomUUID() : `r_${Date.now()}_${Math.random()}`,
    date,
    name,
    status,
    note,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * PUBLIC_INTERFACE
 * Create a new attendance record.
 * @param {{date?: string, name: string, status: "present"|"absent"|"late", note?: string}} record
 * @returns {AttendanceRecord}
 */
export function createRecord(record) {
  const state = getState();
  const next = normalizeNewRecord(record);
  setState({ records: [next, ...state.records] });
  return next;
}

/**
 * PUBLIC_INTERFACE
 * Update an existing record.
 * @param {string} id
 * @param {{date?: string, name?: string, status?: "present"|"absent"|"late", note?: string}} patch
 * @returns {AttendanceRecord}
 */
export function updateRecord(id, patch) {
  const state = getState();
  const idx = state.records.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Record not found.");

  const current = state.records[idx];
  const next = {
    ...current,
    ...patch,
    name: patch.name !== undefined ? String(patch.name).trim() : current.name,
    note: patch.note !== undefined ? String(patch.note) : current.note,
    updatedAt: new Date().toISOString(),
  };

  if (!next.name) throw new Error("Name is required.");
  if (!["present", "absent", "late"].includes(next.status)) throw new Error("Invalid status.");

  const records = state.records.slice();
  records[idx] = next;
  setState({ records });
  return next;
}

/**
 * PUBLIC_INTERFACE
 * Delete a record.
 * @param {string} id
 */
export function deleteRecord(id) {
  const state = getState();
  setState({ records: state.records.filter((r) => r.id !== id) });
}

/**
 * PUBLIC_INTERFACE
 * Remove all records (dangerous).
 */
export function clearAll() {
  setState({ records: [] });
}

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL if present (optional future integration).
 * @returns {string|null}
 */
export function getApiBaseUrl() {
  const v = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL;
  if (!v) return null;
  return String(v).trim() || null;
}

/**
 * PUBLIC_INTERFACE
 * Attempt to sync from API if REACT_APP_API_BASE is configured.
 * For this subtask we keep localStorage as the source of truth; this is a no-op
 * unless an API is later implemented with the expected endpoints.
 *
 * Expected (future) endpoints:
 * - GET    /attendance
 * - POST   /attendance
 * - PATCH  /attendance/:id
 * - DELETE /attendance/:id
 *
 * @returns {Promise<{ok: boolean, message: string}>}
 */
export async function tryApiSync() {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, message: "API base not configured; using local storage." };

  // We intentionally do not hard-require an API in this work item.
  // Provide a soft "not implemented" response to keep UI predictable.
  return { ok: false, message: `API base configured (${base}) but sync is not enabled in this build.` };
}

/**
 * PUBLIC_INTERFACE
 * Listen for cross-tab localStorage changes and notify subscribers.
 * Call once at app start.
 */
export function attachCrossTabListener() {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      subscribers.forEach((fn) => fn());
    }
  });
}
