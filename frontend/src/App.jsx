import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRoutes";

export default function App(){
  return (
    <AuthProvider>
        <AppRouter/>
    </AuthProvider>
  
  );
}