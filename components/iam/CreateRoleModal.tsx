'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { PlatformPermission, PlatformRole, CreateCustomRoleInput } from '@/lib/types/iam';
import { ShieldAlert, CheckSquare, Square, Search } from 'lucide-react';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPermissions: PlatformPermission[];
  existingRoles: PlatformRole[];
  onCreateRole: (input: CreateCustomRoleInput) => { success: boolean; role?: PlatformRole; error?: string };
}

export function CreateRoleModal({
  isOpen,
  onClose,
  allPermissions,
  existingRoles,
  onCreateRole,
}: CreateRoleModalProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');
  const [error, setError] = useState('');

  // Group permissions by domain
  const permissionsByDomain = allPermissions.reduce<Record<string, PlatformPermission[]>>(
    (acc, perm) => {
      acc[perm.domain] = acc[perm.domain] || [];
      acc[perm.domain].push(perm);
      return acc;
    },
    {}
  );

  const handleTogglePerm = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSelectDomainAll = (domainPerms: PlatformPermission[]) => {
    const ids = domainPerms.map((p) => p.id);
    const allSelected = ids.every((pId) => selectedPermissions.includes(pId));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (existingRoles.some((r) => r.id.toLowerCase() === id.trim().toLowerCase())) {
      setError(`A platform role with identifier "${id.trim()}" already exists.`);
      return;
    }

    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission to grant to this custom role.');
      return;
    }

    const res = onCreateRole({
      id: id.trim().toLowerCase(),
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
    });

    if (res.success) {
      setId('');
      setName('');
      setDescription('');
      setSelectedPermissions([]);
      onClose();
    } else if (res.error) {
      setError(res.error);
    }
  };

  const hasPrivileged = selectedPermissions.some((pId) => {
    const p = allPermissions.find((perm) => perm.id === pId);
    return p?.isPrivileged ?? false;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Author Custom Platform Role"
      description="Define a new administrative role with tailored platform capabilities and granular permissions."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && <AlertBanner variant="error">{error}</AlertBanner>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Role Identifier (Technical Slug)
            </label>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. custom_finance_reviewer"
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-foreground"
            />
            <span className="text-[10px] text-muted-foreground block">
              Unique lowercase slug using letters, numbers, and underscores.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Human-Readable Role Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Regional Finance Reviewer"
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">Operational Description</label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the governance duties and administrative scope of this role..."
            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        {hasPrivileged && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <strong>Privileged Capabilities Selected:</strong> This role includes sensitive platform control actions and will be classified as a high-risk privileged role.
            </span>
          </div>
        )}

        {/* Permissions Selection Matrix */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                Select Platform Capabilities ({selectedPermissions.length} selected)
              </span>
            </div>
            <div className="relative w-full sm:w-60">
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

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {Object.entries(permissionsByDomain).map(([domain, perms]) => {
              const visiblePerms = perms.filter((p) => {
                if (!permSearch.trim()) return true;
                const q = permSearch.toLowerCase();
                return p.label.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
              });

              if (visiblePerms.length === 0) return null;

              const allDomainSelected = perms.every((p) => selectedPermissions.includes(p.id));

              return (
                <div key={domain} className="border border-border rounded-xl overflow-hidden text-xs">
                  <div className="bg-muted/50 px-3 py-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground uppercase tracking-wider">
                      {domain.replace('.', ' / ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectDomainAll(perms)}
                      className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {allDomainSelected ? <Square className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                      {allDomainSelected ? 'Deselect Domain' : 'Select All'}
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {visiblePerms.map((p) => {
                      const isSelected = selectedPermissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`p-2.5 flex items-start gap-3 hover:bg-muted/20 cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePerm(p.id)}
                            className="mt-1 rounded text-primary focus:ring-primary cursor-pointer"
                          />
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
                            <p className="text-muted-foreground text-[11px] leading-relaxed">{p.description}</p>
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

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            Create Custom Role
          </button>
        </div>
      </form>
    </Modal>
  );
}
