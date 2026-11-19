'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  Mail,
  Recycle,
  Car,
  Palette,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { ALL_MODULE_IDS } from '@/lib/rbac';

export interface NavItemDef {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

export interface NavSectionDef {
  sectionId: 'Overview' | 'Catalog' | 'Sales' | 'Scrap Config' | 'Customize';
  label: string;
  items: NavItemDef[];
}

/**
 * Navigation hierarchy structured to match the admin modules.
 */
export const navSections: NavSectionDef[] = [
  {
    sectionId: 'Overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    sectionId: 'Catalog',
    label: 'Catalog',
    items: [
      { id: 'products', href: '/products', label: 'Products', icon: Package },
      { id: 'categories', href: '/categories', label: 'Categories', icon: FolderTree },
    ],
  },
  {
    sectionId: 'Sales',
    label: 'Sales',
    items: [
      { id: 'orders', href: '/orders', label: 'Orders', icon: ClipboardList },
      { id: 'customers', href: '/customers', label: 'Customers', icon: Users },
      { id: 'inquiries', href: '/inquiries', label: 'Inquiry Form', icon: Mail },
    ],
  },
  {
    sectionId: 'Scrap Config',
    label: 'Scrap Config',
    items: [
      { id: 'scrapCategories', href: '/scrap-categories', label: 'Scrap Categories', icon: Recycle },
      { id: 'scrapProducts', href: '/scrap-products', label: 'Scrap Products', icon: Car },
    ],
  },
  {
    sectionId: 'Customize',
    label: 'Customize',
    items: [
      { id: 'content', href: '/content', label: 'App Content', icon: Palette },
      { id: 'settings', href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string>('Admin');
  const [userEmail, setUserEmail] = useState<string>('');
  const [allowedModules, setAllowedModules] = useState<string[]>(ALL_MODULE_IDS);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);

  // Load active user session & module permissions
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUserName(data.user.name || 'Admin');
            setUserEmail(data.user.email || '');
            if (Array.isArray(data.user.allowedModules) && data.user.allowedModules.length > 0) {
              setAllowedModules(data.user.allowedModules);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session in sidebar:', err);
      }
    };

    const loadInquiryCount = async () => {
      try {
        const res = await fetch('/api/inquiries?page=1&limit=1');
        if (res.ok) {
          const data = await res.json();
          if (data.statusCounts?.new !== undefined) {
            setNewInquiriesCount(data.statusCounts.new);
          }
        }
      } catch {
        // Non-blocking
      }
    };

    loadSession();
    loadInquiryCount();

    // Listen for custom team access change events from settings page
    const handleAccessUpdated = () => {
      loadSession();
      loadInquiryCount();
    };

    window.addEventListener('team-access-updated', handleAccessUpdated);
    window.addEventListener('rbac-settings-updated', handleAccessUpdated);

    return () => {
      window.removeEventListener('team-access-updated', handleAccessUpdated);
      window.removeEventListener('rbac-settings-updated', handleAccessUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  // Check if a navigation item is accessible by active logged-in user
  const isItemVisible = (moduleId: string): boolean => {
    if (!allowedModules || allowedModules.length === 0) return true;
    return allowedModules.includes(moduleId);
  };

  const isFullAccess = allowedModules.length === ALL_MODULE_IDS.length;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: '14px',
          left: '12px',
          zIndex: 101,
          display: 'none',
          fontSize: '20px',
        }}
        aria-label="Toggle menu"
        id="mobile-menu-toggle"
      >
        <Menu size={20} />
      </button>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo & Collapse Header */}
        <div className="sidebar-logo">
          <div
            className="sidebar-logo-icon"
            onClick={collapsed ? onToggle : undefined}
            style={{ cursor: collapsed ? 'pointer' : 'default', overflow: 'hidden', padding: 2, background: '#fff' }}
            title={collapsed ? 'Click to expand sidebar' : 'Good Eco Solutions'}
          >
            <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <>
              <span className="sidebar-logo-text" title="Good Eco Solutions">
                Good Eco Solutions
              </span>
              <button
                type="button"
                className="sidebar-toggle"
                onClick={onToggle}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => isItemVisible(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.sectionId}>
                <div className="sidebar-section-label">{section.label}</div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="nav-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Icon size={18} />
                      </span>
                      <span className="nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>{item.label}</span>
                        {item.id === 'inquiries' && newInquiriesCount > 0 && !collapsed && (
                          <span
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '10px',
                              marginLeft: '8px',
                            }}
                          >
                            {newInquiriesCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer with Theme Switcher & Member Profile */}
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!collapsed ? (
            <ThemeToggle variant="sidebar" />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ThemeToggle variant="header" className="btn-sm" />
            </div>
          )}

          <div
            className="sidebar-user"
            onClick={handleLogout}
            title="Click to logout"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div
                className="sidebar-avatar"
                style={{
                  background: 'var(--sp-primary)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {userName ? userName[0].toUpperCase() : 'A'}
              </div>
              {!collapsed && (
                <div className="sidebar-user-info" style={{ minWidth: 0, flex: 1 }}>
                  <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userName}
                  </div>
                  <div
                    className="sidebar-user-role"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: isFullAccess ? 'var(--sp-primary-light)' : '#38bdf8',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isFullAccess ? '#10b981' : '#38bdf8',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isFullAccess ? 'Full Access' : `${allowedModules.length} Modules`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <span
                style={{
                  color: 'var(--text-tertiary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  marginLeft: '4px',
                }}
                title="Logout"
              >
                <LogOut size={15} />
              </span>
            )}
          </div>
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
