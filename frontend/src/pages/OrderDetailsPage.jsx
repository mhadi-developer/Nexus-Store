import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, MapPin, PackageCheck, ShoppingBag } from 'lucide-react';
import InlineLoader from '../components/InlineLoader.jsx';
import '../css/order-history-page.css';

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(date);
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    : '$0.00';
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      try {
        const token = window.localStorage.getItem('access_token');
        if (!backendUrl) throw new Error('VITE_BACKEND_URL is not configured.');
        if (!token) throw new Error('Please sign in to view this order.');

        const response = await fetch(
          `${backendUrl.replace(/\/$/, '')}/orders/${encodeURIComponent(orderId)}`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: controller.signal,
          },
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.detail || `Could not load this order (${response.status}).`);
        }
        setOrder(data);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError instanceof Error ? loadError.message : 'Could not load this order.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadOrder();
    return () => controller.abort();
  }, [backendUrl, orderId]);

  const getImageUrl = (image) => {
    if (!image) return '';
    try {
      return new URL(image, `${backendUrl.replace(/\/$/, '')}/`).toString();
    } catch {
      return image;
    }
  };

  if (loading) return <main className="order-history-page"><InlineLoader text="Loading order details..." /></main>;

  return (
    <main className="order-history-page order-details-page">
      <Link className="order-history-back-link" to="/orders">
        <ArrowLeft size={17} aria-hidden="true" /> Back to my orders
      </Link>

      {error ? (
        <div className="order-history-message" role="alert">{error}</div>
      ) : order ? (
        <>
          <header className="order-history-heading order-details-heading">
            <p className="order-history-eyebrow">ORDER DETAILS</p>
            <h1>{order.order_number}</h1>
            <p>Order ID: {order.order_id} <span aria-hidden="true">·</span> Placed {formatDate(order.created_at)}</p>
            <span className="order-status-badge">{String(order.order_status).replaceAll('_', ' ')}</span>
          </header>

          <div className="order-details-layout">
            <div className="order-details-main">
              <section className="order-details-card">
                <div className="order-details-section-title">
                  <ShoppingBag size={20} aria-hidden="true" />
                  <h2>Items in this order</h2>
                </div>
                {order.items?.length ? (
                  <div className="order-detail-items">
                    {order.items.map((item, index) => (
                      <article className="order-detail-item" key={`${item.product_id}-${index}`}>
                        {item.image
                          ? <img src={getImageUrl(item.image)} alt="" />
                          : <div className="order-detail-item-placeholder"><ShoppingBag size={22} aria-hidden="true" /></div>}
                        <div className="order-detail-item-info">
                          <strong>{item.name}</strong>
                          <span>{item.category} · Qty {item.quantity} · {formatMoney(item.price)} each</span>
                        </div>
                        <strong className="order-detail-line-total">{formatMoney(item.line_total)}</strong>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="order-details-muted">No item details are available for this order.</p>
                )}
                <div className="order-details-total">
                  <span>Total</span>
                  <strong>{formatMoney(order.total)}</strong>
                </div>
              </section>

              <section className="order-details-card">
                <div className="order-details-section-title">
                  <MapPin size={20} aria-hidden="true" />
                  <h2>Delivery address</h2>
                </div>
                {order.delivery_address ? (
                  <address className="order-details-address">
                    <strong>{order.customer?.name}</strong>
                    <span>{order.delivery_address.address_line}</span>
                    {order.delivery_address.apartment && <span>{order.delivery_address.apartment}</span>}
                    <span>
                      {order.delivery_address.city}, {order.delivery_address.region} {order.delivery_address.postal_code}
                    </span>
                    <span>{order.delivery_address.country}</span>
                    <span>{order.delivery_address.phone}</span>
                    {order.customer?.email && <span>{order.customer.email}</span>}
                  </address>
                ) : (
                  <p className="order-details-muted">No delivery address is available.</p>
                )}
              </section>
            </div>

            <aside className="order-details-card order-details-payment">
              <div className="order-details-section-title">
                <PackageCheck size={20} aria-hidden="true" />
                <h2>Payment & status</h2>
              </div>
              <dl className="order-details-facts">
                <div><dt>Payment method</dt><dd>{order.payment_method}</dd></div>
                <div><dt>Payment status</dt><dd>{String(order.payment_status).replaceAll('_', ' ')}</dd></div>
                <div><dt>Order status</dt><dd>{String(order.order_status).replaceAll('_', ' ')}</dd></div>
                <div><dt>Order total</dt><dd>{formatMoney(order.total)}</dd></div>
              </dl>
            </aside>
          </div>
        </>
      ) : null}
    </main>
  );
}
