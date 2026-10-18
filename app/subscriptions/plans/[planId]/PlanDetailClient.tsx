'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { MASTER_MODULE_REGISTRY } from '@/lib/modules/registry-data';
import { UpdatePlanInput } from '@/lib/monetization/types';
import {
  Layers,
  Save,
  CheckSquare,
  Square,
  Building2,
  ShieldAlert,
} from 'lucide-react';

interface PlanDetailClientProps {
  planId: string;
}

export function PlanDetailClient({ planId }: PlanDetailClientProps) {
  const { plans, organizations, updatePlan } = usePlatformStore();

  const plan = plans.find((p) => p.id === planId);
  const assignedOrgs = organizations.filter((o) => o.planId === planId);

  const [name, setName] = useState(plan?.name || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(plan?.status || 'published');
  const [priceMonthly, setPriceMonthly] = useState<number>(plan?.priceMonthly || 0);
  const [priceAnnual, setPriceAnnual] = useState<number>(plan?.priceAnnual || 0);
  const [maxCampuses, setMaxCampuses] = useState<number>(plan?.maxCampuses || 1);
  const [maxStudents, setMaxStudents] = useState<number>(plan?.maxStudents || 100);
  const [storageGb, setStorageGb] = useState<number>(plan?.storageGb || 10);
  const [isPopular, setIsPopular] = useState<boolean>(plan?.isPopular || false);

  const [selectedModules, setSelectedModules] = useState<string[]>(plan?.includedModuleIds || []);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleToggleModule = (modId: string) => {
    if (selectedModules.includes(modId)) {
      setSelectedModules(selectedModules.filter((m) => m !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Plan name cannot be empty.');
      return;
    }
    if (priceMonthly < 0 || priceAnnual < 0) {
      setErrorMessage('Plan pricing cannot be negative.');
      return;
    }

    const updates: UpdatePlanInput = {
      name: name.trim(),
      description: description.trim(),
      status,
      priceMonthly: Number(priceMonthly),
      priceAnnual: Number(priceAnnual),
      maxCampuses: Number(maxCampuses),
      maxStudents: Number(maxStudents),
      storageGb: Number(storageGb),
      isPopular,
      includedModuleIds: selectedModules,
    };

    const res = updatePlan(plan.id, updates);
    if (res.success) {
      setSuccessMessage('Plan configuration updated successfully in demonstration store.');
    } else {
      setErrorMessage(res.error || 'Failed to update plan.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Plan Configuration: ${plan.name}`}
        description={`Manage commercial terms, pricing, capacity quotas, and canonical module entitlements for ${plan.id}.`}
        backUrl="/subscriptions/plans"
        actions={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-muted text-muted-foreground uppercase">
              {plan.id}
            </span>
            <Badge variant="neutral" size="md">
              {assignedOrgs.length} {assignedOrgs.length === 1 ? 'School Subscribed' : 'Schools Subscribed'}
            </Badge>
          </div>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      <form onSubmit={handleSave} className="space-y-6">
        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            {successMessage}
          </div>
        )}

        {/* Section 1: Core Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Plan Identity & Lifecycle
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
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
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
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

            <div className="flex items-center gap-2 pt-1">
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
          <h3 className="font-bold text-sm text-foreground">
            Pricing Configuration ({plan.currency})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
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
          </div>
        </div>

        {/* Section 3: Quotas */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground">
            Capacity Quotas & Ceilings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
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

        {/* Section 4: Canonical Modules */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Canonical Module Registry Entitlements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle canonical modules included with this plan tier.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded">
              {selectedModules.length} selected
            </span>
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
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Changes update the in-memory platform store fixture.</span>
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
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
