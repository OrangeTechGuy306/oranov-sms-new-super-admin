'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { PlatformUser, PlatformRoleKey } from '@/lib/types';
import { formatDate, getInitials } from '@/lib/utils/formatters';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const ROLES: { key: PlatformRoleKey; label: string; description: string }[] = [
  {
    key: 'super_admin',
    label: 'Super-Admin',
    description: 'Root access to all platform organizations, subscription overrides, and global security policies.',
  },
  {
    key: 'platform_operator',
    label: 'Platform Operator',
    description: 'Manages school lifecycle transitions, infrastructure health, and technical DNS routing.',
  },
  {
    key: 'support_lead',
    label: 'Support Lead',
    description: 'Customer onboarding assistance, tier-2 troubleshooting, and billing dispute resolution.',
  },
  {
    key: 'compliance_auditor',
    label: 'Compliance Auditor',
    description: 'Read-only access to immutable audit trails, access review logs, and data retention policies.',
  },
];

export default function PlatformUsersPage() {
  const {
    platformUsers,
    createPlatformUser,
    updatePlatformUserRole,
    updatePlatformUserStatus,
  } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: PlatformUser; role: PlatformRoleKey } | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<PlatformRoleKey>('support_lead');
  const [newDepartment, setNewDepartment] = useState('Platform Operations');
  const [createError, setCreateError] = useState('');

  const filteredUsers = platformUsers.filter((user) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!user.name.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const res = createPlatformUser({
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRole('support_lead');
    } else if (res.error) {
      setCreateError(res.error);
    }
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeTarget) return;
    updatePlatformUserRole(roleChangeTarget.user.id, roleChangeTarget.role);
    setRoleChangeTarget(null);
  };

  const columns: Column<PlatformUser>[] = [
    {
      key: 'user',
      header: 'Platform User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {getInitials(u.name)}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-xs block truncate">{u.name}</span>
            <span className="text-[11px] text-muted-foreground font-mono truncate block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Platform Role',
      render: (u) => {
        const roleDef = ROLES.find((r) => r.key === u.role);
        return (
          <div className="space-y-0.5">
            <Badge
              variant={
                u.role === 'super_admin'
                  ? 'purple'
                  : u.role === 'platform_operator'
                  ? 'info'
                  : u.role === 'compliance_auditor'
                  ? 'warning'
                  : 'neutral'
              }
              size="sm"
            >
              {roleDef?.label || u.role}
            </Badge>
            <span className="block text-[10px] text-muted-foreground truncate max-w-xs">
              {u.department}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
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
      header: 'Role Assignment',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={u.role}
            onChange={(e) =>
              setRoleChangeTarget({
                user: u,
                role: e.target.value as PlatformRoleKey,
              })
            }
            className="text-xs bg-card border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>

          {u.status === 'active' ? (
            <button
              type="button"
              onClick={() => updatePlatformUserStatus(u.id, 'suspended')}
              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900 transition-colors"
            >
              Suspend
            </button>
          ) : (
            <button
              type="button"
              onClick={() => updatePlatformUserStatus(u.id, 'active')}
              className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-900 transition-colors"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform User & Role Administration"
        description="Administer super-admin and operational accounts responsible for SaaS infrastructure and tenant management."
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add Platform User
          </button>
        }
      />

      <AlertBanner variant="notice" title="Platform vs Tenant Security Boundary">
        <strong>Strict Architectural Isolation:</strong> Users listed here are platform administrators, operations engineers, and auditors with system-wide SaaS entitlements. They are strictly isolated from individual school tenant roles (Principals, Teachers, Students, and Parents). Production authentication and cryptographic session revocation will be implemented during backend security integration.
      </AlertBanner>

      {/* Role Definitions Matrix Snippet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((role) => (
          <div key={role.key} className="bg-card text-card-foreground p-4 rounded-xl border border-border text-xs space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{role.label}</span>
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.2 rounded text-muted-foreground">
                {platformUsers.filter((u) => u.role === role.key).length} Users
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search platform administrators by name or email..."
        resultCount={filteredUsers.length}
        filters={[
          {
            key: 'role',
            label: 'Platform Role',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { label: 'All Platform Roles', value: 'all' },
              ...ROLES.map((r) => ({ label: r.label, value: r.key })),
            ],
          },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        pageSize={8}
        emptyMessage="No platform users found."
      />

      {/* Create Platform User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Platform Administrator"
        description="Add a new administrator to the platform operations roster. (Development record only)"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {createError && (
            <AlertBanner variant="error">{createError}</AlertBanner>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Full Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Jordan Sterling"
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Corporate Email</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="jordan.s@saas-platform.internal"
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Platform Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as PlatformRoleKey)}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label} — {r.description.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Department / Operations Unit</label>
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="SaaS Cloud Operations"
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="p-3 bg-muted/50 rounded-lg text-[11px] text-muted-foreground flex gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              In production, account provisioning triggers a secure hardware token / webauthn enrollment link sent to the corporate email.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90"
            >
              Create Administrator
            </button>
          </div>
        </form>
      </Modal>

      {/* Role Reassignment Confirmation Dialog */}
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
              <strong className="text-foreground capitalize">{roleChangeTarget.role.replace('_', ' ')}</strong>?
            </p>
          }
          disclaimer="Development Notice: Role changes update client mock records only. In production, this immediately updates token claims and invalidates active session caches."
        />
      )}
    </div>
  );
}
