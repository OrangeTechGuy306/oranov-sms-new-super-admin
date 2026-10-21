'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProviderRecord, ProviderConfigStatus, ProviderConnectionStatus, ProviderReadinessTier } from '@/lib/types/communications';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { formatDate } from '@/lib/utils/formatters';
import {
  Server,
  Lock,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Play,
  Mail,
  Smartphone,
  Bell,
  MessageSquare,
  Key,
  Info,
} from 'lucide-react';

export function ChannelProvidersPanel() {
  const { communicationProviders, simulateProviderHealthCheck } = usePlatformStore();
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { latencyMs: number; output: string; time: string; success: boolean }>>({});

  const handleTestConnection = (providerId: string) => {
    setTestingProviderId(providerId);
    setTimeout(() => {
      const res = simulateProviderHealthCheck(providerId);
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          latencyMs: res.latencyMs,
          output: res.simulatedOutput,
          time: res.checkedAt,
          success: res.success,
        },
      }));
      setTestingProviderId(null);
    }, 600);
  };

  const renderTierBadge = (tier: ProviderReadinessTier) => {
    switch (tier) {
      case 'verified_connected':
        return <Badge variant="success">Verified Connected</Badge>;
      case 'demo_model':
        return <Badge variant="info">Demo Model (Local)</Badge>;
      case 'backend_ready':
        return <Badge variant="warning">Backend Ready (Spec)</Badge>;
      case 'ui_available':
        return <Badge variant="neutral">UI Available Only</Badge>;
      default:
        return <Badge variant="neutral">{tier}</Badge>;
    }
  };

  const renderConfigBadge = (status: ProviderConfigStatus) => {
    switch (status) {
      case 'configured':
        return <Badge variant="success">Configured</Badge>;
      case 'missing_vault_secret':
        return <Badge variant="error">Missing Vault Secret</Badge>;
      case 'not_configured':
        return <Badge variant="warning">Not Configured</Badge>;
      case 'disabled':
        return <Badge variant="neutral">Disabled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderChannelIcon = (ch: string) => {
    switch (ch) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-amber-500" />;
      case 'in_app':
        return <Bell className="w-4 h-4 text-purple-500" />;
      case 'push':
        return <Smartphone className="w-4 h-4 text-indigo-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          Channel & Provider Configuration Visibility
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Inspect downstream delivery gateway readiness, required vault references, and supported channel capabilities.
        </p>
      </div>

      {/* OWASP ASVS Level 3 Zero-Secret Guarantee Banner */}
      <Card className="p-4 bg-muted/20 border-border/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>OWASP Zero-Secret Architecture Guarantee</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In strict compliance with cloud security standards, <strong>zero provider credentials, API keys, or SMTP passwords</strong> are stored in or accessible to the Super-Admin web console. Gateway adapters reference encrypted vault paths (e.g. AWS Secrets Manager, HashiCorp Vault) evaluated exclusively by future backend delivery workers.
        </p>
      </Card>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communicationProviders.map((prov) => {
          const testRes = testResults[prov.id];
          const isTesting = testingProviderId === prov.id;

          return (
            <Card key={prov.id} className="p-5 space-y-4 border border-border shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header: Name, Channel & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-muted text-foreground">
                      {renderChannelIcon(prov.channel)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {prov.displayName}
                      </h4>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase">
                        Channel: {prov.channel}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderTierBadge(prov.readinessTier)}
                    {renderConfigBadge(prov.configStatus)}
                  </div>
                </div>

                {/* Purpose */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {prov.purpose}
                </p>

                {/* Secret Reference */}
                <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    KMS Vault Secret Reference
                  </span>
                  <code className="text-[11px] text-foreground font-mono block truncate">
                    {prov.vaultSecretRef}
                  </code>
                </div>

                {/* Required Environment Keys */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-semibold text-muted-foreground block">
                    Required Environment Parameters:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {prov.requiredEnvKeys.map((key) => (
                      <span key={key} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-semibold text-muted-foreground block">
                    Supported Gateway Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {prov.supportedCapabilities.map((cap) => (
                      <span key={cap} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Simulated Health Test */}
              <div className="pt-3 border-t border-border space-y-2 mt-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Last Activity:</span>
                  <span className="font-mono">
                    {prov.lastSimulatedActivity ? formatDate(prov.lastSimulatedActivity) : 'No recorded activity'}
                  </span>
                </div>

                {testRes && (
                  <div className={`p-2 rounded text-[11px] border ${
                    testRes.success
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                  }`}>
                    <p className="font-semibold">{testRes.output}</p>
                    <span className="text-[10px] opacity-80 block mt-0.5 font-mono">
                      Probe Completed: {formatDate(testRes.time)}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleTestConnection(prov.id)}
                  disabled={isTesting}
                  className="w-full py-1.5 rounded-lg border border-border hover:bg-muted font-semibold text-xs text-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  {isTesting ? 'Probing Simulated Gateway...' : 'Simulate Connection Health Check'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
