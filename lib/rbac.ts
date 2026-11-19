export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

export type SidebarSectionId = 'Overview' | 'Catalog' | 'Sales' | 'Scrap Config' | 'Customize';

export interface ModuleDefinition {
  id: string;
  label: string;
  section: SidebarSectionId;
  sectionLabel: string;
  description: string;
  href: string;
  icon: string;
  allowedActions: PermissionAction[];
}

export interface RolePermissions {
  access: boolean; // Master toggle: whether this module is accessible / visible in the sidebar navigation
  view: boolean;   // Can inspect and read data
  create: boolean; // Can create new records
  edit: boolean;   // Can update / modify records
  delete: boolean; // Can remove / archive records
  export: boolean; // Can download reports or export data
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  isSystem: boolean;
  permissions: Record<string, RolePermissions>;
}

export interface TeamMember {
  id: string; // Firebase Auth UID or doc ID
  name: string;
  email: string;
  allowedModules: string[]; // List of module IDs (e.g. ['dashboard', 'products', 'categories', ...])
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  isPrimaryAdmin?: boolean;
}

export const ALL_MODULE_IDS = [
  'dashboard',
  'products',
  'categories',
  'orders',
  'customers',
  'inquiries',
  'scrapCategories',
  'scrapProducts',
  'content',
  'settings',
];

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'kUwXnXdVTNYEunUTJjz6vC1aa8m2',
    name: 'Super Admin',
    email: 'imran@jseco.in',
    allowedModules: ALL_MODULE_IDS,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    isPrimaryAdmin: true,
  },
  {
    id: 'team_ops_1',
    name: 'Logistics & Towing Manager',
    email: 'operations@goodecosolutions.in',
    allowedModules: ['dashboard', 'orders', 'customers', 'inquiries', 'scrapCategories', 'scrapProducts'],
    status: 'active',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'team_inv_1',
    name: 'Salvage Inventory Specialist',
    email: 'inventory@goodecosolutions.in',
    allowedModules: ['dashboard', 'products', 'categories', 'scrapCategories', 'scrapProducts', 'content'],
    status: 'active',
    createdAt: '2026-02-20T14:30:00Z',
  },
];

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  department: string;
  status: 'active' | 'invited' | 'suspended';
  twoFactorEnabled: boolean;
  lastActive: string;
  createdAt: string;
}

export interface RbacSecurityPolicies {
  requireTwoFactor: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string;
  restrictExportToAdmins: boolean;
  auditLoggingEnabled: boolean;
  preventConcurrentLogins: boolean;
}

export interface RbacSectionGroup {
  id: SidebarSectionId;
  label: string;
  description: string;
}

export const RBAC_SECTIONS: RbacSectionGroup[] = [
  {
    id: 'Overview',
    label: 'OVERVIEW',
    description: 'Executive dashboard, telemetry KPIs, conversion funnel, and activity monitor',
  },
  {
    id: 'Catalog',
    label: 'CATALOG',
    description: 'Salvaged auto spare parts inventory and e-commerce parts category taxonomy',
  },
  {
    id: 'Sales',
    label: 'SALES',
    description: 'Customer order fulfillment, customer directory, and vehicle valuation inquiries',
  },
  {
    id: 'Scrap Config',
    label: 'SCRAP CONFIG',
    description: 'Government RVSF classification categories, scrap vehicle models, and pricing tiers',
  },
  {
    id: 'Customize',
    label: 'CUSTOMIZE',
    description: 'Flutter mobile app CMS banners, promotion countdowns, and system configuration',
  },
];

/**
 * All 10 admin modules mapped 1-to-1 to the sidebar navigation hierarchy.
 */
export const RBAC_MODULES: ModuleDefinition[] = [
  // ── OVERVIEW ─────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    section: 'Overview',
    sectionLabel: 'OVERVIEW',
    description: 'Executive telemetry, scrap valuation counts, order volume, and revenue metrics',
    href: '/admin',
    icon: 'LayoutDashboard',
    allowedActions: ['view', 'export'],
  },

  // ── CATALOG ──────────────────────────────────────────────────────────────
  {
    id: 'products',
    label: 'Products',
    section: 'Catalog',
    sectionLabel: 'CATALOG',
    description: 'Salvage spare parts inventory, pricing, OEM numbers, condition grades, and stock',
    href: '/products',
    icon: 'Package',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
  {
    id: 'categories',
    label: 'Categories',
    section: 'Catalog',
    sectionLabel: 'CATALOG',
    description: 'Auto parts catalog taxonomy (Engines, Transmissions, Electrical, Brakes)',
    href: '/categories',
    icon: 'FolderTree',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },

  // ── SALES ────────────────────────────────────────────────────────────────
  {
    id: 'orders',
    label: 'Orders',
    section: 'Sales',
    sectionLabel: 'SALES',
    description: 'Customer parts orders, payment verification, fulfillment, and shipping labels',
    href: '/orders',
    icon: 'ClipboardList',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
  {
    id: 'customers',
    label: 'Customers',
    section: 'Sales',
    sectionLabel: 'SALES',
    description: 'Customer directory, buyer profiles, seller phone numbers, and addresses',
    href: '/customers',
    icon: 'Users',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
  {
    id: 'inquiries',
    label: 'Vehicle Inquiries',
    section: 'Sales',
    sectionLabel: 'SALES',
    description: 'Scrap car valuations, doorstep towing bookings, and customer inquiry follow-up',
    href: '/inquiries',
    icon: 'Mail',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },

  // ── SCRAP CONFIG ─────────────────────────────────────────────────────────
  {
    id: 'scrapCategories',
    label: 'Scrap Categories',
    section: 'Scrap Config',
    sectionLabel: 'SCRAP CONFIG',
    description: 'Government RVSF vehicle scrap classification groups and compliance standards',
    href: '/scrap-categories',
    icon: 'Recycle',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
  {
    id: 'scrapProducts',
    label: 'Scrap Products',
    section: 'Scrap Config',
    sectionLabel: 'SCRAP CONFIG',
    description: 'Scrap vehicle models, base scrap prices per kg/unit, and deregistration fees',
    href: '/scrap-products',
    icon: 'Car',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },

  // ── CUSTOMIZE ────────────────────────────────────────────────────────────
  {
    id: 'content',
    label: 'App Content',
    section: 'Customize',
    sectionLabel: 'CUSTOMIZE',
    description: 'Mobile app CMS banners, promotion countdown timers, and trending search terms',
    href: '/content',
    icon: 'Palette',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
  {
    id: 'settings',
    label: 'Settings',
    section: 'Customize',
    sectionLabel: 'CUSTOMIZE',
    description: 'Store configuration, email notification dispatch, SMTP setup, and RBAC governance',
    href: '/settings',
    icon: 'Settings',
    allowedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
];

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full unrestricted root authority over all 10 sidebar modules, staff assignments, and security policies.',
    badgeColor: '#10B981',
    isSystem: true,
    permissions: {
      dashboard: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      products: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      categories: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      orders: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      customers: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      inquiries: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      scrapCategories: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      scrapProducts: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      content: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      settings: { access: true, view: true, create: true, edit: true, delete: true, export: true },
    },
  },
  {
    id: 'ops_manager',
    name: 'Operations & Towing Manager',
    description: 'Manages doorstep vehicle pickups, towing slot confirmation, customer orders, and scrap inquiries.',
    badgeColor: '#3B82F6',
    isSystem: false,
    permissions: {
      dashboard: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      products: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      categories: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      orders: { access: true, view: true, create: true, edit: true, delete: false, export: true },
      customers: { access: true, view: true, create: false, edit: true, delete: false, export: true },
      inquiries: { access: true, view: true, create: true, edit: true, delete: false, export: true },
      scrapCategories: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      scrapProducts: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      content: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      settings: { access: false, view: false, create: false, edit: false, delete: false, export: false },
    },
  },
  {
    id: 'inventory_specialist',
    name: 'Inventory & Catalog Specialist',
    description: 'Manages salvaged spare parts, scrap vehicle rates, categories, and inventory stock levels.',
    badgeColor: '#8B5CF6',
    isSystem: false,
    permissions: {
      dashboard: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      products: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      categories: { access: true, view: true, create: true, edit: true, delete: true, export: false },
      orders: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      customers: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      inquiries: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      scrapCategories: { access: true, view: true, create: true, edit: true, delete: true, export: false },
      scrapProducts: { access: true, view: true, create: true, edit: true, delete: true, export: true },
      content: { access: true, view: true, create: true, edit: true, delete: false, export: false },
      settings: { access: false, view: false, create: false, edit: false, delete: false, export: false },
    },
  },
  {
    id: 'support_agent',
    name: 'Support & Valuation Agent',
    description: 'Frontline quotation calls, WhatsApp customer inquiries, follow-up notes, and order viewing.',
    badgeColor: '#F59E0B',
    isSystem: false,
    permissions: {
      dashboard: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      products: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      categories: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      orders: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      customers: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      inquiries: { access: true, view: true, create: true, edit: true, delete: false, export: false },
      scrapCategories: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      scrapProducts: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      content: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      settings: { access: false, view: false, create: false, edit: false, delete: false, export: false },
    },
  },
  {
    id: 'auditor',
    name: 'Auditor & Compliance Inspector',
    description: 'Read-only access for VAHAN deregistration compliance, statutory reports, and accounting audit.',
    badgeColor: '#64748B',
    isSystem: false,
    permissions: {
      dashboard: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      products: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      categories: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      orders: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      customers: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      inquiries: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      scrapCategories: { access: true, view: true, create: false, edit: false, delete: false, export: false },
      scrapProducts: { access: true, view: true, create: false, edit: false, delete: false, export: true },
      content: { access: false, view: false, create: false, edit: false, delete: false, export: false },
      settings: { access: false, view: false, create: false, edit: false, delete: false, export: false },
    },
  },
];

export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    name: 'Rajesh Verma',
    email: 'rajesh.verma@goodecosolutions.in',
    roleId: 'super_admin',
    department: 'Executive Administration',
    status: 'active',
    twoFactorEnabled: true,
    lastActive: 'Active now',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'staff_2',
    name: 'Anjali Sharma',
    email: 'anjali.s@goodecosolutions.in',
    roleId: 'ops_manager',
    department: 'Vehicle Towing & Logistics',
    status: 'active',
    twoFactorEnabled: true,
    lastActive: '15 mins ago',
    createdAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'staff_3',
    name: 'Vikram Singh',
    email: 'vikram.parts@goodecosolutions.in',
    roleId: 'inventory_specialist',
    department: 'Salvage Warehouse & Catalog',
    status: 'active',
    twoFactorEnabled: false,
    lastActive: '2 hours ago',
    createdAt: '2026-02-18T14:20:00Z',
  },
  {
    id: 'staff_4',
    name: 'Pooja Mehta',
    email: 'pooja.m@goodecosolutions.in',
    roleId: 'support_agent',
    department: 'Customer Valuation Support',
    status: 'active',
    twoFactorEnabled: true,
    lastActive: 'Yesterday',
    createdAt: '2026-03-05T10:15:00Z',
  },
  {
    id: 'staff_5',
    name: 'Suresh Nair',
    email: 'audit@goodecosolutions.in',
    roleId: 'auditor',
    department: 'MoRTH Statutory Audit',
    status: 'active',
    twoFactorEnabled: true,
    lastActive: '3 days ago',
    createdAt: '2026-03-10T16:45:00Z',
  },
];

export const DEFAULT_POLICIES: RbacSecurityPolicies = {
  requireTwoFactor: true,
  sessionTimeoutMinutes: 60,
  ipWhitelistEnabled: false,
  ipWhitelist: '192.168.1.0/24, 10.0.0.0/16',
  restrictExportToAdmins: true,
  auditLoggingEnabled: true,
  preventConcurrentLogins: true,
};

/**
 * Normalizes permissions dictionary ensuring every one of the 10 modules
 * has valid boolean flags for access, view, create, edit, delete, export.
 */
export function normalizeRolePermissions(
  perms?: Record<string, Partial<RolePermissions>>
): Record<string, RolePermissions> {
  const normalized: Record<string, RolePermissions> = {};
  for (const mod of RBAC_MODULES) {
    const p = perms?.[mod.id];
    const isView = Boolean(p?.view);
    const isAccess = p?.access !== undefined ? Boolean(p.access) : isView;
    normalized[mod.id] = {
      access: isAccess,
      view: isAccess && isView,
      create: isAccess && Boolean(p?.create),
      edit: isAccess && Boolean(p?.edit),
      delete: isAccess && Boolean(p?.delete),
      export: isAccess && Boolean(p?.export),
    };
  }
  return normalized;
}

/**
 * Normalizes an array of role definitions.
 */
export function normalizeRoles(roles: RoleDefinition[]): RoleDefinition[] {
  if (!Array.isArray(roles) || roles.length === 0) return DEFAULT_ROLES;
  return roles.map((role) => ({
    ...role,
    isSystem: role.id === 'super_admin',
    permissions: normalizeRolePermissions(role.permissions),
  }));
}

/**
 * Checks whether a role has authorization to access/view a module.
 */
export function hasModuleAccess(
  role: RoleDefinition | null | undefined,
  moduleId: string
): boolean {
  if (!role) return false;
  if (role.id === 'super_admin') return true;
  const modPerms = role.permissions?.[moduleId];
  if (!modPerms) return false;
  return Boolean(modPerms.access && modPerms.view);
}
