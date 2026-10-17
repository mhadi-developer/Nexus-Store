import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import '../css/cart-page.css';

const CART_STORAGE_KEY = 'cart';

function readCart() {
  try {
    const storedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
    if (!Array.isArray(storedCart)) return [];
    return storedCart.map((item) => ({
      ...item,
      id: item.id ?? item.product_id,
      name: item.name ?? item.product_title ?? 'Product',
      image: item.image ?? item.product_img ?? '',
      price: Number(item.price ?? item.product_price ?? 0),
      quantity: Math.max(1, Number(item.quantity ?? 1)),
    }));
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const updateQuantity = (id, change) => {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    )));
  };

  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
          <h1>Shopping Cart</h1>
        </div>
        <span className="cart-item-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      {items.length === 0 ? (
        <section className="cart-empty" aria-label="Empty cart">
          <div className="cart-empty-icon" aria-hidden="true"><ShoppingBag size={34} /></div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven’t added anything to your cart yet.</p>
          <Link className="cart-continue-button" to="/">Explore products</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Cart items">
            {items.map((item, index) => (
              <article className="cart-item" key={item.id ?? `${item.name}-${index}`}>
                {item.image ? (
                  <img className="cart-item-image" src={item.image} alt={item.name} loading="lazy" decoding="async" />
                ) : (
                  <div className="cart-item-image cart-item-image-placeholder" aria-hidden="true"><ShoppingBag size={26} /></div>
                )}
                <div className="cart-item-details">
                  <h2>{item.name}</h2>
                  <p>${item.price.toFixed(2)} each</p>
                  <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)}><Minus size={15} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)}><Plus size={15} /></button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  <button className="cart-remove-button" type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <Trash2 size={17} /> Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="cart-summary-total"><span>Total</span><strong>${subtotal.toFixed(2)}</strong></div>
            <button type="button" className="cart-checkout-button" disabled>Proceed to checkout</button>
            <Link className="cart-continue-link" to="/">Continue shopping</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
