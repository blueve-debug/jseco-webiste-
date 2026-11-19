'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import {
  Save,
  Mail,
  Settings as SettingsIcon,
  FlaskConical,
  Check,
  X,
  ShieldCheck,
  Users,
  Lock,
  Plus,
  Trash2,
  Key,
  Globe,
  Store,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Recycle,
  Car,
  Palette,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  Shield,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  RBAC_MODULES,
  RBAC_SECTIONS,
  ALL_MODULE_IDS,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_ROLES,
  type TeamMember,
  type RoleDefinition,
  type RolePermissions,
  type PermissionAction,
  normalizeRoles,
  normalizeRolePermissions,
} from '@/lib/rbac';

interface SettingsData {
  storeName: string;
  storeTagline: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  shippingType: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  // Inquiry Email Notifications & Mail API
  inquiryEmailNotificationsEnabled?: boolean;
  inquiryNotificationEmails?: string;
  hostingerApiKey?: string;
  hostingerMailboxId?: string;
  hostingerSenderEmail?: string;
  hostingerSenderName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  rbacRoles?: RoleDefinition[];
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'team' | 'roles' | 'email' | 'general'>('team');

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [submitting, setSubmitting] = useState(false);

  // RBAC Roles State
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('super_admin');

  // Modals state - Team
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditAccessModal, setShowEditAccessModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Modals state - Roles
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3B82F6');
  const [newRoleCopyFrom, setNewRoleCopyFrom] = useState('support_agent');

  // Add Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPass, setNewMemberPass] = useState('');
  const [showNewMemberPass, setShowNewMemberPass] = useState(false);
  const [newMemberModules, setNewMemberModules] = useState<string[]>([...ALL_MODULE_IDS]);

  // Edit Access Form
  const [editModules, setEditModules] = useState<string[]>([]);

  // Change Password Form
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showHostingerKey, setShowHostingerKey] = useState(false);
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);

  const loadTeam = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        if (data.team && Array.isArray(data.team) && data.team.length > 0) {
          setTeamMembers(data.team);
        }
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/team').then((r) => r.json()).catch(() => ({ team: DEFAULT_TEAM_MEMBERS })),
    ])
      .then(([settingsData, teamData]) => {
        setSettings(settingsData);
        if (settingsData.rbacRoles && Array.isArray(settingsData.rbacRoles) && settingsData.rbacRoles.length > 0) {
          setRoles(normalizeRoles(settingsData.rbacRoles));
        } else {
          setRoles(DEFAULT_ROLES);
        }
        if (teamData?.team && Array.isArray(teamData.team) && teamData.team.length > 0) {
          setTeamMembers(teamData.team);
        }
        if (settingsData.inquiryNotificationEmails) {
          setTestEmail(settingsData.inquiryNotificationEmails.split(',')[0].trim());
        }
      })
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const updateSettingField = (field: keyof SettingsData, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveAll = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const payload = {
        ...settings,
        rbacRoles: roles,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save request failed');
      showToast('Settings saved successfully!');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save RBAC Roles
  const handleSaveRolesOnly = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rbacRoles: roles }),
      });

      if (!res.ok) throw new Error('Failed to save role permissions');
      setSettings({ ...settings, rbacRoles: roles });
      showToast('Role permissions saved successfully!');
    } catch {
      showToast('Failed to save role permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // ROLE DELETION & MANAGEMENT
  // =========================================================================
  const handleOpenDeleteRoleModal = (role: RoleDefinition) => {
    if (role.id === 'super_admin') {
      showToast('Super Admin is the root system role and cannot be deleted', 'error');
      return;
    }
    setRoleToDelete(role);
    setShowDeleteRoleModal(true);
  };

  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete || roleToDelete.id === 'super_admin') return;

    const targetRole = roleToDelete;
    const updatedRoles = roles.filter((r) => r.id !== targetRole.id);

    setSubmitting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rbacRoles: updatedRoles }),
      });

      if (!res.ok) throw new Error('Failed to delete role');

      setRoles(updatedRoles);
      if (settings) {
        setSettings({ ...settings, rbacRoles: updatedRoles });
      }
      if (selectedRoleId === targetRole.id) {
        setSelectedRoleId('super_admin');
      }
      setShowDeleteRoleModal(false);
      setRoleToDelete(null);
      showToast(`Role "${targetRole.name}" has been deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete role';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showToast('Role name is required', 'error');
      return;
    }

    const roleId =
      'custom_' +
      newRoleName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') +
      '_' +
      Date.now().toString(36);

    const baseTemplate = roles.find((r) => r.id === newRoleCopyFrom) || roles[0];
    const newPermissions = normalizeRolePermissions(baseTemplate?.permissions || {});

    const newRole: RoleDefinition = {
      id: roleId,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom administrative role',
      badgeColor: newRoleColor || '#3B82F6',
      isSystem: false,
      permissions: newPermissions,
    };

    const updatedRoles = [...roles, newRole];
    setSubmitting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rbacRoles: updatedRoles }),
      });

      if (!res.ok) throw new Error('Failed to create role');

      setRoles(updatedRoles);
      if (settings) {
        setSettings({ ...settings, rbacRoles: updatedRoles });
      }
      setSelectedRoleId(roleId);
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRoleColor('#3B82F6');
      showToast(`Role "${newRole.name}" created successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create role';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleModuleAction = (moduleId: string, action: PermissionAction) => {
    if (selectedRole.id === 'super_admin') return;

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRoleId) return role;
        const currentPerms = role.permissions[moduleId] || {
          access: false,
          view: false,
          create: false,
          edit: false,
          delete: false,
          export: false,
        };

        const nextVal = !currentPerms[action];
        const updatedPerms = { ...currentPerms, [action]: nextVal };

        if (nextVal) {
          updatedPerms.access = true;
          updatedPerms.view = true;
        }

        if (action === 'view' && !nextVal) {
          updatedPerms.access = false;
          updatedPerms.create = false;
          updatedPerms.edit = false;
          updatedPerms.delete = false;
          updatedPerms.export = false;
        }

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: updatedPerms,
          },
        };
      })
    );
  };

  const handleToggleModuleAccess = (moduleId: string) => {
    if (selectedRole.id === 'super_admin') return;

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRoleId) return role;
        const current = role.permissions[moduleId];
        const nextAccess = !current?.access;

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: {
              access: nextAccess,
              view: nextAccess,
              create: nextAccess ? Boolean(current?.create) : false,
              edit: nextAccess ? Boolean(current?.edit) : false,
              delete: nextAccess ? Boolean(current?.delete) : false,
              export: nextAccess ? Boolean(current?.export) : false,
            },
          },
        };
      })
    );
  };

  const handleApplyBulkPreset = (preset: 'full' | 'viewOnly' | 'clear') => {
    if (selectedRole.id === 'super_admin') return;

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRoleId) return role;
        const updatedPerms: Record<string, RolePermissions> = {};

        for (const mod of RBAC_MODULES) {
          if (preset === 'full') {
            updatedPerms[mod.id] = { access: true, view: true, create: true, edit: true, delete: true, export: true };
          } else if (preset === 'viewOnly') {
            updatedPerms[mod.id] = { access: true, view: true, create: false, edit: false, delete: false, export: false };
          } else {
            updatedPerms[mod.id] = { access: false, view: false, create: false, edit: false, delete: false, export: false };
          }
        }

        return { ...role, permissions: updatedPerms };
      })
    );
  };

  const handleResetRoleToDefault = (roleId: string) => {
    const defaultRole = DEFAULT_ROLES.find((r) => r.id === roleId);
    if (!defaultRole) {
      showToast('No predefined defaults for custom roles', 'info');
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) => (role.id === roleId ? { ...defaultRole } : role))
    );
    showToast(`Reset ${defaultRole.name} to default factory permissions`);
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0] || DEFAULT_ROLES[0];

  // =========================================================================
  // TEAM MEMBER CRUD
  // =========================================================================
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    if (!newMemberPass || newMemberPass.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newMemberModules.length === 0) {
      showToast('Please select at least 1 module for the member', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName.trim(),
          email: newMemberEmail.trim(),
          password: newMemberPass.trim(),
          allowedModules: newMemberModules,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to add member');
      }

      showToast(`Member "${newMemberName}" added with login credentials!`);
      setShowAddMemberModal(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPass('');
      setNewMemberModules([...ALL_MODULE_IDS]);
      await loadTeam();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('team-access-updated'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding member';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditAccess = (member: TeamMember) => {
    setSelectedMember(member);
    setEditModules(member.allowedModules || []);
    setShowEditAccessModal(true);
  };

  const handleSaveAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    if (editModules.length === 0) {
      showToast('Please select at least 1 module', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          allowedModules: editModules,
        }),
      });

      if (!res.ok) throw new Error('Failed to update member access');

      setTeamMembers(
        teamMembers.map((m) =>
          m.id === selectedMember.id ? { ...m, allowedModules: editModules } : m
        )
      );
      showToast(`Module access updated for ${selectedMember.name}`);
      setShowEditAccessModal(false);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('team-access-updated'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update access';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openChangePassword = (member: TeamMember) => {
    setSelectedMember(member);
    setNewPasswordVal('');
    setShowChangePass(false);
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    if (!newPasswordVal || newPasswordVal.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/team/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          password: newPasswordVal.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to change password');
      }

      showToast(`Password updated successfully for ${selectedMember.name}`);
      setShowChangePasswordModal(false);
      setNewPasswordVal('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    if (member.isPrimaryAdmin) {
      showToast('Cannot suspend the primary administrator', 'error');
      return;
    }

    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');

      setTeamMembers(
        teamMembers.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m))
      );
      showToast(`Member account marked as ${newStatus}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const openDeleteModal = (member: TeamMember) => {
    if (member.isPrimaryAdmin) {
      showToast('Primary Root Administrator cannot be deleted', 'error');
      return;
    }
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/team?id=${selectedMember.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete member');

      setTeamMembers(teamMembers.filter((m) => m.id !== selectedMember.id));
      showToast(`Member "${selectedMember.name}" has been deleted`);
      setShowDeleteModal(false);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('team-access-updated'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete member';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================================
  // EMAIL / SMTP TEST
  // =========================================================================
  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showToast('Please enter a valid email to send test to', 'error');
      return;
    }
    const hasHostinger = Boolean(settings?.hostingerApiKey);
    const hasSmtp = Boolean(settings?.smtpHost && settings?.smtpUser);
    if (!hasHostinger && !hasSmtp) {
      showToast('Please provide Hostinger Mail API Key or SMTP credentials first', 'error');
      return;
    }

    setTestingEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: testEmail,
          hostingerApiKey: settings?.hostingerApiKey,
          hostingerMailboxId: settings?.hostingerMailboxId,
          hostingerSenderEmail: settings?.hostingerSenderEmail,
          hostingerSenderName: settings?.hostingerSenderName,
          smtpHost: settings?.smtpHost,
          smtpPort: settings?.smtpPort,
          smtpSecure: settings?.smtpSecure,
          smtpUser: settings?.smtpUser,
          smtpPassword: settings?.smtpPassword,
          smtpFromEmail: settings?.smtpFromEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({ success: true, message: data.message || `Email delivered to ${testEmail}` });
        showToast('Test email sent successfully!');
      } else {
        const failMsg = data.error || 'Failed to send test email';
        setTestEmailResult({ success: false, message: failMsg });
        showToast(failMsg, 'error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error sending test email';
      setTestEmailResult({ success: false, message: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  // Icon renderer helper
  const renderModuleIcon = (iconName: string, size = 16) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard size={size} />;
      case 'Package':
        return <Package size={size} />;
      case 'FolderTree':
        return <FolderTree size={size} />;
      case 'ClipboardList':
        return <ClipboardList size={size} />;
      case 'Users':
        return <Users size={size} />;
      case 'Mail':
        return <Mail size={size} />;
      case 'Recycle':
        return <Recycle size={size} />;
      case 'Car':
        return <Car size={size} />;
      case 'Palette':
        return <Palette size={size} />;
      case 'Settings':
        return <SettingsIcon size={size} />;
      default:
        return <ShieldCheck size={size} />;
    }
  };

  if (loading) return <LoadingPage />;
  if (!settings) return null;

  return (
    <>
      <Header
        title="Settings & Team Access"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Settings' }]}
      />

      <div className="page-content">
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: '20px' }}>
          <div>
            <h1>Settings &amp; Access Governance</h1>
            <p className="page-header-subtitle">
              Manage authorized team members, roles, granular permissions, email notification dispatch, and store configuration
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={handleSaveAll}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button
            type="button"
            className={`tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Users size={16} />
            <span>Team Members &amp; Logins</span>
            <span className="tab-count">{teamMembers.length} Members</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ShieldCheck size={16} />
            <span>Role Permissions Matrix</span>
            <span className="tab-count">{roles.length} Roles</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Mail size={16} />
            <span>Inquiry Email &amp; SMTP</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: settings.inquiryEmailNotificationsEnabled ? '#10b981' : '#64748b',
                display: 'inline-block',
                marginLeft: '4px',
              }}
            />
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Store size={16} />
            <span>Store &amp; General Configuration</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: SIMPLE & FRIENDLY TEAM & MODULE ACCESS
            ======================================================== */}
        {activeTab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '16px',
              }}
            >
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Team Members</span>
                  <Users size={18} color="var(--sp-primary-light)" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  {teamMembers.length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Authorized Login Accounts
                </div>
              </div>

              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Accounts</span>
                  <CheckCircle2 size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
                  {teamMembers.filter((m) => m.status === 'active').length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Can log in to admin dashboard
                </div>
              </div>

              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Configured Roles</span>
                  <ShieldCheck size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                  {roles.length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Customizable access presets
                </div>
              </div>
            </div>

            {/* Team Members List Card */}
            <div className="card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  borderBottom: '1px solid var(--border-default)',
                  paddingBottom: '16px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Team Members &amp; Module Access
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                    Add staff members with login details and choose exactly which sidebar modules they can access
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowAddMemberModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserPlus size={16} /> Add Team Member
                </button>
              </div>

              {/* Members Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: '10px' }}>
                <table className="data-table" style={{ margin: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Member &amp; Login Email</th>
                      <th style={{ width: '40%' }}>Accessible Modules</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>Account Status</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => {
                      const initials = member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      const isFull = member.allowedModules?.length === ALL_MODULE_IDS.length;

                      return (
                        <tr key={member.id}>
                          {/* Member Info */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: member.isPrimaryAdmin ? '#10b981' : '#3b82f6',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  flexShrink: 0,
                                }}
                              >
                                {initials || 'A'}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                    {member.name}
                                  </span>
                                  {member.isPrimaryAdmin && (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 700,
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                      }}
                                    >
                                      Primary Admin
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Accessible Modules Badges */}
                          <td>
                            {isFull ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} /> Full Access (All 10 Modules)
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {member.allowedModules?.map((modId) => {
                                  const mod = RBAC_MODULES.find((m) => m.id === modId);
                                  if (!mod) return null;
                                  return (
                                    <span
                                      key={modId}
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border-default)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      {renderModuleIcon(mod.icon, 12)}
                                      <span>{mod.label}</span>
                                    </span>
                                  );
                                })}
                                {(!member.allowedModules || member.allowedModules.length === 0) && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>No modules assigned</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              disabled={member.isPrimaryAdmin}
                              onClick={() => handleToggleStatus(member)}
                              style={{
                                border: 'none',
                                background: member.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: member.status === 'active' ? '#10b981' : '#ef4444',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '3px 10px',
                                borderRadius: '4px',
                                cursor: member.isPrimaryAdmin ? 'default' : 'pointer',
                              }}
                              title={member.isPrimaryAdmin ? 'Primary Admin cannot be suspended' : 'Click to toggle status'}
                            >
                              {member.status === 'active' ? 'Active' : 'Suspended'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => openEditAccess(member)}
                                style={{ fontSize: '11.5px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Change module access"
                              >
                                <KeyRound size={13} /> Edit Access
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => openChangePassword(member)}
                                style={{ fontSize: '11.5px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Change login password"
                              >
                                <Lock size={13} /> Password
                              </button>

                              {!member.isPrimaryAdmin && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => openDeleteModal(member)}
                                  style={{ color: 'var(--sp-error)', padding: '4px 8px' }}
                                  title="Delete member"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ROLE PERMISSIONS MATRIX & ROLE MANAGEMENT
            ======================================================== */}
        {activeTab === 'roles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Role Selector Card */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Role-Based Access Control
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {roles.length} roles configured
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  Select a role to configure precise View, Create, Edit, Delete, and Export permissions across all modules
                </p>
              </div>

              {/* Role Chips */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                {roles.map((r) => {
                  const isSelected = r.id === selectedRoleId;
                  const isRoot = r.id === 'super_admin';

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoleId(r.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 14px',
                        borderRadius: '999px',
                        border: isSelected
                          ? '2px solid #f59e0b'
                          : '1px solid var(--border-default)',
                        background: isSelected
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'var(--bg-elevated)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: r.badgeColor || '#3B82F6',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {r.name}
                      </span>

                      {isRoot ? (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          System
                        </span>
                      ) : (
                        <button
                          type="button"
                          title={`Delete ${r.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteRoleModal(r);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddRoleModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '999px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                  }}
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              {/* Active Role Banner with DELETE ROLE BUTTON */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 18px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      background: selectedRole.badgeColor || '#f59e0b',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    {selectedRole.name}
                  </span>

                  {selectedRole.id === 'super_admin' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      <Lock size={13} color="#10b981" /> Protected Root System Role
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteRoleModal(selectedRole)}
                      style={{
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <Trash2 size={13} /> Delete Role
                    </button>
                  )}

                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', maxWidth: '450px' }}>
                    {selectedRole.description}
                  </span>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {selectedRole.id !== 'super_admin' && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleResetRoleToDefault(selectedRole.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                    >
                      <RotateCcw size={13} /> Reset to Defaults
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveRolesOnly}
                    disabled={saving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <Save size={13} /> {saving ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </div>

              {/* Preset Buttons for Non-Super-Admin */}
              {selectedRole.id !== 'super_admin' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Quick Permission Presets:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApplyBulkPreset('full')}
                      style={{ fontSize: '11.5px', padding: '3px 9px' }}
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApplyBulkPreset('viewOnly')}
                      style={{ fontSize: '11.5px', padding: '3px 9px' }}
                    >
                      View Only
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleApplyBulkPreset('clear')}
                      style={{ fontSize: '11.5px', padding: '3px 9px', color: 'var(--text-tertiary)' }}
                    >
                      Revoke All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Permissions Matrix by 5 Sections */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Module Permissions Matrix ({selectedRole.name})
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  Toggle master sidebar accessibility and granular capabilities (View, Create, Edit, Delete, Export)
                </p>
              </div>

              {/* Sections & Modules Loop */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {RBAC_SECTIONS.map((sec) => {
                  const sectionMods = RBAC_MODULES.filter((m) => m.section === sec.id);
                  if (sectionMods.length === 0) return null;

                  return (
                    <div
                      key={sec.id}
                      style={{
                        border: '1px solid var(--border-default)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'var(--bg-card)',
                      }}
                    >
                      {/* Section Header */}
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--border-default)',
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              color: 'var(--sp-primary-light)',
                              textTransform: 'uppercase',
                            }}
                          >
                            SECTION: {sec.label}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginLeft: '10px' }}>
                            {sec.description}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {sectionMods.length} Modules
                        </span>
                      </div>

                      {/* Section Modules Table */}
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '38%' }}>Module</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Sidebar Access</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>View</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Create</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Edit</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Delete</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Export</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionMods.map((mod) => {
                            const isRoot = selectedRole.id === 'super_admin';
                            const perms = selectedRole.permissions[mod.id] || {
                              access: false,
                              view: false,
                              create: false,
                              edit: false,
                              delete: false,
                              export: false,
                            };

                            const hasAccess = isRoot || perms.access;

                            return (
                              <tr key={mod.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        background: hasAccess ? 'rgba(0, 166, 118, 0.15)' : 'var(--bg-elevated)',
                                        color: hasAccess ? 'var(--sp-primary-light)' : 'var(--text-tertiary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {renderModuleIcon(mod.icon, 16)}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                                        {mod.label}
                                      </div>
                                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                        {mod.description}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Master Access Toggle */}
                                <td style={{ textAlign: 'center' }}>
                                  <label className="toggle" style={{ margin: 0 }}>
                                    <input
                                      type="checkbox"
                                      disabled={isRoot}
                                      checked={hasAccess}
                                      onChange={() => handleToggleModuleAccess(mod.id)}
                                    />
                                    <span className="toggle-slider" />
                                  </label>
                                </td>

                                {/* Action Checkboxes */}
                                {(['view', 'create', 'edit', 'delete', 'export'] as PermissionAction[]).map((act) => {
                                  const isAllowedByModule = mod.allowedActions.includes(act);
                                  const isChecked = isRoot || (hasAccess && Boolean(perms[act]));

                                  if (!isAllowedByModule) {
                                    return (
                                      <td key={act} style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '11px' }}>
                                        —
                                      </td>
                                    );
                                  }

                                  return (
                                    <td key={act} style={{ textAlign: 'center' }}>
                                      <input
                                        type="checkbox"
                                        disabled={isRoot || !hasAccess}
                                        checked={isChecked}
                                        onChange={() => handleToggleModuleAction(mod.id, act)}
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          cursor: isRoot || !hasAccess ? 'not-allowed' : 'pointer',
                                          accentColor: '#10b981',
                                        }}
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: EMAIL & INQUIRY LEAD NOTIFICATIONS
            ======================================================== */}
        {activeTab === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  borderBottom: '1px solid var(--border-default)',
                  paddingBottom: '16px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Inquiry Email Notifications
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                    Automatically dispatch instant email alerts when customers submit vehicle scrap valuation inquiries
                  </p>
                </div>

                <label className="toggle" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.inquiryEmailNotificationsEnabled ?? true}
                    onChange={(e) => updateSettingField('inquiryEmailNotificationsEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Notification Recipient Email Addresses
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. care@jseco.in, imran@jseco.in"
                  value={settings.inquiryNotificationEmails ?? ''}
                  onChange={(e) => updateSettingField('inquiryNotificationEmails', e.target.value)}
                />
                <div className="form-hint">
                  Separate multiple email addresses with commas. Every inquiry will be delivered to each recipient simultaneously.
                </div>
              </div>

              {/* Hostinger Mail API Configuration */}
              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="var(--sp-primary-light)" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Hostinger Mail API (Direct Delivery)
                    </h3>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    Connected &amp; Active
                  </span>
                </div>

                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">Hostinger Mail API Token / Key</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showHostingerKey ? 'text' : 'password'}
                          className="form-input"
                          placeholder="e.g. 3ea5e08b9032820e53c7dc0d..."
                          value={settings.hostingerApiKey ?? ''}
                          onChange={(e) => updateSettingField('hostingerApiKey', e.target.value)}
                          style={{ paddingRight: '40px', fontFamily: 'monospace', fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowHostingerKey(!showHostingerKey)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                          }}
                        >
                          {showHostingerKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="form-hint">
                        Generated in Hostinger hPanel under <strong>Dev tools &gt; API</strong> or <strong>Agentic Mail</strong>.
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Sender Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="care@jseco.in"
                        value={settings.hostingerSenderEmail ?? ''}
                        onChange={(e) => updateSettingField('hostingerSenderEmail', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Sender Display Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="JSECO Private Limited"
                        value={settings.hostingerSenderName ?? ''}
                        onChange={(e) => updateSettingField('hostingerSenderName', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">Mailbox Resource ID (Optional / Auto-detected)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. AC6fa0af5d624da8e8e7937f79a7ac"
                        value={settings.hostingerMailboxId ?? ''}
                        onChange={(e) => updateSettingField('hostingerMailboxId', e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '13px' }}
                      />
                      <div className="form-hint">
                        Auto-detected from your Hostinger account automatically if left empty.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible SMTP Fallback Section */}
                <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-default)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{showSmtpConfig ? 'Hide' : 'Show'} Custom SMTP Mail Server Fallback</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>(Optional)</span>
                  </button>

                  {showSmtpConfig && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '14px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">SMTP Host</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. smtp.hostinger.com"
                          value={settings.smtpHost ?? ''}
                          onChange={(e) => updateSettingField('smtpHost', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">SMTP Port</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="465"
                          value={settings.smtpPort ?? 465}
                          onChange={(e) => updateSettingField('smtpPort', parseInt(e.target.value) || 465)}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">SMTP Username / Email</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="care@jseco.in"
                          value={settings.smtpUser ?? ''}
                          onChange={(e) => updateSettingField('smtpUser', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">SMTP Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showSmtpPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="••••••••••••••••"
                            value={settings.smtpPassword ?? ''}
                            onChange={(e) => updateSettingField('smtpPassword', e.target.value)}
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                            }}
                          >
                            {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                        <label className="form-label">Outgoing From Header</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder='"JSECO Private Limited" <care@jseco.in>'
                          value={settings.smtpFromEmail ?? ''}
                          onChange={(e) => updateSettingField('smtpFromEmail', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Email Section */}
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13.5px' }}>
                    <FlaskConical size={16} color="var(--sp-primary-light)" />
                    <span>Send Test Notification Email</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter email to receive test message"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      style={{ flex: 1, minWidth: '220px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                    >
                      {testingEmail ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>

                  {testEmailResult && (
                    <div
                      style={{
                        fontSize: '12.5px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: testEmailResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: testEmailResult.success ? '#10b981' : '#ef4444',
                        border: `1px solid ${testEmailResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      {testEmailResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: STORE & GENERAL CONFIGURATION
            ======================================================== */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Store Identity &amp; Contact Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Store Brand Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.storeName}
                    onChange={(e) => updateSettingField('storeName', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.storeTagline}
                    onChange={(e) => updateSettingField('storeTagline', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Public Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={settings.contactEmail}
                    onChange={(e) => updateSettingField('contactEmail', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Support Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.contactPhone}
                    onChange={(e) => updateSettingField('contactPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Currency & Tax */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Pricing &amp; Shipping Rates
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Currency Symbol</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.currencySymbol}
                    onChange={(e) => updateSettingField('currencySymbol', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Flat Shipping Rate</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.flatShippingRate}
                    onChange={(e) => updateSettingField('flatShippingRate', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Free Shipping Minimum Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => updateSettingField('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: DELETE ROLE CONFIRMATION
          ======================================================== */}
      {showDeleteRoleModal && roleToDelete && (
        <Modal
          isOpen={showDeleteRoleModal}
          onClose={() => setShowDeleteRoleModal(false)}
          title={`Delete Role: ${roleToDelete.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
              }}
            >
              <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ef4444' }}>
                  Permanent Role Deletion
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  Are you sure you want to permanently delete the role <strong>{roleToDelete.name}</strong>?
                  All module permission matrices configured for this role will be removed.
                  This action cannot be undone.
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteRoleModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={handleConfirmDeleteRole}
                disabled={submitting}
              >
                <Trash2 size={14} /> {submitting ? 'Deleting...' : 'Yes, Delete Role'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: ADD NEW CUSTOM ROLE
          ======================================================== */}
      {showAddRoleModal && (
        <Modal
          isOpen={showAddRoleModal}
          onClose={() => setShowAddRoleModal(false)}
          title="Create New Role"
        >
          <form onSubmit={handleAddRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Role Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Regional Scrap Inspector"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Role Description</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Brief description of the responsibilities..."
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Badge Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewRoleColor(color)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: color,
                      border: newRoleColor === color ? '2px solid #ffffff' : 'none',
                      boxShadow: newRoleColor === color ? `0 0 0 2px ${color}` : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Clone Permissions Template From</label>
              <select
                className="form-select"
                value={newRoleCopyFrom}
                onChange={(e) => setNewRoleCopyFrom(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddRoleModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================
          MODAL 1: ADD TEAM MEMBER WITH LOGIN DETAILS & MODULES
          ======================================================== */}
      {showAddMemberModal && (
        <Modal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          title="Add Team Member & Assign Access"
        >
          <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Anjali Sharma"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Login Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. anjali@goodecosolutions.in"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                This email will be their username to log in to the admin dashboard.
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Login Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewMemberPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter at least 6 characters"
                  value={newMemberPass}
                  onChange={(e) => setNewMemberPass(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewMemberPass(!showNewMemberPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                  }}
                >
                  {showNewMemberPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Module Access Selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Select Accessible Modules ({newMemberModules.length} selected)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', padding: '2px 7px' }}
                    onClick={() => setNewMemberModules([...ALL_MODULE_IDS])}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', padding: '2px 7px', color: 'var(--text-tertiary)' }}
                    onClick={() => setNewMemberModules([])}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* 10 modules checkboxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {RBAC_MODULES.map((mod) => {
                  const isChecked = newMemberModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        if (isChecked) {
                          setNewMemberModules(newMemberModules.filter((id) => id !== mod.id));
                        } else {
                          setNewMemberModules([...newMemberModules, mod.id]);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: isChecked ? '1px solid rgba(0, 166, 118, 0.4)' : '1px solid var(--border-default)',
                        background: isChecked ? 'rgba(0, 166, 118, 0.1)' : 'var(--bg-elevated)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? '1px solid #10b981' : '1px solid var(--border-default)',
                          background: isChecked ? '#10b981' : 'transparent',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ color: isChecked ? 'var(--sp-primary-light)' : 'var(--text-tertiary)' }}>
                          {renderModuleIcon(mod.icon, 15)}
                        </span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: isChecked ? 700 : 500, color: 'var(--text-primary)' }}>
                            {mod.label}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                            {mod.sectionLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddMemberModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Add Member & Grant Access'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================
          MODAL 2: EDIT MODULE ACCESS
          ======================================================== */}
      {showEditAccessModal && selectedMember && (
        <Modal
          isOpen={showEditAccessModal}
          onClose={() => setShowEditAccessModal(false)}
          title={`Manage Module Access for ${selectedMember.name}`}
        >
          <form onSubmit={handleSaveAccessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Choose which sidebar modules <strong>{selectedMember.name}</strong> can see and access:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', padding: '2px 7px' }}
                  onClick={() => setEditModules([...ALL_MODULE_IDS])}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', padding: '2px 7px', color: 'var(--text-tertiary)' }}
                  onClick={() => setEditModules([])}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 10 modules checkboxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {RBAC_MODULES.map((mod) => {
                const isChecked = editModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      if (isChecked) {
                        setEditModules(editModules.filter((id) => id !== mod.id));
                      } else {
                        setEditModules([...editModules, mod.id]);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: isChecked ? '1px solid rgba(0, 166, 118, 0.4)' : '1px solid var(--border-default)',
                      background: isChecked ? 'rgba(0, 166, 118, 0.1)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: isChecked ? '1px solid #10b981' : '1px solid var(--border-default)',
                        background: isChecked ? '#10b981' : 'transparent',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={13} strokeWidth={3} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ color: isChecked ? 'var(--sp-primary-light)' : 'var(--text-tertiary)' }}>
                        {renderModuleIcon(mod.icon, 15)}
                      </span>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: isChecked ? 700 : 500, color: 'var(--text-primary)' }}>
                          {mod.label}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          {mod.sectionLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditAccessModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Module Access'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================
          MODAL 3: CHANGE PASSWORD
          ======================================================== */}
      {showChangePasswordModal && selectedMember && (
        <Modal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          title={`Change Password for ${selectedMember.name}`}
        >
          <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>User Login Email</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {selectedMember.email}
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showChangePass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter at least 6 characters"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowChangePass(!showChangePass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                  }}
                >
                  {showChangePass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowChangePasswordModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================
          MODAL 4: DELETE MEMBER CONFIRMATION
          ======================================================== */}
      {showDeleteModal && selectedMember && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Member Access"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{selectedMember.name}</strong> ({selectedMember.email})?
              Their login account will be deleted and they will no longer be able to sign in to the dashboard.
            </p>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: '#ef4444', color: '#ffffff', border: 'none' }}
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Member'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
