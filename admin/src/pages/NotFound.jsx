import "../css/not-found.css";

export default function NotFoundPage() {
  return (
    <div className="nx-shell">
      <header className="nx-header nx-glass">
        <a className="nx-brand" href="/">
          <span className="nx-brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 19V5l14 14V5"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Nexus
        </a>
        <span className="nx-brand-tag">Error 404</span>
      </header>

      <main className="nx-nf-main">
        <section className="nx-nf-card nx-glass" aria-labelledby="nf-title">
          <div className="nx-nf-digits" aria-hidden="true">
            <span className="nx-nf-digit">4</span>
            <span className="nx-nf-zero">
              <span className="nx-nf-orb" />
            </span>
            <span className="nx-nf-digit">4</span>
          </div>

          <h1 id="nf-title" className="nx-nf-title">
            This page doesn’t exist
          </h1>
          <p className="nx-nf-text">
            The link may be broken, or the page may have been moved or
            deleted. Check the address, or go back to a page that works.
          </p>

          <div className="nx-nf-actions">
            <a className="nx-btn nx-btn-primary" href="/">
              Go to home
            </a>
            <button
              type="button"
              className="nx-btn nx-btn-ghost"
              onClick={() => window.history.back()}
            >
              Go back
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}