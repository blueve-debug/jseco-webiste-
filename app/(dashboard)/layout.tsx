'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';
import { AdminThemeProvider } from '@/components/AdminThemeProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ToastProvider>
      <AdminThemeProvider>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {children}
        </main>
      </AdminThemeProvider>
    </ToastProvider>
  );
}
