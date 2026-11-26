'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import {
  TenantModuleDefinition,
  ImplementationStatus,
  ModuleDependency,
} from '@/lib/modules/types';

type ModuleAvailabilityState = NonNullable<TenantModuleDefinition['availabilityStatus']>;
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
  Pencil,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ModuleDetailModalProps {
  module: TenantModuleDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleDetailModal({ module, isOpen, onClose }: ModuleDetailModalProps) {
  if (!module) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${module.name} (${module.code})`}
      size="xl"
    >
      <ModuleDetailBody key={module.id} module={module} />
    </Modal>
  );
}

function ModuleDetailBody({ module }: { module: TenantModuleDefinition }) {
  const {
    plans,
    features,
    modules,
    setModuleGlobalAvailability,
    updateModuleMetadata,
    getModuleById,
  } = usePlatformStore();

  const liveModule = getModuleById(module.id) || module;
  const categoryMeta = CATEGORY_METADATA[liveModule.category] || {
    label: liveModule.category.replace(/_/g, ' '),
    macroCategory: liveModule.macroCategory,
  };
  const parentModule = liveModule.parentId ? getModuleById(liveModule.parentId) : null;
  const linkedFeatures = features.filter((f) => f.moduleId === liveModule.id);

  const maturity = liveModule.implementationMaturity || (liveModule.status === 'partial' ? 'partial' : liveModule.status === 'planned' ? 'planned' : 'implemented');
  const availability: ModuleAvailabilityState =
    liveModule.availabilityStatus ||
    (liveModule.isGloballyEnabled ? 'available' : 'disabled');

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(liveModule.name);
  const [draftDescription, setDraftDescription] = useState(liveModule.description);
  const [draftMaturity, setDraftMaturity] = useState<'implemented' | 'partial' | 'planned'>(
    maturity === 'partial' || maturity === 'planned' ? maturity : 'implemented'
  );
  const [draftMaturityNote, setDraftMaturityNote] = useState(liveModule.maturityNote || '');
  const [draftAvailability, setDraftAvailability] = useState<ModuleAvailabilityState>(availability);
  const [draftDeps, setDraftDeps] = useState<ModuleDependency[]>(liveModule.dependencies || []);
  const [newDepId, setNewDepId] = useState('');
  const [newDepType, setNewDepType] = useState<'required' | 'optional'>('required');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleToggleGlobal = () => {
    setModuleGlobalAvailability(liveModule.id, !liveModule.isGloballyEnabled);
  };

  const handleAddDependency = () => {
    if (!newDepId) return;
    if (draftDeps.some((d) => d.moduleId === newDepId)) {
      setEditError(`Dependency "${newDepId}" is already listed.`);
      return;
    }
    const target = getModuleById(newDepId);
    setDraftDeps([
      ...draftDeps,
      {
        moduleId: newDepId,
        type: newDepType,
        description: target ? `Requires ${target.name} capabilities.` : 'Prerequisite module dependency.',
      },
    ]);
    setNewDepId('');
    setEditError('');
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    const res = updateModuleMetadata(liveModule.id, {
      name: draftName,
      description: draftDescription,
      implementationMaturity: draftMaturity,
      maturityNote: draftMaturityNote.trim() || undefined,
      availabilityStatus: draftAvailability,
      dependencies: draftDeps,
    });

    if (res.success) {
      setEditSuccess('Module metadata updated in local Super-Admin store (simulated).');
      setIsEditing(false);
    } else {
      setEditError(res.error || 'Failed to update module definition.');
    }
  };

  const getMaturityBadgeVariant = (status: ImplementationStatus | 'implemented' | 'partial' | 'planned') => {
    if (status === 'implemented') return 'success';
    if (status === 'partial') return 'warning';
    return 'error';
  };

  const getAvailabilityBadgeVariant = (avail: ModuleAvailabilityState) => {
    if (avail === 'available' || avail === 'enabled') return 'success';
    if (avail === 'coming_soon') return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
      {/* Top Header Card */}
      <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" className="font-mono text-[10px]">
              {liveModule.id}
            </Badge>
            <Badge variant={liveModule.parentId ? 'neutral' : 'info'} className="text-[10px]">
              {liveModule.parentId ? 'Submodule' : 'Top-Level Module'}
            </Badge>
            <Badge variant={getMaturityBadgeVariant(maturity)} className="text-[10px] capitalize">
              Maturity: {maturity}
            </Badge>
            <Badge variant={getAvailabilityBadgeVariant(availability)} className="text-[10px] capitalize">
              Availability: {availability.replace(/_/g, ' ')}
            </Badge>
            {liveModule.deprecatedReason && (
              <Badge variant="error" className="text-[10px]">
                Deprecated
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing((prev) => !prev);
                setEditError('');
                setEditSuccess('');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Editor' : 'Edit Metadata'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleGlobal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                liveModule.isGloballyEnabled
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{liveModule.isGloballyEnabled ? 'Disable Platform-Wide' : 'Enable Platform-Wide'}</span>
            </button>
          </div>
        </div>

        <p className="text-foreground text-xs leading-relaxed">{liveModule.description}</p>

        {editSuccess && (
          <AlertBanner variant="info" title="Simulated Registry Update">
            {editSuccess}
          </AlertBanner>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-[11px]">
          <div>
            <span className="text-muted-foreground block">Category:</span>
            <span className="font-semibold text-foreground">{categoryMeta.label}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Macro Domain:</span>
            <span className="font-semibold text-foreground capitalize">{liveModule.macroCategory}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Primary Path:</span>
            <span className="font-mono text-primary font-semibold">{liveModule.href}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Parent Module:</span>
            <span className="font-semibold text-foreground">
              {parentModule ? parentModule.name : 'None (Root Module)'}
            </span>
          </div>
        </div>

        {liveModule.supportedSchoolTypes && liveModule.supportedSchoolTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-[11px]">
            <span className="text-muted-foreground mr-1">Supported School Types:</span>
            {liveModule.supportedSchoolTypes.map((st) => (
              <Badge key={st} variant="neutral" className="text-[10px] capitalize">
                {st}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Inline Metadata & Status Editor (Simulated) */}
      {isEditing && (
        <form
          onSubmit={handleSaveMetadata}
          className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-xs">
              Edit Module Metadata, Maturity & Dependencies (Simulated Store Only)
            </h4>
            <Badge variant="info" className="text-[10px]">Local Client Simulation</Badge>
          </div>

          {editError && (
            <AlertBanner variant="error" title="Validation Error">
              {editError}
            </AlertBanner>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground block">Display Name</label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground block">Implementation Maturity</label>
              <select
                value={draftMaturity}
                onChange={(e) => setDraftMaturity(e.target.value as 'implemented' | 'partial' | 'planned')}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="implemented">Implemented</option>
                <option value="partial">Partial (Incomplete UI/Workflows)</option>
                <option value="planned">Planned (Placeholder / Roadmapped)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground block">Availability State</label>
              <select
                value={draftAvailability}
                onChange={(e) => setDraftAvailability(e.target.value as ModuleAvailabilityState)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="available">Available</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="deprecated">Deprecated</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground block">Maturity / Caveat Note</label>
              <input
                type="text"
                value={draftMaturityNote}
                onChange={(e) => setDraftMaturityNote(e.target.value)}
                placeholder="Document unfinished workflows or release status..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-foreground block">Description</label>
              <textarea
                rows={2}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="font-semibold text-foreground block">Manage Dependencies</label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={newDepId}
                onChange={(e) => setNewDepId(e.target.value)}
                className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select module dependency to add...</option>
                {modules
                  .filter((m) => m.id !== liveModule.id && !draftDeps.some((d) => d.moduleId === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
              </select>
              <select
                value={newDepType}
                onChange={(e) => setNewDepType(e.target.value as 'required' | 'optional')}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="required">required</option>
                <option value="optional">optional</option>
              </select>
              <button
                type="button"
                onClick={handleAddDependency}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Dep
              </button>
            </div>
            {draftDeps.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draftDeps.map((d) => (
                  <span
                    key={d.moduleId}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px]"
                  >
                    {d.moduleId} ({d.type})
                    <button
                      type="button"
                      onClick={() => setDraftDeps(draftDeps.filter((x) => x.moduleId !== d.moduleId))}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove dependency"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              Apply Simulated Changes
            </button>
          </div>
        </form>
      )}

      {/* Platform / Maturity Alerts */}
      {!liveModule.isGloballyEnabled && (
        <AlertBanner variant="error" title="Module Not Globally Enabled">
          Availability is currently <strong>{availability.replace(/_/g, ' ')}</strong>. It evaluates as{' '}
          <strong>unavailable</strong> for all tenant schools unless explicitly marked differently by product lifecycle policy.
          {liveModule.deprecatedReason ? ` Reason: ${liveModule.deprecatedReason}` : ''}
          {liveModule.replacedByModuleId ? ` Replacement: ${liveModule.replacedByModuleId}.` : ''}
        </AlertBanner>
      )}

      {maturity !== 'implemented' && (
        <AlertBanner variant="warning" title={`Implementation Maturity: ${maturity.toUpperCase()}`}>
          {liveModule.maturityNote ||
            liveModule.statusRationale ||
            'Frontend workflows for this module are partially built and do not imply full production completion even when included in a plan.'}
        </AlertBanner>
      )}

      {/* Live Plan Availability Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>Subscription Plan Entitlements (Live Catalogue Sync: {plans.length} Plans)</span>
          </h4>
          <span className="text-[10px] text-muted-foreground">Derived directly from plan includedModuleIds &amp; add-ons</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isIncluded = Array.isArray(plan.includedModuleIds)
              ? plan.includedModuleIds.includes(liveModule.id)
              : liveModule.includedInPlans.includes(plan.tier);
            const isOptionalAddOn = Boolean(plan.optionalAddOnModuleIds?.includes(liveModule.id));

            return (
              <div
                key={plan.id}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  isIncluded
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                    : isOptionalAddOn
                    ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20'
                    : 'border-border/60 bg-muted/20 opacity-75'
                }`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{plan.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {plan.id} • {plan.currency} • {plan.status || 'published'}
                  </p>
                </div>
                {isIncluded ? (
                  <Badge variant="success" className="text-[10px] shrink-0">
                    Included
                  </Badge>
                ) : isOptionalAddOn ? (
                  <Badge variant="warning" className="text-[10px] shrink-0">
                    Optional Add-on
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="text-[10px] shrink-0">
                    Excluded
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Linked Sub-Features */}
      {linkedFeatures.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Linked Fine-Grained Features ({linkedFeatures.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {linkedFeatures.map((feat) => (
              <div key={feat.id} className="p-2.5 rounded-lg border border-border bg-card/50 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{feat.name}</span>
                  <Badge
                    variant={
                      feat.availabilityStatus === 'coming_soon'
                        ? 'warning'
                        : feat.isGloballyEnabled
                        ? 'success'
                        : 'error'
                    }
                    className="text-[10px] capitalize"
                  >
                    {(feat.availabilityStatus || (feat.isGloballyEnabled ? 'enabled' : 'disabled')).replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {feat.id} • Maturity: {feat.implementationMaturity || 'implemented'}
                </p>
                <p className="text-[11px] text-muted-foreground">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies Section */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-primary" />
          <span>Module Dependencies &amp; Prerequisites</span>
        </h4>
        {liveModule.dependencies && liveModule.dependencies.length > 0 ? (
          <div className="space-y-2">
            {liveModule.dependencies.map((dep, idx) => {
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
                      {depMod.isGloballyEnabled ? 'Available' : 'Unavailable'}
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
            <span>Mapped Tenant Workspace Routes ({liveModule.routes.length})</span>
          </h4>
          <span className="text-[10px] text-muted-foreground">app/(tenant) route tree</span>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/20 max-h-40 overflow-y-auto space-y-1 font-mono text-[11px]">
          {liveModule.routes.map((route, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-background/80"
            >
              <span className="text-primary truncate">{route}</span>
              <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                {route === liveModule.href ? 'primary entry' : 'nested/detail route'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Traceable Source Evidence */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-primary" />
          <span>Traceable Source Evidence (frontend/)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2.5 rounded-lg border border-border bg-card/40">
            <span className="text-muted-foreground font-sans block text-[10px]">Page Entry:</span>
            <span className="text-foreground truncate block">{liveModule.sourceEvidence.routePath}</span>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-card/40">
            <span className="text-muted-foreground font-sans block text-[10px]">Test Suite:</span>
            <span className="text-foreground truncate block">
              {liveModule.sourceEvidence.testSuite || 'tests/crossModuleIntegrationAndFinalAudit.test.ts'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-card/40">
            <span className="text-muted-foreground font-sans block text-[10px]">Mock Store:</span>
            <span className="text-foreground truncate block">
              {liveModule.sourceEvidence.mockStore || 'lib/mock/tenantData.ts'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-card/40">
            <span className="text-muted-foreground font-sans block text-[10px]">Type Contract:</span>
            <span className="text-foreground truncate block">
              {liveModule.sourceEvidence.typeDefinition || 'types/navigation.ts'}
            </span>
          </div>
        </div>
      </div>

      {/* Permissions & Roles */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-primary" />
          <span>Required Permissions &amp; Security Classification</span>
        </h4>
        <div className="p-3 rounded-lg border border-border bg-card/40 space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[11px]">Permission Keys:</span>
            {liveModule.requiredPermissions.length > 0 ? (
              liveModule.requiredPermissions.map((perm, idx) => (
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
                liveModule.dataSensitivity === 'sensitive_health_dsl'
                  ? 'error'
                  : liveModule.dataSensitivity === 'restricted_pii'
                  ? 'warning'
                  : 'info'
              }
              className="text-[10px] capitalize"
            >
              {liveModule.dataSensitivity.replace(/_/g, ' ')}
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
          {liveModule.futureBackendRequirements && liveModule.futureBackendRequirements.length > 0 ? (
            liveModule.futureBackendRequirements.map((req, idx) => <li key={idx}>{req}</li>)
          ) : (
            <li>Authoritative database persistence with multi-tenant row-level security.</li>
          )}
          <li>Server-side authorization middleware enforcing entitlement claims before executing tenant mutations.</li>
        </ul>
      </div>
    </div>
  );
}
