import {BrowserRouter , Routes , Route} from "react-router";
import HomePage from "../pages/HomePage.jsx";
import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import ProductDetail from "../pages/ProductDetails.jsx";


export default function AppRouter(){


return (
    <BrowserRouter>
    <Header/>
     <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/product/details/:id" element={<ProductDetail/>} />



     </Routes>
     <Footer/>

    </BrowserRouter>
)
}