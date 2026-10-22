'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { IntegrationRecord, UpdateIntegrationInput } from '@/lib/types/integrations';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react';

interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationRecord | null;
  onSave: (id: string, updates: UpdateIntegrationInput) => void;
}

interface IntegrationConfigFormProps {
  integration: IntegrationRecord;
  onClose: () => void;
  onSave: (id: string, updates: UpdateIntegrationInput) => void;
}

function IntegrationConfigForm({
  integration,
  onClose,
  onSave,
}: IntegrationConfigFormProps) {
  const [baseUrl, setBaseUrl] = useState(integration.config.baseUrl || '');
  const [environment, setEnvironment] = useState<'sandbox' | 'staging' | 'production'>(
    integration.config.environment || 'production'
  );
  const [rateLimitPerMin, setRateLimitPerMin] = useState(
    integration.config.rateLimitPerMin || 1200
  );
  const [isEnabled, setIsEnabled] = useState(integration.isEnabled);
  const [dummyApiKey, setDummyApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!baseUrl.trim()) {
      setError('Base URL cannot be blank.');
      return;
    }

    try {
      new URL(baseUrl.trim());
    } catch {
      setError('Invalid Base URL format. Must be a valid URI (e.g. https://api.provider.com).');
      return;
    }

    const updates: UpdateIntegrationInput = {
      isEnabled,
      configStatus: 'configured',
      missingFields: [],
      config: {
        baseUrl: baseUrl.trim(),
        environment,
        rateLimitPerMin: Number(rateLimitPerMin) || 1200,
        maskedKeyPlaceholder: dummyApiKey.trim()
          ? `sk_demo_••••••••••••••••${dummyApiKey.trim().slice(-4)}`
          : integration.config.maskedKeyPlaceholder,
      },
    };

    onSave(integration.id, updates);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          Safe Demonstration Mode
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
          Any API keys entered here will only be stored locally in memory / localStorage. Real credentials should never be entered into this prototype console.
        </p>
      </div>

      <div>
        <label className="block font-semibold text-foreground mb-1">
          API Base Endpoint URL <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.provider.com/v1"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-hidden"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-foreground mb-1">Target Environment</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as 'sandbox' | 'staging' | 'production')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="sandbox">Sandbox / Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Egress Rate Limit (req/min)</label>
          <input
            type="number"
            min={10}
            max={100000}
            value={rateLimitPerMin}
            onChange={(e) => setRateLimitPerMin(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-foreground mb-1">
          Simulated API Key / Secret Token (Demo Masking)
        </label>
        <div className="relative">
          <input
            type="password"
            value={dummyApiKey}
            onChange={(e) => setDummyApiKey(e.target.value)}
            placeholder={integration.config.maskedKeyPlaceholder || 'Enter fictional secret (e.g. sk_test_...)'}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          <div className="absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </div>
        <span className="mt-1 block text-[10px] text-muted-foreground">
          Current stored preview: <code className="font-mono">{integration.config.maskedKeyPlaceholder || 'None'}</code>
        </span>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
        <div>
          <span className="font-semibold text-foreground block">Enable Integration</span>
          <span className="text-[11px] text-muted-foreground">
            Allow platform workflows to route automated requests through this service
          </span>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-5 w-9 rounded-full bg-muted-foreground/30 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-hidden" />
        </label>
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
          Save Configuration
        </button>
      </div>
    </form>
  );
}

export function IntegrationConfigModal({
  isOpen,
  onClose,
  integration,
  onSave,
}: IntegrationConfigModalProps) {
  if (!integration) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${integration.name}`}
      description="Update connection parameters and operational policies for this third-party service."
      size="md"
    >
      <IntegrationConfigForm
        key={integration.id}
        integration={integration}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}
