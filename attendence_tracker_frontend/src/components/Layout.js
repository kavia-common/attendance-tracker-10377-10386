import React from "react";

/**
 * @typedef {Object} NavItem
 * @property {string} id
 * @property {string} label
 * @property {React.ReactNode} icon
 */

/**
 * PUBLIC_INTERFACE
 * App shell layout with sidebar + topbar + main content.
 */
export function Layout({ navItems, activeNavId, onNavChange, topbar, children }) {
  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebarBrand">
          <div className="brandMark" aria-hidden="true">
            AT
          </div>
          <div className="brandText">
            <div className="brandName">Attendance Tracker</div>
            <div className="brandSub">Ocean Professional</div>
          </div>
        </div>

        <nav className="sidebarNav">
          {navItems.map((item) => {
            const active = item.id === activeNavId;
            return (
              <button
                key={item.id}
                className={`navItem ${active ? "active" : ""}`}
                onClick={() => onNavChange(item.id)}
                aria-current={active ? "page" : undefined}
                type="button"
              >
                <span className="navIcon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="navLabel">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebarFooter">
          <div className="sidebarHint">
            Data is stored locally in your browser (localStorage).
          </div>
        </div>
      </aside>

      <div className="mainColumn">
        <header className="topbar" role="banner">
          {topbar}
        </header>
        <main className="mainContent" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Simple inline icon set (no external deps).
 */
export function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M4 13h7V4H4v9z" stroke="currentColor" strokeWidth="2" />
          <path d="M13 20h7V11h-7v9z" stroke="currentColor" strokeWidth="2" />
          <path d="M13 9h7V4h-7v5z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20h7v-5H4v5z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "records":
      return (
        <svg {...common}>
          <path d="M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L15 3h-6l-.3 2.4a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.9 7.9 0 0 0-.1 1c0 .3 0 .7.1 1l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1L9 21h6l.3-2.4a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
