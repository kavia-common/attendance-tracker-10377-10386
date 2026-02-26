/**
 * @param {string} isoDate YYYY-MM-DD
 * @returns {string}
 */
export function formatDateLong(isoDate) {
  // Use local timezone for display.
  const [y, m, d] = isoDate.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * @param {"present"|"absent"|"late"} status
 * @returns {{label: string, tone: "success"|"danger"|"warning"}}
 */
export function statusMeta(status) {
  switch (status) {
    case "present":
      return { label: "Present", tone: "success" };
    case "absent":
      return { label: "Absent", tone: "danger" };
    case "late":
      return { label: "Late", tone: "warning" };
    default:
      return { label: "Unknown", tone: "warning" };
  }
}

/**
 * @param {string} s
 * @returns {string}
 */
export function initials(s) {
  const parts = String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const chars = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return chars.join("") || "?";
}
