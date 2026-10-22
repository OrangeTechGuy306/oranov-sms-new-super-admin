'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { IntegrationRecord } from '@/lib/types/integrations';
import { filterIntegrations } from '@/lib/integrations/evaluator';
import { formatDate } from '@/lib/utils/formatters';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  Play,
  RotateCcw,
  Check,
  Shield,
  ExternalLink,
  Info,
} from 'lucide-react';

interface IntegrationRegistryTabProps {
  integrations: IntegrationRecord[];
  onOpenDetails: (integration: IntegrationRecord) => void;
  onOpenConfig: (integration: IntegrationRecord) => void;
  onToggleEnabled: (id: string) => void;
  onVerifyConnection: (id: string) => void;
}

export function IntegrationRegistryTab({
  integrations,
  onOpenDetails,
  onOpenConfig,
  onToggleEnabled,
  onVerifyConnection,
}: IntegrationRegistryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enabledFilter, setEnabledFilter] = useState('all');

  const filtered = useMemo(() => {
    return filterIntegrations(integrations, searchQuery, categoryFilter, statusFilter, enabledFilter);
  }, [integrations, searchQuery, categoryFilter, statusFilter, enabledFilter]);

  const categoryBadges: Record<string, string> = {
    payment: 'Payment',
    email_sms: 'Email / SMS',
    identity_sso: 'Identity & SSO',
    video_conferencing: 'Video Suite',
    storage: 'Cloud Storage',
    sis_lms: 'SIS & LMS',
    analytics: 'Analytics',
    custom_api: 'Custom API',
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider name, capability, or keyword..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="payment">Payment Gateways</option>
            <option value="email_sms">Email & SMS Messaging</option>
            <option value="identity_sso">Identity & SSO</option>
            <option value="video_conferencing">Video Suite</option>
            <option value="storage">Object Storage</option>
            <option value="sis_lms">SIS / LMS Systems</option>
            <option value="analytics">Product Telemetry</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Config States</option>
            <option value="configured">Configured</option>
            <option value="incomplete">Incomplete / Action Needed</option>
            <option value="not_configured">Not Configured</option>
          </select>

          {/* Enabled Filter */}
          <select
            value={enabledFilter}
            onChange={(e) => setEnabledFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Lifecycles</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {integrations.length} providers
        </div>
      </div>

      {/* Grid of Providers */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          <Layers className="mx-auto h-8 w-8 opacity-40 mb-2" />
          <p className="font-semibold text-foreground text-sm">No integration providers match filters</p>
          <p className="text-xs mt-1">Try broadening your search query or resetting category filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border bg-card p-4 shadow-xs transition-all flex flex-col justify-between ${
                item.isEnabled ? 'border-border' : 'border-border/60 opacity-80'
              }`}
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {categoryBadges[item.category] || item.category}
                    </span>
                    <h4 className="font-bold text-foreground text-sm">{item.name}</h4>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {item.provider}
                    </span>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={item.isEnabled}
                      onChange={() => onToggleEnabled(item.id)}
                      className="peer sr-only"
                    />
                    <div className="peer h-5 w-9 rounded-full bg-muted-foreground/30 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-hidden" />
                  </label>
                </div>

                <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Badge
                    variant={
                      item.configStatus === 'configured'
                        ? 'success'
                        : item.configStatus === 'incomplete'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {item.configStatus}
                  </Badge>

                  <Badge
                    variant={
                      item.verificationStatus === 'verified_demo'
                        ? 'success'
                        : item.verificationStatus === 'verification_pending'
                        ? 'info'
                        : item.verificationStatus === 'failed'
                        ? 'error'
                        : 'neutral'
                    }
                  >
                    {item.verificationStatus.replace('_', ' ')}
                  </Badge>

                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                    {item.scope === 'platform_wide' ? 'Platform Scope' : 'Tenant Scoped'}
                  </span>
                </div>

                {/* Missing Fields Pill */}
                {item.missingFields && item.missingFields.length > 0 && (
                  <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2 text-amber-700 dark:text-amber-300 text-[11px]">
                    <span className="font-semibold block">Missing fields:</span>
                    <span className="font-mono text-[10px]">{item.missingFields.join(', ')}</span>
                  </div>
                )}

                {/* Capabilities pills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.capabilities.slice(0, 3).map((cap) => (
                    <span
                      key={cap}
                      className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                  {item.capabilities.length > 3 && (
                    <span className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      +{item.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground truncate">
                  Updated: {formatDate(item.lastConfigUpdatedAt)}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onVerifyConnection(item.id)}
                    title="Simulate connection test against local mock adapter"
                    className="rounded border border-border p-1.5 text-foreground hover:bg-muted transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 text-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenConfig(item)}
                    className="rounded border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Configure
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDetails(item)}
                    className="rounded bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
