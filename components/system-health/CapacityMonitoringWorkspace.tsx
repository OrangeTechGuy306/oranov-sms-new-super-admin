'use client';

import React from 'react';
import { ResourceCapacityObservation } from '@/lib/system-health/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  HardDrive,
  Cpu,
  Database,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';

interface CapacityMonitoringWorkspaceProps {
  capacityObservations: ResourceCapacityObservation[];
}

export function CapacityMonitoringWorkspace({
  capacityObservations,
}: CapacityMonitoringWorkspaceProps) {
  const getResourceIcon = (name: string) => {
    if (name.toLowerCase().includes('cpu')) return <Cpu className="w-4 h-4 text-blue-500" />;
    if (name.toLowerCase().includes('ram') || name.toLowerCase().includes('memory')) return <Layers className="w-4 h-4 text-purple-500" />;
    if (name.toLowerCase().includes('connection') || name.toLowerCase().includes('db')) return <Database className="w-4 h-4 text-emerald-500" />;
    if (name.toLowerCase().includes('storage') || name.toLowerCase().includes('s3')) return <HardDrive className="w-4 h-4 text-cyan-500" />;
    return <Activity className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="purple" size="md">Capacity Modeling</Badge>
          <p className="text-muted-foreground">
            Infrastructure capacity observations define utilization against explicit denominators. When limits are unmetered or unknown, values are labeled as &quot;Denominator Unavailable&quot; to prevent misleading percentage calculations.
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
          Source: Simulated Baseline
        </span>
      </div>

      {/* Resource Capacity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {capacityObservations.map((obs) => {
          const hasDenominator = obs.denominatorValue !== null && obs.utilizationPercentage !== null;
          const isWarning = hasDenominator && obs.warningThreshold && obs.utilizationPercentage! >= obs.warningThreshold;
          const isCritical = hasDenominator && obs.criticalThreshold && obs.utilizationPercentage! >= obs.criticalThreshold;

          let statusColor = 'bg-emerald-500';
          let statusLabel = 'Nominal Headroom';
          let statusVariant: 'success' | 'warning' | 'error' = 'success';

          if (isCritical) {
            statusColor = 'bg-rose-500';
            statusLabel = 'Critical Saturation';
            statusVariant = 'error';
          } else if (isWarning) {
            statusColor = 'bg-amber-500';
            statusLabel = 'Warning Threshold';
            statusVariant = 'warning';
          }

          return (
            <div
              key={obs.id}
              className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4 text-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted/60 shrink-0">
                      {getResourceIcon(obs.resourceName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-xs">{obs.resourceName}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono">{obs.componentName}</span>
                    </div>
                  </div>
                  {hasDenominator ? (
                    <Badge variant={statusVariant} size="sm" dot>
                      {statusLabel}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Unmetered
                    </Badge>
                  )}
                </div>

                {/* Utilization Value & Denominator */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xl font-black text-foreground">
                      {obs.currentValue} {obs.unit}
                    </span>
                    {hasDenominator ? (
                      <span className="text-xs text-muted-foreground">
                        of {obs.denominatorValue} {obs.unit} ({obs.utilizationPercentage}%)
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        Denominator Unavailable
                      </span>
                    )}
                  </div>

                  {/* Progress Gauge Bar */}
                  {hasDenominator ? (
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                        style={{ width: `${Math.min(100, obs.utilizationPercentage!)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-2 rounded-full bg-muted/40 border border-dashed border-border" />
                  )}
                </div>

                {/* Threshold Specs */}
                {obs.warningThreshold && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <span>Warning Alert: &gt;={obs.warningThreshold}%</span>
                    <span>Critical Alert: &gt;={obs.criticalThreshold}%</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Observed: {formatDate(obs.timestamp, true)}</span>
                <Badge variant="info" size="sm">
                  {obs.sourceStatus}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
