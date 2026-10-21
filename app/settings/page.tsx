'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { GlobalSettingsPanel } from '@/components/platform-config/GlobalSettingsPanel';
import { FeatureFlagsRegistry } from '@/components/platform-config/FeatureFlagsRegistry';
import { TenantOverridesPanel } from '@/components/platform-config/TenantOverridesPanel';
import { EnvironmentConfigPanel } from '@/components/platform-config/EnvironmentConfigPanel';
import { RolloutPlannerPanel } from '@/components/platform-config/RolloutPlannerPanel';
import { ChangeGovernancePanel } from '@/components/platform-config/ChangeGovernancePanel';
import { ConfigVersionHistoryPanel } from '@/components/platform-config/ConfigVersionHistoryPanel';
import {
  Sliders,
  Flag,
  Building2,
  Server,
  Layers,
  FileCheck2,
  History,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Lock
} from 'lucide-react';

export default function PlatformSettingsPage() {
  const {
    featureFlags,
    tenantOverrides,
    changeProposals,
    configVersions,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<string>('global');

  const pendingProposalsCount = changeProposals.filter(
    (p) => p.status === 'pending_review'
  ).length;

  const tabs = [
    {
      id: 'global',
      label: 'Global Settings & Policies',
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      id: 'flags',
      label: 'Feature Flags Registry',
      icon: <Flag className="w-3.5 h-3.5" />,
      count: featureFlags.length,
    },
    {
      id: 'overrides',
      label: 'Tenant Overrides & Scopes',
      icon: <Building2 className="w-3.5 h-3.5" />,
      count: tenantOverrides.length,
    },
    {
      id: 'environments',
      label: 'Environments & Zero-Secret Safety',
      icon: <Server className="w-3.5 h-3.5" />,
    },
    {
      id: 'rollout',
      label: 'Rollout Planning',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'governance',
      label: 'Change Governance',
      icon: <FileCheck2 className="w-3.5 h-3.5" />,
      count: pendingProposalsCount > 0 ? pendingProposalsCount : undefined,
    },
    {
      id: 'history',
      label: 'Version History & Portability',
      icon: <History className="w-3.5 h-3.5" />,
      count: configVersions.length,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Platform Configuration & Feature Flag Governance"
        description="Unified enterprise configuration workspace with layered precedence (Platform -> Env -> Tenant), dual-control Maker-Checker governance, zero-secret compliance, and canary rollout planning."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Module Entitlements (E-09.6)
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Platform Audit Logs
            </Link>
          </div>
        }
      />

      {/* Governance & Precedence Overview Pill Bar */}
      <div className="bg-card text-card-foreground p-3.5 rounded-xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Hierarchy:</span>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">Layer 1: Platform Default</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium">Layer 2: Environment</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">Layer 3: Tenant Override</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              OWASP Zero-Secret Enforced
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-muted-foreground">
            Active Flags: <strong className="text-foreground">{featureFlags.filter(f => f.lifecycle === 'active').length}</strong>/{featureFlags.length}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Tenant Overrides: <strong className="text-foreground">{tenantOverrides.length}</strong>
          </span>
          {pendingProposalsCount > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingProposalsCount} Pending Review
              </span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={tabs}
      />

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === 'global' && <GlobalSettingsPanel />}
        {activeTab === 'flags' && <FeatureFlagsRegistry />}
        {activeTab === 'overrides' && <TenantOverridesPanel />}
        {activeTab === 'environments' && <EnvironmentConfigPanel />}
        {activeTab === 'rollout' && <RolloutPlannerPanel />}
        {activeTab === 'governance' && <ChangeGovernancePanel />}
        {activeTab === 'history' && <ConfigVersionHistoryPanel />}
      </div>
    </div>
  );
}
