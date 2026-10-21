'use client';

import React, { useState } from 'react';
import { PlatformRole, PlatformPermission } from '@/lib/types/iam';
import { Badge } from '@/components/ui/Badge';
import { Search, Check, ShieldAlert } from 'lucide-react';

interface RolePermissionMatrixProps {
  roles: PlatformRole[];
  permissions: PlatformPermission[];
}

export function RolePermissionMatrix({ roles, permissions }: RolePermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');

  const uniqueDomains = Array.from(new Set(permissions.map((p) => p.domain))).sort();

  const filteredPermissions = permissions.filter((p) => {
    if (domainFilter !== 'all' && p.domain !== domainFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.label.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  const permissionsByDomain = filteredPermissions.reduce<Record<string, PlatformPermission[]>>(
    (acc, perm) => {
      acc[perm.domain] = acc[perm.domain] || [];
      acc[perm.domain].push(perm);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {/* Search & Domain Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-foreground">Filter Matrix:</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-none"
          >
            <option value="all">All SaaS Domains ({uniqueDomains.length})</option>
            {uniqueDomains.map((d) => (
              <option key={d} value={d}>
                {d.replace('.', ' / ')}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permission or slug..."
            className="w-full pl-8 pr-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      {/* Cross-Reference Matrix Table */}
      <div className="border border-border rounded-xl overflow-x-auto bg-card shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-muted-foreground">
              <th className="py-3 px-4 font-semibold min-w-[260px] sticky left-0 bg-muted/90 backdrop-blur-xs z-10 border-r border-border">
                Platform Domain & Capability
              </th>
              {roles.map((role) => (
                <th key={role.id} className="py-3 px-3 font-semibold text-center min-w-[120px] whitespace-nowrap">
                  <div className="space-y-0.5">
                    <span className="block font-bold text-foreground text-xs">{role.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      {role.category === 'system' ? 'System' : 'Custom'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(permissionsByDomain).map(([domain, perms]) => (
              <React.Fragment key={domain}>
                {/* Domain Category Header Row */}
                <tr className="bg-muted/30 font-bold text-foreground text-[11px] uppercase tracking-wider">
                  <td
                    colSpan={roles.length + 1}
                    className="py-2 px-4 border-t border-b border-border bg-muted/40 text-primary"
                  >
                    Domain: {domain.replace('.', ' / ')} ({perms.length} actions)
                  </td>
                </tr>

                {perms.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    {/* Permission Details (Left Sticky Column) */}
                    <td className="py-2.5 px-4 sticky left-0 bg-card/95 backdrop-blur-xs z-10 border-r border-border">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-xs">{p.label}</span>
                        {p.isPrivileged && (
                          <Badge variant="error" size="sm">
                            <ShieldAlert className="w-2.5 h-2.5 mr-1 inline" />
                            Privileged
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground block">{p.id}</span>
                    </td>

                    {/* Role Checkmarks */}
                    {roles.map((role) => {
                      const hasPerm = role.permissions.includes(p.id);
                      return (
                        <td key={role.id} className="py-2 px-3 text-center align-middle">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="text-muted-foreground/30 font-mono text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
