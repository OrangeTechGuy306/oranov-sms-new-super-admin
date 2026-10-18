'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { TenantModuleDefinition } from '@/lib/modules/types';
import { CATEGORY_METADATA } from '@/lib/modules/registry-data';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  Layers,
  CheckCircle2,
  FileCode,
  GitBranch,
  Server,
  Lock,
  ExternalLink,
  Power,
} from 'lucide-react';

interface ModuleDetailModalProps {
  module: TenantModuleDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleDetailModal({ module, isOpen, onClose }: ModuleDetailModalProps) {
  const { setModuleGlobalAvailability, getModuleById } = usePlatformStore();

  if (!module) return null;

  const categoryMeta = CATEGORY_METADATA[module.category] || {
    label: module.category.replace(/_/g, ' '),
    macroCategory: module.macroCategory,
  };

  const parentModule = module.parentId ? getModuleById(module.parentId) : null;

  const handleToggleGlobal = () => {
    setModuleGlobalAvailability(module.id, !module.isGloballyEnabled);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${module.name} (${module.code})`}
      size="xl"
    >
      <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="font-mono text-[10px]">
                {module.id}
              </Badge>
              <Badge variant={module.parentId ? 'neutral' : 'info'} className="text-[10px]">
                {module.parentId ? 'Submodule' : 'Top-Level Module'}
              </Badge>
              <Badge
                variant={
                  module.status === 'implemented'
                    ? 'success'
                    : module.status === 'partial'
                    ? 'warning'
                    : 'error'
                }
                className="text-[10px] capitalize"
              >
                {module.status}
              </Badge>
              <Badge
                variant={module.isGloballyEnabled ? 'success' : 'error'}
                className="text-[10px]"
              >
                {module.isGloballyEnabled ? 'Platform: Enabled' : 'Platform: Disabled'}
              </Badge>
            </div>

            <button
              type="button"
              onClick={handleToggleGlobal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                module.isGloballyEnabled
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{module.isGloballyEnabled ? 'Disable Platform-Wide' : 'Enable Platform-Wide'}</span>
            </button>
          </div>

          <p className="text-foreground text-xs leading-relaxed">{module.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-[11px]">
            <div>
              <span className="text-muted-foreground block">Category:</span>
              <span className="font-semibold text-foreground">{categoryMeta.label}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Macro Domain:</span>
              <span className="font-semibold text-foreground capitalize">{module.macroCategory}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Primary Path:</span>
              <span className="font-mono text-primary font-semibold">{module.href}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Parent Module:</span>
              <span className="font-semibold text-foreground">
                {parentModule ? parentModule.name : 'None (Root Module)'}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Status Alert */}
        {!module.isGloballyEnabled && (
          <AlertBanner
            variant="error"
            title="Module Disabled Platform-Wide"
          >
            This module has been suspended globally at the platform layer. It will evaluate as
            <strong> unavailable</strong> for all tenant schools regardless of their active subscription plan or administrative overrides.
          </AlertBanner>
        )}

        {/* Plan Availability Grid */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>Subscription Plan Entitlements</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'starter', label: 'Starter Academy', tier: 'starter' as const },
              { id: 'growth', label: 'Growth Campus', tier: 'growth' as const },
              { id: 'enterprise', label: 'Enterprise Network', tier: 'enterprise' as const },
            ].map((plan) => {
              const isIncluded = module.includedInPlans.includes(plan.tier);
              return (
                <div
                  key={plan.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    isIncluded
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                      : 'border-border/60 bg-muted/20 opacity-70'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-foreground">{plan.label}</p>
                    <p className="text-[10px] text-muted-foreground">Tier: {plan.tier}</p>
                  </div>
                  {isIncluded ? (
                    <Badge variant="success" className="text-[10px]">
                      Included
                    </Badge>
                  ) : module.requiresAddonLicense && plan.tier !== 'starter' ? (
                    <Badge variant="warning" className="text-[10px]">
                      Add-on License
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="text-[10px]">
                      Excluded
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dependencies Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-primary" />
            <span>Module Dependencies & Prerequisites</span>
          </h4>
          {module.dependencies && module.dependencies.length > 0 ? (
            <div className="space-y-2">
              {module.dependencies.map((dep, idx) => {
                const depMod = getModuleById(dep.moduleId);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-card/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {depMod ? depMod.name : dep.moduleId}
                        </span>
                        <Badge
                          variant={dep.type === 'required' ? 'error' : 'neutral'}
                          className="text-[10px]"
                        >
                          {dep.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{dep.description}</p>
                    </div>
                    {depMod && (
                      <Badge
                        variant={depMod.isGloballyEnabled ? 'success' : 'error'}
                        className="text-[10px] shrink-0"
                      >
                        {depMod.isGloballyEnabled ? 'Satisfied' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Independent standalone module. No external module dependencies declared.</span>
            </div>
          )}
        </div>

        {/* Mapped Tenant Routes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span>Mapped Tenant Workspace Routes ({module.routes.length})</span>
            </h4>
            <span className="text-[10px] text-muted-foreground">app/(tenant) route tree</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/20 max-h-40 overflow-y-auto space-y-1 font-mono text-[11px]">
            {module.routes.map((route, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-background/80"
              >
                <span className="text-primary truncate">{route}</span>
                <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                  {route === module.href ? 'primary entry' : 'nested/detail route'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Traceable Source Evidence */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-primary" />
            <span>Traceable Source Evidence (tenant-dashboard/)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg border border-border bg-card/40">
              <span className="text-muted-foreground font-sans block text-[10px]">Page Entry:</span>
              <span className="text-foreground truncate block">{module.sourceEvidence.routePath}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-card/40">
              <span className="text-muted-foreground font-sans block text-[10px]">Test Suite:</span>
              <span className="text-foreground truncate block">{module.sourceEvidence.testSuite || 'tests/crossModuleIntegrationAndFinalAudit.test.ts'}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-card/40">
              <span className="text-muted-foreground font-sans block text-[10px]">Mock Store:</span>
              <span className="text-foreground truncate block">{module.sourceEvidence.mockStore || 'lib/mock/tenantData.ts'}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-card/40">
              <span className="text-muted-foreground font-sans block text-[10px]">Type Contract:</span>
              <span className="text-foreground truncate block">{module.sourceEvidence.typeDefinition || 'types/navigation.ts'}</span>
            </div>
          </div>
        </div>

        {/* Permissions & Roles */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-primary" />
            <span>Required Permissions & Security Classification</span>
          </h4>
          <div className="p-3 rounded-lg border border-border bg-card/40 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-[11px]">Permission Keys:</span>
              {module.requiredPermissions.length > 0 ? (
                module.requiredPermissions.map((perm, idx) => (
                  <Badge key={idx} variant="neutral" className="font-mono text-[10px]">
                    {perm}
                  </Badge>
                ))
              ) : (
                <Badge variant="neutral" className="text-[10px]">
                  Unrestricted View
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
              <span className="text-muted-foreground text-[11px]">Data Classification:</span>
              <Badge
                variant={
                  module.dataSensitivity === 'sensitive_health_dsl'
                    ? 'error'
                    : module.dataSensitivity === 'restricted_pii'
                    ? 'warning'
                    : 'info'
                }
                className="text-[10px] capitalize"
              >
                {module.dataSensitivity.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Future Backend Requirements */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
          <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
            <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Future Backend Readiness Requirements</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 text-[11px]">
            {module.futureBackendRequirements && module.futureBackendRequirements.length > 0 ? (
              module.futureBackendRequirements.map((req, idx) => <li key={idx}>{req}</li>)
            ) : (
              <li>Authoritative database persistence with multi-tenant row-level security.</li>
            )}
            <li>Server-side authorization middleware enforcing entitlement claims before executing tenant mutations.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
