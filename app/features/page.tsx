'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ModuleDetailModal } from '@/components/modules/ModuleDetailModal';
import { PlanComparisonMatrix } from '@/components/modules/PlanComparisonMatrix';
import { OrganizationEntitlementsPanel } from '@/components/modules/OrganizationEntitlementsPanel';
import { CATEGORY_METADATA } from '@/lib/modules/registry-data';
import { TenantModuleDefinition } from '@/lib/modules/types';
import {
  Layers,
  CheckCircle2,
  Building2,
  Power,
  ShieldCheck,
  GitBranch,
  Sliders,
  FileCode,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function MasterTenantModuleRegistryPage() {
  const { hasAnyPermission } = usePlatformAuth();
  const canToggleFeatures = hasAnyPermission(['system.features.toggle', 'modules.registry.manage']);
  const {
    modules,
    moduleMetrics,
    plans,
    organizations,
    features,
    toggleFeature,
    updateFeatureDefinition,
    setModuleGlobalAvailability,
    setModuleAvailabilityStatus,
    validateRegistry,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'catalogue' | 'matrix' | 'overrides' | 'flags' | 'audit'>('catalogue');

  // Catalogue Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [hierarchyFilter, setHierarchyFilter] = useState<'all' | 'top_only' | 'sub_only'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<
    'all' | 'enabled' | 'disabled' | 'coming_soon' | 'deprecated' | 'unavailable' | 'unassigned'
  >('all');

  // Overrides tab selected school
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id || 'org_001'
  );

  // Inspected module modal
  const [inspectedModule, setInspectedModule] = useState<TenantModuleDefinition | null>(null);

  // Validation report
  const validationReport = useMemo(() => validateRegistry(), [validateRegistry]);

  // Filtered catalogue modules
  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !mod.name.toLowerCase().includes(q) &&
          !mod.code.toLowerCase().includes(q) &&
          !mod.id.toLowerCase().includes(q) &&
          !mod.href.toLowerCase().includes(q) &&
          !mod.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && mod.category !== selectedCategory) {
        return false;
      }

      if (selectedPlanTier !== 'all') {
        const targetPlan = plans.find((p) => p.id === selectedPlanTier || p.tier === selectedPlanTier);
        if (targetPlan && Array.isArray(targetPlan.includedModuleIds)) {
          if (!targetPlan.includedModuleIds.includes(mod.id)) {
            return false;
          }
        } else if (!mod.includedInPlans.includes(selectedPlanTier as 'starter' | 'growth' | 'enterprise')) {
          return false;
        }
      }

      const effectiveMaturity = mod.implementationMaturity || mod.status;
      if (selectedStatus !== 'all' && effectiveMaturity !== selectedStatus) {
        return false;
      }

      if (hierarchyFilter === 'top_only' && mod.parentId) {
        return false;
      }

      if (hierarchyFilter === 'sub_only' && !mod.parentId) {
        return false;
      }

      if (availabilityFilter === 'enabled' && !mod.isGloballyEnabled) {
        return false;
      }

      if (availabilityFilter === 'disabled' && mod.isGloballyEnabled) {
        return false;
      }

      if (
        (availabilityFilter === 'coming_soon' ||
          availabilityFilter === 'deprecated' ||
          availabilityFilter === 'unavailable') &&
        mod.availabilityStatus !== availabilityFilter
      ) {
        return false;
      }

      if (availabilityFilter === 'unassigned') {
        const isAssignedToAnyPlan = plans.some(
          (p) =>
            p.includedModuleIds?.includes(mod.id) ||
            p.optionalAddOnModuleIds?.includes(mod.id)
        );
        if (isAssignedToAnyPlan) return false;
      }

      return true;
    });
  }, [
    modules,
    plans,
    searchQuery,
    selectedCategory,
    selectedPlanTier,
    selectedStatus,
    hierarchyFilter,
    availabilityFilter,
  ]);

  const categoryOptions = useMemo(() => {
    const categories = new Set(modules.map((m) => m.category));
    return Array.from(categories).map((c) => ({
      key: c,
      label: CATEGORY_METADATA[c]?.label || c.replace(/_/g, ' '),
    }));
  }, [modules]);

  const handleToggleGlobal = (e: React.MouseEvent, mod: TenantModuleDefinition) => {
    e.stopPropagation();
    setModuleGlobalAvailability(mod.id, !mod.isGloballyEnabled);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Tenant Module Registry & Feature Entitlements"
        description="Comprehensive Super-Admin registry of discovered tenant capabilities, subscription-tier mappings, dependency hierarchies, and organization overrides."
      />

      <AlertBanner variant="warning" title="Platform Architecture & Authorization Boundary">
        <strong>Backend Architecture Notice:</strong> Module catalogue records, global availability switches, and school overrides reflect local development state in the Super-Admin client. In production, feature entitlements will be cryptographically signed into tenant session claims and enforced by server-side backend middleware on every API endpoint.
      </AlertBanner>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Registry Entries"
          value={moduleMetrics.totalModules}
          subtitle={`${moduleMetrics.topLevelModules} top, ${moduleMetrics.submodules} sub`}
          icon={<Layers className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Mapped Workspace Routes"
          value={moduleMetrics.totalMappedRoutes}
          subtitle="Across 10 Nav Groups"
          icon={<FileCode className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Implementation Readiness"
          value={`${moduleMetrics.implementedCount}`}
          subtitle={`${moduleMetrics.partialCount} Partial • ${moduleMetrics.plannedCount} Planned`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Platform Available"
          value={`${moduleMetrics.platformEnabledCount}`}
          subtitle={`${moduleMetrics.comingSoonCount || 0} Coming Soon • ${moduleMetrics.deprecatedCount || 0} Deprecated`}
          icon={<Power className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Plan & Feature Coverage"
          value={`${moduleMetrics.totalFeaturesCount || features.length} Features`}
          subtitle={`${moduleMetrics.unassignedModulesCount || 0} modules unassigned • Starter ${moduleMetrics.planStarterCount}`}
          icon={<Sparkles className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Active School Overrides"
          value={moduleMetrics.activeOverridesCount}
          subtitle="Custom Tenant Grants"
          icon={<Sliders className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as 'catalogue' | 'matrix' | 'overrides' | 'flags' | 'audit')}
        tabs={[
          {
            id: 'catalogue',
            label: 'Module Catalogue',
            icon: <Layers className="w-3.5 h-3.5" />,
            count: filteredModules.length,
          },
          {
            id: 'matrix',
            label: 'Plan Entitlements Matrix',
            icon: <Sparkles className="w-3.5 h-3.5" />,
          },
          {
            id: 'overrides',
            label: 'School Entitlement Overrides',
            icon: <Sliders className="w-3.5 h-3.5" />,
            count: moduleMetrics.activeOverridesCount,
          },
          {
            id: 'flags',
            label: 'Feature Registry & Flags',
            icon: <ShieldCheck className="w-3.5 h-3.5" />,
            count: features.length,
          },
          {
            id: 'audit',
            label: 'Registry Integrity Audit',
            icon: <ShieldAlert className="w-3.5 h-3.5" />,
          },
        ]}
      />

      {/* TAB 1: MODULE CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <SearchFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search modules by name, code, path, or description..."
                resultCount={filteredModules.length}
                onReset={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPlanTier('all');
                  setSelectedStatus('all');
                  setHierarchyFilter('all');
                  setAvailabilityFilter('all');
                }}
              />

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:outline-none"
                  aria-label="Filter by domain category"
                >
                  <option value="all">All Domain Categories ({categoryOptions.length})</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <select
                  value={hierarchyFilter}
                  onChange={(e) => setHierarchyFilter(e.target.value as 'all' | 'top_only' | 'sub_only')}
                  className="px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:outline-none"
                  aria-label="Filter by module hierarchy"
                >
                  <option value="all">All Hierarchies</option>
                  <option value="top_only">Top-Level Modules Only ({moduleMetrics.topLevelModules})</option>
                  <option value="sub_only">Submodules Only ({moduleMetrics.submodules})</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:outline-none"
                  aria-label="Filter by implementation maturity"
                >
                  <option value="all">Maturity: All</option>
                  <option value="implemented">Implemented ({moduleMetrics.implementedCount})</option>
                  <option value="partial">Partial ({moduleMetrics.partialCount})</option>
                  <option value="planned">Planned ({moduleMetrics.plannedCount})</option>
                </select>

                <select
                  value={selectedPlanTier}
                  onChange={(e) => setSelectedPlanTier(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:outline-none"
                  aria-label="Filter by subscription plan"
                >
                  <option value="all">All Plans ({plans.length})</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      Included in {p.name}
                    </option>
                  ))}
                </select>

                <select
                  value={availabilityFilter}
                  onChange={(e) =>
                    setAvailabilityFilter(
                      e.target.value as
                        | 'all'
                        | 'enabled'
                        | 'disabled'
                        | 'coming_soon'
                        | 'deprecated'
                        | 'unavailable'
                        | 'unassigned'
                    )
                  }
                  className="px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:outline-none"
                  aria-label="Filter by platform availability"
                >
                  <option value="all">Availability: All</option>
                  <option value="enabled">Available / Enabled</option>
                  <option value="disabled">Disabled / Suspended</option>
                  <option value="coming_soon">Coming Soon ({moduleMetrics.comingSoonCount || 0})</option>
                  <option value="deprecated">Deprecated ({moduleMetrics.deprecatedCount || 0})</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="unassigned">Unassigned to Any Plan ({moduleMetrics.unassignedModulesCount || 0})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Module Catalogue Table */}
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="p-3.5 font-semibold text-foreground min-w-[260px]">
                      Module Identity & Code
                    </th>
                    <th className="p-3.5 font-semibold text-foreground min-w-[140px]">
                      Domain Category
                    </th>
                    <th className="p-3.5 font-semibold text-foreground min-w-[100px]">Readiness</th>
                    <th className="p-3.5 font-semibold text-foreground min-w-[120px]">
                      Platform Status
                    </th>
                    <th className="p-3.5 font-semibold text-foreground min-w-[160px]">
                      Plan Inclusion
                    </th>
                    <th className="p-3.5 font-semibold text-foreground min-w-[110px]">
                      Dependencies
                    </th>
                    <th className="p-3.5 font-semibold text-foreground text-right min-w-[110px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredModules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-muted-foreground text-xs">
                        No tenant modules match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredModules.map((mod) => {
                      const catLabel = CATEGORY_METADATA[mod.category]?.label || mod.category;
                      const hasDeps = mod.dependencies && mod.dependencies.length > 0;

                      return (
                        <tr
                          key={mod.id}
                          onClick={() => setInspectedModule(mod)}
                          className="hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          {/* Module Identity */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {mod.parentId ? (
                                <span className="text-muted-foreground/60 text-xs ml-3 font-mono">
                                  └─
                                </span>
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

                          {/* Readiness Status */}
                          <td className="p-3.5">
                            <div className="flex flex-col items-start gap-1">
                              <Badge
                                variant={
                                  (mod.implementationMaturity || mod.status) === 'implemented'
                                    ? 'success'
                                    : (mod.implementationMaturity || mod.status) === 'partial'
                                    ? 'warning'
                                    : 'error'
                                }
                                className="text-[10px] capitalize"
                              >
                                {mod.implementationMaturity || mod.status}
                              </Badge>
                              {mod.availabilityStatus && mod.availabilityStatus !== 'available' && mod.availabilityStatus !== 'enabled' && (
                                <Badge variant={mod.availabilityStatus === 'coming_soon' ? 'warning' : 'error'} className="text-[9px] capitalize">
                                  {mod.availabilityStatus.replace(/_/g, ' ')}
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Platform Availability */}
                          <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-start gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleToggleGlobal(e, mod)}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border ${
                                  mod.isGloballyEnabled
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                                    : 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                                }`}
                                title={mod.isGloballyEnabled ? 'Click to disable platform-wide' : 'Click to enable platform-wide'}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    mod.isGloballyEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                                <span>{mod.isGloballyEnabled ? 'Enabled' : 'Disabled'}</span>
                              </button>
                              <select
                                value={mod.availabilityStatus || (mod.isGloballyEnabled ? 'available' : 'disabled')}
                                onChange={(e) =>
                                  setModuleAvailabilityStatus(
                                    mod.id,
                                    e.target.value as
                                      | 'available'
                                      | 'enabled'
                                      | 'disabled'
                                      | 'coming_soon'
                                      | 'deprecated'
                                      | 'unavailable'
                                  )
                                }
                                aria-label={`Availability status for ${mod.name}`}
                                className="px-1.5 py-0.5 bg-muted/40 border border-border rounded text-[10px] text-foreground focus:outline-none"
                              >
                                <option value="available">Available</option>
                                <option value="enabled">Enabled</option>
                                <option value="disabled">Disabled</option>
                                <option value="coming_soon">Coming Soon</option>
                                <option value="deprecated">Deprecated</option>
                                <option value="unavailable">Unavailable</option>
                              </select>
                            </div>
                          </td>

                          {/* Plans Inclusion */}
                          <td className="p-3.5">
                            <div className="flex flex-wrap items-center gap-1">
                              {plans
                                .filter((p) => p.includedModuleIds?.includes(mod.id))
                                .map((p) => (
                                  <Badge key={p.id} variant="neutral" className="text-[9px]">
                                    {p.name.replace(/ Academy| Plan| Workspace/gi, '')}
                                  </Badge>
                                ))}
                              {plans.some((p) => p.optionalAddOnModuleIds?.includes(mod.id)) && (
                                <Badge variant="warning" className="text-[9px]">
                                  Add-on
                                </Badge>
                              )}
                              {!plans.some(
                                (p) =>
                                  p.includedModuleIds?.includes(mod.id) ||
                                  p.optionalAddOnModuleIds?.includes(mod.id)
                              ) && (
                                <Badge variant="error" className="text-[9px]">
                                  Unassigned
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Dependencies */}
                          <td className="p-3.5">
                            {hasDeps ? (
                              <div className="flex items-center gap-1 text-[11px] text-foreground">
                                <GitBranch className="w-3.5 h-3.5 text-primary" />
                                <span>{mod.dependencies.length} Dep{mod.dependencies.length === 1 ? '' : 's'}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">None</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setInspectedModule(mod)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg cursor-pointer border border-primary/20"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLAN ENTITLEMENTS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Subscription Plan Comparison Matrix</h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Inspect which discovered modules and submodules are bundled into Starter, Growth, and Enterprise subscription tiers.
              </p>
            </div>
          </div>

          <PlanComparisonMatrix
            modules={modules}
            onSelectModule={(mod) => setInspectedModule(mod)}
          />
        </div>
      )}

      {/* TAB 3: SCHOOL ENTITLEMENT OVERRIDES */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          {/* School Selector Bar */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Select School Organization:</span>
            </div>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-semibold focus:outline-none"
              aria-label="Select organization to manage entitlements"
            >
              {organizations.map((org) => {
                const plan = plans.find((p) => p.id === org.planId);
                return (
                  <option key={org.id} value={org.id}>
                    {org.name} ({plan?.name || 'Unknown Plan'})
                  </option>
                );
              })}
            </select>
          </div>

          <OrganizationEntitlementsPanel
            organizationId={selectedOrgId}
            onInspectModule={(mod) => setInspectedModule(mod)}
          />
        </div>
      )}

      {/* TAB 4: CANONICAL FEATURE REGISTRY & RELEASE FLAGS */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                Canonical Feature Registry &amp; Release Flags ({features.length})
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Granular capabilities (`feat_*`) linked to parent modules (`mod_*`), showing independent implementation maturity and availability status.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Badge variant="success">{moduleMetrics.activeFeaturesCount ?? features.filter((f) => f.isGloballyEnabled).length} Active</Badge>
              <Badge variant="warning">{moduleMetrics.comingSoonFeaturesCount ?? features.filter((f) => f.availabilityStatus === 'coming_soon').length} Coming Soon</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => {
              const linkedPlans = plans.filter(
                (p) =>
                  p.includedFeatureIds?.includes(feat.id) ||
                  feat.availableInPlans.includes(p.id) ||
                  feat.availableInPlans.includes(p.tier)
              );
              const avail = feat.availabilityStatus || (feat.isGloballyEnabled ? 'available' : 'disabled');
              const maturity = feat.implementationMaturity || 'implemented';

              return (
                <div
                  key={feat.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{feat.name}</h4>
                        <span className="font-mono text-[10px] text-muted-foreground block">
                          {feat.id} • {feat.code}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            avail === 'coming_soon'
                              ? 'warning'
                              : feat.isGloballyEnabled
                              ? 'success'
                              : 'error'
                          }
                          className="text-[10px] capitalize"
                        >
                          {avail.replace(/_/g, ' ')}
                        </Badge>
                        <Badge
                          variant={maturity === 'implemented' ? 'info' : 'warning'}
                          className="text-[9px] capitalize"
                        >
                          Maturity: {maturity}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-[11px] leading-relaxed">{feat.description}</p>

                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {feat.moduleId && (
                        <Badge variant="neutral" className="font-mono text-[9px]">
                          Parent: {feat.moduleId}
                        </Badge>
                      )}
                      {feat.isBeta && (
                        <Badge variant="warning" className="text-[9px]">
                          Beta / Rollout
                        </Badge>
                      )}
                      {feat.requiresAddonLicense && (
                        <Badge variant="warning" className="text-[9px]">
                          Add-on License
                        </Badge>
                      )}
                    </div>

                    {linkedPlans.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {linkedPlans.map((p) => (
                          <Badge key={p.id} variant="neutral" className="text-[9px]">
                            {p.name.replace(/ Academy| Plan/gi, '')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {feat.commercialConfigStatus === 'requires_product_owner_configuration' && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                        Commercial add-on pricing requires Product Owner configuration.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px]">
                    <span className="capitalize text-muted-foreground">Domain: {feat.category}</span>
                    {canToggleFeatures ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={avail}
                          onChange={(e) =>
                            updateFeatureDefinition(feat.id, {
                              availabilityStatus: e.target.value as
                                | 'available'
                                | 'enabled'
                                | 'disabled'
                                | 'coming_soon'
                                | 'deprecated'
                                | 'unavailable',
                            })
                          }
                          aria-label={`Availability for ${feat.name}`}
                          className="px-1.5 py-1 rounded border border-border bg-muted/40 text-foreground text-[10px] focus:outline-none"
                        >
                          <option value="available">Available</option>
                          <option value="enabled">Enabled</option>
                          <option value="coming_soon">Coming Soon</option>
                          <option value="disabled">Disabled</option>
                          <option value="deprecated">Deprecated</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => toggleFeature(feat.id)}
                          className="px-2 py-1 rounded border border-border bg-muted/40 hover:bg-muted text-foreground font-semibold cursor-pointer text-[10px]"
                        >
                          Toggle Flag
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Read-only</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: REGISTRY INTEGRITY AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Registry Validation & Referential Integrity Status</span>
              </h3>
              <Badge
                variant={validationReport.isValid ? 'success' : 'error'}
                className="text-xs"
              >
                {validationReport.isValid ? 'Registry Passed All Integrity Checks' : 'Integrity Issues Detected'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Automated audit evaluating 100% of discovered modules for unique identifiers, valid parent references, satisfied dependency graph, acyclic relationships, and conflict-free route mappings.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Evaluated Entries:</span>
                <span className="font-bold text-foreground">{validationReport.totalModulesCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Verified Routes:</span>
                <span className="font-bold text-foreground">{validationReport.mappedRoutesCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Validation Errors:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {validationReport.errorCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Warnings:</span>
                <span className="font-bold text-foreground">{validationReport.warningCount}</span>
              </div>
            </div>
          </div>

          {/* Validation Issues Feed */}
          {validationReport.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-xs">Audit Observations ({validationReport.issues.length})</h4>
              <div className="space-y-2">
                {validationReport.issues.map((iss) => (
                  <div
                    key={iss.id}
                    className="p-3 rounded-lg border border-border bg-card/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={iss.severity === 'error' ? 'error' : 'warning'}
                          className="text-[10px] capitalize"
                        >
                          {iss.severity} ({iss.category})
                        </Badge>
                        {iss.moduleId && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {iss.moduleId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-foreground mt-1">{iss.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module Capabilities & Evidence Inspection Modal */}
      <ModuleDetailModal
        module={inspectedModule}
        isOpen={!!inspectedModule}
        onClose={() => setInspectedModule(null)}
      />
    </div>
  );
}
