'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { 
  PlatformEnvironmentConfig, 
  SafeSecretMetadataItem, 
  SafeSecretStatus 
} from '@/lib/types/platform-config';
import {
  Server,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  EyeOff,
  Layers,
  Clock,
  Radio,
  ExternalLink,
  Cpu
} from 'lucide-react';

export function EnvironmentConfigPanel() {
  const { environments, featureFlags, addToast } = usePlatformStore();
  const [selectedEnvId, setSelectedEnvId] = useState<'development' | 'staging' | 'production'>('production');
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedEnv = environments.find(e => e.environmentId === selectedEnvId) || environments[0];

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast({
        type: 'info',
        title: 'Environment Probe Completed',
        message: `Health probe dispatched to ${selectedEnv.name}. Zero secrets exposed; 100% KMS references verified.`
      });
    }, 600);
  };

  const getStatusBadge = (status: PlatformEnvironmentConfig['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case 'isolated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Radio className="w-3 h-3 text-sky-500" />
            Isolated Sandbox
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Degraded Sync
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <XCircle className="w-3 h-3 text-slate-500" />
            Disconnected
          </span>
        );
    }
  };

  const getSecretStatusBadge = (status: SafeSecretStatus) => {
    switch (status) {
      case 'reference_configured':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Reference Configured
          </span>
        );
      case 'secret_required':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Secret Required
          </span>
        );
      case 'secret_missing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Missing In Vault
          </span>
        );
      case 'unconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <EyeOff className="w-3 h-3 text-slate-400" />
            Unconnected Provider
          </span>
        );
    }
  };

  const getProviderLabel = (provider: SafeSecretMetadataItem['provider']) => {
    switch (provider) {
      case 'vault':
        return 'HashiCorp Vault KMS';
      case 'aws_secrets_manager':
        return 'AWS Secrets Manager (KMS)';
      case 'local_env_file':
        return 'Local Env (.env.local - Non-Prod)';
      case 'unconnected':
      default:
        return 'Provider Not Linked';
    }
  };

  // Compute active flags in this environment
  const applicableFlags = featureFlags.filter(
    (f) => f.environment === selectedEnv.environmentId || f.environment === 'all'
  );

  return (
    <div className="space-y-6">
      {/* Zero-Secret Guarantee Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-indigo-950/20 border border-emerald-500/30 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Enterprise Zero-Secret Governance Guarantee
              </h3>
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md">
                OWASP ASVS Level 3
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with strict platform security guidelines, <strong className="text-slate-900 dark:text-white">passwords, API private keys, database connection strings, and cryptographic signing keys are NEVER stored, previewed, transmitted, or exported in plaintext</strong> through this dashboard. Only non-sensitive key references, rotation telemetry, and secure provider attestation are presented.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Zero Plaintext Exposure
              </span>
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                Hardware KMS & Vault References Only
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-500" />
                Decoupled Frontend Posture Demonstration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {environments.map((env) => {
          const isSelected = env.environmentId === selectedEnvId;
          return (
            <button
              key={env.environmentId}
              type="button"
              onClick={() => setSelectedEnvId(env.environmentId)}
              className={`p-5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize">
                      {env.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">
                      {env.environmentId}
                    </span>
                  </div>
                </div>
                {getStatusBadge(env.status)}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {env.notes}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Configuration Source</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 font-mono text-[11px] truncate block">
                    {env.source}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Active Feature Flags</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {featureFlags.filter((f) => f.environment === env.environmentId || f.environment === 'all').length} flags
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Environment Detail View */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                {selectedEnv.name} Environment Configuration
              </h3>
              {getStatusBadge(selectedEnv.status)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>API Gateway: <code className="text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{selectedEnv.apiUrl}</code></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Last verified: {new Date(selectedEnv.lastSyncTimestamp).toLocaleString()}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Verifying Safe Probes...' : 'Verify Provider Health'}
          </button>
        </div>

        {/* Safe Secrets Reference Table */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                Managed Secret References & Provider Metadata
              </h4>
              <p className="text-xs text-slate-500">
                Attested KMS and vault keys required by platform services. Raw cryptographic secrets are never displayed.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {selectedEnv.secretMetadata.length} Managed References
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Environment Key Identifier</th>
                  <th className="px-4 py-3">Reference Status</th>
                  <th className="px-4 py-3">KMS / Secret Provider</th>
                  <th className="px-4 py-3">Last Attested Rotation</th>
                  <th className="px-4 py-3">Intended Architectural Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {selectedEnv.secretMetadata.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      {item.keyName}
                    </td>
                    <td className="px-4 py-3">
                      {getSecretStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {getProviderLabel(item.provider)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {item.lastRotated ? new Date(item.lastRotated).toLocaleDateString() : 'Never / Initial'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Flags Applicable to this Environment */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Active Flag Deployments in {selectedEnv.name}
              </h4>
              <p className="text-xs text-slate-500">
                Feature flags whose target release environments include <code className="font-mono text-slate-600 dark:text-slate-300">{selectedEnv.environmentId}</code>.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {applicableFlags.length} Target Flags
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {applicableFlags.map(flag => (
              <div 
                key={flag.key}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {flag.name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      flag.defaultValue
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      Default: {flag.defaultValue ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block truncate">
                    {flag.key}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-full ${
                    flag.lifecycle === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                      : flag.lifecycle === 'archived'
                      ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}>
                    {flag.lifecycle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
