'use client';

import React from 'react';
import { PlatformHealthSummary } from '@/lib/system-health/types';
import { StatCard } from '@/components/ui/StatCard';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Radio,
  Layers,
  Wrench,
} from 'lucide-react';

interface SystemHealthSummaryCardsProps {
  summary: PlatformHealthSummary;
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onOpenIncidentsTab: () => void;
}

export function SystemHealthSummaryCards({
  summary,
  activeStatusFilter,
  onSelectStatusFilter,
  onOpenIncidentsTab,
}: SystemHealthSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {/* 1. Total Registered Components */}
      <div
        onClick={() => onSelectStatusFilter('all')}
        className={`cursor-pointer transition-all rounded-xl ${
          activeStatusFilter === 'all'
            ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background'
            : 'hover:opacity-90'
        }`}
      >
        <StatCard
          title="All Components"
          value={summary.totalComponents}
          subtitle="Platform inventory"
          icon={<Layers className="w-4 h-4 text-primary" />}
        />
      </div>

      {/* 2. Healthy / Operational */}
      <div
        onClick={() => onSelectStatusFilter('healthy')}
        className={`cursor-pointer transition-all rounded-xl ${
          activeStatusFilter === 'healthy'
            ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-background'
            : 'hover:opacity-90'
        }`}
      >
        <StatCard
          title="Operational"
          value={summary.healthyCount}
          subtitle={`${Math.round((summary.healthyCount / Math.max(1, summary.totalComponents)) * 100)}% of components`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* 3. Degraded */}
      <div
        onClick={() => onSelectStatusFilter('degraded')}
        className={`cursor-pointer transition-all rounded-xl ${
          activeStatusFilter === 'degraded'
            ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-background'
            : 'hover:opacity-90'
        }`}
      >
        <StatCard
          title="Degraded"
          value={summary.degradedCount}
          subtitle="Performance warning"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* 4. Critical Outage */}
      <div
        onClick={() => onSelectStatusFilter('critical')}
        className={`cursor-pointer transition-all rounded-xl ${
          activeStatusFilter === 'critical'
            ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-background'
            : 'hover:opacity-90'
        }`}
      >
        <StatCard
          title="Critical Outage"
          value={summary.criticalCount}
          subtitle={summary.criticalCount > 0 ? 'Requires immediate triage' : 'No active outages'}
          icon={<AlertOctagon className="w-4 h-4 text-rose-500" />}
        />
      </div>

      {/* 5. Unknown / Stale / Disconnected */}
      <div
        onClick={() => onSelectStatusFilter('unverified')}
        className={`cursor-pointer transition-all rounded-xl ${
          activeStatusFilter === 'unverified'
            ? 'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-background'
            : 'hover:opacity-90'
        }`}
      >
        <StatCard
          title="Unverified / Stale"
          value={summary.unknownCount + summary.staleCount + summary.notConnectedCount}
          subtitle={`${summary.notConnectedCount} not connected`}
          icon={<Radio className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* 6. Scheduled Maintenance */}
      <div
        onClick={() => onSelectStatusFilter('maintenance')}
        className={`cursor-pointer transition-all rounded-xl ${
          activeStatusFilter === 'maintenance'
            ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-background'
            : 'hover:opacity-90'
        }`}
      >
        <StatCard
          title="Maintenance"
          value={summary.maintenanceCount}
          subtitle="Scheduled windows"
          icon={<Wrench className="w-4 h-4 text-blue-500" />}
        />
      </div>

      {/* 7. Active Demonstration Incidents */}
      <div
        onClick={onOpenIncidentsTab}
        className="cursor-pointer transition-all rounded-xl hover:opacity-90"
      >
        <StatCard
          title="Open Incidents"
          value={summary.openIncidentsCount}
          subtitle="Click to view lifecycle"
          icon={<Activity className="w-4 h-4 text-purple-500" />}
        />
      </div>
    </div>
  );
}
