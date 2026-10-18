import { Link } from 'react-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import '../css/cart-page.css';

export default function CartPage() {
  const { cart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const items = cart.map((item) => ({
    ...item,
    id: item.id ?? item.product_id,
    name: item.name ?? item.product_title ?? 'Product',
    image: item.image ?? item.product_img ?? '',
    price: Number(item.price ?? item.product_price ?? 0),
    quantity: Math.max(1, Number(item.product_cart_quantity ??  1)),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                    <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => decrementQuantity(item)}><Minus size={15} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => incrementQuantity(item)}><Plus size={15} /></button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  <button className="cart-remove-button" type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
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
            <Link className="cart-checkout-button" to="/checkout">Proceed to checkout</Link>
            <Link className="cart-continue-link" to="/">Continue shopping</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
