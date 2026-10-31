import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CreditCard, PackageCheck, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import '../css/order-summary-page.css';

const blankAddress = { phone: '', addressLine: '', apartment: '', city: '', region: '', postalCode: '', country: '' };

export default function OrderSummaryPage() {
  const { user, loading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(blankAddress);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [error, setError] = useState('');
  const addressKey = `delivery_address_${user?.id ?? 'guest'}`;

  useEffect(() => {
    try {
      const savedAddress = JSON.parse(localStorage.getItem(addressKey) || 'null');
      setAddress({ ...blankAddress, ...savedAddress });
    } catch {
      setAddress(blankAddress);
    }
  }, [addressKey]);

  const items = useMemo(() => cart.map((item) => ({
    ...item,
    id: item.id ?? item.product_id,
    name: item.name ?? item.product_title ?? 'Product',
    image: item.image ?? item.product_img ?? '',
    price: Number(item.price ?? item.product_price ?? 0),
    quantity: Math.max(1, Number(item.product_cart_quantity) || 1),
  })), [cart]);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateAddress = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  };

  const confirmOrder = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!items.length) {
      setError('Your cart is empty. Add items before confirming an order.');
      return;
    }
    const orderRequest = {
      deliveryAddress: {
        addressLine: address.addressLine,
        apartment: address.apartment,
        city: address.city,
        country: address.country,
        phone: address.phone,
        postalCode: address.postalCode,
        region: address.region,
      },
      items: items.map((item) => ({
        product_id: Number(item.id),
        quantity: item.quantity,
      })),
      paymentMethod: paymentMethod === 'stripe' ? 'Stripe' : 'Cash on delivery',
    };
    console.log('Final checkout payload:', orderRequest);

    try {
      const token = window.localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).filter(Boolean).join(' ')
          : detail;
        throw new Error(typeof message === 'string' ? message : `Checkout failed (${response.status}).`);
      }

      if (data?.payment_method === 'Stripe' && data.checkout_url) {
        window.location.assign(data.checkout_url);
        return;
      }

      if (data?.payment_method === 'Cash on delivery' && data.order_number) {
        navigate(`/order-success/${encodeURIComponent(data.order_number)}?type=order`);
        return;
      }

      throw new Error('The checkout response did not contain the expected order details.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to process your order.');
    }
  };

  if (loading) return <main className="order-page"><p>Loading your account…</p></main>;

  if (!user) {
    return (
      <main className="order-page">
        <section className="order-empty">
          <h1>Sign in to continue</h1>
          <p>Your account details are needed to prepare delivery.</p>
          <Link className="order-primary-link" to="/login">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="order-page">
      <header className="order-heading">
        <p className="order-eyebrow">CHECKOUT</p>
        <h1>Review your order</h1>
        <p>Confirm your account and delivery details before placing the order.</p>
      </header>

      {items.length === 0 ? (
        <section className="order-empty">
          <ShoppingBag size={40} aria-hidden="true" />
          <h2>Your cart is empty</h2>
          <Link className="order-primary-link" to="/shop">Browse products</Link>
        </section>
      ) : (
        <form className="order-layout" onSubmit={confirmOrder}>
          <div className="order-main-column">
            <section className="order-card">
              <div className="order-section-heading"><span>01</span><div><h2>Account information</h2><p>Signed-in customer</p></div></div>
              <div className="order-account">
                <strong>{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.userName}</strong>
                <span>{user.email}</span>
                <span>@{user.userName}</span>
              </div>
            </section>

            <section className="order-card">
              <div className="order-section-heading"><span>02</span><div><h2>Delivery address</h2><p>Where should we deliver your order?</p></div></div>
              <div className="delivery-fields">
                <label>Phone number<input name="phone" type="tel" autoComplete="tel" value={address.phone} onChange={updateAddress} required /></label>
                <label className="field-wide">Street address<input name="addressLine" autoComplete="address-line1" value={address.addressLine} onChange={updateAddress} required /></label>
                <label className="field-wide">Apartment, suite, etc. <span>(optional)</span><input name="apartment" autoComplete="address-line2" value={address.apartment} onChange={updateAddress} /></label>
                <label>City<input name="city" autoComplete="address-level2" value={address.city} onChange={updateAddress} required /></label>
                <label>State / Province<input name="region" autoComplete="address-level1" value={address.region} onChange={updateAddress} required /></label>
                <label>Postal code<input name="postalCode" autoComplete="postal-code" value={address.postalCode} onChange={updateAddress} required /></label>
                <label>Country<input name="country" autoComplete="country-name" value={address.country} onChange={updateAddress} required /></label>
              </div>
            </section>

            <section className="order-card">
              <div className="order-section-heading"><span>03</span><div><h2>Payment method</h2><p>Choose how you would like to pay.</p></div></div>
              <fieldset className="order-payment-options">
                <legend className="visually-hidden">Choose a payment method</legend>
                <label className={`order-payment-option${paymentMethod === 'stripe' ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                  />
                  <CreditCard size={22} aria-hidden="true" />
                  <span><strong>Stripe</strong><small>Card payments are not processed yet.</small></span>
                </label>
                <label className={`order-payment-option${paymentMethod === 'cash_on_delivery' ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                  />
                  <PackageCheck size={22} aria-hidden="true" />
                  <span><strong>Cash on delivery</strong><small>Pay when your order arrives.</small></span>
                </label>
              </fieldset>
            </section>
          </div>

          <aside className="order-review-card">
            <h2>Order summary</h2>
            <div className="order-products">
              {items.map((item, index) => (
                <div className="order-product" key={item.id ?? index}>
                  {item.image ? <img src={item.image} alt="" /> : <div className="order-product-placeholder"><ShoppingBag size={20} /></div>}
                  <div><strong>{item.name}</strong><span>Qty {item.quantity} · ${item.price.toFixed(2)} each</span></div>
                  <strong>${(item.quantity * item.price).toFixed(2)}</strong>
                </div>
              ))}
            </div>
            <div className="order-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="order-total-row"><span>Delivery</span><span>Free</span></div>
            <div className="order-grand-total"><span>{paymentMethod === 'cash_on_delivery' ? 'Total due on delivery' : 'Order total'}</span><strong>${subtotal.toFixed(2)}</strong></div>
            {error && <p className="order-error" role="alert">{error}</p>}
            <button className="order-confirm-button" type="submit">Log checkout payload · ${subtotal.toFixed(2)}</button>
            <Link className="order-back-link" to="/cart">Return to cart</Link>
          </aside>
        </form>
      )}
    </main>
  );
}
