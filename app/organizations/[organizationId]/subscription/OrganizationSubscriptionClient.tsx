'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Invoice } from '@/lib/types';
import { CreditCard } from 'lucide-react';

import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { PaymentMethodType } from '@/lib/types';

interface ClientProps {
  organizationId: string;
}

export function OrganizationSubscriptionClient({ organizationId }: ClientProps) {
  const {
    getOrganizationById,
    getSubscriptionByOrgId,
    getInvoicesByOrgId,
    plans,
    updateOrganizationPlan,
    recordPayment,
  } = usePlatformStore();

  const org = getOrganizationById(organizationId);
  const subscription = getSubscriptionByOrgId(organizationId);
  const invoices = getInvoicesByOrgId(organizationId);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(org?.planId || 'plan_growth');
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>(
    subscription?.billingCycle || 'annual'
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Payment Recording State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  if (!org) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organization Not Found" backUrl="/organizations" />
        <EmptyState
          title="Organization Not Found"
          description="Could not locate organization to manage subscriptions."
          action={
            <Link
              href="/organizations"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg"
            >
              Back to Organizations Directory
            </Link>
          }
        />
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === org.planId) || plans[0];
  const newPlan = plans.find((p) => p.id === selectedPlanId) || currentPlan;

  const handleConfirmPlanChange = () => {
    updateOrganizationPlan(org.id, selectedPlanId, selectedCycle);
    setShowConfirmModal(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    setPayError('');

    const res = recordPayment({
      invoiceId: paymentModalInvoice.id,
      amount: Number(payAmount),
      method: payMethod,
      referenceNumber: payRef,
      notes: payNotes,
    });

    if (res.success) {
      setPaymentModalInvoice(null);
    } else if (res.error) {
      setPayError(res.error);
    }
  };

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => <span className="font-semibold text-foreground font-mono text-xs">{inv.invoiceNumber}</span>,
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (inv) => <span className="text-muted-foreground font-mono text-xs">{formatDate(inv.issueDate)}</span>,
    },
    {
      key: 'amountDue',
      header: 'Amount Invoiced',
      render: (inv) => <span className="font-bold text-foreground text-xs">{formatCurrency(inv.amountDue, inv.currency)}</span>,
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (inv) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400 text-xs">
          {formatCurrency(inv.amountPaid || 0, inv.currency)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (inv) => {
        const bal = Math.max(0, (inv.amountDue || 0) - (inv.amountPaid || 0));
        return (
          <span className={`font-mono text-xs font-semibold ${bal > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
            {formatCurrency(bal, inv.currency)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <Badge status={inv.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (inv) => {
        const bal = Math.max(0, (inv.amountDue || 0) - (inv.amountPaid || 0));
        if (inv.status === 'paid' || bal <= 0 || inv.status === 'void') return null;
        return (
          <button
            type="button"
            onClick={() => {
              setPaymentModalInvoice(inv);
              setPayAmount(bal);
              setPayRef(`PAY-MOCK-${Math.floor(100000 + Math.random() * 900000)}`);
              setPayError('');
              setPayNotes('');
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Record Payment
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Subscription Management — ${org.name}`}
        description={`Manage active subscription tier, billing period cycle, and invoice ledger for ${org.name}.`}
        backUrl={`/organizations/${org.id}`}
        badge={<Badge status={subscription?.status || 'active'} size="sm" />}
      />

      <AlertBanner variant="info" title="Billing & Payment Gateway Boundary">
        In this frontend development phase, plan upgrades and billing cycle adjustments update local mock state and generate audit events. Live credit card processing, SEPA/ACH debits, and automated Stripe webhooks will be connected in future backend phases.
      </AlertBanner>

      {/* Current Plan Overview Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Active Subscription Details
          </h3>
          <Badge status={subscription?.status || 'active'} dot size="sm" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground text-[11px]">Active Plan</span>
            <p className="font-bold text-sm text-foreground mt-0.5">{currentPlan.name}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground text-[11px]">Current Cadence</span>
            <p className="font-bold text-sm text-foreground capitalize mt-0.5">{subscription?.billingCycle || 'annual'}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground text-[11px]">Current Period Ends</span>
            <p className="font-mono text-foreground mt-0.5">{formatDate(subscription?.currentPeriodEnd)}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground text-[11px]">Annual Value</span>
            <p className="font-bold text-sm text-foreground mt-0.5">{formatCurrency(currentPlan.priceAnnual)}</p>
          </div>
        </div>
      </div>

      {/* Plan Selection Section */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Select New Plan Tier</h3>
            <p className="text-xs text-muted-foreground">Compare features, student capacities, and pricing.</p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg text-xs font-medium border border-border self-start">
            <button
              type="button"
              onClick={() => setSelectedCycle('monthly')}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedCycle === 'monthly'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('annual')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                selectedCycle === 'annual'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1 rounded">Save 15%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isCurrentlyAssigned = org.planId === plan.id;
            const price = selectedCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border bg-card hover:border-muted-foreground/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{plan.name}</span>
                    {isCurrentlyAssigned && (
                      <span className="text-[10px] bg-muted font-bold px-2 py-0.5 rounded text-foreground">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                  <div>
                    <span className="text-2xl font-black text-foreground">{formatCurrency(price)}</span>
                    <span className="text-xs text-muted-foreground">/{selectedCycle === 'annual' ? 'year' : 'month'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p>• Students: <strong>{plan.maxStudents.toLocaleString()}</strong></p>
                  <p>• Staff: <strong>{plan.maxStaff.toLocaleString()}</strong></p>
                  <p>• Campuses: <strong>{plan.maxCampuses}</strong></p>
                  <p>• Cloud Storage: <strong>{plan.storageGb} GB</strong></p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Selected: <strong className="text-foreground">{newPlan.name}</strong> ({selectedCycle})
          </p>
          <button
            type="button"
            disabled={selectedPlanId === org.planId && selectedCycle === subscription?.billingCycle}
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
          >
            Apply Plan Change
          </button>
        </div>
      </div>

      {/* School Invoices Ledger */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Organization Invoices</h3>
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          keyExtractor={(inv) => inv.id}
          emptyMessage="No billing invoices found for this organization."
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPlanChange}
        title="Confirm Subscription Plan Change"
        variant="primary"
        confirmLabel="Confirm Upgrade/Downgrade"
        description={
          <p>
            You are changing the subscription for{' '}
            <strong className="text-foreground">{org.name}</strong> from{' '}
            <strong className="text-foreground">{currentPlan.name}</strong> to{' '}
            <strong className="text-foreground">{newPlan.name}</strong> ({selectedCycle} billing at{' '}
            {formatCurrency(selectedCycle === 'annual' ? newPlan.priceAnnual : newPlan.priceMonthly)}).
          </p>
        }
      />

      {/* Record Payment Simulation Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment for Invoice ${paymentModalInvoice.invoiceNumber}`}
          size="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1 border border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Total:</span>
                <span className="font-semibold text-foreground">{formatCurrency(paymentModalInvoice.amountDue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paymentModalInvoice.amountPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/50 font-bold">
                <span className="text-foreground">Unpaid Balance:</span>
                <span className="text-foreground font-mono">
                  {formatCurrency(Math.max(0, paymentModalInvoice.amountDue - (paymentModalInvoice.amountPaid || 0)))}
                </span>
              </div>
            </div>

            {payError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {payError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Payment Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={paymentModalInvoice.amountDue - (paymentModalInvoice.amountPaid || 0)}
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="bank_transfer">Bank Wire / Electronic Transfer</option>
                <option value="card">Corporate Credit Card</option>
                <option value="cheque">Institutional Cheque</option>
                <option value="manual_invoice">Manual Ledger Settlement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Reference / Transaction Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. WIRE-884920 or CHQ-4491"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Reconciliation Notes (Optional)</label>
              <textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. Verified by financial accounting desk, annual subscription renewal."
                rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              ⚡ <strong>Simulation Notice:</strong> This action updates client-side mock invoice ledger records in local development storage. No real banking or payment gateways are contacted.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Payment Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
