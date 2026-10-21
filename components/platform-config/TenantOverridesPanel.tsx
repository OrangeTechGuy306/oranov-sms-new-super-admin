'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Building2,
  Sliders,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export function TenantOverridesPanel() {
  const {
    organizations,
    featureFlags,
    tenantOverrides,
    setTenantFeatureOverride,
    removeTenantFeatureOverride,
    evaluateEffectiveFlag,
    plans,
    subscriptions,
  } = usePlatformStore();

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id || 'org_001'
  );

  // Override Modal
  const [modalFlagKey, setModalFlagKey] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState<boolean>(true);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Remove Override Confirm
  const [flagKeyToRemove, setFlagKeyToRemove] = useState<string | null>(null);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
  const selectedSub = subscriptions.find((s) => s.organizationId === selectedOrgId);
  const selectedPlan = plans.find((p) => p.id === selectedSub?.planId || p.id === selectedOrg?.planId);

  // Evaluated flags for this organization
  const evaluatedList = useMemo(() => {
    return featureFlags.map((flag) => {
      const effective = evaluateEffectiveFlag(flag.key, selectedOrgId, 'all');
      const explicitOverride = tenantOverrides.find(
        (o) => o.organizationId === selectedOrgId && o.flagKey === flag.key
      );

      return {
        flag,
        effective,
        explicitOverride,
      };
    });
  }, [featureFlags, selectedOrgId, tenantOverrides, evaluateEffectiveFlag]);

  const handleOpenOverrideModal = (flagKey: string, currentValue: boolean) => {
    setModalFlagKey(flagKey);
    setOverrideValue(!currentValue);
    setOverrideReason('');
    setOverrideError(null);
  };

  const handleSaveOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFlagKey || !selectedOrgId) return;

    if (!overrideReason.trim() || overrideReason.trim().length < 5) {
      setOverrideError('A detailed reason (min 5 characters) is required for audit compliance.');
      return;
    }

    const res = setTenantFeatureOverride({
      organizationId: selectedOrgId,
      flagKey: modalFlagKey,
      overrideValue,
      reason: overrideReason.trim(),
    });

    if (res.success) {
      setModalFlagKey(null);
    } else {
      setOverrideError(res.error || 'Failed to apply override.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Precedence Hierarchy & Architecture Banner */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>Institutional Feature Overrides & Precedence Resolution</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspect how global platform defaults and environment restrictions are overridden at the specific tenant school boundary.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-muted-foreground">Select School:</span>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-xs font-semibold text-foreground"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Precedence Model Pill Visualization */}
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground text-[11px]">Evaluation Precedence:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border text-[11px]">
            <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center font-bold text-[10px]">1</span>
            <span>Platform Default</span>
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border text-[11px]">
            <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center font-bold text-[10px]">2</span>
            <span>Environment Override</span>
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/40 text-primary font-semibold text-[11px]">
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">3</span>
            <span>Tenant Override (Highest)</span>
          </div>
          <span className="text-muted-foreground text-[11px] ml-auto">
            Gated by: Module Licensing & Dependency Graph
          </span>
        </div>
      </div>

      {/* Selected Organization Summary Card */}
      {selectedOrg && (
        <div className="p-4 rounded-xl border border-border bg-muted/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm">{selectedOrg.name}</h3>
                <Badge variant={selectedOrg.status === 'active' ? 'success' : 'warning'} className="text-[10px] capitalize">
                  {selectedOrg.status}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Domain: <code className="font-mono text-foreground">{selectedOrg.subdomain}.schoolsaas.com</code> | Code: {selectedOrg.code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px]">Licensed Tier</span>
              <span className="font-semibold text-foreground uppercase">{selectedPlan?.tier || 'Starter'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Subscription Plan</span>
              <span className="font-semibold text-foreground">{selectedPlan?.name || 'Standard'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Active Overrides</span>
              <span className="font-bold text-primary">
                {tenantOverrides.filter((o) => o.organizationId === selectedOrgId).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Evaluated Flags Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden text-xs">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-xs">
            Evaluated Capabilities & Effective Status ({evaluatedList.length} Flags)
          </h4>
          <span className="text-[11px] text-muted-foreground">
            All overrides operate in local Super-Admin development state.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-[11px] text-muted-foreground">
                <th className="p-3 font-semibold">Feature Flag</th>
                <th className="p-3 font-semibold">L1: Platform Default</th>
                <th className="p-3 font-semibold">L3: Tenant Override</th>
                <th className="p-3 font-semibold">Effective Evaluated State</th>
                <th className="p-3 font-semibold">Resolution Source</th>
                <th className="p-3 font-semibold text-right">Override Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {evaluatedList.map(({ flag, effective, explicitOverride }) => {
                const isOverridden = !!explicitOverride;

                return (
                  <tr key={flag.key} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3 max-w-xs">
                      <span className="font-semibold text-foreground block">{flag.name}</span>
                      <code className="text-[10px] font-mono text-muted-foreground">{flag.key}</code>
                      {flag.relatedModuleId && (
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          Linked Module: <span className="font-mono">{flag.relatedModuleId}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <Badge variant={flag.enabled ? 'success' : 'neutral'} className="text-[10px]">
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>

                    <td className="p-3">
                      {isOverridden ? (
                        <div className="space-y-0.5">
                          <Badge
                            variant={explicitOverride.overrideValue ? 'success' : 'error'}
                            className="text-[10px]"
                          >
                            {explicitOverride.overrideValue ? 'Forced ON' : 'Forced OFF'}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground max-w-xs truncate" title={explicitOverride.reason}>
                            {explicitOverride.reason}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Inherited</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="space-y-1">
                        {effective.effectiveValue ? (
                          <Badge variant="success" className="text-[10px]">
                            Active / Enabled
                          </Badge>
                        ) : effective.failureReason ? (
                          <div className="space-y-0.5">
                            <Badge variant="warning" className="text-[10px]">
                              Gated / Blocked
                            </Badge>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 block max-w-xs leading-tight">
                              {effective.failureReason}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">
                            Disabled
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-[11px] text-muted-foreground max-w-xs truncate">
                      {effective.inheritanceSource}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenOverrideModal(flag.key, isOverridden ? explicitOverride!.overrideValue : flag.enabled)}
                          className="px-2.5 py-1 rounded-md border border-border hover:bg-muted text-foreground text-[11px] font-semibold transition-colors"
                        >
                          {isOverridden ? 'Edit Override' : 'Configure Override'}
                        </button>

                        {isOverridden && (
                          <button
                            type="button"
                            onClick={() => setFlagKeyToRemove(flag.key)}
                            className="p-1 rounded-md border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                            title="Remove Override (Restore Inheritance)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Safe Failure Behavior Demonstration Card */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
        <h4 className="font-semibold text-foreground flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>Safe Failure & Unresolved References Guarantee</span>
        </h4>
        <p className="text-muted-foreground text-xs leading-relaxed">
          In compliance with the E-09.15 specification, if an organization reference or feature flag key fails to resolve, or if prerequisite dependencies are disabled, the platform strictly defaults to <strong className="text-foreground">False / Disabled</strong>. Missing configurations or unknown identifiers are never interpreted as authorization to enable capabilities.
        </p>
      </div>

      {/* MODAL: SET OR EDIT OVERRIDE */}
      {modalFlagKey && (
        <Modal
          isOpen={!!modalFlagKey}
          onClose={() => setModalFlagKey(null)}
          title={`Configure Institutional Override: ${modalFlagKey}`}
          description={`Override platform release state for ${selectedOrg?.name}.`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setModalFlagKey(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverrideSubmit}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
              >
                Save Override
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveOverrideSubmit} className="space-y-4 text-xs">
            {overrideError && (
              <AlertBanner variant="error" title="Override Error">
                {overrideError}
              </AlertBanner>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Forced Override State</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOverrideValue(true)}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-semibold transition-colors ${
                    overrideValue ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-muted/20 border-border text-muted-foreground'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Forced Enabled (ON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideValue(false)}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-semibold transition-colors ${
                    !overrideValue ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400' : 'bg-muted/20 border-border text-muted-foreground'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Forced Disabled (OFF)</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Administrative Justification / Reason</label>
              <textarea
                rows={3}
                placeholder="Mandatory justification for this institutional override (e.g. IB accreditation, pilot program, public school charter constraint)..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground">Stored permanently in the platform audit trail and configuration version history.</span>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DIALOG: REMOVE OVERRIDE */}
      <ConfirmDialog
        isOpen={!!flagKeyToRemove}
        onClose={() => setFlagKeyToRemove(null)}
        onConfirm={() => {
          if (flagKeyToRemove && selectedOrgId) {
            removeTenantFeatureOverride(selectedOrgId, flagKeyToRemove);
            setFlagKeyToRemove(null);
          }
        }}
        title="Remove Institutional Override?"
        description={`This will delete the explicit override for "${flagKeyToRemove}" on ${selectedOrg?.name}. The school will immediately revert to inheriting the default platform release state.`}
        confirmLabel="Remove Override"
        variant="warning"
      />
    </div>
  );
}
