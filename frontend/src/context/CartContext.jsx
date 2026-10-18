import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext(null);

const getItemId = (item) => item.id ?? item.product_id;
const getCartQuantity = (item) => Number(item.product_cart_quantity) || 1;

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = action.payload;
      const productId = getItemId(product);
      const quantityToAdd = Number(product.product_cart_quantity) || 1;
      const exists = state.some((item) => String(getItemId(item)) === String(productId));

      if (!exists) {
        return [...state, { ...product, product_cart_quantity: quantityToAdd }];
      }

      return state.map((item) => String(getItemId(item)) === String(productId)
        ? { ...item, product_cart_quantity: getCartQuantity(item) + quantityToAdd }
        : item);
    }

    case 'CHANGE_QUANTITY': {
      const productId = getItemId(action.payload);
      const change = Number(action.payload.product_change_quaanity) || 0;
      return state
        .map((item) => String(getItemId(item)) === String(productId)
          ? { ...item, product_cart_quantity: getCartQuantity(item) + change }
          : item)
        .filter((item) => getCartQuantity(item) > 0);
    }

    case 'REMOVE_FROM_CART':
      return state.filter((item) => String(getItemId(item)) !== String(action.payload.id));

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
}

function loadInitialCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(savedCart)
      ? savedCart.map((item) => ({ ...item, product_cart_quantity: getCartQuantity(item) }))
      : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
}

export default function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, product_cart_quantity: Number(product.product_cart_quantity) || 1 },
    });
  };

  const incrementQuantity = (product) => {
    dispatch({ type: 'CHANGE_QUANTITY', payload: { ...product, product_change_quaanity: 1 } });
  };

  const decrementQuantity = (product) => {
    dispatch({ type: 'CHANGE_QUANTITY', payload: { ...product, product_change_quaanity: -1 } });
  };

  const removeFromCart = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ cart, addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
