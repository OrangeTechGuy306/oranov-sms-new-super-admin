'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { PlanComparisonMatrix } from '@/components/modules/PlanComparisonMatrix';
import { validatePlanDefinition } from '@/lib/monetization/evaluator';
import { BillingFrequency, SubscriptionPlanStatus, UpdatePlanInput } from '@/lib/monetization/types';
import { CanonicalSchoolType } from '@/lib/modules/canonical-contract';
import { Organization, SubscriptionPlan } from '@/lib/types';
import {
  Layers,
  Save,
  CheckSquare,
  Square,
  Building2,
  ShieldAlert,
  Sparkles,
  Wand2,
  AlertTriangle,
} from 'lucide-react';

interface PlanDetailClientProps {
  planId: string;
}

const SCHOOL_TYPES: Array<{ id: CanonicalSchoolType; label: string }> = [
  { id: 'nursery', label: 'Nursery / Early Years' },
  { id: 'primary', label: 'Primary School' },
  { id: 'secondary', label: 'Secondary School' },
  { id: 'combined', label: 'Combined K-12' },
  { id: 'college', label: 'College / Tertiary' },
  { id: 'vocational', label: 'Vocational' },
  { id: 'international', label: 'International' },
];

export function PlanDetailClient({ planId }: PlanDetailClientProps) {
  const { plans, organizations, modules, updatePlan } = usePlatformStore();

  const plan = plans.find((p) => p.id === planId);
  const assignedOrgs = organizations.filter((o) => o.planId === planId);

  if (!plan) {
    return (
      <div className="space-y-6">
        <PageHeader title="Plan Not Found" backUrl="/subscriptions/plans" />
        <EmptyState
          title="Plan Not Found"
          description={`No subscription plan with ID "${planId}" exists in the catalogue.`}
          action={
            <Link
              href="/subscriptions/plans"
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
            >
              Back to Plan Catalogue
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <PlanDetailEditor
      key={`${plan.id}-${plan.version ?? 1}-${plan.updatedAt ?? ''}`}
      plan={plan}
      plans={plans}
      assignedOrgs={assignedOrgs}
      modules={modules}
      updatePlan={updatePlan}
    />
  );
}

function PlanDetailEditor({
  plan,
  plans,
  assignedOrgs,
  modules,
  updatePlan,
}: {
  plan: SubscriptionPlan;
  plans: SubscriptionPlan[];
  assignedOrgs: Organization[];
  modules: ReturnType<typeof usePlatformStore>['modules'];
  updatePlan: ReturnType<typeof usePlatformStore>['updatePlan'];
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [status, setStatus] = useState<SubscriptionPlanStatus>(plan.status || 'published');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'internal_only'>(
    plan.visibility || 'public'
  );
  const [billingIntervals, setBillingIntervals] = useState<BillingFrequency[]>(
    plan.billingIntervals || ['monthly', 'annual']
  );
  const [priceMonthly, setPriceMonthly] = useState<number>(plan.priceMonthly);
  const [priceAnnual, setPriceAnnual] = useState<number>(plan.priceAnnual);
  const [priceQuarterly, setPriceQuarterly] = useState<number>(plan.priceQuarterly ?? 0);
  const [trialDays, setTrialDays] = useState<number>(plan.trialDays ?? 14);
  const [targetSchoolTypes, setTargetSchoolTypes] = useState<CanonicalSchoolType[]>(
    plan.targetSchoolTypes || ['primary', 'secondary', 'combined']
  );
  const [maxCampuses, setMaxCampuses] = useState<number>(plan.maxCampuses);
  const [maxStudents, setMaxStudents] = useState<number>(plan.maxStudents);
  const [maxStaff, setMaxStaff] = useState<number>(plan.maxStaff);
  const [storageGb, setStorageGb] = useState<number>(plan.storageGb);
  const [isPopular, setIsPopular] = useState<boolean>(plan.isPopular || false);
  const [commercialPricingNote, setCommercialPricingNote] = useState(
    plan.commercialPricingNote || ''
  );

  const [selectedModules, setSelectedModules] = useState<string[]>(plan.includedModuleIds || []);
  const [optionalAddOns, setOptionalAddOns] = useState<string[]>(plan.optionalAddOnModuleIds || []);
  const [upgradeToPlanIds, setUpgradeToPlanIds] = useState<string[]>(plan.upgradeToPlanIds || []);
  const [downgradeToPlanIds, setDowngradeToPlanIds] = useState<string[]>(plan.downgradeToPlanIds || []);

  const [moduleFilter, setModuleFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showMatrixPreview, setShowMatrixPreview] = useState(false);

  const modulesById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);

  const filteredModules = useMemo(() => {
    const q = moduleFilter.trim().toLowerCase();
    return modules.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [modules, moduleFilter]);

  const liveValidation = useMemo(() => {
    return validatePlanDefinition(
      {
        id: plan.id,
        name: name.trim(),
        tier: plan.tier,
        status,
        currency: plan.currency,
        priceMonthly: Number(priceMonthly),
        priceAnnual: Number(priceAnnual),
        priceQuarterly: Number(priceQuarterly),
        trialDays: Number(trialDays),
        maxCampuses: Number(maxCampuses),
        maxStudents: Number(maxStudents),
        maxStaff: Number(maxStaff),
        storageGb: Number(storageGb),
        includedModuleIds: selectedModules,
        optionalAddOnModuleIds: optionalAddOns,
        upgradeToPlanIds,
        downgradeToPlanIds,
      },
      plans
    );
  }, [
    plan.id,
    plan.tier,
    plan.currency,
    plans,
    name,
    status,
    priceMonthly,
    priceAnnual,
    priceQuarterly,
    trialDays,
    maxCampuses,
    maxStudents,
    maxStaff,
    storageGb,
    selectedModules,
    optionalAddOns,
    upgradeToPlanIds,
    downgradeToPlanIds,
  ]);

  const hasUnsavedChanges = useMemo(() => {
    const sortJoin = (arr?: string[]) => [...(arr || [])].sort().join(',');
    return (
      name.trim() !== plan.name ||
      description.trim() !== plan.description ||
      status !== (plan.status || 'published') ||
      visibility !== (plan.visibility || 'public') ||
      Number(priceMonthly) !== plan.priceMonthly ||
      Number(priceAnnual) !== plan.priceAnnual ||
      Number(priceQuarterly) !== (plan.priceQuarterly ?? 0) ||
      Number(trialDays) !== (plan.trialDays ?? 14) ||
      Number(maxCampuses) !== plan.maxCampuses ||
      Number(maxStudents) !== plan.maxStudents ||
      Number(maxStaff) !== plan.maxStaff ||
      Number(storageGb) !== plan.storageGb ||
      isPopular !== (plan.isPopular || false) ||
      commercialPricingNote.trim() !== (plan.commercialPricingNote || '') ||
      sortJoin(targetSchoolTypes) !== sortJoin(plan.targetSchoolTypes) ||
      sortJoin(billingIntervals) !== sortJoin(plan.billingIntervals || ['monthly', 'annual']) ||
      sortJoin(selectedModules) !== sortJoin(plan.includedModuleIds) ||
      sortJoin(optionalAddOns) !== sortJoin(plan.optionalAddOnModuleIds) ||
      sortJoin(upgradeToPlanIds) !== sortJoin(plan.upgradeToPlanIds) ||
      sortJoin(downgradeToPlanIds) !== sortJoin(plan.downgradeToPlanIds)
    );
  }, [
    plan,
    name,
    description,
    status,
    visibility,
    priceMonthly,
    priceAnnual,
    priceQuarterly,
    trialDays,
    maxCampuses,
    maxStudents,
    maxStaff,
    storageGb,
    isPopular,
    commercialPricingNote,
    targetSchoolTypes,
    billingIntervals,
    selectedModules,
    optionalAddOns,
    upgradeToPlanIds,
    downgradeToPlanIds,
  ]);

  const handleToggleModule = (modId: string) => {
    setErrorMessage('');
    if (selectedModules.includes(modId)) {
      setSelectedModules(selectedModules.filter((m) => m !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
      setOptionalAddOns(optionalAddOns.filter((m) => m !== modId));
    }
  };

  const handleToggleAddOn = (modId: string) => {
    setErrorMessage('');
    if (optionalAddOns.includes(modId)) {
      setOptionalAddOns(optionalAddOns.filter((m) => m !== modId));
    } else {
      setOptionalAddOns([...optionalAddOns, modId]);
      setSelectedModules(selectedModules.filter((m) => m !== modId));
    }
  };

  const handleAutoResolveDependencies = () => {
    const next = new Set(selectedModules);
    let changed = true;
    while (changed) {
      changed = false;
      for (const modId of Array.from(next)) {
        const mod = modulesById.get(modId);
        if (!mod) continue;
        if (mod.parentId && !next.has(mod.parentId)) {
          next.add(mod.parentId);
          changed = true;
        }
        for (const dep of mod.dependencies || []) {
          if (dep.type === 'required' && !next.has(dep.moduleId)) {
            next.add(dep.moduleId);
            changed = true;
          }
        }
      }
    }
    const resolved = Array.from(next);
    setSelectedModules(resolved);
    setOptionalAddOns(optionalAddOns.filter((id) => !next.has(id)));
  };

  const toggleInterval = (interval: BillingFrequency) => {
    if (billingIntervals.includes(interval)) {
      if (billingIntervals.length === 1) return;
      setBillingIntervals(billingIntervals.filter((i) => i !== interval));
    } else {
      setBillingIntervals([...billingIntervals, interval]);
    }
  };

  const toggleSchoolType = (st: CanonicalSchoolType) => {
    if (targetSchoolTypes.includes(st)) {
      if (targetSchoolTypes.length === 1) return;
      setTargetSchoolTypes(targetSchoolTypes.filter((s) => s !== st));
    } else {
      setTargetSchoolTypes([...targetSchoolTypes, st]);
    }
  };

  const commitSave = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!liveValidation.isValid) {
      setErrorMessage(liveValidation.errors[0] || 'Plan validation failed.');
      return;
    }

    const updates: UpdatePlanInput = {
      name: name.trim(),
      description: description.trim(),
      status,
      visibility,
      billingIntervals,
      priceMonthly: Number(priceMonthly),
      priceAnnual: Number(priceAnnual),
      priceQuarterly: Number(priceQuarterly),
      trialDays: Number(trialDays),
      targetSchoolTypes,
      maxCampuses: Number(maxCampuses),
      maxStudents: Number(maxStudents),
      maxStaff: Number(maxStaff),
      storageGb: Number(storageGb),
      isPopular,
      commercialPricingNote: commercialPricingNote.trim() || undefined,
      includedModuleIds: selectedModules,
      optionalAddOnModuleIds: optionalAddOns,
      upgradeToPlanIds,
      downgradeToPlanIds,
    };

    const res = updatePlan(plan.id, updates);
    if (res.success) {
      setSuccessMessage('Plan configuration updated in local demonstration store. Matrix comparison and entitlement evaluators reflect the new entitlements immediately.');
      setShowArchiveConfirm(false);
    } else {
      setErrorMessage(res.error || 'Failed to update plan.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isDestructiveStatusChange =
      (plan.status === 'published' || !plan.status) &&
      (status === 'archived' || status === 'deprecated');

    if (isDestructiveStatusChange) {
      setShowArchiveConfirm(true);
      return;
    }

    commitSave();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Plan Configuration: ${plan.name}`}
        description={`Manage commercial terms, quotas, school compatibility, and canonical module entitlements for ${plan.id}.`}
        backUrl="/subscriptions/plans"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="warning" size="md">
                Unsaved Edits
              </Badge>
            )}
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-muted text-muted-foreground uppercase">
              {plan.id} • v{plan.version ?? 1}
            </span>
            <Badge variant="neutral" size="md">
              {assignedOrgs.length} {assignedOrgs.length === 1 ? 'School Subscribed' : 'Schools Subscribed'}
            </Badge>
            <button
              type="button"
              onClick={() => setShowMatrixPreview((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted cursor-pointer"
            >
              {showMatrixPreview ? 'Hide Comparison Preview' : 'Preview Live Comparison'}
            </button>
          </div>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      <form onSubmit={handleSave} className="space-y-6">
        {errorMessage && (
          <AlertBanner variant="error" title="Plan Validation Failed">
            {errorMessage}
          </AlertBanner>
        )}

        {successMessage && (
          <AlertBanner variant="info" title="Simulated Plan Update Saved">
            {successMessage}
          </AlertBanner>
        )}

        {!liveValidation.isValid && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Live Canonical Graph Warnings ({liveValidation.errors.length})
              </span>
              <button
                type="button"
                onClick={handleAutoResolveDependencies}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-primary-foreground text-[11px] font-bold hover:bg-primary/90 cursor-pointer"
              >
                <Wand2 className="w-3 h-3" />
                Auto-Include Parents &amp; Required Deps
              </button>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {liveValidation.errors.slice(0, 6).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {liveValidation.errors.length > 6 && (
                <li>+ {liveValidation.errors.length - 6} additional validation items...</li>
              )}
            </ul>
          </div>
        )}

        {/* Section 1: Core Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Plan Identity, Visibility &amp; Lifecycle
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Plan Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Commercial Tier</label>
              <input
                type="text"
                value={plan.tier.toUpperCase()}
                disabled
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground font-mono focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Catalogue Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionPlanStatus)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="deprecated">Deprecated</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Plan Visibility</label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as 'public' | 'private' | 'internal_only')
                }
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="public">Public (Standard Catalogue)</option>
                <option value="private">Private (Invite / Custom Contract)</option>
                <option value="internal_only">Internal Pilot Only</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="font-semibold text-foreground">Plan Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Trial Duration (Days)</label>
              <input
                type="number"
                min="0"
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="font-semibold text-foreground block">
                Supported School Types (Tenant Compatibility)
              </label>
              <div className="flex flex-wrap gap-2">
                {SCHOOL_TYPES.map((st) => {
                  const active = targetSchoolTypes.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleSchoolType(st.id)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 md:col-span-2">
              <input
                type="checkbox"
                id="isPopularToggle"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-border text-primary"
              />
              <label htmlFor="isPopularToggle" className="text-xs text-foreground cursor-pointer font-medium">
                Mark as Most Popular Tier
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-foreground">
              Pricing Configuration ({plan.currency})
            </h3>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-muted-foreground">Intervals:</span>
              {(['monthly', 'quarterly', 'annual'] as BillingFrequency[]).map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => toggleInterval(interval)}
                  className={`px-2 py-0.5 rounded border capitalize cursor-pointer ${
                    billingIntervals.includes(interval)
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Monthly Billing Price *</label>
              <input
                type="number"
                min="0"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Quarterly Billing Price</label>
              <input
                type="number"
                min="0"
                value={priceQuarterly}
                onChange={(e) => setPriceQuarterly(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Annual Billing Price *</label>
              <input
                type="number"
                min="0"
                value={priceAnnual}
                onChange={(e) => setPriceAnnual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Currency</label>
              <input
                type="text"
                value={plan.currency}
                disabled
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground font-mono focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="font-semibold text-foreground">Commercial Policy / Product Owner Note</label>
              <input
                type="text"
                value={commercialPricingNote}
                onChange={(e) => setCommercialPricingNote(e.target.value)}
                placeholder="e.g. Unlisted add-on SKUs require Product Owner pricing configuration before production GA."
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Quotas */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground">
            Capacity Quotas &amp; Ceilings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Max Campuses *</label>
              <input
                type="number"
                min="1"
                value={maxCampuses}
                onChange={(e) => setMaxCampuses(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Max Students *</label>
              <input
                type="number"
                min="1"
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Max Staff *</label>
              <input
                type="number"
                min="1"
                value={maxStaff}
                onChange={(e) => setMaxStaff(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Cloud Storage (GB) *</label>
              <input
                type="number"
                min="1"
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3.5: Upgrade & Downgrade Paths */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs text-xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Upgrade &amp; Downgrade Transition Eligibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="font-semibold text-foreground block">Eligible Upgrade Targets:</span>
              <div className="flex flex-wrap gap-2">
                {plans
                  .filter((p) => p.id !== plan.id)
                  .map((other) => {
                    const checked = upgradeToPlanIds.includes(other.id);
                    return (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() =>
                          setUpgradeToPlanIds(
                            checked
                              ? upgradeToPlanIds.filter((id) => id !== other.id)
                              : [...upgradeToPlanIds, other.id]
                          )
                        }
                        className={`px-2.5 py-1 rounded border text-[11px] cursor-pointer ${
                          checked
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {other.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-foreground block">Eligible Downgrade Targets:</span>
              <div className="flex flex-wrap gap-2">
                {plans
                  .filter((p) => p.id !== plan.id)
                  .map((other) => {
                    const checked = downgradeToPlanIds.includes(other.id);
                    return (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() =>
                          setDowngradeToPlanIds(
                            checked
                              ? downgradeToPlanIds.filter((id) => id !== other.id)
                              : [...downgradeToPlanIds, other.id]
                          )
                        }
                        className={`px-2.5 py-1 rounded border text-[11px] cursor-pointer ${
                          checked
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {other.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Canonical Module Selection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Canonical Module &amp; Add-On Entitlements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign included modules or mark them as optional commercial add-ons. Editing triggers immediate recomputation across matrices and evaluators.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded">
                {selectedModules.length} Included
              </span>
              <span className="font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded">
                {optionalAddOns.length} Optional Add-ons
              </span>
              <button
                type="button"
                onClick={handleAutoResolveDependencies}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-muted/40 hover:bg-muted font-semibold cursor-pointer"
              >
                <Wand2 className="w-3 h-3 text-primary" />
                Auto-Resolve Dependencies
              </button>
            </div>
          </div>

          <input
            type="text"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            placeholder="Filter modules by name, ID, or category..."
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredModules.map((mod) => {
              const checked = selectedModules.includes(mod.id);
              const isAddOn = optionalAddOns.includes(mod.id);
              const isDeprecated = mod.availabilityStatus === 'deprecated';
              const maturity = mod.implementationMaturity || mod.status;

              return (
                <div
                  key={mod.id}
                  className={`p-3 rounded-xl border text-xs transition-all space-y-2 ${
                    checked
                      ? 'bg-primary/5 border-primary/40 shadow-2xs'
                      : isAddOn
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-muted/20 border-border/70 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => handleToggleModule(mod.id)}
                      className="flex items-start gap-2 cursor-pointer flex-1 min-w-0"
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">{mod.name}</span>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{mod.id}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAddOn(mod.id)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 cursor-pointer ${
                        isAddOn
                          ? 'border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-300'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                      title="Toggle Optional Add-on eligibility"
                    >
                      {isAddOn ? 'Add-on ✓' : '+ Add-on'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {maturity !== 'implemented' && (
                      <Badge variant="warning" className="text-[9px] capitalize">
                        Maturity: {maturity}
                      </Badge>
                    )}
                    {isDeprecated && (
                      <Badge variant="error" className="text-[9px]">
                        Deprecated
                      </Badge>
                    )}
                    {mod.parentId && (
                      <span className="text-[9px] font-mono text-muted-foreground">
                        Parent: {mod.parentId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Assigned Organizations */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Organizations Subscribed to this Plan ({assignedOrgs.length})
          </h3>

          {assignedOrgs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tenant schools are currently assigned to this plan.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {assignedOrgs.map((org) => (
                <div
                  key={org.id}
                  className="p-3 bg-muted/20 border border-border rounded-lg text-xs flex items-center justify-between"
                >
                  <div>
                    <Link
                      href={`/organizations/${org.id}`}
                      className="font-bold text-foreground hover:text-primary hover:underline"
                    >
                      {org.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono">{org.code}</p>
                  </div>
                  <Badge status={org.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Changes update the in-memory client platform store (simulated). Production billing &amp; plan versioning require backend API persistence.</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/subscriptions/plans"
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!liveValidation.isValid}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Simulated Changes
            </button>
          </div>
        </div>
      </form>

      {showMatrixPreview && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">
            Live Canonical Plan Comparison Matrix Preview
          </h3>
          <PlanComparisonMatrix modules={modules} includeDraftPlans />
        </div>
      )}

      {/* Confirmation Modal for Destructive Archive / Deprecate Transition */}
      {showArchiveConfirm && (
        <Modal
          isOpen={showArchiveConfirm}
          onClose={() => setShowArchiveConfirm(false)}
          title={`Confirm Plan Lifecycle Transition: ${status.toUpperCase()}`}
        >
          <div className="space-y-4 text-xs">
            <AlertBanner variant="warning" title="Commercial Lifecycle Impact">
              Transitioning <strong>{plan.name}</strong> from <strong>published</strong> to{' '}
              <strong>{status}</strong> will remove it from new public onboarding choices.{' '}
              {assignedOrgs.length > 0
                ? `${assignedOrgs.length} subscribed organization(s) currently depend on this plan and will require migration planning.`
                : 'No active organizations are currently assigned.'}
            </AlertBanner>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-border font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitSave}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
              >
                Confirm {status === 'archived' ? 'Archive' : 'Deprecate'} (Simulated)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
