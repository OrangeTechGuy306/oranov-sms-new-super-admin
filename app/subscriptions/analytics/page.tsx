'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { formatCurrency } from '@/lib/utils/formatters';
import { computeMonetizationAnalytics, calculateDaysRemaining, CANONICAL_REFERENCE_DATE } from '@/lib/monetization/evaluator';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  Layers,
  Clock,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function MonetizationAnalyticsPage() {
  const { subscriptions, plans, invoices, payments } = usePlatformStore();

  const analytics = useMemo(() => {
    return computeMonetizationAnalytics(
      subscriptions,
      plans,
      invoices,
      payments,
      CANONICAL_REFERENCE_DATE
    );
  }, [subscriptions, plans, invoices, payments]);

  const currencies = Object.keys(analytics.currencyBreakdown);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currencies[0] || 'USD');
  const [showDefinitions, setShowDefinitions] = useState(false);

  const aging = useMemo(() => {
    let current0to30 = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let days90Plus = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'void') return;
      if (inv.currency !== selectedCurrency) return;
      const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
      if (balance <= 0) return;

      const daysRemaining = calculateDaysRemaining(inv.dueDate, CANONICAL_REFERENCE_DATE);
      const daysOverdue = -daysRemaining;
      if (daysOverdue <= 0) {
        current0to30 += balance;
      } else if (daysOverdue <= 30) {
        current0to30 += balance;
      } else if (daysOverdue <= 60) {
        days31to60 += balance;
      } else if (daysOverdue <= 90) {
        days61to90 += balance;
      } else {
        days90Plus += balance;
      }
    });

    return { current0to30, days31to60, days61to90, days90Plus };
  }, [invoices, selectedCurrency]);

  const currentMetrics = analytics.currencyBreakdown[selectedCurrency] || {
    currency: selectedCurrency,
    mrr: 0,
    arr: 0,
    activePaidSubscriptions: 0,
    invoicedVolume: 0,
    collectedVolume: 0,
    outstandingBalance: 0,
    arpu: 0,
    overdueInvoiceCount: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monetization & Commercial Revenue Analytics"
        description="Platform recurring revenue (MRR/ARR), cohort subscription distributions, and currency-isolated receivables."
        backUrl="/subscriptions"
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Currency Isolation Selector */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-primary" />
            Isolated Currency Scope:
          </span>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs font-semibold">
            {currencies.map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setSelectedCurrency(curr)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-card text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {curr} Scope
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDefinitions(!showDefinitions)}
          className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          {showDefinitions ? 'Hide Metric Definitions' : 'View Metric Calculation Formulas & Boundaries'}
          {showDefinitions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Documented Metric Definitions Panel */}
      {showDefinitions && (
        <div className="p-5 bg-card border border-border rounded-xl space-y-4 text-xs">
          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Monetization Governance Metric Definitions & Scope Rules
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <strong className="text-foreground block">Monthly Recurring Revenue (MRR):</strong>
              <p>
                Sum of normalized monthly plan pricing for all <code>active</code> and <code>past_due</code> subscriptions in the selected currency. Annual subscriptions are divided by 12, quarterly by 3. Free trials and draft accounts are strictly excluded.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <strong className="text-foreground block">Annualized Run-Rate (ARR):</strong>
              <p>
                Calculated strictly as <code>MRR × 12</code> for the selected currency scope. Avoids multi-currency contamination.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <strong className="text-foreground block">Average Revenue Per Account (ARPU):</strong>
              <p>
                Calculated as <code>MRR ÷ Active Paid Subscriptions</code> in the current currency partition. Evaluates unit economic monetization efficiency.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <strong className="text-foreground block">Receivables & Aging:</strong>
              <p>
                Outstanding ledger balances partitioned into 0-30 days, 31-60 days, 61-90 days, and 90+ days past due. Voided invoices are excluded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Financial StatCards (Partitioned by Currency) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Monthly Recurring Revenue (${selectedCurrency})`}
          value={formatCurrency(currentMetrics.mrr, selectedCurrency)}
          subtitle={`Normalized monthly plan run-rate in ${selectedCurrency}`}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title={`Annualized Run-Rate (${selectedCurrency})`}
          value={formatCurrency(currentMetrics.arr, selectedCurrency)}
          subtitle="MRR multiplied by 12"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title={`Average Revenue / Account (${selectedCurrency})`}
          value={formatCurrency(currentMetrics.mrr / Math.max(1, analytics.activePaidSubscriptions), selectedCurrency)}
          subtitle={`Across ${analytics.activePaidSubscriptions} paid accounts`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title={`Outstanding Receivables (${selectedCurrency})`}
          value={formatCurrency(currentMetrics.totalOutstanding, selectedCurrency)}
          subtitle={`Invoiced: ${formatCurrency(currentMetrics.totalInvoiced, selectedCurrency)}`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Subscription Cohorts Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cohort Card 1: Subscription Lifecycle Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Platform Subscription Lifecycle Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Active Paid Subscriptions
              </span>
              <span className="font-mono font-bold text-foreground">{analytics.activePaidSubscriptions}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Trialing Onboarding Accounts
              </span>
              <span className="font-mono font-bold text-foreground">{analytics.trialingSubscriptions}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Past Due & Grace Period Subscriptions
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{analytics.pastDueSubscriptions}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                Canceled Subscriptions
              </span>
              <span className="font-mono font-bold text-muted-foreground">{analytics.canceledSubscriptions}</span>
            </div>
          </div>
        </div>

        {/* Cohort Card 2: Plan Tier Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Plan Adoption & Density
          </h3>

          <div className="space-y-3 text-xs">
            {analytics.subscriptionsByPlan.map((item) => {
              const percentage = Math.round((item.count / (analytics.totalSubscriptions || 1)) * 100) || 0;
              return (
                <div key={item.planId} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">{item.planName}</span>
                    <span className="font-mono text-muted-foreground">{item.count} schools ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invoice Receivables Aging Breakdown */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Invoice Aging Breakdown (Outstanding Balances)
        </h3>
        <p className="text-xs text-muted-foreground">
          Aging categories computed against standardized platform reference clock ({CANONICAL_REFERENCE_DATE.slice(0, 10)}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Current (0 - 30 Days)</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(aging.current0to30, selectedCurrency)}
            </div>
            <p className="text-[11px] text-muted-foreground">Within regular payment terms</p>
          </div>

          <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">31 - 60 Days Overdue</span>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatCurrency(aging.days31to60, selectedCurrency)}
            </div>
            <p className="text-[11px] text-muted-foreground">In active grace/reminder cycle</p>
          </div>

          <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">61 - 90 Days Overdue</span>
            <div className="text-xl font-bold font-mono text-destructive">
              {formatCurrency(aging.days61to90, selectedCurrency)}
            </div>
            <p className="text-[11px] text-muted-foreground">Escalated collection required</p>
          </div>

          <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">90+ Days (Severe Overdue)</span>
            <div className="text-xl font-bold font-mono text-destructive">
              {formatCurrency(aging.days90Plus, selectedCurrency)}
            </div>
            <p className="text-[11px] text-muted-foreground">Eligible for suspension / bad debt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
