import React from "react";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" },
];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
  </svg>
);

export default function Header({ active = "/admin", notifications = 3, initials = "NX" }) {
  return (
    <header className="nx-header nx-glass">
      <a className="nx-brand" href="/admin" aria-label="Nexus admin home">
        <span className="nx-brand-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 19V5l14 14V5" />
          </svg>
        </span>
        Nexus
        <span className="nx-brand-tag">Admin</span>
      </a>

      <nav className="nx-nav" aria-label="Main">
        {links.map((l) => (
          <a key={l.href} href={l.href} aria-current={l.href === active ? "page" : undefined}>
            {l.label}
          </a>
        ))}
      </nav>

      <div className="nx-header-end">
        <label className="nx-search">
          <SearchIcon />
          <input type="search" placeholder="Search orders, products, customers" aria-label="Search the store" />
        </label>

        <button className="nx-icon-btn" type="button" aria-label={`Notifications, ${notifications} unread`}>
          <BellIcon />
          {notifications > 0 && <span className="nx-badge">{notifications}</span>}
        </button>

        <button className="nx-avatar" type="button" aria-label="Open account menu">
          {initials}
        </button>
      </div>
    </header>
  );
}