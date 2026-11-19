'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Check, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check size={16} />;
      case 'error':
        return <X size={16} />;
      case 'info':
        return <Info size={16} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon" style={{ display: 'flex', alignItems: 'center' }}>
              {renderIcon(toast.type)}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
