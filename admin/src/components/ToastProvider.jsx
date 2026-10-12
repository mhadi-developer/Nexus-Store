import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);
const ICONS = { success: Check, error: CircleAlert, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    timers.current.set(id, setTimeout(() => dismissToast(id), 4200));
  }, [dismissToast]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-label="Notifications" aria-live="polite" aria-relevant="additions">
        {toasts.map(({ id, message, type }) => {
          const Icon = ICONS[type] || Info;
          return (
            <div className={`admin-toast ${type}`} key={id} role={type === "error" ? "alert" : "status"}>
              <span className="admin-toast-icon"><Icon size={17} aria-hidden="true" /></span>
              <span className="admin-toast-message">{message}</span>
              <button className="admin-toast-dismiss" type="button" onClick={() => dismissToast(id)} aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
