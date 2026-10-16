import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = window.localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not configured.");

      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/login/user`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) window.localStorage.removeItem("access_token");
        setUser(null);
        return null;
      }

      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      console.error("Unable to load the signed-in user:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem("access_token");
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
