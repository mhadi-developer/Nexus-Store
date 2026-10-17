export default  function ProtectRoutes({children}){
 // Keep rendering while the profile request runs. Authentication state is
 // still available to components through AuthContext, and this route currently
 // does not reject unauthenticated users after loading completes.
  return children;
}
