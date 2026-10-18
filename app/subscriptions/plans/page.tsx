'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { formatCurrency } from '@/lib/utils/formatters';
import { getPlanModuleEntitlementsSummary } from '@/lib/monetization/evaluator';
import { MASTER_MODULE_REGISTRY } from '@/lib/modules/registry-data';
import {
  Check,
  Building2,
  Users,
  HardDrive,
  Plus,
  Layers,
  Settings,
  Search,
  Filter,
} from 'lucide-react';

export default function PlanCataloguePage() {
  const { plans, organizations } = usePlatformStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!plan.name.toLowerCase().includes(q) && !plan.id.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'all' && (plan.status || 'published') !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [plans, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plan Catalogue & Commercial Tiers"
        description="Standardized SaaS pricing plans, capacity quotas, campus ceilings, and canonical module entitlements."
        backUrl="/subscriptions"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs font-semibold border border-border">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-card text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-card text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1 rounded">Save 15%</span>
              </button>
            </div>

            <Link
              href="/subscriptions/plans/new"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Define New Plan
            </Link>
          </div>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plan catalogue by name, tier, or identifier..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-none"
          >
            <option value="all">All Plan Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
          const assignedCount = organizations.filter((o) => o.planId === plan.id).length;
          const entitlements = getPlanModuleEntitlementsSummary(plan);

          return (
            <div
              key={plan.id}
              className={`bg-card text-card-foreground rounded-2xl border p-6 flex flex-col justify-between shadow-xs transition-all relative ${
                plan.isPopular
                  ? 'border-primary ring-2 ring-primary/20 shadow-md'
                  : 'border-border'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular Tier
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{plan.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-muted text-muted-foreground">
                      {plan.status || 'published'}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {assignedCount} {assignedCount === 1 ? 'School' : 'Schools'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground min-h-[32px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">
                      {formatCurrency(price, plan.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                      Equivalent to {formatCurrency(Math.round(plan.priceAnnual / 12), plan.currency)}/month billed annually
                    </p>
                  )}
                </div>

                {/* Quota Highlights */}
                <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Student Capacity:
                    </span>
                    <strong className="text-foreground font-mono">
                      {plan.maxStudents > 50000 ? 'Unlimited' : plan.maxStudents.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      Campuses / Branches:
                    </span>
                    <strong className="text-foreground font-mono">
                      {plan.maxCampuses > 50 ? 'Unlimited' : plan.maxCampuses}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-primary" />
                      Cloud Storage:
                    </span>
                    <strong className="text-foreground font-mono">{plan.storageGb} GB</strong>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-1.5">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      Canonical Modules:
                    </span>
                    <strong className="text-foreground font-mono">
                      {entitlements.totalIncluded} of {MASTER_MODULE_REGISTRY.length} Included
                    </strong>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Included Capabilities:
                  </h4>
                  <ul className="space-y-2 text-xs text-foreground/90">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-[11px] text-muted-foreground italic pl-6">
                        + {plan.features.length - 4} additional entitlements
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/50 flex items-center gap-2">
                <Link
                  href={`/subscriptions/plans/${plan.id}`}
                  className="flex-1 py-2 px-3 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configure
                </Link>
                <Link
                  href="/organizations/new"
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    plan.isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Onboard
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
