'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { formatDate } from '@/lib/utils/formatters';
import { OrganizationSubscription } from '@/lib/types';
import {
  calculateDaysRemaining,
  CANONICAL_REFERENCE_DATE,
  getRenewalStatus,
  getGracePeriodStatus,
} from '@/lib/monetization/evaluator';
import {
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Search,
} from 'lucide-react';

export default function RenewalsOversightPage() {
  const { subscriptions, organizations, plans } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<'renewals' | 'trials' | 'grace' | 'cancellations'>('renewals');
  const [searchQuery, setSearchQuery] = useState('');

  // Computations
  const upcomingRenewals = useMemo(() => {
    return subscriptions.filter((s) => {
      const renewal = getRenewalStatus(s, CANONICAL_REFERENCE_DATE);
      return renewal.isExpiringSoon && !s.cancelAtPeriodEnd;
    });
  }, [subscriptions]);

  const trialingSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => s.status === 'trialing');
  }, [subscriptions]);

  const graceSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const grace = getGracePeriodStatus(s, CANONICAL_REFERENCE_DATE);
      return grace.inGracePeriod;
    });
  }, [subscriptions]);

  const scheduledCancellations = useMemo(() => {
    return subscriptions.filter((s) => s.cancelAtPeriodEnd);
  }, [subscriptions]);

  // Tab data selection
  const currentDataset = useMemo(() => {
    let list: OrganizationSubscription[] = [];
    if (activeTab === 'renewals') list = upcomingRenewals;
    else if (activeTab === 'trials') list = trialingSubscriptions;
    else if (activeTab === 'grace') list = graceSubscriptions;
    else if (activeTab === 'cancellations') list = scheduledCancellations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => {
        const org = organizations.find((o) => o.id === s.organizationId);
        return org?.name.toLowerCase().includes(q) || org?.code.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      });
    }
    return list;
  }, [activeTab, upcomingRenewals, trialingSubscriptions, graceSubscriptions, scheduledCancellations, searchQuery, organizations]);

  const columns: Column<OrganizationSubscription>[] = [
    {
      key: 'organization',
      header: 'School Organization',
      render: (sub) => {
        const org = organizations.find((o) => o.id === sub.organizationId);
        return (
          <div>
            <Link
              href={`/subscriptions/${sub.id}`}
              className="font-bold text-xs text-foreground hover:text-primary hover:underline block"
            >
              {org ? org.name : 'Unknown School'}
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono">
              {org?.code || '—'} • {sub.id}
            </span>
          </div>
        );
      },
    },
    {
      key: 'plan',
      header: 'Assigned Plan',
      render: (sub) => {
        const plan = plans.find((p) => p.id === sub.planId);
        return (
          <span className="font-semibold text-xs text-foreground">
            {plan?.name || sub.planId}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (sub) => <Badge status={sub.status} size="sm" />,
    },
    {
      key: 'countdown',
      header: 'Days Remaining Horizon',
      render: (sub) => {
        const days = calculateDaysRemaining(sub.currentPeriodEnd, CANONICAL_REFERENCE_DATE);
        let badgeColor = 'text-foreground bg-muted';
        if (days < 0) badgeColor = 'text-destructive bg-destructive/10 border-destructive/20';
        else if (days <= 7) badgeColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20';
        else badgeColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';

        return (
          <div className="space-y-0.5">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${badgeColor}`}>
              {days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`}
            </span>
            <div className="text-[11px] text-muted-foreground font-mono">
              End Date: {formatDate(sub.currentPeriodEnd)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'cadence',
      header: 'Cadence',
      render: (sub) => (
        <span className="capitalize text-xs font-medium text-muted-foreground">
          {sub.billingCycle}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (sub) => (
        <Link
          href={`/subscriptions/${sub.id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Manage
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Renewals, Trials & Grace Periods Oversight"
        description="Temporal pipeline monitoring for upcoming subscription renewals, evaluation expiries, and grace period policies."
        backUrl="/subscriptions"
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Top StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Renewals Approaching"
          value={upcomingRenewals.length}
          subtitle="Next 30 calendar days horizon"
          icon={<Calendar className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Active Trial Cohort"
          value={trialingSubscriptions.length}
          subtitle="Evaluation accounts"
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Active Grace Periods"
          value={graceSubscriptions.length}
          subtitle="Overdue accounts within 14-day grace"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Pending Cancellations"
          value={scheduledCancellations.length}
          subtitle="Marked cancel at period end"
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('renewals')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'renewals'
                ? 'bg-card text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming Renewals ({upcomingRenewals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trials'
                ? 'bg-card text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Trial Evaluations ({trialingSubscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grace')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'grace'
                ? 'bg-card text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Grace Periods ({graceSubscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancellations')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cancellations'
                ? 'bg-card text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Scheduled Cancellations ({scheduledCancellations.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name or subscription..."
            className="pl-9 pr-4 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <DataTable
          data={currentDataset}
          columns={columns}
          keyExtractor={(sub) => sub.id}
          emptyMessage="No subscription records found in this category."
        />
      </div>

      {/* Reference Date Disclosure */}
      <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground flex items-center justify-between">
        <span>
          <strong>Canonical Reference Horizon:</strong> Deterministic baseline reference date is{' '}
          <code className="font-mono text-foreground font-semibold">{CANONICAL_REFERENCE_DATE.slice(0, 10)}</code> (Phase E-09.11 standardized clock).
        </span>
        <span className="text-[10px] uppercase font-bold text-muted-foreground">Deterministic Fixture</span>
      </div>
    </div>
  );
}
