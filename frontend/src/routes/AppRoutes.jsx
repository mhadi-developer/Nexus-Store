
import { lazy, Suspense } from "react";
import {BrowserRouter , Routes , Route} from "react-router";
import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import InlineLoader from "../components/InlineLoader.jsx";

const HomePage = lazy(() => import("../pages/HomePage.jsx"));
const ProductDetail = lazy(() => import("../pages/ProductDetails.jsx"));
const Register = lazy(() => import("../pages/RegisterPage.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const PasswordPage = lazy(() => import("../pages/PasswordPage.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));
const ProtectRoutes = lazy(() => import("../pages/Protected.jsx"));
const CartPage = lazy(() => import("../pages/CartPage.jsx"));
const OrderSummaryPage = lazy(() => import("../pages/OrderSummaryPage.jsx"));
const ShopPage = lazy(() => import("../pages/ShopPage.jsx"));
const CategoriesPage = lazy(() => import("../pages/CategoriesPage.jsx"));



export default function AppRouter(){


return (

    <BrowserRouter>
    <Header/>
     <Suspense fallback={<main className="route-loading"><InlineLoader text="Loading page..." /></main>}>
     <Routes>
        <Route path="/" element={
            <ProtectRoutes>
               <HomePage/>
            </ProtectRoutes>
            
            } />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/forgot-password" element={<PasswordPage/>} />
        <Route path="/reset-password" element={<PasswordPage/>} />
        <Route path="/change-password" element={<PasswordPage/>} />

        <Route path="/product/details/:id" element={<ProductDetail/>} />
        <Route path="/cart" element={<CartPage/>} />
        <Route path="/checkout" element={<OrderSummaryPage/>} />
        <Route path="/shop" element={<ShopPage/>} />
        <Route path="/categories" element={<CategoriesPage/>} />
        <Route path="*" element={<NotFound/>} />

     </Routes>
     </Suspense>
     <Footer/>

    </BrowserRouter>

)
}
