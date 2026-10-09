import "./css/admin-theme.css"
import {BrowserRouter, Routes , Route} from "react-router"
import Homepage from "./pages/Homepage"

export default function App(){
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
      </Routes>
    </BrowserRouter>

    
    </>
  )
}