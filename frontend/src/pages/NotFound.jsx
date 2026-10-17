import { Link } from 'react-router';
import { ArrowLeft, Compass } from 'lucide-react';
import '../css/not-found.css';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="not-found-icon" aria-hidden="true">
          <Compass size={34} strokeWidth={1.8} />
        </div>
        <p className="not-found-code">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p className="not-found-message">
          We couldn’t find the page you’re looking for. It may have moved or the address may be incorrect.
        </p>
        <Link className="not-found-home" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to home
        </Link>
      </section>
    </main>
  );
}
