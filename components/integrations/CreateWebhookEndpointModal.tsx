'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { WebhookEndpointRecord, CreateWebhookEndpointInput } from '@/lib/types/integrations';
import { WEBHOOK_EVENT_CATALOGUE } from '@/lib/integrations/fixtures';
import { validateWebhookEndpointInput } from '@/lib/integrations/evaluator';
import { AlertTriangle, Globe } from 'lucide-react';

interface CreateWebhookEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateWebhookEndpointInput) => void;
  initialEndpoint?: WebhookEndpointRecord | null;
}

interface WebhookEndpointFormProps {
  initialEndpoint?: WebhookEndpointRecord | null;
  onClose: () => void;
  onSubmit: (input: CreateWebhookEndpointInput) => void;
}

function WebhookEndpointForm({
  initialEndpoint,
  onClose,
  onSubmit,
}: WebhookEndpointFormProps) {
  const [name, setName] = useState(initialEndpoint?.name || '');
  const [destinationUrl, setDestinationUrl] = useState(
    initialEndpoint?.destinationUrl || 'https://hooks.demo-tenant.internal/webhooks/listener'
  );
  const [description, setDescription] = useState(initialEndpoint?.description || '');
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>(
    initialEndpoint ? [...initialEndpoint.subscribedEvents] : ['organization.created', 'subscription.plan_updated']
  );
  const [timeoutMs, setTimeoutMs] = useState(initialEndpoint?.timeoutMs || 5000);
  const [rateLimitPerSec, setRateLimitPerSec] = useState(initialEndpoint?.rateLimitPerSec || 10);
  const [maxRetries, setMaxRetries] = useState(initialEndpoint?.retryPolicy.maxRetries || 3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleEvent = (eventId: string) => {
    if (subscribedEvents.includes(eventId)) {
      setSubscribedEvents(subscribedEvents.filter((e) => e !== eventId));
    } else {
      setSubscribedEvents([...subscribedEvents, eventId]);
    }
  };

  const handleSelectAllEvents = () => {
    setSubscribedEvents(WEBHOOK_EVENT_CATALOGUE.map((e) => e.id));
  };

  const handleClearAllEvents = () => {
    setSubscribedEvents([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: CreateWebhookEndpointInput = {
      name: name.trim(),
      destinationUrl: destinationUrl.trim(),
      description: description.trim(),
      subscribedEvents,
      timeoutMs,
      rateLimitPerSec,
      retryPolicy: {
        maxRetries,
        initialIntervalSec: 5,
        backoffMultiplier: 2,
      },
    };

    const validation = validateWebhookEndpointInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(input);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {errors._global && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errors._global}</span>
        </div>
      )}

      <div>
        <label className="block font-semibold text-foreground mb-1">
          Endpoint Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="e.g. Primary Billing Webhook"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          required
        />
        {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
      </div>

      <div>
        <label className="block font-semibold text-foreground mb-1">
          Destination URL <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => {
              setDestinationUrl(e.target.value);
              if (errors.destinationUrl) setErrors((prev) => ({ ...prev, destinationUrl: '' }));
            }}
            placeholder="https://hooks.demo-tenant.internal/webhooks/listener"
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-hidden"
            required
          />
          <div className="absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none">
            <Globe className="h-3.5 w-3.5" />
          </div>
        </div>
        {errors.destinationUrl ? (
          <p className="mt-1 text-[11px] text-rose-600">{errors.destinationUrl}</p>
        ) : (
          <span className="mt-1 block text-[10px] text-muted-foreground">
            Must be a valid HTTPS URL (or HTTP on localhost/demo hosts). No outbound traffic will be sent from this demo dashboard.
          </span>
        )}
      </div>

      <div>
        <label className="block font-semibold text-foreground mb-1">Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the downstream subscriber system or target workload..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block font-semibold text-foreground mb-1">HTTP Timeout (ms)</label>
          <input
            type="number"
            min={1000}
            max={30000}
            step={500}
            value={timeoutMs}
            onChange={(e) => setTimeoutMs(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          {errors.timeoutMs && <p className="mt-1 text-[10px] text-rose-600">{errors.timeoutMs}</p>}
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Rate Limit (req/s)</label>
          <input
            type="number"
            min={1}
            max={500}
            value={rateLimitPerSec}
            onChange={(e) => setRateLimitPerSec(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          {errors.rateLimitPerSec && <p className="mt-1 text-[10px] text-rose-600">{errors.rateLimitPerSec}</p>}
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Max Retries</label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxRetries}
            onChange={(e) => setMaxRetries(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          {errors.maxRetries && <p className="mt-1 text-[10px] text-rose-600">{errors.maxRetries}</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-semibold text-foreground">
            Subscribed Events ({subscribedEvents.length} selected) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleSelectAllEvents}
              className="text-primary hover:underline"
            >
              Select All
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              type="button"
              onClick={handleClearAllEvents}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>

        {errors.subscribedEvents && (
          <p className="mb-1.5 text-[11px] text-rose-600">{errors.subscribedEvents}</p>
        )}

        <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border border-border p-2 bg-muted/20">
          {WEBHOOK_EVENT_CATALOGUE.map((event) => {
            const isSelected = subscribedEvents.includes(event.id);
            return (
              <div
                key={event.id}
                onClick={() => toggleEvent(event.id)}
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
                    <code className="font-mono font-bold text-foreground text-xs">{event.id}</code>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      [{event.category}]
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
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
          {initialEndpoint ? 'Save Changes' : 'Create Endpoint'}
        </button>
      </div>
    </form>
  );
}

export function CreateWebhookEndpointModal({
  isOpen,
  onClose,
  onSubmit,
  initialEndpoint,
}: CreateWebhookEndpointModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEndpoint ? `Edit ${initialEndpoint.name}` : 'Register Webhook Endpoint'}
      description="Configure event subscriptions and delivery policies for an automated HTTP callback destination."
      size="lg"
    >
      {isOpen && (
        <WebhookEndpointForm
          key={initialEndpoint?.id || 'new'}
          initialEndpoint={initialEndpoint}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
