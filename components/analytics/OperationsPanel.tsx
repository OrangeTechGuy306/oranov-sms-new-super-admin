'use client';

import React from 'react';
import {
  OperationsAnalyticsSummary,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import {
  Activity,
  Server,
  AlertTriangle,
  Database,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface OperationsPanelProps {
  metrics: OperationsAnalyticsSummary;
  filters: AnalyticsGlobalFilters;
}

export function OperationsPanel({
  metrics,
  filters,
}: OperationsPanelProps) {
  // Service health components breakdown
  const componentItems = [
    { key: 'operational', label: 'Operational (Healthy)', count: metrics.operationalComponents, percentage: Math.round((metrics.operationalComponents / Math.max(1, metrics.totalComponents)) * 100), colorHex: '#10b981' },
    { key: 'degraded', label: 'Degraded Performance', count: metrics.degradedComponents, percentage: Math.round((metrics.degradedComponents / Math.max(1, metrics.totalComponents)) * 100), colorHex: '#f59e0b' },
    { key: 'outage', label: 'Service Outage', count: metrics.outageComponents, percentage: Math.round((metrics.outageComponents / Math.max(1, metrics.totalComponents)) * 100), colorHex: '#ef4444' },
    { key: 'maintenance', label: 'Scheduled Maintenance', count: metrics.maintenanceComponents, percentage: Math.round((metrics.maintenanceComponents / Math.max(1, metrics.totalComponents)) * 100), colorHex: '#64748b' },
  ].filter((it) => it.count > 0);

  return (
    <div className="space-y-6">
      {/* Telemetry Integrity Disclaimer */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Infrastructure Telemetry & Observability Architecture (Phase E-09.14 Integration)
        </h4>
        <p className="text-muted-foreground">
          Telemetry indicators below are evaluated from deterministic synthetic observation fixtures.
          <strong className="text-foreground ml-1">Observability Boundary:</strong> The dashboard does not execute raw TCP socket pings or live Prometheus queries in the browser. Production SRE telemetry will be ingested from real-time agent pipelines.
        </p>
      </div>

      {/* Primary Operations StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Platform Status"
          value={metrics.overallHealthStatus.toUpperCase()}
          subtitle={`${metrics.operationalComponents} of ${metrics.totalComponents} services healthy`}
          icon={<Server className="w-5 h-5 text-emerald-500" />}
          badge={{
            label: metrics.overallHealthStatus === 'healthy' ? 'Nominal' : 'Attention',
            variant: metrics.overallHealthStatus === 'healthy' ? 'success' : 'warning',
          }}
        />

        <StatCard
          title="Incidents in Period"
          value={metrics.totalIncidentsInPeriod}
          subtitle={`${metrics.activeIncidentsCount} currently open or investigating`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          badge={{
            label: `${filters.dateRange.label}`,
            variant: 'info',
          }}
        />

        <StatCard
          title="Mean Time to Resolution"
          value={metrics.meanTimeToResolutionMinutes !== null ? `${metrics.meanTimeToResolutionMinutes}m` : 'N/A'}
          subtitle="MTTR for resolved infrastructure incidents"
          icon={<Clock className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="Backup Verification Ratio"
          value={`${metrics.verifiedBackupsRatio.verified} / ${metrics.verifiedBackupsRatio.total}`}
          subtitle="Multi-tenant automated restore tests passed"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsDonutChart
          title="Service Component Health Status"
          description="Operational state distribution across core microservices and databases."
          items={componentItems}
          centerLabel="Services"
          centerValue={metrics.totalComponents}
        />

        <AnalyticsBarChart
          title="Incident Severity Distribution"
          description="Historical incident count by classification (Critical, Major, Minor)."
          items={metrics.incidentSeverityDistribution}
          unit="Incidents"
        />
      </div>

      {/* Capacity & Observability Alert Table */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Monitored Cluster Telemetry & Resource Capacity Gauges
        </h4>
        <p className="text-xs text-muted-foreground">
          Simulated node metrics and automated threshold evaluation warnings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 text-xs">
          <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
            <span className="font-semibold text-muted-foreground block">PostgreSQL Primary DB</span>
            <div className="text-lg font-bold font-mono text-foreground">68% CPU • 42% Disk</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● WITHIN CAPACITY</span>
          </div>

          <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
            <span className="font-semibold text-muted-foreground block">Redis Session Cluster</span>
            <div className="text-lg font-bold font-mono text-foreground">34% Memory • 12ms P95</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● NOMINAL</span>
          </div>

          <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
            <span className="font-semibold text-muted-foreground block">Object Storage (S3 Assets)</span>
            <div className="text-lg font-bold font-mono text-foreground">1.8 TB • 2.4% Rate/Mo</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● NOMINAL</span>
          </div>

          <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
            <span className="font-semibold text-muted-foreground block">CBT Testing Engine Pods</span>
            <div className="text-lg font-bold font-mono text-foreground">58% Autoscaled HPA</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
