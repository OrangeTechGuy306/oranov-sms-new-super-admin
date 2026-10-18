'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { downloadCsvFile, generateCsvContent } from '@/lib/utils/csv-export';
import { OrganizationSubscription, SubscriptionLifecycleStatus } from '@/lib/types';
import { canTransitionSubscriptionStatus, calculateDaysRemaining, CANONICAL_REFERENCE_DATE } from '@/lib/monetization/evaluator';
import {
  CreditCard,
  Layers,
  Clock,
  AlertTriangle,
  Download,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function PlatformSubscriptionsPage() {
  const {
    subscriptions,
    organizations,
    plans,
    invoices,
    payments,
    transitionSubscriptionStatus,
  } = usePlatformStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [cycleFilter, setCycleFilter] = useState<string>('all');

  // Quick Lifecycle Transition Modal
  const [transitioningSub, setTransitioningSub] = useState<OrganizationSubscription | null>(null);
  const [targetStatus, setTargetStatus] = useState<SubscriptionLifecycleStatus>('active');
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionError, setTransitionError] = useState('');

  // Metrics computation
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const trialCount = subscriptions.filter((s) => s.status === 'trialing').length;
  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length;
  const failedPaymentsCount = payments.filter((p) => p.status === 'failed').length;

  const totalOutstandingBalance = useMemo(() => {
    return invoices.reduce((acc, inv) => {
      const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
      return acc + balance;
    }, 0);
  }, [invoices]);

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const org = organizations.find((o) => o.id === sub.organizationId);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrg = org?.name.toLowerCase().includes(q) || org?.code.toLowerCase().includes(q);
        const matchSub = sub.id.toLowerCase().includes(q);
        if (!matchOrg && !matchSub) return false;
      }
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (planFilter !== 'all' && sub.planId !== planFilter) return false;
      if (cycleFilter !== 'all' && sub.billingCycle !== cycleFilter) return false;
      return true;
    });
  }, [subscriptions, organizations, searchQuery, statusFilter, planFilter, cycleFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Subscription ID',
      'Organization ID',
      'School Name',
      'Plan ID',
      'Status',
      'Billing Cycle',
      'Start Date',
      'Renewal / End Date',
      'Currency',
    ];
    const rows = filteredSubscriptions.map((s) => {
      const org = organizations.find((o) => o.id === s.organizationId);
      const plan = plans.find((p) => p.id === s.planId);
      return [
        s.id,
        s.organizationId,
        org ? org.name : 'Unknown School',
        s.planId,
        s.status,
        s.billingCycle,
        s.currentPeriodStart,
        s.currentPeriodEnd,
        plan?.currency || 'USD',
      ];
    });
    const csv = generateCsvContent(headers, rows);
    downloadCsvFile(`saas-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const openTransitionModal = (sub: OrganizationSubscription) => {
    setTransitioningSub(sub);
    setTransitionError('');
    setTransitionReason('');
    // Default next status
    if (sub.status === 'draft') setTargetStatus('trialing');
    else if (sub.status === 'trialing') setTargetStatus('active');
    else if (sub.status === 'active') setTargetStatus('past_due');
    else if (sub.status === 'past_due') setTargetStatus('suspended');
    else if (sub.status === 'suspended') setTargetStatus('active');
    else setTargetStatus('active');
  };

  const handleExecuteTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitioningSub) return;
    if (!transitionReason.trim()) {
      setTransitionError('Mandatory administrative reason required for audit traceability.');
      return;
    }

    const res = transitionSubscriptionStatus(
      transitioningSub.id,
      targetStatus,
      transitionReason.trim()
    );

    if (res.success) {
      setTransitioningSub(null);
    } else {
      setTransitionError(res.error || 'Failed to transition subscription status');
    }
  };

  const columns: Column<OrganizationSubscription>[] = [
    {
      key: 'organization',
      header: 'School Organization',
      render: (sub) => {
        const org = organizations.find((o) => o.id === sub.organizationId);
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {org ? org.code.slice(0, 2) : 'SO'}
            </div>
            <div>
              <Link
                href={`/subscriptions/${sub.id}`}
                className="font-bold text-foreground hover:text-primary hover:underline text-xs flex items-center gap-1"
              >
                {org ? org.name : 'Unknown School'}
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
              </Link>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <span>Code: {org?.code || '—'}</span>
                <span>•</span>
                <span>{sub.id}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'plan',
      header: 'Assigned Plan',
      render: (sub) => {
        const plan = plans.find((p) => p.id === sub.planId);
        const price = sub.billingCycle === 'annual' ? plan?.priceAnnual : plan?.priceMonthly;
        return (
          <div>
            <span className="font-semibold text-xs text-foreground block">
              {plan?.name || sub.planId}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {plan ? formatCurrency(price || 0, plan.currency) : '—'} / {sub.billingCycle}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (sub) => {
        return (
          <div className="space-y-1">
            <Badge status={sub.status} dot size="sm" />
            {sub.cancelAtPeriodEnd && (
              <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                Cancels at period end
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'period',
      header: 'Current Period & Renewal',
      render: (sub) => {
        const daysLeft = calculateDaysRemaining(sub.currentPeriodEnd, CANONICAL_REFERENCE_DATE);
        return (
          <div className="text-xs space-y-0.5">
            <div className="font-mono text-foreground font-medium">
              {formatDate(sub.currentPeriodEnd)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {daysLeft >= 0 ? `${daysLeft} days remaining` : `${Math.abs(daysLeft)} days overdue`}
            </div>
          </div>
        );
      },
    },
    {
      key: 'invoices',
      header: 'Invoices & Balance',
      render: (sub) => {
        const orgInvoices = invoices.filter((i) => i.organizationId === sub.organizationId);
        const orgBalance = orgInvoices.reduce((sum, inv) => {
          return sum + Math.max(0, inv.amountDue - (inv.amountPaid || 0));
        }, 0);
        const plan = plans.find((p) => p.id === sub.planId);
        const currency = plan?.currency || 'USD';

        return (
          <div className="text-xs">
            <span className="text-muted-foreground">
              {orgInvoices.length} {orgInvoices.length === 1 ? 'invoice' : 'invoices'}
            </span>
            <div className="font-mono font-medium">
              {orgBalance > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {formatCurrency(orgBalance, currency)} due
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">Settled</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Governance Actions',
      align: 'right',
      render: (sub) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openTransitionModal(sub)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Transition
          </button>
          <Link
            href={`/subscriptions/${sub.id}`}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1"
          >
            Details
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Subscriptions & Monetization Governance"
        description="Comprehensive platform subscription administration, lifecycle transition state machine, and financial ledger oversight."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Subscriptions CSV
            </button>
            <Link
              href="/subscriptions/plans/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              Define New Plan
            </Link>
          </div>
        }
      />

      {/* Sub-Navigation Tabs */}
      <SubscriptionNavTabs />

      {/* Simulation Banner */}
      <MonetizationSimulationBanner />

      {/* Metrics StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Paid Subscriptions"
          value={activeCount}
          subtitle="Organizations currently on paid tiers"
          icon={<CreditCard className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Trialing Organizations"
          value={trialCount}
          subtitle="In evaluation onboarding phase"
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Past Due Accounts"
          value={pastDueCount}
          subtitle={totalOutstandingBalance > 0 ? `Unsettled: ${formatCurrency(totalOutstandingBalance, 'USD')}` : 'All accounts settled'}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Failed Payment Alerts"
          value={failedPaymentsCount}
          subtitle="Requires administrative retry/review"
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by school organization name, school code, or subscription ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-none"
            >
              <option value="all">All Statuses ({subscriptions.length})</option>
              <option value="active">Active ({subscriptions.filter((s) => s.status === 'active').length})</option>
              <option value="trialing">Trialing ({subscriptions.filter((s) => s.status === 'trialing').length})</option>
              <option value="past_due">Past Due ({subscriptions.filter((s) => s.status === 'past_due').length})</option>
              <option value="suspended">Suspended ({subscriptions.filter((s) => s.status === 'suspended').length})</option>
              <option value="canceled">Canceled ({subscriptions.filter((s) => s.status === 'canceled').length})</option>
              <option value="draft">Draft ({subscriptions.filter((s) => s.status === 'draft').length})</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-none"
            >
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-none"
            >
              <option value="all">All Cycles</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <DataTable
          data={filteredSubscriptions}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyMessage="No organization subscriptions match the specified search query or filters."
        />
      </div>

      {/* Quick Status Transition Modal */}
      {transitioningSub && (
        <Modal
          isOpen={!!transitioningSub}
          onClose={() => setTransitioningSub(null)}
          title={`Simulate Lifecycle State Transition: ${transitioningSub.id}`}
        >
          <form onSubmit={handleExecuteTransition} className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">School Organization:</span>
                <span className="font-bold text-foreground">
                  {organizations.find((o) => o.id === transitioningSub.organizationId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current State:</span>
                <Badge status={transitioningSub.status} size="sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Target Lifecycle State:
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as SubscriptionLifecycleStatus)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
              >
                {(
                  ['draft', 'trialing', 'active', 'past_due', 'suspended', 'canceled', 'expired'] as SubscriptionLifecycleStatus[]
                ).map((st) => {
                  const allowed = canTransitionSubscriptionStatus(transitioningSub.status, st);
                  return (
                    <option key={st} value={st} disabled={!allowed}>
                      {st.toUpperCase()} {!allowed ? '(Invalid Transition)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Mandatory Administrative Reason & Audit Notes:
              </label>
              <textarea
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                placeholder="State the administrative justification for this simulated state machine transition..."
                rows={3}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                required
              />
            </div>

            {transitionError && (
              <p className="text-xs text-destructive font-medium">{transitionError}</p>
            )}

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Simulation Warning:</strong> This state transition updates the in-memory mock store and appends an administrative audit event. It does not disconnect real tenant infrastructure.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransitioningSub(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
              >
                Execute Transition
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
