'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { SubscriptionNavTabs } from '@/components/monetization/SubscriptionNavTabs';
import { MonetizationSimulationBanner } from '@/components/monetization/MonetizationSimulationBanner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { validateDiscountPolicy } from '@/lib/monetization/evaluator';
import { DiscountPolicy, CreateDiscountInput } from '@/lib/monetization/types';
import {
  Tag,
  Plus,
  CheckCircle2,
  Layers,
  Search,
  ShieldAlert,
} from 'lucide-react';

export default function DiscountPoliciesPage() {
  const { discounts, plans, createDiscount, toggleDiscount } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState<number>(15);
  const [currency, setCurrency] = useState('USD');
  const [applicablePlans, setApplicablePlans] = useState<string[]>(['all']);
  const [validFrom, setValidFrom] = useState('2026-01-01');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [maxRedemptions, setMaxRedemptions] = useState<number>(50);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const activeCount = discounts.filter((d) => d.isActive).length;
  const totalRedemptions = discounts.reduce((sum, d) => sum + (d.currentRedemptions || 0), 0);

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!d.code.toLowerCase().includes(q) && !d.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [discounts, searchQuery]);

  const handleOpenCreateModal = () => {
    setCode('');
    setName('');
    setDiscountType('percentage');
    setValue(15);
    setCurrency('USD');
    setApplicablePlans(['all']);
    setValidFrom('2026-01-01');
    setValidUntil('2026-12-31');
    setMaxRedemptions(50);
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    const input: CreateDiscountInput = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      discountType,
      value: Number(value),
      currency: discountType === 'fixed_amount' ? currency : undefined,
      applicablePlans,
      validFrom,
      validUntil,
      maxRedemptions: Number(maxRedemptions),
    };

    const validation = validateDiscountPolicy(input, discounts);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const res = createDiscount(input);
    if (res.success) {
      setShowCreateModal(false);
    } else {
      setFormErrors([res.error || 'Failed to create discount policy']);
    }
  };

  const columns: Column<DiscountPolicy>[] = [
    {
      key: 'code',
      header: 'Promotional Code',
      render: (d) => (
        <div>
          <span className="font-mono font-bold text-xs text-foreground block uppercase">
            {d.code}
          </span>
          <span className="text-[11px] text-muted-foreground">{d.name}</span>
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Discount Value',
      render: (d) => {
        if (d.discountType === 'percentage') {
          return (
            <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
              {d.value}% Off
            </span>
          );
        }
        return (
          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
            {formatCurrency(d.value, d.currency || 'USD')} Fixed Off
          </span>
        );
      },
    },
    {
      key: 'scope',
      header: 'Applicable Plans',
      render: (d) => {
        if (d.applicablePlans.includes('all')) {
          return <span className="text-xs text-foreground font-medium">All Platform Tiers</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {d.applicablePlans.map((pId) => {
              const plan = plans.find((p) => p.id === pId);
              return (
                <span
                  key={pId}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground"
                >
                  {plan?.name || pId}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'validity',
      header: 'Validity Period',
      render: (d) => (
        <div className="text-xs text-muted-foreground font-mono">
          <span>{formatDate(d.validFrom)}</span>
          <span className="mx-1">→</span>
          <span className="text-foreground">{formatDate(d.validUntil)}</span>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage Limit',
      render: (d) => (
        <div className="text-xs font-mono">
          <span className="text-foreground font-semibold">{d.currentRedemptions || 0}</span>
          <span className="text-muted-foreground"> / {d.maxRedemptions || '∞'} used</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Policy Status',
      render: (d) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            d.isActive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {d.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (d) => (
        <button
          type="button"
          onClick={() => toggleDiscount(d.id)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
            d.isActive
              ? 'border-border text-foreground hover:bg-muted'
              : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          {d.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts & Promotional Policies"
        description="Platform promotional voucher codes, percentage discounts, and onboarding incentive campaigns."
        backUrl="/subscriptions"
        actions={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Promotional Code
          </button>
        }
      />

      <SubscriptionNavTabs />
      <MonetizationSimulationBanner />

      {/* Top StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Promotional Codes"
          value={activeCount}
          subtitle="Ready for school onboarding"
          icon={<Tag className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          subtitle="Vouchers applied to subscriptions"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Total Policies Registered"
          value={discounts.length}
          subtitle="In platform promotional registry"
          icon={<Layers className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. EDUTRUST15) or promotion name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <DataTable
          data={filteredDiscounts}
          columns={columns}
          keyExtractor={(d) => d.id}
          emptyMessage="No promotional policies configured in the platform registry."
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Promotional Policy / Voucher Code"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formErrors.length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive space-y-1">
                <strong>Validation Errors:</strong>
                <ul className="list-disc list-inside">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Voucher Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EDUGLOBAL20"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono uppercase focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Promotion Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Global Education Grant"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Discount Type *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed_amount')}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
                >
                  <option value="percentage">Percentage (%) Discount</option>
                  <option value="fixed_amount">Fixed Amount Discount</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Discount Value ({discountType === 'percentage' ? '%' : currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={discountType === 'percentage' ? 100 : undefined}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Valid From *</label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Valid Until *</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-semibold text-foreground">Max Redemptions Allowed *</label>
                <input
                  type="number"
                  min="1"
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Simulation Warning:</strong> This discount policy is stored in the demonstration store and applied locally in test workflows.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
              >
                Save Promotional Policy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
