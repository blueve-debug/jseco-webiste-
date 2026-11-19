'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AdminTheme = 'dark' | 'light';

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_theme') as AdminTheme | null;
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
      }
    } catch {
      // localStorage may be inaccessible
    }
    setMounted(true);
  }, []);

  const setTheme = (next: AdminTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem('admin_theme', next);
    } catch {
      // localStorage error
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div
        className="admin-layout"
        data-theme={mounted ? theme : 'dark'}
        data-theme-mounted={mounted ? 'true' : 'false'}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

