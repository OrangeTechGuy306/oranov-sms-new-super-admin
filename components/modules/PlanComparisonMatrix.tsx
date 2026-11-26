'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Filter,
  ExternalLink,
  AlertTriangle,
  Clock,
  Ban,
} from 'lucide-react';
import { TenantModuleDefinition } from '@/lib/modules/types';
import { CATEGORY_METADATA } from '@/lib/modules/registry-data';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  generatePlanComparisonRowsFromRegistry,
  type PlanComparisonRow,
} from '@/lib/modules/canonical-entitlements';
import type {
  CanonicalModuleDefinition,
  CanonicalPlanDefinition,
  CanonicalSchoolType,
} from '@/lib/modules/canonical-contract';

interface PlanComparisonMatrixProps {
  modules: TenantModuleDefinition[];
  onSelectModule?: (mod: TenantModuleDefinition) => void;
  includeDraftPlans?: boolean;
}

const SCHOOL_TYPE_OPTIONS: Array<{ value: 'all' | CanonicalSchoolType; label: string }> = [
  { value: 'all', label: 'All School Types' },
  { value: 'nursery', label: 'Nursery / Early Years' },
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'combined', label: 'Combined K-12' },
  { value: 'college', label: 'College / Tertiary' },
  { value: 'vocational', label: 'Vocational / Polytechnic' },
  { value: 'international', label: 'International School' },
];

export function PlanComparisonMatrix({
  modules,
  onSelectModule,
  includeDraftPlans = false,
}: PlanComparisonMatrixProps) {
  const { plans } = usePlatformStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<'all' | CanonicalSchoolType>('all');
  const [onlyDiffering, setOnlyDiffering] = useState(false);

  const visiblePlans = useMemo(
    () =>
      plans.filter(
        (p) =>
          p.status !== 'archived' &&
          p.status !== 'deprecated' &&
          (includeDraftPlans || p.status !== 'draft')
      ),
    [plans, includeDraftPlans]
  );

  const canonicalPlans = useMemo<CanonicalPlanDefinition[]>(
    () =>
      visiblePlans.map((p) => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        normalizedTier: p.normalizedTier || p.tier,
        status: p.status || 'published',
        visibility: p.visibility || 'public',
        description: p.description,
        billingIntervals: p.billingIntervals || ['monthly', 'annual'],
        currency: p.currency,
        priceMonthly: p.priceMonthly,
        priceAnnual: p.priceAnnual,
        priceQuarterly: p.priceQuarterly,
        trialDays: p.trialDays ?? 14,
        targetSchoolTypes: p.targetSchoolTypes || ['primary', 'secondary', 'combined'],
        maxStudents: p.maxStudents,
        maxStaff: p.maxStaff,
        maxCampuses: p.maxCampuses,
        storageGb: p.storageGb,
        features: p.features || [],
        includedModuleIds: p.includedModuleIds || [],
        includedFeatureIds: p.includedFeatureIds || [],
        optionalAddOnModuleIds: p.optionalAddOnModuleIds || [],
        optionalAddOnFeatureIds: p.optionalAddOnFeatureIds || [],
        upgradeToPlanIds: p.upgradeToPlanIds || [],
        downgradeToPlanIds: p.downgradeToPlanIds || [],
        version: p.version ?? 1,
        commercialPricingNote: p.commercialPricingNote,
        isPopular: p.isPopular,
        isActive: p.isActive,
      })),
    [visiblePlans]
  );

  const canonicalModules = useMemo<CanonicalModuleDefinition[]>(
    () =>
      modules.map((m) => ({
        ...(m as unknown as CanonicalModuleDefinition),
        kind: m.parentId ? 'submodule' : 'module',
        registryVersion: m.registryVersion || '2026.1.0-p04',
        availabilityStatus:
          m.availabilityStatus || (m.isGloballyEnabled ? 'enabled' : 'disabled'),
        implementationMaturity:
          m.implementationMaturity ||
          (m.status === 'partial' ? 'partial' : m.status === 'planned' ? 'planned' : 'implemented'),
        supportedSchoolTypes: m.supportedSchoolTypes || [
          'nursery',
          'primary',
          'secondary',
          'combined',
          'college',
          'vocational',
          'international',
        ],
        featureIds: m.featureIds || [],
      })),
    [modules]
  );

  const rows = useMemo<PlanComparisonRow[]>(() => {
    const baseRows = generatePlanComparisonRowsFromRegistry(canonicalModules, canonicalPlans, {
      topLevelOnly: true,
      category: selectedCategory,
      schoolTypeFilter: schoolTypeFilter === 'all' ? undefined : schoolTypeFilter,
    });
    if (!onlyDiffering) return baseRows;
    return baseRows.filter((row) => {
      const states = new Set(canonicalPlans.map((p) => row.perPlan[p.id]?.state));
      return states.size > 1;
    });
  }, [canonicalModules, canonicalPlans, selectedCategory, schoolTypeFilter, onlyDiffering]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(modules.filter((m) => !m.parentId).map((m) => m.category)));
    return cats.sort((a, b) =>
      (CATEGORY_METADATA[a]?.label || a).localeCompare(CATEGORY_METADATA[b]?.label || b)
    );
  }, [modules]);

  const modMap = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);

  const planStats = useMemo(() => {
    const out: Record<string, { included: number; addon: number; excluded: number }> = {};
    for (const plan of visiblePlans) {
      let included = 0;
      let addon = 0;
      let excluded = 0;
      for (const r of rows) {
        const st = r.perPlan[plan.id]?.state;
        if (st === 'included') included += 1;
        else if (st === 'optional_addon') addon += 1;
        else excluded += 1;
      }
      out[plan.id] = { included, addon, excluded };
    }
    return out;
  }, [visiblePlans, rows]);

  const formatCap = (n: number) => (n >= 999999 ? 'Unlimited' : n.toLocaleString());

  return (
    <div className="space-y-4">
      {/* Plan Commercial & Capacity Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visiblePlans.map((plan) => {
          const stats = planStats[plan.id] || { included: 0, addon: 0, excluded: 0 };
          const schoolCompatible =
            schoolTypeFilter === 'all' ||
            !plan.targetSchoolTypes ||
            plan.targetSchoolTypes.includes(schoolTypeFilter);

          return (
            <div
              key={plan.id}
              className={`p-4 rounded-xl border bg-card space-y-2 ${
                plan.isPopular ? 'border-primary/50 bg-primary/5' : 'border-border'
              } ${!schoolCompatible ? 'opacity-65' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {plan.tier} tier
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {plan.currency} {plan.priceMonthly}/mo
                </span>
              </div>
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                {plan.isPopular && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                {plan.name}
              </h4>
              <p className="text-xs font-medium text-foreground">
                {stats.included} included • {stats.addon} add-ons • {stats.excluded} excluded
              </p>
              <p className="text-[11px] text-muted-foreground">
                Limits: {formatCap(plan.maxStudents)} students, {formatCap(plan.maxStaff)} staff,{' '}
                {formatCap(plan.maxCampuses)} campuses, {plan.storageGb} GB
              </p>
              {!schoolCompatible && (
                <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Not configured for {schoolTypeFilter}
                </p>
              )}
              {plan.upgradeToPlanIds && plan.upgradeToPlanIds.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Upgrades: {plan.upgradeToPlanIds.join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-2.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_METADATA[c]?.label || c}
              </option>
            ))}
          </select>

          <select
            value={schoolTypeFilter}
            onChange={(e) => setSchoolTypeFilter(e.target.value as 'all' | CanonicalSchoolType)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            {SCHOOL_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyDiffering}
            onChange={(e) => setOnlyDiffering(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span>Show only tier-differentiating modules</span>
        </label>
      </div>

      {/* Live Comparison Table Derived From Saved Plans + Canonical Registry */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-3 px-4 font-semibold text-foreground min-w-[260px]">
                Canonical Module &amp; Maturity
              </th>
              <th className="py-3 px-3 font-semibold text-muted-foreground min-w-[160px]">
                Domain Category
              </th>
              {visiblePlans.map((plan) => (
                <th
                  key={plan.id}
                  className="py-3 px-4 font-semibold text-center text-foreground min-w-[125px]"
                >
                  <div>{plan.name}</div>
                  <div className="text-[10px] font-normal font-mono text-muted-foreground">
                    {plan.currency} {plan.priceMonthly}/mo
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => {
              const rawMod = modMap.get(row.moduleId);
              return (
                <tr key={row.moduleId} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => rawMod && onSelectModule && onSelectModule(rawMod)}
                        className="font-medium text-foreground hover:text-primary hover:underline flex items-center gap-1.5 text-left"
                      >
                        {row.moduleName}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </button>
                      {row.implementationMaturity === 'partial' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 text-[10px] font-medium">
                          Partial
                        </span>
                      )}
                      {row.availabilityStatus === 'deprecated' && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 text-[10px] font-medium">
                          Deprecated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {row.moduleId}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {CATEGORY_METADATA[row.category]?.label || row.category}
                  </td>
                  {visiblePlans.map((plan) => {
                    const cell = row.perPlan[plan.id];
                    return (
                      <td key={plan.id} className="py-3 px-4 text-center">
                        {cell?.state === 'included' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Included</span>
                          </span>
                        ) : cell?.state === 'optional_addon' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[11px] font-medium">
                            Add-on
                          </span>
                        ) : cell?.state === 'coming_soon' ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 text-[11px] font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Soon
                          </span>
                        ) : cell?.state === 'deprecated' || cell?.state === 'unsupported_school_type' ? (
                          <span className="inline-flex items-center gap-1 text-muted-foreground/70 text-[11px]">
                            <Ban className="w-3.5 h-3.5" />
                            {cell.label}
                          </span>
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/35 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={2 + visiblePlans.length} className="py-8 text-center text-muted-foreground">
                  No canonical modules matched the selected comparison filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
