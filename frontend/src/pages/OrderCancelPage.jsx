import { Link } from 'react-router';
import { ArrowLeft, CircleX, RotateCcw } from 'lucide-react';
import '../css/order-outcome-page.css';

export default function OrderCancelPage() {
  return (
    <main className="order-outcome-page">
      <section className="order-outcome-card order-outcome-cancel" aria-labelledby="order-outcome-title">
        <div className="order-outcome-icon" aria-hidden="true">
          <CircleX size={38} strokeWidth={1.8} />
        </div>
        <p className="order-outcome-eyebrow">CHECKOUT NOT COMPLETED</p>
        <h1 id="order-outcome-title">Your order wasn’t placed</h1>
        <p className="order-outcome-message">
          Your payment was cancelled, and you haven’t been charged. You can return to checkout whenever you’re ready.
        </p>
        <Link className="order-outcome-primary" to="/checkout">
          <RotateCcw size={18} aria-hidden="true" />
          Try checkout again
        </Link>
        <Link className="order-outcome-secondary" to="/cart">
          <ArrowLeft size={16} aria-hidden="true" />
          Return to cart
        </Link>
      </section>
    </main>
  );
}
