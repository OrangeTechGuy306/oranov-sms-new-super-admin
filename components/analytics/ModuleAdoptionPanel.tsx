'use client';

import React, { useState } from 'react';
import {
  ModuleAdoptionMetrics,
  ModuleAdoptionItem,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

interface ModuleAdoptionPanelProps {
  metrics: ModuleAdoptionMetrics;
  filters: AnalyticsGlobalFilters;
}

export function ModuleAdoptionPanel({
  metrics,
  filters,
}: ModuleAdoptionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMacroCategory, setSelectedMacroCategory] = useState<string>('all');

  // Filter modules for table
  const filteredModules = metrics.allModuleStats.filter((m) => {
    if (selectedMacroCategory !== 'all' && m.macroCategory !== selectedMacroCategory) return false;
    if (
      searchQuery.trim() &&
      !m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.moduleId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(metrics.allModuleStats.map((m) => m.macroCategory)));

  const topAdoptionChartItems = metrics.topAdoptedModules.map((m) => ({
    key: m.moduleId,
    label: m.name,
    count: m.enabledTenantCount,
    percentage: m.totalAdoptionRatePercent,
    colorHex: '#10b981',
  }));

  const leastAdoptionChartItems = metrics.leastAdoptedModules.map((m) => ({
    key: m.moduleId,
    label: m.name,
    count: m.enabledTenantCount,
    percentage: m.totalAdoptionRatePercent,
    colorHex: '#f59e0b',
  }));

  return (
    <div className="space-y-6">
      {/* Governance & Usage Disclaimer */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Master Module Registry Entitlement Governance
        </h4>
        <p className="text-muted-foreground">
          Adoption evaluates which platform features are <strong className="text-foreground">enabled by subscription plan</strong> or explicit organization override.
          <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
            Critical distinction: Module enablement indicates technical access, not active daily user clickstream usage. Daily active usage telemetry requires future backend event streaming.
          </span>
        </p>
      </div>

      {/* Top Level StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Master Modules in Registry"
          value={metrics.totalModulesInRegistry}
          subtitle="Governed across 4 functional macro domains"
          icon={<Layers className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="Average Platform Adoption"
          value={`${metrics.averageAdoptionRatePercent}%`}
          subtitle="Mean module enablement across active schools"
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="High-Adoption Modules"
          value={metrics.allModuleStats.filter((m) => m.status === 'high_adoption').length}
          subtitle="Modules enabled in ≥ 75% of school accounts"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="Underutilized Modules"
          value={metrics.allModuleStats.filter((m) => m.status === 'underutilized').length}
          subtitle="Modules enabled in < 30% of accounts (upsell target)"
          icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsBarChart
          title="Top Adopted Modules (High Penetration)"
          description="Platform modules with highest institutional adoption rates."
          items={topAdoptionChartItems}
          unit="Schools"
        />

        <AnalyticsBarChart
          title="Underutilized / Expansion Modules"
          description="Specialized or enterprise-tier modules with lowest enablement."
          items={leastAdoptionChartItems}
          unit="Schools"
        />
      </div>

      {/* Complete Module Entitlement Matrix Table */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Module Registry Entitlement Roster ({filteredModules.length})
            </h4>
            <p className="text-xs text-muted-foreground">
              Distinguishing total tenant base, eligible cohort, and enabled institutional accounts.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="pl-8 pr-3 py-1 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary w-40 sm:w-52"
              />
            </div>

            <select
              value={selectedMacroCategory}
              onChange={(e) => setSelectedMacroCategory(e.target.value)}
              className="px-2.5 py-1 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Domains</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold sticky top-0">
              <tr>
                <th className="p-2.5">Module Name & Identifier</th>
                <th className="p-2.5">Domain</th>
                <th className="p-2.5 text-right">Enabled Orgs</th>
                <th className="p-2.5 text-right">Eligible Orgs</th>
                <th className="p-2.5 text-right">Adoption (% of Eligible)</th>
                <th className="p-2.5 text-right">Total Adoption (%)</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredModules.map((mod) => (
                <tr key={mod.moduleId} className="hover:bg-muted/20">
                  <td className="p-2.5">
                    <div className="font-bold text-foreground">{mod.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {mod.moduleId}
                    </div>
                  </td>
                  <td className="p-2.5 text-muted-foreground uppercase text-[11px] font-medium">
                    {mod.macroCategory}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-foreground">
                    {mod.enabledTenantCount}
                  </td>
                  <td className="p-2.5 text-right font-mono text-muted-foreground">
                    {mod.eligibleTenantCount}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-primary">
                    {mod.adoptionRatePercent}%
                  </td>
                  <td className="p-2.5 text-right font-mono text-muted-foreground">
                    {mod.totalAdoptionRatePercent}%
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        mod.status === 'high_adoption'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : mod.status === 'underutilized'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {mod.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
