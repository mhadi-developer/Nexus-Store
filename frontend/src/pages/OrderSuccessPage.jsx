import { Link, useParams, useSearchParams } from 'react-router';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import '../css/order-outcome-page.css';

export default function OrderSuccessPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const isCashOrder = searchParams.get('type') === 'order';

  if(sessionId && searchParams){
    window.localStorage.removeItem('cart');
    window.localStorage.removeItem(`delivery_address_${window.localStorage.getItem('user_id') ?? 'guest'}`);
    window.localStorage.removeItem('orders');
  }

  return (
    <main className="order-outcome-page">
      <section className="order-outcome-card order-outcome-success" aria-labelledby="order-outcome-title">
        <div className="order-outcome-icon" aria-hidden="true">
          <CheckCircle2 size={38} strokeWidth={1.8} />
        </div>
        <p className="order-outcome-eyebrow">{isCashOrder ? 'ORDER PLACED' : 'PAYMENT COMPLETE'}</p>
        <h1 id="order-outcome-title">Thank you for your order!</h1>
        <p className="order-outcome-message">
          {isCashOrder
            ? 'Your order has been placed. Pay when it arrives.'
            : 'Your payment was successful. We’re getting your order ready.'}
        </p>
        <div className="order-session-id">
          <span>{isCashOrder ? 'Order number' : 'Session ID'}</span>
          <code>{sessionId}</code>
        </div>
        <Link className="order-outcome-primary" to="/shop">
          <ShoppingBag size={18} aria-hidden="true" />
          Continue shopping
        </Link>
        <Link className="order-outcome-secondary" to="/">Back to home</Link>
      </section>
    </main>
  );
}
