'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { IntegrationHealthIndicator } from '@/lib/types/integrations';
import { formatDate } from '@/lib/utils/formatters';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Filter,
  Check,
  Search,
} from 'lucide-react';

interface IntegrationHealthTabProps {
  indicators: IntegrationHealthIndicator[];
  onNavigateTab: (tabId: string) => void;
}

export function IntegrationHealthTab({
  indicators,
  onNavigateTab,
}: IntegrationHealthTabProps) {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let list = [...indicators];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.entityName.toLowerCase().includes(q) ||
          i.reason.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== 'all') {
      list = list.filter((i) => i.severity === severityFilter);
    }

    if (entityFilter !== 'all') {
      list = list.filter((i) => i.entityType === entityFilter);
    }

    return list;
  }, [indicators, searchQuery, severityFilter, entityFilter]);

  const criticalCount = indicators.filter((i) => i.severity === 'critical').length;
  const warningCount = indicators.filter((i) => i.severity === 'warning').length;
  const infoCount = indicators.filter((i) => i.severity === 'informational').length;

  return (
    <div className="space-y-4 text-xs">
      {/* Diagnostics KPI Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Indicators
          </span>
          <p className="text-2xl font-bold text-foreground">{indicators.length}</p>
          <span className="text-[10px] text-muted-foreground">Evaluated checks</span>
        </div>

        <div className="rounded-xl border border-rose-300/60 bg-rose-50/50 p-4 space-y-1 dark:border-rose-900/60 dark:bg-rose-950/30 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            Critical Blockers
          </span>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{criticalCount}</p>
          <span className="text-[10px] text-rose-800/80 dark:text-rose-300/80">Requires immediate fix</span>
        </div>

        <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 space-y-1 dark:border-amber-900/60 dark:bg-amber-950/30 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Warnings & Degraded
          </span>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{warningCount}</p>
          <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80">Needs review</span>
        </div>

        <div className="rounded-xl border border-blue-300/60 bg-blue-50/50 p-4 space-y-1 dark:border-blue-900/60 dark:bg-blue-950/30 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Advisories & Inactive
          </span>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{infoCount}</p>
          <span className="text-[10px] text-blue-800/80 dark:text-blue-300/80">Informational notices</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnostic indicators..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Blockers</option>
            <option value="warning">Warnings</option>
            <option value="informational">Informational</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Entity Types</option>
            <option value="integration">Integrations</option>
            <option value="api_client">API Clients</option>
            <option value="webhook_endpoint">Webhook Endpoints</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> indicators
        </div>
      </div>

      {/* Indicators List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
          <p className="font-semibold text-foreground text-sm">All integration health indicators clear</p>
          <p className="text-xs mt-1">No configuration blockers or unresolved delivery failures detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border bg-card p-4 shadow-xs space-y-2 transition-all ${
                item.severity === 'critical'
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : item.severity === 'warning'
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-border'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.severity === 'critical'
                        ? 'error'
                        : item.severity === 'warning'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {item.severity}
                  </Badge>
                  <span className="font-bold text-foreground text-sm">{item.title}</span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
                    {item.entityType.replace('_', ' ')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab(item.targetTab)}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs shrink-0"
                >
                  Resolve in {item.targetTab} <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold">Root Cause: </span>
                  <span className="text-foreground">{item.reason}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Recommended Remediation: </span>
                  <span className="text-foreground font-medium">{item.recommendedAction}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground">
                <span>Target: {item.entityName}</span>
                <span>
                  {item.isDerivedFromDemo
                    ? 'Evaluated from local demonstration data model'
                    : 'Verified by operational probe'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
