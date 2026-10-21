'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PlatformRole, PlatformPermission } from '@/lib/types/iam';
import { PlatformUser } from '@/lib/types/platform-users';
import { formatDate } from '@/lib/utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Users2,
  Trash2,
  Save,
  Search,
} from 'lucide-react';

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: PlatformRole | null;
  allPermissions: PlatformPermission[];
  allUsers: PlatformUser[];
  onUpdateRolePermissions: (roleId: string, permissions: string[]) => { success: boolean; error?: string };
  onDeleteRole: (roleId: string) => { success: boolean; error?: string };
  onSelectUser: (user: PlatformUser) => void;
}

export function RoleDetailModal({
  isOpen,
  onClose,
  role,
  allPermissions,
  allUsers,
  onUpdateRolePermissions,
  onDeleteRole,
  onSelectUser,
}: RoleDetailModalProps) {
  const [prevRoleId, setPrevRoleId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (role && role.id !== prevRoleId) {
    setPrevRoleId(role.id);
    setSelectedPermissions([...role.permissions]);
    setIsEditing(false);
    setError('');
  }

  if (!role) return null;

  const assignedUsers = allUsers.filter((u) => {
    const roleIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0 ? u.assignedRoles : [u.role];
    return roleIds.includes(role.id);
  });

  const filteredPermissions = allPermissions.filter((p) => {
    if (!permSearch.trim()) return true;
    const q = permSearch.toLowerCase();
    return (
      p.label.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    );
  });

  const permissionsByDomain = filteredPermissions.reduce<Record<string, PlatformPermission[]>>(
    (acc, perm) => {
      acc[perm.domain] = acc[perm.domain] || [];
      acc[perm.domain].push(perm);
      return acc;
    },
    {}
  );

  const handleTogglePerm = (permId: string) => {
    if (role.isSystemManaged) return;
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = () => {
    setError('');
    const res = onUpdateRolePermissions(role.id, selectedPermissions);
    if (res.success) {
      setIsEditing(false);
    } else if (res.error) {
      setError(res.error);
    }
  };

  const handleDelete = () => {
    const res = onDeleteRole(role.id);
    if (res.success) {
      setConfirmDelete(false);
      onClose();
    } else if (res.error) {
      setError(res.error);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Platform Role Definition & Entitlement Inspection"
        description="Inspect role privilege level, assigned administrator accounts, and granular platform permission matrix."
        size="xl"
      >
        <div className="space-y-6">
          {error && <AlertBanner variant="error">{error}</AlertBanner>}

          {/* Header Overview Card */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm">{role.name}</h3>
                <Badge variant={role.category === 'system' ? 'purple' : 'neutral'} size="sm">
                  {role.category === 'system' ? 'System Managed' : 'Custom Role'}
                </Badge>
                {role.isPrivileged ? (
                  <Badge variant="error" size="sm">
                    <ShieldAlert className="w-3 h-3 mr-1 inline" />
                    Privileged Authority
                  </Badge>
                ) : (
                  <Badge variant="info" size="sm">
                    <ShieldCheck className="w-3 h-3 mr-1 inline" />
                    Standard Role
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{role.description}</p>
              <span className="font-mono text-[11px] text-muted-foreground block">
                Identifier: <strong>{role.id}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {!role.isSystemManaged && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-lg border border-border transition-colors cursor-pointer"
                >
                  Edit Permissions
                </button>
              )}
              {!role.isSystemManaged && isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPermissions([...role.permissions]);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              )}
              {!role.isSystemManaged && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                  title="Delete Custom Role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* System Protection Notice */}
          {role.isSystemManaged && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs flex items-start gap-2.5 text-foreground">
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Immutable Core System Role:</strong> Canonical permission mappings for {role.name} are protected by platform safeguards to preserve baseline operations. To define modified privileges, create a Custom Role.
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 border border-border rounded-xl p-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">Assigned Administrators</span>
              <span className="font-semibold text-foreground">{assignedUsers.length} Users</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Permissions Granted</span>
              <span className="font-semibold text-foreground">
                {isEditing ? selectedPermissions.length : role.permissions.length} of {allPermissions.length}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Created</span>
              <span className="text-foreground">{formatDate(role.createdAt, false)}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Last Reconfigured</span>
              <span className="text-foreground font-mono">{formatDate(role.updatedAt || role.createdAt, false)}</span>
            </div>
          </div>

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
              Granted Permissions ({role.permissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              Assigned Administrators ({assignedUsers.length})
            </button>
          </div>

          {/* TAB 1: Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {isEditing ? 'Select or deselect capabilities below to customize this role.' : 'Permissions currently included in this role definition:'}
                </span>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Search permissions..."
                    className="w-full pl-8 pr-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {Object.entries(permissionsByDomain).map(([domain, perms]) => {
                  const domainPermIds = perms.map((p) => p.id);
                  const activeCount = domainPermIds.filter((pId) =>
                    isEditing ? selectedPermissions.includes(pId) : role.permissions.includes(pId)
                  ).length;

                  return (
                    <div key={domain} className="border border-border rounded-xl overflow-hidden text-xs">
                      <div className="bg-muted/50 px-3 py-2 font-bold text-foreground flex items-center justify-between text-[11px] uppercase tracking-wider">
                        <span>{domain.replace('.', ' / ')}</span>
                        <span className="text-[10px] font-mono text-muted-foreground font-normal">
                          {activeCount} of {perms.length} Granted
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {perms.map((p) => {
                          const isAssigned = isEditing
                            ? selectedPermissions.includes(p.id)
                            : role.permissions.includes(p.id);

                          return (
                            <label
                              key={p.id}
                              className={`p-3 flex items-start gap-3 transition-colors ${
                                isEditing ? 'cursor-pointer hover:bg-muted/20' : ''
                              } ${isAssigned ? 'bg-primary/5' : 'opacity-60'}`}
                            >
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => handleTogglePerm(p.id)}
                                  className="mt-1 rounded text-primary focus:ring-primary"
                                />
                              ) : (
                                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isAssigned ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                              )}
                              <div className="space-y-0.5 flex-1 min-w-0">
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
                                <p className="text-muted-foreground text-[11px]">{p.description}</p>
                                <span className="font-mono text-[10px] text-muted-foreground block">{p.id}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Assigned Administrators */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {assignedUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No administrators are currently assigned to this role.
                </div>
              ) : (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                  {assignedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 bg-card hover:bg-muted/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{u.name}</span>
                          <Badge status={u.status} dot size="sm" />
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground block">{u.email}</span>
                        <span className="text-[10px] text-muted-foreground">{u.department}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectUser(u);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold border border-border rounded-lg hover:bg-muted cursor-pointer"
                      >
                        Inspect User
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title={`Delete Custom Role: ${role.name}`}
          variant="danger"
          confirmLabel="Permanently Delete Role"
          description={
            <p>
              Are you sure you want to delete the custom role <strong className="text-foreground">{role.name}</strong>? This action cannot be undone.
            </p>
          }
          disclaimer="Development Notice: Deletes custom role from local store. Ensure no administrators remain assigned to this role."
        />
      )}
    </>
  );
}
