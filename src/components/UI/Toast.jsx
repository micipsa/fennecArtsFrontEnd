/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import styles from "./Toast.module.css";

const ToastContext = createContext();

const TYPES = {
  success: { icon: "✅", className: "success" },
  error: { icon: "❌", className: "error" },
  info: { icon: "ℹ️", className: "info" },
  xp: { icon: "⚔️", className: "xp" },
  warning: { icon: "⚠️", className: "warning" },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className={styles.container} aria-live="polite">
        {toasts.map((toast) => {
          const config = TYPES[toast.type] || TYPES.info;
          return (
            <div
              key={toast.id}
              className={`${styles.toast} ${styles[config.className]}`}
              onClick={() => removeToast(toast.id)}>
              <span className={styles.icon}>{config.icon}</span>
              <span className={styles.message}>{toast.message}</span>
              <button
                className={styles.close}
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}>
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
