'use client';

import React, { useState } from 'react';
import {
  Building2,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { TenantGovernanceSummary } from '@/lib/types/data-governance';
import { TenantGovernanceDrawer } from './TenantGovernanceDrawer';

interface TenantGovernanceTabProps {
  tenants: TenantGovernanceSummary[];
  onNavigateTab: (tab: string) => void;
}

export function TenantGovernanceTab({ tenants, onNavigateTab }: TenantGovernanceTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompleteness, setSelectedCompleteness] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<TenantGovernanceSummary | null>(null);

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = t.tenantName.toLowerCase().includes(q);
      const matchId = t.tenantId.toLowerCase().includes(q);
      const matchCode = t.tenantCode.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCode) return false;
    }

    if (
      selectedCompleteness !== 'all' &&
      t.governanceCompleteness !== selectedCompleteness
    ) {
      return false;
    }

    return true;
  });

  const getCompletenessBadge = (badge: string) => {
    switch (badge) {
      case 'complete':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Complete
          </span>
        );
      case 'review_required':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Review Required
          </span>
        );
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            Incomplete
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {badge}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Multi-Tenant Organization Governance Overview
          </h2>
          <p className="text-xs text-muted-foreground">
            Aggregate compliance posture, policy coverage, and active legal holds across school organizations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
            <Shield className="h-3 w-3 text-indigo-500" />
            Tenant Isolation Guaranteed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organization name, code, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedCompleteness}
            onChange={(e) => setSelectedCompleteness(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Governance Statuses</option>
            <option value="complete">Metadata Complete</option>
            <option value="review_required">Review Required (Policies Expiring)</option>
            <option value="incomplete">Configuration Incomplete</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Organization & Code</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Classification Coverage</th>
                <th className="py-2.5 px-3">Retention Policies Assigned</th>
                <th className="py-2.5 px-3">Open DSARs</th>
                <th className="py-2.5 px-3">Pending Exceptions</th>
                <th className="py-2.5 px-3">Governance Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No organizations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr
                    key={t.tenantId}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTenant(t)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground text-xs">
                        {t.tenantName}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {t.tenantCode}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase border border-border">
                        {t.tier}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground w-7">
                          {t.classificationCoveragePercent}%
                        </span>
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${t.classificationCoveragePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-foreground">
                        {t.retentionPoliciesAssignedCount} Policies
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          t.openPrivacyRequestsCount > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-muted-foreground'
                        }`}
                      >
                        {t.openPrivacyRequestsCount}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          t.unresolvedExceptionsCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                        }`}
                      >
                        {t.unresolvedExceptionsCount}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {getCompletenessBadge(t.governanceCompleteness)}
                    </td>

                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedTenant(t)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="View tenant governance drawer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-muted/30 p-2.5 px-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Showing {filteredTenants.length} of {tenants.length} tenant organizations</span>
          <span>Aggregate metrics only • Student privacy protected</span>
        </div>
      </div>

      {/* Tenant Drawer */}
      {selectedTenant && (
        <TenantGovernanceDrawer
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
}
