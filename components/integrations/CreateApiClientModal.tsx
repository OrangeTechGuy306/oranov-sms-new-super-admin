'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ApiClientType, CreateApiClientInput } from '@/lib/types/integrations';
import { API_SCOPES_CATALOGUE } from '@/lib/integrations/fixtures';
import { validateApiClientInput } from '@/lib/integrations/evaluator';
import { KeyRound, ShieldAlert, AlertTriangle, Plus, Check } from 'lucide-react';

interface CreateApiClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateApiClientInput) => void;
}

export function CreateApiClientModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateApiClientModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientType, setClientType] = useState<ApiClientType>('first_party_console');
  const [organizationName, setOrganizationName] = useState('SchoolSaaS Core');
  const [assignedScopes, setAssignedScopes] = useState<string[]>([
    'organizations:read',
    'subscriptions:read',
  ]);
  const [ipWhitelistStr, setIpWhitelistStr] = useState('');
  const [rateLimitRps, setRateLimitRps] = useState(30);
  const [expiresInDays, setExpiresInDays] = useState(365);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);

  const toggleScope = (scopeKey: string) => {
    if (assignedScopes.includes(scopeKey)) {
      setAssignedScopes(assignedScopes.filter((s) => s !== scopeKey));
    } else {
      setAssignedScopes([...assignedScopes, scopeKey]);
    }
  };

  const handleValidationCheck = () => {
    const ipList = ipWhitelistStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const check = validateApiClientInput({
      name,
      description,
      clientType,
      organizationName,
      assignedScopes,
      ipWhitelist: ipList,
      rateLimitRps: Number(rateLimitRps) || 30,
      expiresInDays: Number(expiresInDays) || 365,
    });

    setErrors(check.errors);
    setWarnings(check.warnings);
    return check.isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleValidationCheck()) {
      return;
    }

    const ipList = ipWhitelistStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      clientType,
      organizationName: organizationName.trim(),
      assignedScopes,
      ipWhitelist: ipList,
      rateLimitRps: Number(rateLimitRps) || 30,
      expiresInDays: Number(expiresInDays) || 365,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register API Client"
      description="Create a client identity for first-party dashboards, automated background workers, or external partners."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {Object.keys(errors).length > 0 && (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Please correct the following errors:
            </div>
            <ul className="mt-1 list-disc pl-5 space-y-0.5">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Security Advisory
            </div>
            <ul className="mt-1 list-disc pl-5 space-y-0.5">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Canvas LMS Integration"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Client Classification</label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as ApiClientType)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="first_party_console">First-Party Internal Console</option>
              <option value="tenant_backend">Tenant Dedicated Service</option>
              <option value="partner_sis">External Partner / SIS / LMS</option>
              <option value="bi_analytics">BI & Reporting Pipeline</option>
              <option value="automation_worker">Automated Cron Worker</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            Application Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain intended usage and system purpose..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Owner / Organization</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g. Platform Core"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Rate Limit (req / sec)</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={rateLimitRps}
              onChange={(e) => setRateLimitRps(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Validity Period (days)</label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value={90}>90 Days</option>
              <option value={180}>180 Days</option>
              <option value={365}>1 Year (365 Days)</option>
              <option value={730}>2 Years</option>
            </select>
          </div>
        </div>

        {/* Scope Selection Palette */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-foreground">
              Assigned Access Scopes <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              {assignedScopes.length} selected
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-border p-2 bg-muted/20">
            {API_SCOPES_CATALOGUE.map((scope) => {
              const isSelected = assignedScopes.includes(scope.key);
              return (
                <div
                  key={scope.key}
                  onClick={() => toggleScope(scope.key)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer border transition-colors ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                      : 'border-transparent hover:bg-muted/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono font-bold text-foreground text-xs">{scope.key}</code>
                      {scope.isElevated && (
                        <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.2 text-[10px] font-semibold">
                          Elevated
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground capitalize">({scope.category})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{scope.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IP Whitelist */}
        <div>
          <label className="block font-semibold text-foreground mb-1">
            Allowed IP Addresses / CIDRs (Optional)
          </label>
          <textarea
            rows={2}
            value={ipWhitelistStr}
            onChange={(e) => setIpWhitelistStr(e.target.value)}
            placeholder="e.g. 192.168.1.0/24 (one per line)"
            className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            Leave blank to permit requests from any IP address. Recommended for production: configure trusted CIDRs.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Register Client
          </button>
        </div>
      </form>
    </Modal>
  );
}
