'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { InvoicePrintModal } from '@/components/monetization/InvoicePrintModal';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Invoice, PaymentRecord, PaymentMethodType, SubscriptionLifecycleStatus } from '@/lib/types';
import {
  canTransitionSubscriptionStatus,
  calculateDaysRemaining,
  CANONICAL_REFERENCE_DATE,
  getGracePeriodStatus,
  getPlanModuleEntitlementsSummary,
} from '@/lib/monetization/evaluator';
import { MASTER_MODULE_REGISTRY } from '@/lib/modules/registry-data';
import {
  Building2,
  Layers,
  ShieldAlert,
  CheckCircle2,
  History,
  FileText,
  DollarSign,
  RefreshCw,
  Printer,
} from 'lucide-react';

interface SubscriptionDetailClientProps {
  subscriptionId: string;
}

export function SubscriptionDetailClient({ subscriptionId }: SubscriptionDetailClientProps) {
  const {
    getSubscriptionById,
    getOrganizationById,
    plans,
    invoices,
    payments,
    getSubscriptionEvents,
    transitionSubscriptionStatus,
    recordPayment,
    retryPayment,
  } = usePlatformStore();

  const subscription = getSubscriptionById(subscriptionId);
  const org = subscription ? getOrganizationById(subscription.organizationId) : undefined;
  const plan = plans.find((p) => p.id === subscription?.planId);
  const events = getSubscriptionEvents(subscriptionId);

  // Invoices & payments for this subscription/organization
  const orgInvoices = invoices.filter((i) => i.organizationId === subscription?.organizationId);
  const orgPayments = payments.filter((p) => p.organizationId === subscription?.organizationId);

  // Lifecycle Transition Modal State
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<SubscriptionLifecycleStatus>('active');
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionError, setTransitionError] = useState('');

  // Payment Recording Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Invoice Print Preview Modal State
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  if (!subscription) {
    return (
      <div className="space-y-6">
        <PageHeader title="Subscription Not Found" backUrl="/subscriptions" />
        <EmptyState
          title="Subscription Record Not Found"
          description={`No subscription with identifier "${subscriptionId}" exists in the platform repository.`}
          action={
            <Link
              href="/subscriptions"
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
            >
              Return to Subscriptions Hub
            </Link>
          }
        />
      </div>
    );
  }

  const daysToRenewal = calculateDaysRemaining(subscription.currentPeriodEnd, CANONICAL_REFERENCE_DATE);
  const graceInfo = getGracePeriodStatus(subscription, CANONICAL_REFERENCE_DATE);

  // Canonical entitlements
  const entitlementsSummary = plan
    ? getPlanModuleEntitlementsSummary(plan)
    : { totalIncluded: 0, includedModules: [], categoriesCount: 0, missingModuleIds: [] };
  const includedIds = new Set(entitlementsSummary.includedModules.map((m) => m.id));

  const handleOpenTransitionModal = () => {
    setTransitionError('');
    setTransitionReason('');
    if (subscription.status === 'trialing') setTargetStatus('active');
    else if (subscription.status === 'active') setTargetStatus('past_due');
    else if (subscription.status === 'past_due') setTargetStatus('suspended');
    else if (subscription.status === 'suspended') setTargetStatus('active');
    else setTargetStatus('active');
    setShowTransitionModal(true);
  };

  const handleExecuteTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionReason.trim()) {
      setTransitionError('Mandatory administrative reason required for audit traceability.');
      return;
    }

    const res = transitionSubscriptionStatus(
      subscription.id,
      targetStatus,
      transitionReason.trim()
    );

    if (res.success) {
      setShowTransitionModal(false);
    } else {
      setTransitionError(res.error || 'Failed to execute transition');
    }
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    setPayError('');

    const res = recordPayment({
      invoiceId: paymentModalInvoice.id,
      amount: Number(payAmount),
      method: payMethod,
      referenceNumber: payRef || `PAY-REC-${Date.now().toString().slice(-6)}`,
      notes: payNotes,
    });

    if (res.success) {
      setPaymentModalInvoice(null);
    } else if (res.error) {
      setPayError(res.error);
    }
  };

  const handleRetryPayment = (paymentId: string) => {
    retryPayment(paymentId);
  };

  // Invoice Columns
  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => <span className="font-mono font-bold text-xs text-foreground">{inv.invoiceNumber}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <Badge status={inv.status} size="sm" />,
    },
    {
      key: 'dates',
      header: 'Issue / Due Date',
      render: (inv) => (
        <div className="text-xs text-muted-foreground font-mono">
          <span>{formatDate(inv.issueDate)}</span>
          <span className="mx-1">→</span>
          <span className="text-foreground">{formatDate(inv.dueDate)}</span>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Invoice Total',
      render: (inv) => (
        <span className="font-mono font-bold text-xs text-foreground">
          {formatCurrency(inv.amountDue, inv.currency)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance Due',
      render: (inv) => {
        const bal = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
        return (
          <span className={`font-mono text-xs font-bold ${bal > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(bal, inv.currency)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => {
        const bal = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setPrintInvoice(inv)}
              className="p-1.5 text-xs rounded border border-border text-foreground hover:bg-muted"
              title="View / Print Demo Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            {bal > 0 && inv.status !== 'void' && (
              <button
                type="button"
                onClick={() => {
                  setPaymentModalInvoice(inv);
                  setPayAmount(bal);
                  setPayError('');
                }}
                className="px-2 py-1 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Record Payment
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Payment Columns
  const paymentColumns: Column<PaymentRecord>[] = [
    {
      key: 'id',
      header: 'Transaction Ref',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-xs text-foreground block">{p.referenceNumber || p.id}</span>
          <span className="text-[10px] text-muted-foreground font-mono">ID: {p.id}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Settled',
      render: (p) => (
        <span className="font-mono font-bold text-xs text-foreground">
          {formatCurrency(p.amount, p.currency)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (p) => (
        <span className="capitalize text-xs text-muted-foreground">
          {p.method.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge status={p.status} size="sm" />,
    },
    {
      key: 'processedAt',
      header: 'Processed At',
      render: (p) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(p.processedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Recovery',
      align: 'right',
      render: (p) => {
        if (p.status === 'failed') {
          return (
            <button
              type="button"
              onClick={() => handleRetryPayment(p.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
            >
              <RefreshCw className="w-3 h-3" />
              Simulate Retry
            </button>
          );
        }
        return <span className="text-[11px] text-muted-foreground">Settled</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Subscription Governance: ${subscription.id}`}
        description={`Commercial relationship and lifecycle administration for ${org?.name || 'School Organization'}.`}
        backUrl="/subscriptions"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/organizations/${subscription.organizationId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted"
            >
              <Building2 className="w-3.5 h-3.5" />
              View School Profile
            </Link>
            <button
              type="button"
              onClick={handleOpenTransitionModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Simulate State Transition
            </button>
          </div>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Top Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Lifecycle & State */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Current Lifecycle State
            </span>
            <Badge status={subscription.status} dot size="md" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cadence:</span>
              <span className="font-semibold text-foreground capitalize">{subscription.billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period End:</span>
              <span className="font-mono text-foreground">{formatDate(subscription.currentPeriodEnd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renewal Horizon:</span>
              <span className={`font-mono font-bold ${daysToRenewal <= 7 ? 'text-amber-600' : 'text-foreground'}`}>
                {daysToRenewal >= 0 ? `${daysToRenewal} days remaining` : `${Math.abs(daysToRenewal)} days overdue`}
              </span>
            </div>
            {subscription.trialEndDate && (
              <div className="flex justify-between border-t border-border pt-2 text-muted-foreground">
                <span>Trial Expiry:</span>
                <span className="font-mono text-foreground">{formatDate(subscription.trialEndDate)}</span>
              </div>
            )}
            {graceInfo.inGracePeriod && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-700 dark:text-amber-400">
                <strong>Active Grace Period:</strong> {graceInfo.daysRemaining} days remaining before suspension.
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Commercial Plan */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Commercial Tier & Terms
            </span>
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
              {plan?.tier}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan Name:</span>
              <span className="font-bold text-foreground">{plan?.name || subscription.planId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Price:</span>
              <span className="font-mono font-bold text-foreground">
                {plan ? formatCurrency(subscription.billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly, plan.currency) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campuses Allowed:</span>
              <span className="font-mono text-foreground">{plan?.maxCampuses || 1} branches</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Ceiling:</span>
              <span className="font-mono text-foreground">{plan?.maxStudents.toLocaleString() || '—'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: School Entity */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tenant Entity
            </span>
            <span className="font-mono text-xs text-muted-foreground">{org?.code}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">School Name:</span>
              <span className="font-bold text-foreground">{org?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Contact:</span>
              <span className="text-foreground">{org?.contact?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground">{org?.contact?.city || '—'}, {org?.contact?.country || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscribed Since:</span>
              <span className="font-mono text-foreground">{formatDate(subscription.currentPeriodStart)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Module Entitlements Breakdown */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Canonical Module Registry Entitlements
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evaluating plan tier &quot;{plan?.tier}&quot; against the master module registry (Phase E-09.6 alignment).
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-lg border border-border">
            {entitlementsSummary.totalIncluded} of {MASTER_MODULE_REGISTRY.length} Modules Included
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {MASTER_MODULE_REGISTRY.map((mod) => {
            const isIncluded = includedIds.has(mod.id);
            return (
              <div
                key={mod.id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isIncluded
                    ? 'bg-card border-border shadow-2xs'
                    : 'bg-muted/30 border-border/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{mod.name}</span>
                  {isIncluded ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">Omitted</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">{mod.id}</p>
                <span className="inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {mod.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Invoices & Billing History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Financial ledger items issued to this tenant organization.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {orgInvoices.length} {orgInvoices.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <DataTable
          data={orgInvoices}
          columns={invoiceColumns}
          keyExtractor={(inv) => inv.id}
          emptyMessage="No invoices have been recorded for this subscription."
        />
      </div>

      {/* Payment Records Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Settlement & Payment Attempts
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulated electronic and manual payment logs.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {orgPayments.length} {orgPayments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <DataTable
          data={orgPayments}
          columns={paymentColumns}
          keyExtractor={(p) => p.id}
          emptyMessage="No payment attempts have been recorded for this subscription."
        />
      </div>

      {/* Subscription Lifecycle Event Audit Log */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Subscription Lifecycle Audit History
        </h3>

        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">No lifecycle transition events recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-lg border border-border bg-muted/20 text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      Lifecycle Transition
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ({evt.fromStatus} → {evt.toStatus})
                    </span>
                  </div>
                  <p className="text-muted-foreground">{evt.reason}</p>
                  <p className="text-[11px] text-muted-foreground/80 font-mono">
                    Actor: {evt.actor}
                  </p>
                </div>
                <span className="font-mono text-muted-foreground text-[11px] shrink-0">
                  {formatDate(evt.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* State Machine Transition Modal */}
      {showTransitionModal && (
        <Modal
          isOpen={showTransitionModal}
          onClose={() => setShowTransitionModal(false)}
          title={`Simulate Lifecycle State Transition: ${subscription.id}`}
        >
          <form onSubmit={handleExecuteTransition} className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">School Organization:</span>
                <span className="font-bold text-foreground">{org?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current State:</span>
                <Badge status={subscription.status} size="sm" />
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
                  const allowed = canTransitionSubscriptionStatus(subscription.status, st);
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
                Mandatory Administrative Reason:
              </label>
              <textarea
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                placeholder="Explain the administrative justification for this transition..."
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
                <strong>Simulation Warning:</strong> This state transition is stored locally in the development session. It demonstrates platform governance without modifying live school operations.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTransitionModal(false)}
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

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Demo Payment: ${paymentModalInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Amount Due:</span>
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(paymentModalInvoice.amountDue, paymentModalInvoice.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {formatCurrency(paymentModalInvoice.amountPaid || 0, paymentModalInvoice.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Payment Amount:</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={paymentModalInvoice.amountDue - (paymentModalInvoice.amountPaid || 0)}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Settlement Method:</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
              >
                <option value="bank_transfer">Electronic Bank Transfer</option>
                <option value="credit_card">Corporate Credit Card (Demo)</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash_deposit">Direct Bank Deposit / Wire</option>
                <option value="cheque">Institutional Check</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reference / Transaction ID:</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. TR-DEMO-99120"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Audit Notes:</label>
              <textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Optional administrative settlement notes..."
                rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
              />
            </div>

            {payError && <p className="text-xs text-destructive font-medium">{payError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        invoice={printInvoice}
        organization={org}
        plan={plan}
        onClose={() => setPrintInvoice(null)}
      />
    </div>
  );
}
