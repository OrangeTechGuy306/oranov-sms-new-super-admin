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
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { downloadCsvFile, generateCsvContent } from '@/lib/utils/csv-export';
import { PaymentRecord } from '@/lib/types';
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  RefreshCw,
  Filter,
} from 'lucide-react';

export default function PaymentsMonitoringPage() {
  const { payments, organizations, invoices, retryPayment } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    let usdSettled = 0;
    let gbpSettled = 0;
    let succeededCount = 0;
    let failedCount = 0;
    let pendingCount = 0;

    payments.forEach((p) => {
      if (p.status === 'succeeded') {
        succeededCount++;
        if (p.currency === 'GBP') gbpSettled += p.amount;
        else usdSettled += p.amount;
      } else if (p.status === 'failed') {
        failedCount++;
      } else if (p.status === 'pending') {
        pendingCount++;
      }
    });

    return {
      usdSettled,
      gbpSettled,
      succeededCount,
      failedCount,
      pendingCount,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const org = organizations.find((o) => o.id === p.organizationId);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRef = p.referenceNumber?.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        const matchOrg = org?.name.toLowerCase().includes(q) || org?.code.toLowerCase().includes(q);
        const matchInv = p.invoiceId.toLowerCase().includes(q);
        if (!matchRef && !matchOrg && !matchInv) return false;
      }
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [payments, organizations, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Payment ID',
      'Invoice ID',
      'Organization',
      'Amount',
      'Currency',
      'Method',
      'Reference Number',
      'Status',
      'Failure Reason',
      'Processed At',
    ];
    const rows = filteredPayments.map((p) => {
      const org = organizations.find((o) => o.id === p.organizationId);
      return [
        p.id,
        p.invoiceId,
        org ? org.name : 'Unknown School',
        p.amount,
        p.currency,
        p.method,
        p.referenceNumber || '',
        p.status,
        p.failureReason || '',
        p.processedAt,
      ];
    });
    const csv = generateCsvContent(headers, rows);
    downloadCsvFile(`payment-attempts-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleSimulateRetry = (paymentId: string) => {
    setRetryingId(paymentId);
    setTimeout(() => {
      retryPayment(paymentId);
      setRetryingId(null);
    }, 400);
  };

  const columns: Column<PaymentRecord>[] = [
    {
      key: 'id',
      header: 'Transaction ID / Reference',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-xs text-foreground block">
            {p.referenceNumber || p.id}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {p.id}
          </span>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Organization',
      render: (p) => {
        const org = organizations.find((o) => o.id === p.organizationId);
        return (
          <div>
            <Link
              href={`/organizations/${p.organizationId}`}
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
      key: 'invoice',
      header: 'Invoice Reference',
      render: (p) => {
        const inv = invoices.find((i) => i.id === p.invoiceId);
        return (
          <span className="font-mono text-xs text-foreground font-medium">
            {inv?.invoiceNumber || p.invoiceId}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
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
        <span className="capitalize text-xs text-muted-foreground font-medium">
          {p.method.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => {
        return (
          <div className="space-y-0.5">
            <Badge status={p.status} size="sm" />
            {p.status === 'failed' && p.failureCategory && (
              <span className="block text-[10px] font-mono text-destructive uppercase">
                {p.failureCategory.replace('_', ' ')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'processedAt',
      header: 'Timestamp',
      render: (p) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(p.processedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => {
        if (p.status === 'failed') {
          const isPendingRetry = retryingId === p.id;
          return (
            <button
              type="button"
              disabled={isPendingRetry}
              onClick={() => handleSimulateRetry(p.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPendingRetry ? 'animate-spin' : ''}`} />
              Simulate Retry
            </button>
          );
        }
        return <span className="text-[11px] text-muted-foreground">Settled</span>;
      },
    },
  ];

  const failedItems = payments.filter((p) => p.status === 'failed');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Monitoring & Failed Payment Recovery"
        description="Comprehensive audit of settled transactions, gateway failure categories, and administrative retry simulations."
        backUrl="/subscriptions"
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Payments CSV
          </button>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Top StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="USD Settled Volume"
          value={formatCurrency(stats.usdSettled, 'USD')}
          subtitle={`${stats.succeededCount} successful attempts`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="GBP Settled Volume"
          value={formatCurrency(stats.gbpSettled, 'GBP')}
          subtitle="Direct British Pounds collections"
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Failed Payment Alerts"
          value={stats.failedCount}
          subtitle="Declines, timeouts, or expired cards"
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
        />
        <StatCard
          title="Pending Settlements"
          value={stats.pendingCount}
          subtitle="In flight batch settlement"
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
      </div>

      {/* Failed Payment Alert Card if any exist */}
      {failedItems.length > 0 && (
        <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/25 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Failed Payment Diagnoses Requiring Attention ({failedItems.length})
            </h4>
            <span className="text-[11px] text-destructive/80 font-mono">
              Simulated Gateway Declines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {failedItems.map((fail) => {
              const org = organizations.find((o) => o.id === fail.organizationId);
              const inv = invoices.find((i) => i.id === fail.invoiceId);
              return (
                <div
                  key={fail.id}
                  className="p-3 bg-card border border-destructive/30 rounded-lg text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{org?.name}</span>
                    <span className="font-mono font-bold text-destructive">
                      {formatCurrency(fail.amount, fail.currency)}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <p>
                      <strong>Failure Reason:</strong> {fail.failureReason || 'Transaction rejected by simulated issuer.'}
                    </p>
                    <p className="font-mono">
                      Category: {fail.failureCategory || 'general_decline'} • Invoice: {inv?.invoiceNumber || fail.invoiceId}
                    </p>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSimulateRetry(fail.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded hover:bg-primary/90 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Simulate Safe Retry
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction reference, invoice number, or school name..."
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
            <option value="all">All Statuses ({payments.length})</option>
            <option value="succeeded">Succeeded ({payments.filter((p) => p.status === 'succeeded').length})</option>
            <option value="failed">Failed ({payments.filter((p) => p.status === 'failed').length})</option>
            <option value="pending">Pending ({payments.filter((p) => p.status === 'pending').length})</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <DataTable
          data={filteredPayments}
          columns={columns}
          keyExtractor={(p) => p.id}
          emptyMessage="No payment records match the specified filters."
        />
      </div>
    </div>
  );
}
