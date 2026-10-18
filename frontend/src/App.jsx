import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import AppRouter from "./routes/AppRoutes";

export default function App(){
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter/>
      </CartProvider>
    </AuthProvider>
  
  );
}