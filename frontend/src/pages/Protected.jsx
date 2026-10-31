import {useAuth} from "../context/AuthContext"
import Loader from "../components/Loader"
import {Navigate} from "react-router"

export default function ProtectedPage({children}){
  const {user , loading } = useAuth();

  if (loading) return <Loader/>

  if(!user?.email ) return <Navigate to={'/login'}  replace/>

  return children
}