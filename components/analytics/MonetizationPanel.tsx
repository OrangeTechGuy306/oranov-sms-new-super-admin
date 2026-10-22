'use client';

import React, { useState } from 'react';
import {
  SubscriptionsAnalyticsSummary,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MonetizationPanelProps {
  metrics: SubscriptionsAnalyticsSummary;
  filters: AnalyticsGlobalFilters;
  onCurrencyChange: (currency: string) => void;
}

export function MonetizationPanel({
  metrics,
  filters,
  onCurrencyChange,
}: MonetizationPanelProps) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const selectedCurr = metrics.selectedCurrency;
  const currStats = metrics.currencyBreakdown[selectedCurr] || {
    currency: selectedCurr,
    mrr: 0,
    arr: 0,
    arpu: 0,
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    activeAccounts: 0,
  };

  // Status breakdown for donut
  const statusItems = [
    { key: 'active', label: 'Active Paid', count: metrics.activePaidSubscriptions, percentage: Math.round((metrics.activePaidSubscriptions / Math.max(1, metrics.activePaidSubscriptions + metrics.trialingSubscriptions + metrics.pastDueSubscriptions + metrics.canceledSubscriptions)) * 100), colorHex: '#10b981' },
    { key: 'trialing', label: 'Trialing Accounts', count: metrics.trialingSubscriptions, percentage: Math.round((metrics.trialingSubscriptions / Math.max(1, metrics.activePaidSubscriptions + metrics.trialingSubscriptions + metrics.pastDueSubscriptions + metrics.canceledSubscriptions)) * 100), colorHex: '#3b82f6' },
    { key: 'past_due', label: 'Past Due / Dunning', count: metrics.pastDueSubscriptions, percentage: Math.round((metrics.pastDueSubscriptions / Math.max(1, metrics.activePaidSubscriptions + metrics.trialingSubscriptions + metrics.pastDueSubscriptions + metrics.canceledSubscriptions)) * 100), colorHex: '#f59e0b' },
    { key: 'canceled', label: 'Canceled / Churned', count: metrics.canceledSubscriptions, percentage: Math.round((metrics.canceledSubscriptions / Math.max(1, metrics.activePaidSubscriptions + metrics.trialingSubscriptions + metrics.pastDueSubscriptions + metrics.canceledSubscriptions)) * 100), colorHex: '#64748b' },
  ].filter((it) => it.count > 0);

  // Receivables aging breakdown
  const agingItems = [
    { key: '0_30', label: 'Current (0-30 Days)', count: metrics.receivablesAging.current0to30, percentage: 0, colorHex: '#10b981' },
    { key: '31_60', label: '31 - 60 Days Overdue', count: metrics.receivablesAging.days31to60, percentage: 0, colorHex: '#3b82f6' },
    { key: '61_90', label: '61 - 90 Days Overdue', count: metrics.receivablesAging.days61to90, percentage: 0, colorHex: '#f59e0b' },
    { key: '90_plus', label: '90+ Days (Severe Arrears)', count: metrics.receivablesAging.days90Plus, percentage: 0, colorHex: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Strict Currency Isolation Toolbar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Isolated Currency Scope:
          </span>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-semibold">
            {metrics.availableCurrencies.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrencyChange(c)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  selectedCurr === c
                    ? 'bg-card text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {c} Partition
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          {showFormulaDetails ? 'Hide Revenue Safeguards' : 'View Revenue Safeguards & Definitions'}
          {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Financial Safeguards Collapsible Panel */}
      {showFormulaDetails && (
        <div className="p-5 bg-card border border-border rounded-xl space-y-3 text-xs shadow-2xs">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Revenue Metric Safeguards and Integrity Disclaimers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
              <strong className="text-foreground block">Zero Multi-Currency Summation:</strong>
              <p>
                Revenues in USD, GBP, CAD, and EUR are strictly kept in isolated partitions. Adding amounts across currencies without audited live FX rates produces invalid financial reporting.
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
              <strong className="text-foreground block">Recognized vs Invoiced Volume:</strong>
              <p>
                Invoiced amounts do not equal collected cash. Overdue balances and unpaid dunning invoices are tracked separately and not counted towards realized receipts.
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
              <strong className="text-foreground block">Contracted MRR vs Active Usage:</strong>
              <p>
                MRR represents contracted plan prices divided by payment periodicity. It does not measure variable consumption or overage fees.
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
              <strong className="text-foreground block">Future Backend Integration Requirements:</strong>
              <p>
                Production ARR, true churn, customer lifetime value (LTV), and GAAP revenue recognition require integration with billing gateways (Stripe/Adyen) and financial ERP systems.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Financial StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Monthly Recurring Revenue (${selectedCurr})`}
          value={formatCurrency(currStats.mrr, selectedCurr)}
          subtitle={`Annualized ARR: ${formatCurrency(currStats.arr, selectedCurr)}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title={`Average Revenue / Account (${selectedCurr})`}
          value={formatCurrency(currStats.arpu, selectedCurr)}
          subtitle={`Evaluated across ${currStats.activeAccounts} active paid accounts`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title={`Cumulative Invoiced Volume (${selectedCurr})`}
          value={formatCurrency(currStats.totalInvoiced, selectedCurr)}
          subtitle={`Collected: ${formatCurrency(currStats.totalCollected, selectedCurr)}`}
          icon={<CreditCard className="w-5 h-5 text-purple-500" />}
        />

        <StatCard
          title={`Outstanding Receivables (${selectedCurr})`}
          value={formatCurrency(currStats.totalOutstanding, selectedCurr)}
          subtitle={`${metrics.pastDueSubscriptions} accounts in payment dunning`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          badge={{
            label: currStats.totalOutstanding > 0 ? 'Action Needed' : 'Ledger Balanced',
            variant: currStats.totalOutstanding > 0 ? 'warning' : 'success',
          }}
        />
      </div>

      {/* Subscription Cohorts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsDonutChart
          title="Subscription Lifecycle Distribution"
          description="Paid accounts, trial pipeline, grace periods, and canceled subscriptions."
          items={statusItems}
          centerLabel="Total Subs"
        />

        <AnalyticsBarChart
          title="Plan Tier Density & Distribution"
          description="Adoption across Enterprise Network, Growth Campus, and Starter Academy."
          items={metrics.planDistribution}
          unit="Subscriptions"
        />
      </div>

      {/* Receivables Aging Analysis */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Receivables Aging Analysis ({selectedCurr})
            </h4>
            <p className="text-xs text-muted-foreground">
              Unpaid invoice balances partitioned into chronological aging buckets.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            Total Overdue: {formatCurrency(currStats.totalOutstanding, selectedCurr)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {agingItems.map((ag) => (
            <div key={ag.key} className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                {ag.label}
              </span>
              <div className="text-lg font-bold font-mono text-foreground">
                {formatCurrency(ag.count, selectedCurr)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
