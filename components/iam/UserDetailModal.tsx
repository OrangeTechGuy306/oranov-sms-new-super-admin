'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PlatformUser } from '@/lib/types/platform-users';
import { PlatformRole, PlatformPermission } from '@/lib/types/iam';
import { AuditEvent } from '@/lib/types/audit-logs';
import { evaluateEffectivePermissions, validateRoleAssignment } from '@/lib/iam/evaluator';
import { formatDate, getInitials } from '@/lib/utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  Search,
  History,
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlatformUser | null;
  allRoles: PlatformRole[];
  allPermissions: PlatformPermission[];
  allAuditEvents: AuditEvent[];
  onAssignRole: (userId: string, roleId: string) => { success: boolean; error?: string };
  onRemoveRole: (userId: string, roleId: string) => { success: boolean; error?: string };
  onUpdateStatus: (userId: string, status: 'active' | 'suspended') => { success: boolean; error?: string };
}

export function UserDetailModal({
  isOpen,
  onClose,
  user,
  allRoles,
  allPermissions,
  allAuditEvents,
  onAssignRole,
  onRemoveRole,
  onUpdateStatus,
}: UserDetailModalProps) {
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState<string>('');
  const [permSearch, setPermSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles' | 'audit'>('permissions');
  const [confirmRemovalRole, setConfirmRemovalRole] = useState<PlatformRole | null>(null);
  const [confirmAssignRole, setConfirmAssignRole] = useState<PlatformRole | null>(null);
  const [actionError, setActionError] = useState<string>('');

  const effectiveSummary = useMemo(() => {
    if (!user) return null;
    return evaluateEffectivePermissions(user, allRoles, allPermissions);
  }, [user, allRoles, allPermissions]);

  const userAudits = useMemo(() => {
    if (!user) return [];
    return allAuditEvents
      .filter((e) => e.targetId === user.id || e.actor.id === user.id)
      .slice(0, 10);
  }, [user, allAuditEvents]);

  if (!user || !effectiveSummary) return null;

  const currentRoleIds = effectiveSummary.assignedRoleIds;
  const availableRolesToAssign = allRoles.filter((r) => !currentRoleIds.includes(r.id));

  const filteredEffectivePermissions = effectiveSummary.effectivePermissions.filter((p) => {
    if (!permSearch.trim()) return true;
    const q = permSearch.toLowerCase();
    return (
      p.label.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    );
  });

  // Group permissions by domain
  const permissionsByDomain = filteredEffectivePermissions.reduce<Record<string, PlatformPermission[]>>(
    (acc, perm) => {
      acc[perm.domain] = acc[perm.domain] || [];
      acc[perm.domain].push(perm);
      return acc;
    },
    {}
  );

  const handleAssignRoleClick = () => {
    setActionError('');
    if (!selectedRoleToAssign) return;
    const role = allRoles.find((r) => r.id === selectedRoleToAssign);
    if (!role) return;

    const val = validateRoleAssignment(user, role.id, [user], allRoles, 'assign');
    if (!val.valid) {
      setActionError(val.error || 'Invalid role assignment.');
      return;
    }

    if (val.requiresConfirmation) {
      setConfirmAssignRole(role);
    } else {
      const res = onAssignRole(user.id, role.id);
      if (res.success) {
        setSelectedRoleToAssign('');
      } else if (res.error) {
        setActionError(res.error);
      }
    }
  };

  const handleConfirmAssignRole = () => {
    if (!confirmAssignRole) return;
    const res = onAssignRole(user.id, confirmAssignRole.id);
    if (res.success) {
      setSelectedRoleToAssign('');
      setConfirmAssignRole(null);
    } else if (res.error) {
      setActionError(res.error);
      setConfirmAssignRole(null);
    }
  };

  const handleRemoveRoleClick = (role: PlatformRole) => {
    setActionError('');
    const val = validateRoleAssignment(user, role.id, [user], allRoles, 'remove');
    if (!val.valid) {
      setActionError(val.error || 'Cannot revoke role.');
      return;
    }

    if (val.requiresConfirmation) {
      setConfirmRemovalRole(role);
    } else {
      const res = onRemoveRole(user.id, role.id);
      if (!res.success && res.error) {
        setActionError(res.error);
      }
    }
  };

  const handleConfirmRemoveRole = () => {
    if (!confirmRemovalRole) return;
    const res = onRemoveRole(user.id, confirmRemovalRole.id);
    if (!res.success && res.error) {
      setActionError(res.error);
    }
    setConfirmRemovalRole(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Platform Administrator Profile & Access Oversight"
        description="Review synthetic administrative identity, assigned platform roles, derived capabilities, and access change audit events."
        size="xl"
      >
        <div className="space-y-6">
          {actionError && (
            <AlertBanner variant="error" title="Access Operation Blocked">
              {actionError}
            </AlertBanner>
          )}

          {/* User Profile Card Header */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-sm truncate">{user.name}</h3>
                  <Badge status={user.status} dot size="sm" />
                  {effectiveSummary.isSuperAdmin && (
                    <Badge variant="purple" size="sm">
                      <ShieldAlert className="w-3 h-3 mr-1 inline" />
                      Root Owner
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">{user.email}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{user.department || 'Platform Operations'}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {user.status === 'active' ? (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(user.id, 'suspended')}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                >
                  Suspend Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(user.id, 'active')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900 transition-colors cursor-pointer"
                >
                  Activate Account
                </button>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 border border-border rounded-xl p-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">User ID</span>
              <span className="font-mono text-foreground font-semibold">{user.id}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">2FA Enforced</span>
              <span className={`font-semibold inline-flex items-center gap-1 ${user.twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                {user.twoFactorEnabled ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {user.twoFactorEnabled ? 'Enabled (MFA)' : 'Not Configured'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Provisioned Date</span>
              <span className="text-foreground">{formatDate(user.createdAt, false)}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Last Activity</span>
              <span className="text-foreground font-mono">{formatDate(user.lastLoginAt, true)}</span>
            </div>
          </div>

          {user.notes && (
            <div className="bg-muted/40 border border-border/80 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">Administrative Record Note:</strong> {user.notes}
            </div>
          )}

          {/* Tab Selector */}
          <div className="border-b border-border flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'permissions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Effective Capabilities ({effectiveSummary.totalPermissionCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roles'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Assigned Roles ({effectiveSummary.assignedRoles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Access Change Audit ({userAudits.length})
            </button>
          </div>

          {/* TAB 1: Effective Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Derived across <strong>{effectiveSummary.assignedRoles.length}</strong> assigned role(s).
                  </span>
                  {effectiveSummary.privilegedPermissions.length > 0 && (
                    <Badge variant="warning" size="sm">
                      {effectiveSummary.privilegedPermissions.length} Privileged Actions
                    </Badge>
                  )}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Filter permissions..."
                    className="w-full pl-8 pr-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {filteredEffectivePermissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No matching permissions found.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {Object.entries(permissionsByDomain).map(([domain, perms]) => (
                    <div key={domain} className="border border-border rounded-xl overflow-hidden text-xs">
                      <div className="bg-muted/50 px-3 py-2 font-bold text-foreground flex items-center justify-between uppercase tracking-wider text-[11px]">
                        <span>{domain.replace('.', ' / ')}</span>
                        <span className="text-[10px] font-mono text-muted-foreground font-normal">
                          {perms.length} Action(s)
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {perms.map((p) => {
                          const grantingRoles = effectiveSummary.inheritedFrom[p.id] || [];
                          return (
                            <div key={p.id} className="p-3 hover:bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground text-xs">{p.label}</span>
                                  {p.isPrivileged && (
                                    <Badge variant="error" size="sm">
                                      Privileged
                                    </Badge>
                                  )}
                                  <Badge variant="neutral" size="sm">
                                    {p.action}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed">{p.description}</p>
                                <span className="font-mono text-[10px] text-muted-foreground block">{p.id}</span>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-[10px] text-muted-foreground block">Granted by:</span>
                                <div className="flex flex-wrap sm:justify-end gap-1 mt-0.5">
                                  {grantingRoles.map((rId) => {
                                    const rDef = allRoles.find((r) => r.id === rId);
                                    return (
                                      <span
                                        key={rId}
                                        className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold"
                                      >
                                        {rDef?.name || rId}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Assigned Roles */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground block">Currently Assigned Roles</span>
                <div className="space-y-2">
                  {effectiveSummary.assignedRoles.map((role) => (
                    <div
                      key={role.id}
                      className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{role.name}</span>
                          <Badge variant={role.category === 'system' ? 'purple' : 'neutral'} size="sm">
                            {role.category === 'system' ? 'System Managed' : 'Custom Role'}
                          </Badge>
                          {role.isPrivileged && (
                            <Badge variant="error" size="sm">
                              Privileged
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px]">{role.description}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {role.permissions.length} Permissions granted
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRoleClick(role)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Additional Role */}
              {availableRolesToAssign.length > 0 && (
                <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-2 text-xs">
                  <span className="font-semibold text-foreground block">Assign Additional Role</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRoleToAssign}
                      onChange={(e) => setSelectedRoleToAssign(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none"
                    >
                      <option value="">Select a platform role to grant...</option>
                      {availableRolesToAssign.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.category === 'system' ? 'System' : 'Custom'} · {r.permissions.length} perms)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAssignRoleClick}
                      disabled={!selectedRoleToAssign}
                      className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Grant Role
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Access Audit Log */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground block">
                Showing simulated local demonstration audit events involving <strong>{user.name}</strong>.
              </span>
              {userAudits.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No access audit events recorded yet for this administrator.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {userAudits.map((event) => (
                    <div
                      key={event.id}
                      className="bg-card border border-border rounded-lg p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">{event.action.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground font-mono">{formatDate(event.timestamp, true)}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{event.details}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span>Actor: {event.actor.name} ({event.actor.role})</span>
                        <span>·</span>
                        <span className="capitalize text-emerald-600 font-semibold">{event.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground flex items-start gap-2 border border-border/80">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              <strong>Development Simulation Notice:</strong> Role additions, revocations, and status toggles update local demonstration state and mock audit streams. In production, permission enforcement requires cryptographically signed tokens and server-side authorization boundaries.
            </p>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog for Privileged Role Revocation */}
      {confirmRemovalRole && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmRemovalRole(null)}
          onConfirm={handleConfirmRemoveRole}
          title={`Revoke Privileged Role: ${confirmRemovalRole.name}`}
          variant="danger"
          confirmLabel="Confirm Role Revocation"
          description={
            <p>
              Are you sure you want to revoke the privileged role{' '}
              <strong className="text-foreground">{confirmRemovalRole.name}</strong> from{' '}
              <strong className="text-foreground">{user.name}</strong>? This user will lose all associated privileged capabilities.
            </p>
          }
          disclaimer="Development Notice: Access updates client mock records only. In production, this immediately updates token claims and invalidates active session caches."
        />
      )}

      {/* Confirmation Dialog for Privileged Role Assignment */}
      {confirmAssignRole && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmAssignRole(null)}
          onConfirm={handleConfirmAssignRole}
          title={`Grant Privileged Role: ${confirmAssignRole.name}`}
          variant="warning"
          confirmLabel="Confirm Privilege Elevation"
          description={
            <p>
              Are you sure you want to elevate privileges for{' '}
              <strong className="text-foreground">{user.name}</strong> by granting{' '}
              <strong className="text-foreground">{confirmAssignRole.name}</strong>? This role grants sensitive platform control entitlements.
            </p>
          }
          disclaimer="Development Notice: Access updates client mock records only. In production, this immediately updates token claims and invalidates active session caches."
        />
      )}
    </>
  );
}
