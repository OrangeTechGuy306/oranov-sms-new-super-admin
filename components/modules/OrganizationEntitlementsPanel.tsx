'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { CATEGORY_METADATA } from '@/lib/modules/registry-data';
import {
  TenantModuleDefinition,
  OrganizationOverrideAction,
  EffectiveEntitlementStatus,
} from '@/lib/modules/types';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  Building2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface OrganizationEntitlementsPanelProps {
  organizationId: string;
  onInspectModule?: (module: TenantModuleDefinition) => void;
}

export function OrganizationEntitlementsPanel({
  organizationId,
  onInspectModule,
}: OrganizationEntitlementsPanelProps) {
  const {
    getOrganizationById,
    plans,
    modules,
    getOrganizationModuleOverrides,
    setOrganizationModuleOverride,
    resetOrganizationModuleOverride,
    evaluateEntitlement,
  } = usePlatformStore();

  const org = getOrganizationById(organizationId);
  const orgPlan = plans.find((p) => p.id === org?.planId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EffectiveEntitlementStatus>('all');
  const [overrideFilter, setOverrideFilter] = useState<'all' | 'overridden' | 'inherited'>('all');

  // Override Edit Modal State
  const [overrideModalModule, setOverrideModalModule] = useState<TenantModuleDefinition | null>(null);
  const [modalAction, setModalAction] = useState<OrganizationOverrideAction>('force_enable');
  const [modalReason, setModalReason] = useState('');
  const [modalError, setModalError] = useState('');

  const orgOverrides = getOrganizationModuleOverrides(organizationId);

  // Evaluate all modules for this organization
  const evaluatedModules = useMemo(() => {
    return modules.map((mod) => {
      const evalResult = evaluateEntitlement(mod.id, organizationId, org?.planId);
      const activeOverride = orgOverrides.find((o) => o.moduleId === mod.id);
      return {
        module: mod,
        evaluation: evalResult,
        override: activeOverride,
      };
    });
  }, [modules, organizationId, org?.planId, orgOverrides, evaluateEntitlement]);

  const filteredEvaluations = useMemo(() => {
    return evaluatedModules.filter(({ module: mod, evaluation: evalRes, override }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !mod.name.toLowerCase().includes(q) &&
          !mod.code.toLowerCase().includes(q) &&
          !mod.href.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && mod.category !== selectedCategory) {
        return false;
      }

      if (statusFilter !== 'all' && evalRes.effectiveStatus !== statusFilter) {
        return false;
      }

      if (overrideFilter === 'overridden' && (!override || override.action === 'inherit')) {
        return false;
      }

      if (overrideFilter === 'inherited' && override && override.action !== 'inherit') {
        return false;
      }

      return true;
    });
  }, [evaluatedModules, searchQuery, selectedCategory, statusFilter, overrideFilter]);

  const openOverrideModal = (mod: TenantModuleDefinition, currentAction: OrganizationOverrideAction) => {
    setOverrideModalModule(mod);
    setModalAction(currentAction === 'inherit' ? 'force_enable' : currentAction);
    const existing = orgOverrides.find((o) => o.moduleId === mod.id);
    setModalReason(existing?.reason || '');
    setModalError('');
  };

  const handleSaveOverride = () => {
    if (!overrideModalModule) return;
    if (!modalReason.trim() || modalReason.trim().length < 5) {
      setModalError('Please specify a justification reason with at least 5 characters.');
      return;
    }

    const res = setOrganizationModuleOverride({
      organizationId,
      moduleId: overrideModalModule.id,
      action: modalAction,
      reason: modalReason.trim(),
    });

    if (res.success) {
      setOverrideModalModule(null);
    } else if (res.error) {
      setModalError(res.error);
    }
  };

  const handleResetOverride = (modId: string) => {
    resetOrganizationModuleOverride(organizationId, modId);
  };

  const categoryOptions = useMemo(() => {
    const set = new Set(modules.map((m) => m.category));
    return Array.from(set).map((c) => ({
      key: c,
      label: CATEGORY_METADATA[c]?.label || c.replace(/_/g, ' '),
    }));
  }, [modules]);

  return (
    <div className="space-y-6 text-xs">
      {/* School Context Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <span>{org?.name || organizationId}</span>
              <Badge variant="neutral" className="text-[10px]">
                {orgPlan?.name || 'Unknown Plan'}
              </Badge>
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Evaluating effective access based on subscription plan default, platform availability, and school overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="neutral" className="text-xs">
            {orgOverrides.length} Active Custom Override{orgOverrides.length === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      <AlertBanner variant="warning" title="Development Demonstration Boundary">
        <strong>Frontend Simulation Notice:</strong> Module overrides recorded here mutate client-side development fixtures and state. Real tenant access control will be cryptographically enforced by the future backend authorization layer on every API request.
      </AlertBanner>

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search modules by name, code, or route..."
            resultCount={filteredEvaluations.length}
            onReset={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setStatusFilter('all');
              setOverrideFilter('all');
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-medium focus:outline-none"
              aria-label="Filter entitlements by category"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'unavailable' | 'restricted' | 'unresolved')}
              className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-medium focus:outline-none"
              aria-label="Filter entitlements by effective status"
            >
              <option value="all">All Effective States</option>
              <option value="available">Available (Access Granted)</option>
              <option value="unavailable">Unavailable (Excluded/Disabled)</option>
              <option value="restricted">Restricted (Dependency Issue)</option>
              <option value="unresolved">Unresolved</option>
            </select>

            <select
              value={overrideFilter}
              onChange={(e) => setOverrideFilter(e.target.value as 'all' | 'overridden' | 'inherited')}
              className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-medium focus:outline-none"
              aria-label="Filter entitlements by override state"
            >
              <option value="all">All Override States</option>
              <option value="overridden">Custom Overrides Only</option>
              <option value="inherited">Plan Defaults (Inherited)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entitlements Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3.5 font-semibold text-foreground min-w-[220px]">Module & Code</th>
                <th className="p-3.5 font-semibold text-foreground min-w-[130px]">Category</th>
                <th className="p-3.5 font-semibold text-foreground min-w-[110px]">Plan Default</th>
                <th className="p-3.5 font-semibold text-foreground min-w-[120px]">Platform State</th>
                <th className="p-3.5 font-semibold text-foreground min-w-[130px]">School Override</th>
                <th className="p-3.5 font-semibold text-foreground min-w-[140px]">Effective Result</th>
                <th className="p-3.5 font-semibold text-foreground text-right min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    No modules match the current entitlement filters for this organization.
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map(({ module: mod, evaluation: evalRes, override }) => {
                  const catLabel = CATEGORY_METADATA[mod.category]?.label || mod.category;
                  const isOverridden = override && override.action !== 'inherit';

                  return (
                    <tr
                      key={mod.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isOverridden ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      {/* Name & Route */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {mod.parentId ? (
                            <span className="text-muted-foreground/60 text-xs ml-3 font-mono">└─</span>
                          ) : null}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground">{mod.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {mod.code}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono block truncate max-w-xs">
                              {mod.href}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <Badge variant="neutral" className="text-[10px]">
                          {catLabel}
                        </Badge>
                      </td>

                      {/* Plan Default */}
                      <td className="p-3.5">
                        {evalRes.planInclusion === 'included' ? (
                          <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Included</span>
                          </div>
                        ) : evalRes.planInclusion === 'add_on' ? (
                          <Badge variant="warning" className="text-[10px]">
                            Add-on License
                          </Badge>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-muted-foreground/70 text-xs">
                            <X className="w-3.5 h-3.5" />
                            <span>Excluded</span>
                          </div>
                        )}
                      </td>

                      {/* Platform Availability */}
                      <td className="p-3.5">
                        <Badge
                          variant={mod.isGloballyEnabled ? 'success' : 'error'}
                          className="text-[10px]"
                        >
                          {mod.isGloballyEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>

                      {/* School Override */}
                      <td className="p-3.5">
                        {isOverridden ? (
                          <div className="space-y-0.5">
                            <Badge
                              variant={override?.action === 'force_enable' ? 'success' : 'error'}
                              className="text-[10px]"
                            >
                              {override?.action === 'force_enable' ? 'Force Enable' : 'Force Disable'}
                            </Badge>
                            {override?.reason && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[160px]" title={override.reason}>
                                {override.reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            Plan Default
                          </span>
                        )}
                      </td>

                      {/* Effective Result */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <Badge
                            variant={
                              evalRes.effectiveStatus === 'available'
                                ? 'success'
                                : evalRes.effectiveStatus === 'restricted'
                                ? 'warning'
                                : 'error'
                            }
                            className="text-[10px] font-semibold"
                          >
                            {evalRes.effectiveStatus === 'available'
                              ? 'Available'
                              : evalRes.effectiveStatus === 'restricted'
                              ? 'Restricted'
                              : 'Unavailable'}
                          </Badge>
                          <p
                            className="text-[10px] text-muted-foreground truncate max-w-[180px]"
                            title={evalRes.reason}
                          >
                            {evalRes.reason}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOverridden ? (
                            <button
                              type="button"
                              onClick={() => handleResetOverride(mod.id)}
                              className="px-2 py-1 rounded text-[11px] font-medium border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                              title="Revert to inherited plan default"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openOverrideModal(
                                  mod,
                                  evalRes.effectiveStatus === 'available'
                                    ? 'force_disable'
                                    : 'force_enable'
                                )
                              }
                              className="px-2 py-1 rounded text-[11px] font-medium border border-primary/30 text-primary hover:bg-primary/10 cursor-pointer flex items-center gap-1"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Override</span>
                            </button>
                          )}

                          {onInspectModule && (
                            <button
                              type="button"
                              onClick={() => onInspectModule(mod)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                              title="Inspect module capabilities"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Edit Modal */}
      {overrideModalModule && (
        <Modal
          isOpen={true}
          onClose={() => setOverrideModalModule(null)}
          title={`Override Entitlement: ${overrideModalModule.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Configure an administrative override for <strong>{org?.name}</strong>. This custom override
              alters the effective access derived from the <strong>{orgPlan?.name}</strong> plan.
            </p>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs">
                {modalError}
              </div>
            )}

            <div className="space-y-2">
              <label className="font-semibold text-foreground block">Override Action:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalAction('force_enable')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    modalAction === 'force_enable'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-semibold'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Force Enable</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Grant school access even if not included in subscription plan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setModalAction('force_disable')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    modalAction === 'force_disable'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-100 font-semibold'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Force Disable</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Revoke access for this school even if included in plan.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">
                Administrative Justification (Mandatory):
              </label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="State the commercial, operational, or trial reason for this override..."
                rows={3}
                className="w-full p-2.5 bg-muted/20 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground">
                Minimum 5 characters. This justification is recorded in the platform audit trail.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setOverrideModalModule(null)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted font-medium text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverride}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs cursor-pointer hover:bg-primary/90"
              >
                Apply Override (Demo)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
