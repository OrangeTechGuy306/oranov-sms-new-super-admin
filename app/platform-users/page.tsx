'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PlatformUser, PlatformRoleKey } from '@/lib/types/platform-users';
import { PlatformRole, PlatformPermission } from '@/lib/types/iam';
import { AuditEvent } from '@/lib/types/audit-logs';
import { formatDate, getInitials } from '@/lib/utils/formatters';
import {
  computeIamMetrics,
  filterPlatformUsers,
  filterPlatformRoles,
  filterPlatformPermissions,
  validateRoleAssignment,
} from '@/lib/iam/evaluator';
import { IamSummaryCards } from '@/components/iam/IamSummaryCards';
import { PlatformBoundaryNotice } from '@/components/iam/PlatformBoundaryNotice';
import { UserDetailModal } from '@/components/iam/UserDetailModal';
import { CreateUserModal } from '@/components/iam/CreateUserModal';
import { RoleDetailModal } from '@/components/iam/RoleDetailModal';
import { CreateRoleModal } from '@/components/iam/CreateRoleModal';
import { RolePermissionMatrix } from '@/components/iam/RolePermissionMatrix';
import { PlatformVsTenantSeparationCard } from '@/components/iam/PlatformVsTenantSeparationCard';
import {
  UserPlus,
  ShieldPlus,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Users2,
  Layers,
  KeyRound,
  Grid,
  History,
  Lock,
  Eye,
} from 'lucide-react';

export default function PlatformUsersPage() {
  const {
    platformUsers,
    platformRoles,
    platformPermissions,
    auditEvents,
    createPlatformUser,
    updatePlatformUserRole,
    updatePlatformUserStatus,
    assignRoleToUser,
    removeRoleFromUser,
    createPlatformRole,
    updatePlatformRolePermissions,
    deletePlatformRole,
  } = usePlatformStore();

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('users');

  // Modals state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<PlatformUser | null>(null);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<PlatformRole | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: PlatformUser; role: PlatformRoleKey } | null>(null);

  // Filters for Tab 1 (Users)
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Filters for Tab 2 (Roles)
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [roleCategoryFilter, setRoleCategoryFilter] = useState<'all' | 'system' | 'custom'>('all');
  const [rolePrivilegeFilter, setRolePrivilegeFilter] = useState<'all' | 'privileged' | 'standard'>('all');

  // Filters for Tab 3 (Permissions)
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [permDomainFilter, setPermDomainFilter] = useState('all');
  const [permActionFilter, setPermActionFilter] = useState('all');
  const [permPrivilegeFilter, setPermPrivilegeFilter] = useState<'all' | 'privileged' | 'standard'>('all');

  // Compute live IAM metrics
  const iamMetrics = useMemo(() => {
    return computeIamMetrics(platformUsers, platformRoles, platformPermissions);
  }, [platformUsers, platformRoles, platformPermissions]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return filterPlatformUsers(platformUsers, {
      searchQuery: userSearchQuery,
      roleFilter: userRoleFilter,
      statusFilter: userStatusFilter,
      departmentFilter: 'all',
    });
  }, [platformUsers, userSearchQuery, userRoleFilter, userStatusFilter]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return filterPlatformRoles(platformRoles, {
      searchQuery: roleSearchQuery,
      categoryFilter: roleCategoryFilter,
      privilegeFilter: rolePrivilegeFilter,
    });
  }, [platformRoles, roleSearchQuery, roleCategoryFilter, rolePrivilegeFilter]);

  // Filtered Permissions
  const filteredPermissions = useMemo(() => {
    return filterPlatformPermissions(platformPermissions, {
      searchQuery: permSearchQuery,
      domainFilter: permDomainFilter,
      actionFilter: permActionFilter,
      privilegeFilter: permPrivilegeFilter,
    });
  }, [platformPermissions, permSearchQuery, permDomainFilter, permActionFilter, permPrivilegeFilter]);

  // IAM Access Audit Events
  const iamAuditEvents = useMemo(() => {
    return auditEvents.filter(
      (e) =>
        e.category === 'platform_access' ||
        e.targetEntity === 'PlatformUser' ||
        e.targetEntity === 'PlatformRole'
    );
  }, [auditEvents]);

  // Available unique permission domains
  const uniqueDomains = useMemo(() => {
    return Array.from(new Set(platformPermissions.map((p) => p.domain))).sort();
  }, [platformPermissions]);

  // Quick Role change handler with safeguard confirmation
  const handleQuickRoleChange = (user: PlatformUser, newRoleKey: PlatformRoleKey) => {
    const val = validateRoleAssignment(user, newRoleKey, platformUsers, platformRoles, 'assign');
    if (!val.valid) {
      alert(val.error);
      return;
    }
    setRoleChangeTarget({ user, role: newRoleKey });
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeTarget) return;
    updatePlatformUserRole(roleChangeTarget.user.id, roleChangeTarget.role);
    setRoleChangeTarget(null);
  };

  // User columns definition
  const userColumns: Column<PlatformUser>[] = [
    {
      key: 'user',
      header: 'Administrator Identity',
      render: (u) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setSelectedUserForDetail(u)}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-primary/40 transition-all">
            {getInitials(u.name)}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-xs block truncate group-hover:text-primary transition-colors">
              {u.name}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono truncate block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Assigned Platform Roles',
      render: (u) => {
        const roleIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0 ? u.assignedRoles : [u.role];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {roleIds.map((rId) => {
              const roleDef = platformRoles.find((r) => r.id === rId);
              return (
                <Badge
                  key={rId}
                  variant={
                    rId === 'super_admin'
                      ? 'purple'
                      : roleDef?.isPrivileged
                      ? 'error'
                      : roleDef?.category === 'system'
                      ? 'info'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {roleDef?.name || rId}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'Department / Unit',
      render: (u) => (
        <span className="text-xs text-muted-foreground truncate block max-w-[180px]">
          {u.department || 'Platform Operations'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (u) => <Badge status={u.status} dot size="sm" />,
    },
    {
      key: 'twoFactor',
      header: '2FA Auth',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            u.twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {u.twoFactorEnabled ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {u.twoFactorEnabled ? 'Enforced' : 'Optional'}
        </span>
      ),
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (u) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(u.lastLoginAt, true)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Access Oversight',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedUserForDetail(u)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-muted hover:bg-muted/80 rounded-lg border border-border text-foreground transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3 h-3 text-muted-foreground" />
            Inspect
          </button>

          <select
            value={u.role}
            onChange={(e) => handleQuickRoleChange(u, e.target.value as PlatformRoleKey)}
            className="text-xs bg-card border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none cursor-pointer"
            title="Reassign Primary Role"
          >
            {platformRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {u.status === 'active' ? (
            <button
              type="button"
              onClick={() => updatePlatformUserStatus(u.id, 'suspended')}
              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
            >
              Suspend
            </button>
          ) : (
            <button
              type="button"
              onClick={() => updatePlatformUserStatus(u.id, 'active')}
              className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-900 transition-colors cursor-pointer"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  // Role columns definition
  const roleColumns: Column<PlatformRole>[] = [
    {
      key: 'name',
      header: 'Role Name & Scope',
      render: (r) => (
        <div
          className="space-y-0.5 cursor-pointer group"
          onClick={() => setSelectedRoleForDetail(r)}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">
              {r.name}
            </span>
            <Badge variant={r.category === 'system' ? 'purple' : 'neutral'} size="sm">
              {r.category === 'system' ? 'System Managed' : 'Custom'}
            </Badge>
            {r.isPrivileged && (
              <Badge variant="error" size="sm">
                <ShieldAlert className="w-2.5 h-2.5 mr-1 inline" />
                Privileged
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">{r.description}</p>
          <span className="font-mono text-[10px] text-muted-foreground block">{r.id}</span>
        </div>
      ),
    },
    {
      key: 'assignments',
      header: 'Assigned Users',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Users2 className="w-3.5 h-3.5 text-muted-foreground" />
          {r.assignmentCount ?? 0} Account(s)
        </span>
      ),
    },
    {
      key: 'permissionsCount',
      header: 'Permissions Granted',
      render: (r) => (
        <span className="text-xs text-muted-foreground font-mono">
          <strong className="text-foreground">{r.permissions.length}</strong> of {platformPermissions.length}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Reconfigured',
      render: (r) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(r.updatedAt || r.createdAt, false)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => setSelectedRoleForDetail(r)}
          className="px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-lg border border-border text-foreground transition-colors cursor-pointer"
        >
          Inspect Role
        </button>
      ),
    },
  ];

  // Permission columns definition
  const permColumns: Column<PlatformPermission>[] = [
    {
      key: 'label',
      header: 'Capability Label & Technical ID',
      render: (p) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-xs">{p.label}</span>
            {p.isPrivileged ? (
              <Badge variant="error" size="sm">Privileged</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Standard</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed max-w-lg">{p.description}</p>
          <span className="font-mono text-[10px] text-muted-foreground block">{p.id}</span>
        </div>
      ),
    },
    {
      key: 'domain',
      header: 'Platform Domain',
      render: (p) => (
        <Badge variant="info" size="sm">
          {p.domain.replace('.', ' / ')}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Permitted Action',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
          {p.action}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Implementation Status',
      render: (p) => (
        <Badge variant={p.status === 'implemented' ? 'success' : 'neutral'} size="sm">
          {p.status === 'implemented' ? 'Implemented' : 'Planned'}
        </Badge>
      ),
    },
  ];

  // Audit Columns definition
  const auditColumns: Column<AuditEvent>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (e) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(e.timestamp, true)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (e) => (
        <div className="space-y-0.5">
          <span className="font-bold text-foreground text-xs block">
            {e.action.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Target: {e.targetEntity} · {e.targetId}
          </span>
        </div>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (e) => (
        <div className="text-xs">
          <span className="font-semibold text-foreground block">{e.actor.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{e.actor.role}</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Audit Details',
      render: (e) => (
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{e.details}</p>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      align: 'right',
      render: (e) => (
        <Badge
          variant={e.severity === 'critical' ? 'error' : e.severity === 'warning' ? 'warning' : 'neutral'}
          size="sm"
        >
          {e.severity}
        </Badge>
      ),
    },
  ];

  const tabs = [
    {
      id: 'users',
      label: 'Platform Administrators',
      icon: <Users2 className="w-4 h-4" />,
      count: platformUsers.length,
    },
    {
      id: 'roles',
      label: 'Role Catalogue',
      icon: <Layers className="w-4 h-4" />,
      count: platformRoles.length,
    },
    {
      id: 'permissions',
      label: 'Permissions Catalogue',
      icon: <KeyRound className="w-4 h-4" />,
      count: platformPermissions.length,
    },
    {
      id: 'matrix',
      label: 'Role-Permission Matrix',
      icon: <Grid className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Access Audit History',
      icon: <History className="w-4 h-4" />,
      count: iamAuditEvents.length,
    },
    {
      id: 'boundary',
      label: 'Platform vs Tenant Boundary',
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Users, Roles, Permissions & Access Governance"
        description="Comprehensive governance control plane for SaaS platform administrators, role catalogues, granular capability assignments, and security boundaries."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateRoleOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-lg border border-border transition-colors shadow-xs cursor-pointer"
            >
              <ShieldPlus className="w-4 h-4 text-primary" />
              Author Custom Role
            </button>
            <button
              type="button"
              onClick={() => setIsCreateUserOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Platform User
            </button>
          </div>
        }
      />

      {/* Security Plane Notice */}
      <PlatformBoundaryNotice />

      {/* Top IAM Governance KPI Cards */}
      <IamSummaryCards metrics={iamMetrics} />

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Platform Administrators Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <SearchFilterBar
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
            searchPlaceholder="Search platform administrators by name, email, or identifier..."
            resultCount={filteredUsers.length}
            filters={[
              {
                key: 'role',
                label: 'Platform Role',
                value: userRoleFilter,
                onChange: setUserRoleFilter,
                options: [
                  { label: 'All Platform Roles', value: 'all' },
                  ...platformRoles.map((r) => ({ label: r.name, value: r.id })),
                ],
              },
              {
                key: 'status',
                label: 'Account Status',
                value: userStatusFilter,
                onChange: setUserStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active Only', value: 'active' },
                  { label: 'Suspended Only', value: 'suspended' },
                  { label: 'Pending Invite', value: 'pending_invite' },
                ],
              },
            ]}
          />

          <DataTable
            columns={userColumns}
            data={filteredUsers}
            keyExtractor={(u) => u.id}
            pageSize={10}
            emptyMessage="No platform administrators match the search criteria."
          />
        </div>
      )}

      {/* TAB 2: Role Catalogue & Management */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <SearchFilterBar
            searchQuery={roleSearchQuery}
            onSearchChange={setRoleSearchQuery}
            searchPlaceholder="Search role catalogue by name or slug..."
            resultCount={filteredRoles.length}
            filters={[
              {
                key: 'category',
                label: 'Role Category',
                value: roleCategoryFilter,
                onChange: (v) => setRoleCategoryFilter(v as 'all' | 'system' | 'custom'),
                options: [
                  { label: 'All Categories', value: 'all' },
                  { label: 'System Managed', value: 'system' },
                  { label: 'Custom Defined', value: 'custom' },
                ],
              },
              {
                key: 'privilege',
                label: 'Privilege Level',
                value: rolePrivilegeFilter,
                onChange: (v) => setRolePrivilegeFilter(v as 'all' | 'privileged' | 'standard'),
                options: [
                  { label: 'All Privilege Levels', value: 'all' },
                  { label: 'Privileged Only', value: 'privileged' },
                  { label: 'Standard Only', value: 'standard' },
                ],
              },
            ]}
          />

          <DataTable
            columns={roleColumns}
            data={filteredRoles}
            keyExtractor={(r) => r.id}
            pageSize={10}
            emptyMessage="No platform roles match the search criteria."
          />
        </div>
      )}

      {/* TAB 3: Permissions Catalogue */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <SearchFilterBar
            searchQuery={permSearchQuery}
            onSearchChange={setPermSearchQuery}
            searchPlaceholder="Search permission definitions by label, slug, or description..."
            resultCount={filteredPermissions.length}
            filters={[
              {
                key: 'domain',
                label: 'Platform Domain',
                value: permDomainFilter,
                onChange: setPermDomainFilter,
                options: [
                  { label: 'All Domains', value: 'all' },
                  ...uniqueDomains.map((d) => ({ label: d.replace('.', ' / '), value: d })),
                ],
              },
              {
                key: 'action',
                label: 'Permitted Action',
                value: permActionFilter,
                onChange: setPermActionFilter,
                options: [
                  { label: 'All Actions', value: 'all' },
                  { label: 'Read Only', value: 'read' },
                  { label: 'Create', value: 'create' },
                  { label: 'Update', value: 'update' },
                  { label: 'Manage / Execute', value: 'manage' },
                  { label: 'Export', value: 'export' },
                ],
              },
              {
                key: 'privilege',
                label: 'Privilege Level',
                value: permPrivilegeFilter,
                onChange: (v) => setPermPrivilegeFilter(v as 'all' | 'privileged' | 'standard'),
                options: [
                  { label: 'All Privilege Levels', value: 'all' },
                  { label: 'Privileged Actions', value: 'privileged' },
                  { label: 'Standard Actions', value: 'standard' },
                ],
              },
            ]}
          />

          <DataTable
            columns={permColumns}
            data={filteredPermissions}
            keyExtractor={(p) => p.id}
            pageSize={12}
            emptyMessage="No permissions match the search criteria."
          />
        </div>
      )}

      {/* TAB 4: Role-Permission Assignment Matrix */}
      {activeTab === 'matrix' && (
        <RolePermissionMatrix roles={platformRoles} permissions={platformPermissions} />
      )}

      {/* TAB 5: Access Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-3 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Chronological log of administrative user creations, role reassignments, permission changes, and status toggles.
            </span>
            <Badge variant="neutral" size="sm">{iamAuditEvents.length} Simulated Events</Badge>
          </div>

          <DataTable
            columns={auditColumns}
            data={iamAuditEvents}
            keyExtractor={(e) => e.id}
            pageSize={10}
            emptyMessage="No administrative access change events recorded in development store."
          />
        </div>
      )}

      {/* TAB 6: Platform vs Tenant Boundary Architecture */}
      {activeTab === 'boundary' && <PlatformVsTenantSeparationCard />}

      {/* MODAL: Administrator Inspection Drawer / Detail */}
      <UserDetailModal
        isOpen={Boolean(selectedUserForDetail)}
        onClose={() => setSelectedUserForDetail(null)}
        user={selectedUserForDetail}
        allRoles={platformRoles}
        allPermissions={platformPermissions}
        allAuditEvents={auditEvents}
        onAssignRole={assignRoleToUser}
        onRemoveRole={removeRoleFromUser}
        onUpdateStatus={updatePlatformUserStatus}
      />

      {/* MODAL: Role Detail & Custom Role Permissions Editor */}
      <RoleDetailModal
        isOpen={Boolean(selectedRoleForDetail)}
        onClose={() => setSelectedRoleForDetail(null)}
        role={selectedRoleForDetail}
        allPermissions={platformPermissions}
        allUsers={platformUsers}
        onUpdateRolePermissions={updatePlatformRolePermissions}
        onDeleteRole={deletePlatformRole}
        onSelectUser={(u) => setSelectedUserForDetail(u)}
      />

      {/* MODAL: Provision Platform User */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        allRoles={platformRoles}
        onCreateUser={createPlatformUser}
      />

      {/* MODAL: Author Custom Role */}
      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        allPermissions={platformPermissions}
        existingRoles={platformRoles}
        onCreateRole={createPlatformRole}
      />

      {/* DIALOG: Quick Role Reassignment Confirmation */}
      {roleChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setRoleChangeTarget(null)}
          onConfirm={handleConfirmRoleChange}
          title={`Reassign Platform Role — ${roleChangeTarget.user.name}`}
          variant={roleChangeTarget.role === 'super_admin' ? 'danger' : 'warning'}
          confirmLabel="Confirm Role Reassignment"
          description={
            <p>
              Are you sure you want to change the security privileges for{' '}
              <strong className="text-foreground">{roleChangeTarget.user.name}</strong> to{' '}
              <strong className="text-foreground capitalize">{roleChangeTarget.role.replace(/_/g, ' ')}</strong>?
            </p>
          }
          disclaimer="Development Notice: Role changes update client mock records only. In production, this immediately updates token claims and invalidates active session caches."
        />
      )}
    </div>
  );
}
