import React, { useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";


/* ---------- Placeholder data: replace with your API calls ---------- */
const RANGES = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    revenue: [4200, 5100, 4700, 6300, 7200, 8100, 6900],
    total: "$42,500",
    delta: "+12.4%",
  },
  "30D": {
    labels: ["W1", "W2", "W3", "W4"],
    revenue: [31000, 36500, 34200, 42500],
    total: "$144,200",
    delta: "+8.1%",
  },
  "90D": {
    labels: ["Jul", "Aug", "Sep"],
    revenue: [118000, 131000, 144200],
    total: "$393,200",
    delta: "+15.7%",
  },
};

const KPIS = [
  { label: "Revenue", value: "$42,500", change: "+12.4%", up: true },
  { label: "Orders", value: "1,284", change: "+6.9%", up: true },
  { label: "New customers", value: "312", change: "+3.2%", up: true },
  { label: "Cart abandonment", value: "63%", change: "+1.8%", up: false },
];

const TOP_PRODUCTS = [
  { name: "Aero Wireless Earbuds", sold: 412, pct: 100 },
  { name: "Lumen Desk Lamp", sold: 328, pct: 80 },
  { name: "Orbit Smartwatch", sold: 251, pct: 61 },
  { name: "Slate Laptop Sleeve", sold: 187, pct: 45 },
];

const ORDERS = [
  { id: "#NX-10482", customer: "Amna Rauf", total: "$128.00", status: "paid" },
  { id: "#NX-10481", customer: "Bilal Shah", total: "$64.50", status: "shipped" },
  { id: "#NX-10480", customer: "Sara Iqbal", total: "$312.00", status: "pending" },
  { id: "#NX-10479", customer: "Usman Tariq", total: "$89.99", status: "refunded" },
  { id: "#NX-10478", customer: "Hina Malik", total: "$45.00", status: "paid" },
];

const LOW_STOCK = [
  { name: "Orbit Smartwatch (Black)", left: 4, pct: 8 },
  { name: "Aero Earbuds Case", left: 9, pct: 18 },
  { name: "Lumen Bulb Pack", left: 12, pct: 24 },
];

const STATUS_LABEL = { paid: "Paid", shipped: "Shipped", pending: "Pending", refunded: "Refunded" };

/* ---------- Revenue chart (pure SVG, no chart library) ---------- */
function RevenueChart({ labels, values }) {
  const W = 640, H = 240, PAD = { t: 16, r: 8, b: 28, l: 8 };

  const { line, area, points } = useMemo(() => {
    const max = Math.max(...values) * 1.15;
    const stepX = (W - PAD.l - PAD.r) / (values.length - 1);
    const pts = values.map((v, i) => [
      PAD.l + i * stepX,
      PAD.t + (1 - v / max) * (H - PAD.t - PAD.b),
    ]);
    // smooth curve using midpoint control points
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    const a = `${d} L ${pts[pts.length - 1][0]} ${H - PAD.b} L ${pts[0][0]} ${H - PAD.b} Z`;
    return { line: d, area: a, points: pts };
  }, [values]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue over the selected period">
      <defs>
        <linearGradient id="nx-line" x1="0" x2="1">
          <stop offset="0" stopColor="#5b6cff" />
          <stop offset="1" stopColor="#19d3c5" />
        </linearGradient>
        <linearGradient id="nx-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#19d3c5" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5b6cff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} className="grid-line" x1="0" x2={W} y1={PAD.t + g * (H - PAD.t - PAD.b)} y2={PAD.t + g * (H - PAD.t - PAD.b)} />
      ))}

      <path d={area} fill="url(#nx-fill)" />
      <path d={line} fill="none" stroke="url(#nx-line)" strokeWidth="3.5" strokeLinecap="round" />

      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill="#0b1030" stroke="#fff" strokeWidth="2" />
      ))}

      {labels.map((l, i) => (
        <text key={l} className="axis" x={points[i][0]} y={H - 6} textAnchor="middle">
          {l}
        </text>
      ))}
    </svg>
  );
}

/* ---------- Page ---------- */
export default function HomePage() {
  const [range, setRange] = useState("7D");
  const data = RANGES[range];

  return (
    <div className="nx-shell">
      <Header active="/admin" notifications={3} initials="NX" />

      <main className="nx-main">
        <div className="nx-page-head">
          <div>
            <h1>Store overview</h1>
            <p>Sales, orders and stock for Nexus at a glance.</p>
          </div>

          <div className="nx-seg nx-glass" role="group" aria-label="Date range">
            {Object.keys(RANGES).map((r) => (
              <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
                {r === "7D" ? "Last 7 days" : r === "30D" ? "Last 30 days" : "Last 90 days"}
              </button>
            ))}
          </div>
        </div>

        <div className="nx-grid">
          {KPIS.map((k) => (
            <section key={k.label} className="nx-kpi nx-glass">
              <div className="nx-kpi-label">{k.label}</div>
              <div className="nx-kpi-value">{k.value}</div>
              <div className={`nx-delta ${k.up ? "up" : "down"}`}>
                {k.up ? "\u25B2" : "\u25BC"} {k.change} <span>vs last period</span>
              </div>
            </section>
          ))}

          <section className="nx-chart nx-glass">
            <h2 className="nx-card-title">Revenue</h2>
            <p className="nx-card-sub">Gross sales after discounts</p>
            <div className="nx-chart-total">
              <strong>{data.total}</strong>
              <span className="nx-delta up">{data.delta}</span>
            </div>
            <RevenueChart labels={data.labels} values={data.revenue} />
          </section>

          <section className="nx-top nx-glass">
            <h2 className="nx-card-title">Best sellers</h2>
            <p className="nx-card-sub">Units sold this week</p>
            <ul className="nx-list">
              {TOP_PRODUCTS.map((p) => (
                <li key={p.name}>
                  <div className="nx-row">
                    <span>{p.name}</span>
                    <span>{p.sold}</span>
                  </div>
                  <div className="nx-bar" role="presentation"><i style={{ width: `${p.pct}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>

          <section className="nx-orders nx-glass">
            <div className="nx-card-head">
              <div>
                <h2 className="nx-card-title">Recent orders</h2>
                <p className="nx-card-sub">Latest five across all channels</p>
              </div>
              <a className="nx-link-btn" href="/admin/orders">View all orders</a>
            </div>
            <div className="nx-table-wrap">
              <table className="nx-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customer}</td>
                      <td><span className={`nx-pill ${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                      <td className="num">{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="nx-stock nx-glass">
            <div className="nx-card-head">
              <div>
                <h2 className="nx-card-title">Low stock</h2>
                <p className="nx-card-sub">Restock soon</p>
              </div>
              <a className="nx-link-btn" href="/admin/products?filter=low-stock">Manage</a>
            </div>
            <ul className="nx-list">
              {LOW_STOCK.map((s) => (
                <li key={s.name}>
                  <div className="nx-row">
                    <span>{s.name}</span>
                    <span>{s.left} left</span>
                  </div>
                  <div className="nx-bar warn" role="presentation"><i style={{ width: `${s.pct}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}