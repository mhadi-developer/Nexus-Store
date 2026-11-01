import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, PackageCheck, ShoppingBag } from 'lucide-react';
import InlineLoader from '../components/InlineLoader.jsx';
import '../css/order-history-page.css';

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = window.localStorage.getItem('access_token');
        if (!backendUrl) throw new Error('VITE_BACKEND_URL is not configured.');
        if (!token) throw new Error('Please sign in to view your orders.');

        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/orders`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.detail || `Could not load your orders (${response.status}).`);
        }
        if (!Array.isArray(data)) throw new Error('The orders response was invalid.');
        setOrders(data);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError instanceof Error ? loadError.message : 'Could not load your orders.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadOrders();
    return () => controller.abort();
  }, []);

  if (loading) return <main className="order-history-page"><InlineLoader text="Loading your orders..." /></main>;

  return (
    <main className="order-history-page">
      <header className="order-history-heading">
        <p className="order-history-eyebrow">YOUR ACCOUNT</p>
        <h1>My orders</h1>
        <p>Review your order status and open an order for its full details.</p>
      </header>

      {error ? (
        <div className="order-history-message" role="alert">{error}</div>
      ) : orders.length === 0 ? (
        <section className="order-history-empty">
          <ShoppingBag size={38} aria-hidden="true" />
          <h2>No orders yet</h2>
          <p>When you place an order, its status and details will appear here.</p>
          <Link className="order-history-primary" to="/shop">Browse products</Link>
        </section>
      ) : (
        <section className="order-history-list" aria-label="Your orders">
          {orders.map((order) => (
            <article className="order-history-card" key={order.order_id}>
              <div className="order-history-card-main">
                <div className="order-history-card-title">
                  <PackageCheck size={21} aria-hidden="true" />
                  <div>
                    <span>Order number</span>
                    <strong>{order.order_number}</strong>
                  </div>
                </div>
                <dl className="order-history-fields">
                  <div><dt>Order ID</dt><dd>{order.order_id}</dd></div>
                  <div>
                    <dt>Status</dt>
                    <dd><span className="order-status-badge">{String(order.order_status).replaceAll('_', ' ')}</span></dd>
                  </div>
                  <div><dt>Placed on</dt><dd>{formatDate(order.created_at)}</dd></div>
                </dl>
              </div>
              <Link
                className="order-history-details-link"
                to={`/orders/${encodeURIComponent(order.order_id)}`}
                aria-label={`View details for order ${order.order_number}`}
              >
                View details <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
