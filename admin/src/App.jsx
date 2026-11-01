import "./css/admin-theme.css"
import {BrowserRouter, Routes , Route} from "react-router"
import Homepage from "./pages/Homepage"
import ProductsPage from "./pages/ProductsPage"
import CategoriesPage from "./pages/CategoriesPage"
import { ToastProvider } from "./components/ToastProvider.jsx"
import NotFoundPage from "./pages/NotFound.jsx"

export default function App(){

 
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/admin" element={<Homepage/>}/>
        <Route path="/admin/products" element={<ProductsPage/>}/>
        <Route path="/admin/categories" element={<CategoriesPage/>}/>
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}
