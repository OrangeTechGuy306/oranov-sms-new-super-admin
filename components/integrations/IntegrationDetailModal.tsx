'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { IntegrationRecord } from '@/lib/types/integrations';
import { formatDate } from '@/lib/utils/formatters';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Clock,
  Key,
  Shield,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface IntegrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationRecord | null;
  onOpenConfig?: (integration: IntegrationRecord) => void;
  onVerify?: (integration: IntegrationRecord) => void;
}

export function IntegrationDetailModal({
  isOpen,
  onClose,
  integration,
  onOpenConfig,
  onVerify,
}: IntegrationDetailModalProps) {
  if (!integration) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground">{integration.name}</span>
            <span className="block text-xs font-normal text-muted-foreground">
              Provider: {integration.provider}
            </span>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Demonstration metadata only</span>
          </div>
          <div className="flex items-center gap-2">
            {onVerify && integration.configStatus === 'configured' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerify(integration);
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Simulate Connection Test
              </button>
            )}
            {onOpenConfig && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConfig(integration);
                }}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Edit Configuration
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Status Pills Banner */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
              Configuration Status
            </span>
            <Badge
              variant={
                integration.configStatus === 'configured'
                  ? 'success'
                  : integration.configStatus === 'incomplete'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {integration.configStatus}
            </Badge>
          </div>

          <div className="h-8 w-px bg-border" />

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
              Verification Status
            </span>
            <Badge
              variant={
                integration.verificationStatus === 'verified_demo'
                  ? 'success'
                  : integration.verificationStatus === 'verification_pending'
                  ? 'info'
                  : integration.verificationStatus === 'failed'
                  ? 'error'
                  : 'neutral'
              }
            >
              {integration.verificationStatus}
            </Badge>
          </div>

          <div className="h-8 w-px bg-border" />

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
              Scope
            </span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {integration.scope === 'platform_wide' ? 'Platform-Wide' : 'Tenant-Scoped'}
            </span>
          </div>

          <div className="h-8 w-px bg-border" />

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
              Lifecycle
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                integration.isEnabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  integration.isEnabled ? 'bg-emerald-500' : 'bg-muted-foreground'
                }`}
              />
              {integration.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Missing Fields Warning */}
        {integration.missingFields && integration.missingFields.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Missing Mandatory Parameters
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              This integration cannot be activated until the following configuration parameters are supplied:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {integration.missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded bg-amber-200/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description & Overview */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Service Overview</h4>
          <p className="text-muted-foreground leading-relaxed">{integration.description}</p>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Registered Capabilities</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {integration.capabilities.map((cap) => (
              <div
                key={cap}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Permissions */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Required Platform Privileges</h4>
          <div className="flex flex-wrap gap-1.5">
            {integration.requiredPermissions.map((perm) => (
              <span
                key={perm}
                className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-foreground"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Config Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Connection & Protocol Parameters</h4>
          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">API Base Endpoint</span>
                <p className="font-mono text-foreground text-xs truncate">
                  {integration.config.baseUrl || 'Not configured'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Environment Target</span>
                <p className="font-medium text-foreground text-xs uppercase">
                  {integration.config.environment || 'production'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Authentication Type</span>
                <p className="font-medium text-foreground text-xs">
                  {integration.config.authType || 'api_key'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Masked Credential Token</span>
                <p className="font-mono text-muted-foreground text-xs">
                  {integration.config.maskedKeyPlaceholder || 'None set'}
                </p>
              </div>
            </div>

            {integration.config.rateLimitPerMin && (
              <div className="border-t border-border pt-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Egress Rate Limit</span>
                <p className="font-medium text-foreground text-xs">
                  {integration.config.rateLimitPerMin.toLocaleString()} requests / minute
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Last config update: {formatDate(integration.lastConfigUpdatedAt)}</span>
          </div>
          {integration.lastVerifiedAt && (
            <div>Last verified: {formatDate(integration.lastVerifiedAt)}</div>
          )}
          {integration.documentationUrl && (
            <a
              href={integration.documentationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Provider Documentation <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
