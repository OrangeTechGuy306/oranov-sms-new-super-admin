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
import { InvoicePrintModal } from '@/components/monetization/InvoicePrintModal';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { downloadCsvFile, generateCsvContent } from '@/lib/utils/csv-export';
import { Invoice, PaymentMethodType } from '@/lib/types';
import {
  FileText,
  DollarSign,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Printer,
  Ban,
} from 'lucide-react';

export default function InvoicesLedgerPage() {
  const {
    invoices,
    organizations,
    plans,
    recordPayment,
    voidInvoice,
  } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  // Record Payment Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Void Invoice Modal State
  const [voidModalInvoice, setVoidModalInvoice] = useState<Invoice | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState('');

  // Print Invoice Modal State
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  // Financial aggregates by currency
  const financialTotals = useMemo(() => {
    let usdInvoiced = 0;
    let usdPaid = 0;
    let usdBalance = 0;
    let gbpInvoiced = 0;
    let gbpPaid = 0;
    let gbpBalance = 0;

    invoices.forEach((inv) => {
      const bal = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
      if (inv.currency === 'GBP') {
        gbpInvoiced += inv.amountDue;
        gbpPaid += inv.amountPaid || 0;
        gbpBalance += bal;
      } else {
        usdInvoiced += inv.amountDue;
        usdPaid += inv.amountPaid || 0;
        usdBalance += bal;
      }
    });

    const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

    return {
      usdInvoiced,
      usdPaid,
      usdBalance,
      gbpInvoiced,
      gbpPaid,
      gbpBalance,
      overdueCount,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const org = organizations.find((o) => o.id === inv.organizationId);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchOrg = org?.name.toLowerCase().includes(q) || org?.code.toLowerCase().includes(q);
        if (!matchNumber && !matchOrg) return false;
      }
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (currencyFilter !== 'all' && inv.currency !== currencyFilter) return false;
      return true;
    });
  }, [invoices, organizations, searchQuery, statusFilter, currencyFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Invoice #',
      'Organization',
      'Currency',
      'Subtotal',
      'Discount',
      'Tax',
      'Amount Due',
      'Amount Paid',
      'Remaining Balance',
      'Status',
      'Issue Date',
      'Due Date',
    ];
    const rows = filteredInvoices.map((inv) => {
      const org = organizations.find((o) => o.id === inv.organizationId);
      const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
      return [
        inv.invoiceNumber,
        org ? org.name : 'Unknown School',
        inv.currency,
        inv.subtotal ?? inv.amountDue,
        inv.discountAmount || 0,
        inv.taxAmount || 0,
        inv.amountDue,
        inv.amountPaid || 0,
        balance,
        inv.status,
        inv.issueDate,
        inv.dueDate,
      ];
    });
    const csv = generateCsvContent(headers, rows);
    downloadCsvFile(`invoices-ledger-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    setPayError('');

    const res = recordPayment({
      invoiceId: paymentModalInvoice.id,
      amount: Number(payAmount),
      method: payMethod,
      referenceNumber: payRef || `TR-REC-${Date.now().toString().slice(-6)}`,
      notes: payNotes,
    });

    if (res.success) {
      setPaymentModalInvoice(null);
    } else if (res.error) {
      setPayError(res.error);
    }
  };

  const handleVoidInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidModalInvoice) return;
    setVoidError('');

    if (!voidReason.trim()) {
      setVoidError('Mandatory administrative reason required to void an invoice.');
      return;
    }

    const res = voidInvoice(voidModalInvoice.id, voidReason.trim());
    if (res.success) {
      setVoidModalInvoice(null);
    } else {
      setVoidError(res.error || 'Failed to void invoice.');
    }
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <div>
          <span className="font-mono font-bold text-xs text-foreground block">{inv.invoiceNumber}</span>
          <span className="text-[10px] text-muted-foreground font-mono">ID: {inv.id}</span>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Organization',
      render: (inv) => {
        const org = organizations.find((o) => o.id === inv.organizationId);
        return (
          <div>
            <Link
              href={`/organizations/${inv.organizationId}`}
              className="font-bold text-xs text-foreground hover:text-primary hover:underline block"
            >
              {org ? org.name : 'Unknown School'}
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono">
              {org?.code || '—'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'dates',
      header: 'Issued / Due',
      render: (inv) => (
        <div className="text-xs text-muted-foreground font-mono">
          <div>{formatDate(inv.issueDate)}</div>
          <div className="text-foreground text-[11px] font-medium">Due: {formatDate(inv.dueDate)}</div>
        </div>
      ),
    },
    {
      key: 'amountDue',
      header: 'Total Due',
      render: (inv) => (
        <div>
          <span className="font-mono font-bold text-xs text-foreground block">
            {formatCurrency(inv.amountDue, inv.currency)}
          </span>
          {inv.discountAmount !== undefined && inv.discountAmount > 0 && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              -{formatCurrency(inv.discountAmount, inv.currency)} discount
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'amountPaid',
      header: 'Recorded Paid',
      render: (inv) => (
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          {formatCurrency(inv.amountPaid || 0, inv.currency)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (inv) => {
        const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
        return (
          <span
            className={`font-mono text-xs font-bold ${
              balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatCurrency(balance, inv.currency)}
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
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => {
        const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
        const canVoid = inv.status === 'issued' || inv.status === 'overdue';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setPrintInvoice(inv);
              }}
              className="p-1.5 rounded border border-border text-foreground hover:bg-muted text-xs cursor-pointer"
              title="Print Demo Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {balance > 0 && inv.status !== 'void' && (
              <button
                type="button"
                onClick={() => {
                  setPaymentModalInvoice(inv);
                  setPayAmount(balance);
                  setPayError('');
                }}
                className="px-2.5 py-1 text-xs font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Record Pay
              </button>
            )}

            {canVoid && (
              <button
                type="button"
                onClick={() => {
                  setVoidModalInvoice(inv);
                  setVoidReason('');
                  setVoidError('');
                }}
                className="p-1.5 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                title="Void Invoice"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Billing Ledger Oversight"
        description="Platform commercial invoice directory, payment recording, and balance reconciliation."
        backUrl="/subscriptions"
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Invoices CSV
          </button>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Financial StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="USD Invoiced Volume"
          value={formatCurrency(financialTotals.usdInvoiced, 'USD')}
          subtitle={`Collected: ${formatCurrency(financialTotals.usdPaid, 'USD')}`}
          icon={<FileText className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="USD Receivables Balance"
          value={formatCurrency(financialTotals.usdBalance, 'USD')}
          subtitle="Outstanding balances in USD"
          icon={<DollarSign className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="GBP Invoiced Volume"
          value={formatCurrency(financialTotals.gbpInvoiced, 'GBP')}
          subtitle={`Collected: ${formatCurrency(financialTotals.gbpPaid, 'GBP')}`}
          icon={<FileText className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Overdue Invoices"
          value={financialTotals.overdueCount}
          subtitle="Past due payment deadline"
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
        />
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-card rounded-xl border border-border space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number or school organization..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-none"
            >
              <option value="all">All Statuses ({invoices.length})</option>
              <option value="paid">Paid ({invoices.filter((i) => i.status === 'paid').length})</option>
              <option value="issued">Issued / Open ({invoices.filter((i) => i.status === 'issued').length})</option>
              <option value="overdue">Overdue ({invoices.filter((i) => i.status === 'overdue').length})</option>
              <option value="draft">Draft ({invoices.filter((i) => i.status === 'draft').length})</option>
              <option value="void">Void ({invoices.filter((i) => i.status === 'void').length})</option>
            </select>

            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-none"
            >
              <option value="all">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <DataTable
          data={filteredInvoices}
          columns={columns}
          keyExtractor={(inv) => inv.id}
          emptyMessage="No invoices match the specified criteria."
        />
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment for ${paymentModalInvoice.invoiceNumber}`}
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
              <label className="text-xs font-semibold text-foreground">Payment Amount ({paymentModalInvoice.currency}):</label>
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
                <option value="credit_card">Corporate Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash_deposit">Direct Bank Wire</option>
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
                placeholder="Optional settlement notes..."
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

      {/* Void Invoice Modal */}
      {voidModalInvoice && (
        <Modal
          isOpen={!!voidModalInvoice}
          onClose={() => setVoidModalInvoice(null)}
          title={`Void Invoice: ${voidModalInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleVoidInvoiceSubmit} className="space-y-4">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              <strong>Warning:</strong> Voiding an invoice cancels all outstanding balances and marks the ledger record as void. This action is permanently logged in the audit trail.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Mandatory Reason for Voiding *:</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="State the administrative justification (e.g. Billed in error, plan tier revised, duplicate charge)..."
                rows={3}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none"
                required
              />
            </div>

            {voidError && <p className="text-xs text-destructive font-medium">{voidError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidModalInvoice(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90"
              >
                Confirm Void
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Print Demo Invoice Modal */}
      {printInvoice && (
        <InvoicePrintModal
          invoice={printInvoice}
          organization={organizations.find((o) => o.id === printInvoice.organizationId)}
          plan={plans.find((p) => p.id === organizations.find((o) => o.id === printInvoice.organizationId)?.planId)}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
}
