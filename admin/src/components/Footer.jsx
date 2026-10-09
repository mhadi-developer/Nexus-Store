import React from "react";

export default function Footer({ version = "2.4.0", status = "All systems running" }) {
  return (
    <footer className="nx-footer nx-glass">
      <span className="nx-status">
        <i aria-hidden="true" />
        {status}
      </span>

      <nav aria-label="Footer">
        <a href="/admin/help">Help center</a>
        <a href="/admin/audit-log">Audit log</a>
        <a href="/admin/api">API keys</a>
        <a href="/admin/privacy">Privacy</a>
      </nav>

      <span>
        &copy; {new Date().getFullYear()} Nexus Store &middot; Admin v{version}
      </span>
    </footer>
  );
}