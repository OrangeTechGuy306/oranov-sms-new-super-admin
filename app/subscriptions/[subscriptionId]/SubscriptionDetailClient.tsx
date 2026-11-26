'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
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
} from '@/lib/monetization/evaluator';
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
  Clock,
  ArrowUpDown,
  PackagePlus,
} from 'lucide-react';

interface SubscriptionDetailClientProps {
  subscriptionId: string;
}

export function SubscriptionDetailClient({ subscriptionId }: SubscriptionDetailClientProps) {
  const {
    getSubscriptionById,
    getOrganizationById,
    plans,
    modules,
    invoices,
    payments,
    getSubscriptionEvents,
    transitionSubscriptionStatus,
    updateOrganizationPlan,
    extendSubscriptionTrial,
    manageSubscriptionAddOn,
    evaluateEntitlement,
    recordPayment,
    retryPayment,
  } = usePlatformStore();

  const subscription = getSubscriptionById(subscriptionId);
  const org = subscription ? getOrganizationById(subscription.organizationId) : undefined;
  const plan = plans.find((p) => p.id === subscription?.planId);
  const events = getSubscriptionEvents(subscriptionId);

  const orgInvoices = invoices.filter((i) => i.organizationId === subscription?.organizationId);
  const orgPayments = payments.filter((p) => p.organizationId === subscription?.organizationId);

  // Lifecycle Transition Modal State
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<SubscriptionLifecycleStatus>('active');
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionError, setTransitionError] = useState('');

  // Trial Extension Modal State
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [newTrialEndDate, setNewTrialEndDate] = useState('2026-12-31T23:59:59Z');
  const [trialReason, setTrialReason] = useState('');
  const [trialError, setTrialError] = useState('');

  // Upgrade / Downgrade Plan Switch Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedNewPlanId, setSelectedNewPlanId] = useState('');
  const [selectedNewCycle, setSelectedNewCycle] = useState<'monthly' | 'annual'>('annual');
  const [planSwitchError, setPlanSwitchError] = useState('');

  // Add-on Grant Form State
  const [newAddOnModuleId, setNewAddOnModuleId] = useState('');
  const [newAddOnExpiry, setNewAddOnExpiry] = useState('');
  const [addOnFeedback, setAddOnFeedback] = useState('');

  // Entitlement View Filter
  const [entitlementFilter, setEntitlementFilter] = useState<'all' | 'entitled' | 'locked' | 'addon'>('all');

  // Payment Recording Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Invoice Print Preview Modal State
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  const evaluatedModules = useMemo(() => {
    if (!subscription) return [];
    return modules.map((mod) => ({
      mod,
      evalRes: evaluateEntitlement(mod.id, subscription.organizationId, plan?.id),
    }));
  }, [modules, subscription, plan?.id, evaluateEntitlement]);

  const filteredEvaluations = useMemo(() => {
    return evaluatedModules.filter(({ evalRes }) => {
      if (entitlementFilter === 'entitled') return evalRes.effectiveStatus === 'available';
      if (entitlementFilter === 'addon') return evalRes.precedenceApplied === 'ADDON_ENTITLED' || evalRes.requiresAddon;
      if (entitlementFilter === 'locked') return evalRes.effectiveStatus !== 'available';
      return true;
    });
  }, [evaluatedModules, entitlementFilter]);

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
  const totalEntitledCount = evaluatedModules.filter((e) => e.evalRes.effectiveStatus === 'available').length;
  const activeAddOns = subscription.activeAddOns || [];

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

  const handleExtendTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrialError('');
    const res = extendSubscriptionTrial(subscription.id, newTrialEndDate, trialReason.trim());
    if (res.success) {
      setShowTrialModal(false);
    } else {
      setTrialError(res.error || 'Failed to update trial window');
    }
  };

  const handleSwitchPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSwitchError('');
    if (!selectedNewPlanId) {
      setPlanSwitchError('Please select a target subscription plan.');
      return;
    }
    const res = updateOrganizationPlan(subscription.organizationId, selectedNewPlanId, selectedNewCycle);
    if (res.success) {
      setShowPlanModal(false);
    } else {
      setPlanSwitchError(res.error || 'Failed to switch subscription plan.');
    }
  };

  const handleGrantAddOn = (e: React.FormEvent) => {
    e.preventDefault();
    setAddOnFeedback('');
    if (!newAddOnModuleId) return;
    const targetMod = modules.find((m) => m.id === newAddOnModuleId);
    const res = manageSubscriptionAddOn(subscription.id, 'grant', {
      moduleId: newAddOnModuleId,
      name: targetMod ? `${targetMod.name} Add-On` : newAddOnModuleId,
      expiryDate: newAddOnExpiry.trim() || undefined,
    });
    if (res.success) {
      setAddOnFeedback(`Granted simulated add-on "${targetMod?.name || newAddOnModuleId}".`);
      setNewAddOnModuleId('');
      setNewAddOnExpiry('');
    } else {
      setAddOnFeedback(res.error || 'Unable to grant add-on.');
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
        description={`Commercial relationship, entitlement add-ons, and lifecycle administration for ${org?.name || 'School Organization'}.`}
        backUrl="/subscriptions"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/organizations/${subscription.organizationId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted"
            >
              <Building2 className="w-3.5 h-3.5" />
              View School Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedNewPlanId(subscription.planId);
                setSelectedNewCycle(subscription.billingCycle);
                setPlanSwitchError('');
                setShowPlanModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Upgrade / Change Plan
            </button>
            <button
              type="button"
              onClick={() => {
                setNewTrialEndDate(subscription.trialEndDate || '2026-12-31T23:59:59Z');
                setTrialReason('');
                setTrialError('');
                setShowTrialModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              Extend Trial (Sim)
            </button>
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

      {/* Top Level Metadata Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              Commercial Tier &amp; Terms
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
              <span className="text-muted-foreground">Campuses / Staff Ceiling:</span>
              <span className="font-mono text-foreground">
                {plan?.maxCampuses || 1} branches • {plan?.maxStaff?.toLocaleString() || '—'} staff
              </span>
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
              <span className="text-muted-foreground">Organization Status:</span>
              <Badge status={org?.status || 'active'} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscribed Since:</span>
              <span className="font-mono text-foreground">{formatDate(subscription.currentPeriodStart)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add-On Licenses Management (Simulated) */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-primary" />
              Subscription Add-On Licenses (Simulated Governance)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Grant, expire, or revoke commercial module add-ons for lifecycle edge-case testing. Server-side billing webhooks are not connected in P0-4.
            </p>
          </div>
          <Badge variant="neutral">{activeAddOns.length} Recorded Add-on(s)</Badge>
        </div>

        {addOnFeedback && (
          <AlertBanner variant="info" title="Add-On State Updated">
            {addOnFeedback}
          </AlertBanner>
        )}

        <form onSubmit={handleGrantAddOn} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-foreground block">Select Module Add-On</label>
            <select
              value={newAddOnModuleId}
              onChange={(e) => setNewAddOnModuleId(e.target.value)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="">Choose module to grant as add-on...</option>
              {modules
                .filter((m) => m.availabilityStatus !== 'deprecated')
                .map((m) => {
                  const isPlanAddOn = plan?.optionalAddOnModuleIds?.includes(m.id);
                  return (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) {isPlanAddOn ? '★ Plan Optional Add-On' : ''}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Optional Expiry ISO Date</label>
            <input
              type="text"
              value={newAddOnExpiry}
              onChange={(e) => setNewAddOnExpiry(e.target.value)}
              placeholder="e.g. 2027-06-30T00:00:00Z"
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newAddOnModuleId}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            Grant Simulated Add-On
          </button>
        </form>

        {activeAddOns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {activeAddOns.map((addon) => (
              <div
                key={addon.id}
                className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">{addon.name}</span>
                    <Badge
                      variant={
                        addon.status === 'active'
                          ? 'success'
                          : addon.status === 'expired'
                          ? 'warning'
                          : 'error'
                      }
                      className="text-[10px] capitalize"
                    >
                      {addon.status}
                    </Badge>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    {addon.moduleId || addon.featureId}
                    {addon.expiryDate ? ` • Expires ${formatDate(addon.expiryDate)}` : ' • No expiry'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() =>
                      manageSubscriptionAddOn(subscription.id, 'expire', {
                        moduleId: addon.moduleId,
                        featureId: addon.featureId,
                        name: addon.name,
                      })
                    }
                    className="px-2 py-1 rounded border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold hover:bg-amber-500/10 cursor-pointer"
                  >
                    Simulate Expiry
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      manageSubscriptionAddOn(subscription.id, 'revoke', {
                        moduleId: addon.moduleId,
                        featureId: addon.featureId,
                        name: addon.name,
                      })
                    }
                    className="px-2 py-1 rounded border border-rose-500/40 text-rose-700 dark:text-rose-300 text-[10px] font-semibold hover:bg-rose-500/10 cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Effective Module Entitlements Evaluation */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Effective Tenant Entitlements ({totalEntitledCount} of {modules.length} Entitled)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Resolved via canonical fail-closed precedence across tenant status, subscription lifecycle, plan defaults, school types, add-ons, overrides, and dependencies.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['all', 'entitled', 'addon', 'locked'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setEntitlementFilter(tab)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold capitalize cursor-pointer ${
                  entitlementFilter === tab
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredEvaluations.slice(0, 120).map(({ mod, evalRes }) => {
            const isEntitled = evalRes.effectiveStatus === 'available';
            return (
              <div
                key={mod.id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isEntitled
                    ? 'bg-card border-border shadow-2xs'
                    : 'bg-muted/30 border-border/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground truncate">{mod.name}</span>
                  {isEntitled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Badge variant="error" className="text-[9px] shrink-0">
                      {evalRes.canonicalStatus || evalRes.effectiveStatus}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{mod.id}</p>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {evalRes.precedenceApplied.replace(/_/g, ' ')}
                  </span>
                  {evalRes.implementationMaturity && evalRes.implementationMaturity !== 'implemented' && (
                    <Badge variant="warning" className="text-[9px] capitalize">
                      {evalRes.implementationMaturity}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredEvaluations.length > 120 && (
          <p className="text-[11px] text-muted-foreground">
            Showing first 120 of {filteredEvaluations.length} evaluated entries. Open Features &amp; Overrides for full search.
          </p>
        )}
      </div>

      {/* Invoices Ledger Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Invoices &amp; Billing History
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
              Settlement &amp; Payment Attempts
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

      {/* Plan Switch / Upgrade / Downgrade Modal */}
      {showPlanModal && (
        <Modal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          title={`Switch Plan / Upgrade or Downgrade (Simulated): ${org?.name}`}
        >
          <form onSubmit={handleSwitchPlanSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">Select Target Plan</label>
              <select
                value={selectedNewPlanId}
                onChange={(e) => setSelectedNewPlanId(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                {plans.map((p) => {
                  const isUpgrade = plan?.upgradeToPlanIds?.includes(p.id);
                  const isDowngrade = plan?.downgradeToPlanIds?.includes(p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currency} {p.priceMonthly}/mo)
                      {p.id === subscription.planId ? ' — Current Plan' : isUpgrade ? ' — Upgrade' : isDowngrade ? ' — Downgrade' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">Billing Cycle</label>
              <select
                value={selectedNewCycle}
                onChange={(e) => setSelectedNewCycle(e.target.value as 'monthly' | 'annual')}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            {planSwitchError && <p className="text-destructive font-medium">{planSwitchError}</p>}
            <AlertBanner variant="info" title="Frontend Simulation Notice">
              Switches plan and updates local store entitlements immediately; proration and payment intents require future backend billing hooks.
            </AlertBanner>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold"
              >
                Apply Plan Change (Sim)
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Trial Extension Modal */}
      {showTrialModal && (
        <Modal
          isOpen={showTrialModal}
          onClose={() => setShowTrialModal(false)}
          title={`Extend Trial Window (Simulated): ${subscription.id}`}
        >
          <form onSubmit={handleExtendTrialSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">New Trial Expiry ISO Timestamp</label>
              <input
                type="text"
                value={newTrialEndDate}
                onChange={(e) => setNewTrialEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Use a past ISO date (e.g. `2026-10-01T00:00:00Z`) to simulate an expired trial, or a future date to unlock active trialing.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">Administrative Reason</label>
              <textarea
                rows={2}
                value={trialReason}
                onChange={(e) => setTrialReason(e.target.value)}
                placeholder="Reason for adjusting trial window..."
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
              />
            </div>
            {trialError && <p className="text-destructive font-medium">{trialError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTrialModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold"
              >
                Apply Trial Window
              </button>
            </div>
          </form>
        </Modal>
      )}

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
