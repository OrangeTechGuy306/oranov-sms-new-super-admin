'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { MASTER_MODULE_REGISTRY } from '@/lib/modules/registry-data';
import { validatePlanDefinition } from '@/lib/monetization/evaluator';
import { CreatePlanInput } from '@/lib/monetization/types';
import { PlanTier } from '@/lib/types';
import {
  Layers,
  Save,
  CheckSquare,
  Square,
  ShieldAlert,
  Plus,
  Trash2,
} from 'lucide-react';

export default function CreatePlanPage() {
  const router = useRouter();
  const { plans, createPlan } = usePlatformStore();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [tier, setTier] = useState<PlanTier>('growth');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [priceMonthly, setPriceMonthly] = useState<number>(399);
  const [priceAnnual, setPriceAnnual] = useState<number>(3990);
  const [priceQuarterly, setPriceQuarterly] = useState<number>(1099);
  const [maxCampuses, setMaxCampuses] = useState<number>(3);
  const [maxStudents, setMaxStudents] = useState<number>(1500);
  const [storageGb, setStorageGb] = useState<number>(100);
  const [isPopular, setIsPopular] = useState(false);

  // Selected module IDs from MASTER_MODULE_REGISTRY
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'mod_dashboard',
    'mod_students',
    'mod_attendance',
    'mod_finance',
    'mod_staff',
  ]);

  // Features list
  const [features, setFeatures] = useState<string[]>([
    'Multi-campus student administration',
    'Standard fee collections and invoicing',
    'Staff payroll management',
    'Canonical reporting & transcripts',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-slug ID from name if user hasn't explicitly customized it
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
    }
  };

  const handleSelectAllModules = () => {
    setSelectedModules(MASTER_MODULE_REGISTRY.map((m) => m.id));
  };

  const handleDeselectAllModules = () => {
    setSelectedModules([]);
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
      description: description.trim(),
      currency,
      priceMonthly: Number(priceMonthly),
      priceAnnual: Number(priceAnnual),
      priceQuarterly: Number(priceQuarterly),
      maxCampuses: Number(maxCampuses),
      maxStudents: Number(maxStudents),
      maxStaff: Math.max(10, Math.round(Number(maxStudents) / 10)),
      storageGb: Number(storageGb),
      isPopular,
      features,
      includedModuleIds: selectedModules,
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
        description="Configure commercial tiers, quotas, currency pricing, and canonical module entitlements."
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
            Plan Identification & Tier
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-foreground">Marketing & Commercial Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of who this plan is tailored for..."
                rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
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
          <h3 className="font-bold text-sm text-foreground">
            Commercial Pricing & Billing Cadence
          </h3>

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
          </div>
        </div>

        {/* Section 3: Capacity & Resource Ceilings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground">
            Capacity Ceilings & Quotas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Max Campuses / Branches *</label>
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
              <label className="font-semibold text-foreground">Max Students Capacity *</label>
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
              <label className="font-semibold text-foreground">Cloud Storage Allocation (GB) *</label>
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

        {/* Section 4: Canonical Module Entitlements Multi-Select */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Canonical Module Registry Entitlements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select which canonical modules from the master registry are included with this subscription tier.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAllModules}
                className="px-2.5 py-1 rounded border border-border bg-muted/50 text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Select All
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {MASTER_MODULE_REGISTRY.map((mod) => {
              const checked = selectedModules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => handleToggleModule(mod.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                    checked
                      ? 'bg-primary/5 border-primary/40 shadow-2xs'
                      : 'bg-muted/20 border-border/70 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{mod.name}</span>
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">{mod.id}</p>
                  <span className="inline-block mt-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {mod.category}
                  </span>
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
              Save Plan Definition
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
