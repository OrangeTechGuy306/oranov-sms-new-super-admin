'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { validatePlanDefinition } from '@/lib/monetization/evaluator';
import { BillingFrequency, CreatePlanInput } from '@/lib/monetization/types';
import { CanonicalSchoolType } from '@/lib/modules/canonical-contract';
import { PlanTier } from '@/lib/types';
import {
  Layers,
  Save,
  CheckSquare,
  Square,
  ShieldAlert,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';

const SCHOOL_TYPES: Array<{ id: CanonicalSchoolType; label: string }> = [
  { id: 'nursery', label: 'Nursery' },
  { id: 'primary', label: 'Primary' },
  { id: 'secondary', label: 'Secondary' },
  { id: 'combined', label: 'Combined K-12' },
  { id: 'college', label: 'College / Tertiary' },
  { id: 'vocational', label: 'Vocational' },
  { id: 'international', label: 'International' },
];

export default function CreatePlanPage() {
  const router = useRouter();
  const { plans, modules, createPlan } = usePlatformStore();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [tier, setTier] = useState<PlanTier>('growth');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'internal_only'>('public');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [billingIntervals, setBillingIntervals] = useState<BillingFrequency[]>([
    'monthly',
    'quarterly',
    'annual',
  ]);
  const [priceMonthly, setPriceMonthly] = useState<number>(399);
  const [priceAnnual, setPriceAnnual] = useState<number>(3990);
  const [priceQuarterly, setPriceQuarterly] = useState<number>(1099);
  const [trialDays, setTrialDays] = useState<number>(14);
  const [maxCampuses, setMaxCampuses] = useState<number>(3);
  const [maxStudents, setMaxStudents] = useState<number>(1500);
  const [maxStaff, setMaxStaff] = useState<number>(120);
  const [storageGb, setStorageGb] = useState<number>(100);
  const [targetSchoolTypes, setTargetSchoolTypes] = useState<CanonicalSchoolType[]>([
    'primary',
    'secondary',
    'combined',
  ]);
  const [commercialPricingNote, setCommercialPricingNote] = useState(
    'Draft commercial tier created in local development store; requires Product Owner commercial sign-off.'
  );
  const [isPopular, setIsPopular] = useState(false);

  const [selectedModules, setSelectedModules] = useState<string[]>([
    'mod_dashboard',
    'mod_students',
    'mod_academics',
    'mod_attendance',
    'mod_finance',
    'mod_staff',
    'mod_settings',
  ]);
  const [optionalAddOns, setOptionalAddOns] = useState<string[]>([]);
  const [upgradeToPlanIds, setUpgradeToPlanIds] = useState<string[]>(['plan_enterprise']);
  const [downgradeToPlanIds, setDowngradeToPlanIds] = useState<string[]>(['plan_starter']);

  const [moduleSearch, setModuleSearch] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Multi-campus student administration',
    'Standard fee collections and invoicing',
    'Staff payroll management',
    'Canonical reporting & transcripts',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const modulesById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);

  const filteredModules = useMemo(() => {
    const q = moduleSearch.trim().toLowerCase();
    return modules.filter((m) => {
      if (m.availabilityStatus === 'deprecated') return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [modules, moduleSearch]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!id || id.startsWith('plan_')) {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 24);
      setId(`plan_${slug}`);
    }
  };

  const handleToggleModule = (modId: string) => {
    if (selectedModules.includes(modId)) {
      setSelectedModules(selectedModules.filter((m) => m !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
      setOptionalAddOns(optionalAddOns.filter((m) => m !== modId));
    }
  };

  const handleToggleAddOn = (modId: string) => {
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
    setSelectedModules(Array.from(next));
    setOptionalAddOns(optionalAddOns.filter((x) => !next.has(x)));
  };

  const handleSelectAllModules = () => {
    setSelectedModules(
      modules.filter((m) => m.availabilityStatus !== 'deprecated').map((m) => m.id)
    );
    setOptionalAddOns([]);
  };

  const handleDeselectAllModules = () => {
    setSelectedModules([]);
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

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const input: CreatePlanInput = {
      id: id.trim(),
      name: name.trim(),
      tier,
      status,
      visibility,
      description: description.trim(),
      currency,
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
      features,
      includedModuleIds: selectedModules,
      optionalAddOnModuleIds: optionalAddOns,
      upgradeToPlanIds,
      downgradeToPlanIds,
    };

    const validation = validatePlanDefinition(input, plans);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    const res = createPlan(input);
    if (res.success) {
      router.push('/subscriptions/plans');
    } else {
      setValidationErrors([res.error || 'Failed to create plan']);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Define New Subscription Plan"
        description="Configure commercial tiers, quotas, currency pricing, school compatibility, and canonical module entitlements."
        backUrl="/subscriptions/plans"
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      <form onSubmit={handleSubmit} className="space-y-6">
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
            <h4 className="font-bold flex items-center gap-1.5">
              Plan Definition Validation Errors:
            </h4>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 1: Core Plan Identity */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Plan Identification, Visibility &amp; Compatibility
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Plan Display Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Regional Multi-Campus Excellence"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Unique Plan Identifier (slug) *</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. plan_regional_excellence"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Commercial Tier *</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as PlanTier)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="starter">Starter Academy (Single-campus foundational)</option>
                <option value="growth">Growth Academy (Multi-branch expanding)</option>
                <option value="enterprise">Enterprise Collegiate (Comprehensive governance)</option>
                <option value="custom">Custom / Pilot Agreement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Catalogue Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="published">Published (Available for onboarding)</option>
                <option value="draft">Draft (Restricted to internal testing)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Visibility *</label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as 'public' | 'private' | 'internal_only')
                }
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="internal_only">Internal Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Trial Window (Days) *</label>
              <input
                type="number"
                min="0"
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="font-semibold text-foreground">Marketing &amp; Commercial Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of who this plan is tailored for..."
                rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="font-semibold text-foreground block">Target School Types</label>
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

            <div className="flex items-center gap-2 pt-2 md:col-span-2">
              <input
                type="checkbox"
                id="isPopularCheck"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-border text-primary"
              />
              <label htmlFor="isPopularCheck" className="text-xs text-foreground cursor-pointer font-medium">
                Highlight as &quot;Most Popular&quot; tier in onboarding workflows
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Currency */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-foreground">
              Commercial Pricing &amp; Billing Cadence
            </h3>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-muted-foreground">Enabled Intervals:</span>
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
              <label className="font-semibold text-foreground">Billing Currency *</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Monthly Price *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Annual Price (Pre-paid) *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceAnnual}
                onChange={(e) => setPriceAnnual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Quarterly Price</label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceQuarterly}
                onChange={(e) => setPriceQuarterly(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="font-semibold text-foreground">Commercial Policy Note</label>
              <input
                type="text"
                value={commercialPricingNote}
                onChange={(e) => setCommercialPricingNote(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Capacity & Resource Ceilings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground">
            Capacity Ceilings &amp; Quotas
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/50 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Eligible Upgrades:</span>
              <div className="flex flex-wrap gap-1.5">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setUpgradeToPlanIds(
                        upgradeToPlanIds.includes(p.id)
                          ? upgradeToPlanIds.filter((x) => x !== p.id)
                          : [...upgradeToPlanIds, p.id]
                      )
                    }
                    className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                      upgradeToPlanIds.includes(p.id)
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-border bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Eligible Downgrades:</span>
              <div className="flex flex-wrap gap-1.5">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setDowngradeToPlanIds(
                        downgradeToPlanIds.includes(p.id)
                          ? downgradeToPlanIds.filter((x) => x !== p.id)
                          : [...downgradeToPlanIds, p.id]
                      )
                    }
                    className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                      downgradeToPlanIds.includes(p.id)
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                        : 'border-border bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Canonical Module Entitlements Multi-Select */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Canonical Module Registry Entitlements ({selectedModules.length} Included • {optionalAddOns.length} Add-ons)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select canonical modules included in this plan or mark individual items as optional add-ons.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleAutoResolveDependencies}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer"
              >
                <Wand2 className="w-3 h-3" />
                Auto-Resolve Deps
              </button>
              <button
                type="button"
                onClick={handleSelectAllModules}
                className="px-2.5 py-1 rounded border border-border bg-muted/50 text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Select All Active
              </button>
              <button
                type="button"
                onClick={handleDeselectAllModules}
                className="px-2.5 py-1 rounded border border-border bg-muted/50 text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <input
            type="text"
            value={moduleSearch}
            onChange={(e) => setModuleSearch(e.target.value)}
            placeholder="Search canonical modules by ID, name, or category..."
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredModules.map((mod) => {
              const checked = selectedModules.includes(mod.id);
              const isAddOn = optionalAddOns.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  className={`p-3 rounded-xl border text-xs transition-all space-y-1.5 ${
                    checked
                      ? 'bg-primary/5 border-primary/40 shadow-2xs'
                      : isAddOn
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-muted/20 border-border/70 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => handleToggleModule(mod.id)}
                      className="flex items-start gap-2 cursor-pointer select-none flex-1 min-w-0"
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
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {isAddOn ? 'Add-on ✓' : '+ Add-on'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="neutral" className="text-[9px] uppercase">
                      {mod.category}
                    </Badge>
                    {(mod.implementationMaturity || mod.status) !== 'implemented' && (
                      <Badge variant="warning" className="text-[9px] capitalize">
                        {mod.implementationMaturity || mod.status}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Feature Highlights */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground">
            Catalogue Marketing Feature Highlights
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="Add key feature bullet point..."
              className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-lg text-xs"
              >
                <span className="text-foreground">{feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Plan definition is saved to the in-memory mock store and audit log.</span>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Create Subscription Plan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
