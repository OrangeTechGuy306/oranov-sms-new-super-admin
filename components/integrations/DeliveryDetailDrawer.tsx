'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { WebhookDeliveryRecord } from '@/lib/types/integrations';
import { canRetryDelivery } from '@/lib/integrations/evaluator';
import { formatDate } from '@/lib/utils/formatters';
import {
  Webhook,
  RotateCcw,
  AlertTriangle,
  Copy,
  Check,
  Lock,
} from 'lucide-react';

interface DeliveryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: WebhookDeliveryRecord | null;
  onRetry: (deliveryId: string, simulateSuccess?: boolean) => void;
}

export function DeliveryDetailDrawer({
  isOpen,
  onClose,
  delivery,
  onRetry,
}: DeliveryDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'payload' | 'headers' | 'attempts'>('payload');
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!delivery) return null;

  const retryCheck = canRetryDelivery(delivery);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(delivery.payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getOutcomeBadgeVariant = (outcome: string): 'success' | 'warning' | 'error' | 'neutral' => {
    switch (outcome) {
      case 'simulated_success':
        return 'success';
      case 'retry_scheduled':
      case 'retry_eligible':
        return 'warning';
      case 'exhausted_retries':
      case 'simulated_failure':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Webhook className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground">Delivery Inspection</span>
            <span className="block font-mono text-xs font-normal text-muted-foreground">{delivery.id}</span>
          </div>
        </div>
      }
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Fictional demonstration payload (zero student PII)</span>
          </div>
          <div className="flex items-center gap-2">
            {retryCheck.eligible && (
              <button
                type="button"
                onClick={() => {
                  onRetry(delivery.id, true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Simulate Retry Attempt
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Status Strip */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
              Delivery Outcome
            </span>
            <Badge variant={getOutcomeBadgeVariant(delivery.outcome)}>
              {delivery.outcome.replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
              HTTP Status Code
            </span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                delivery.httpStatusCode >= 200 && delivery.httpStatusCode < 300
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {delivery.httpStatusCode}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
              Dispatch Latency
            </span>
            <span className="font-mono text-xs text-foreground font-semibold">
              {delivery.durationMs}ms
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
              Attempts Count
            </span>
            <span className="font-medium text-foreground text-xs">
              {delivery.currentAttempt} of {delivery.maxAttempts}
            </span>
          </div>
        </div>

        {/* Destination & Event Row */}
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Endpoint Destination</span>
            <span className="font-medium text-foreground text-xs">{delivery.endpointName}</span>
          </div>
          <div className="font-mono text-xs text-foreground bg-muted/50 p-2 rounded truncate">
            {delivery.destinationUrl}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Event Type</span>
              <p className="font-mono text-xs font-bold text-foreground">{delivery.eventType}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Event Identifier</span>
              <p className="font-mono text-xs text-muted-foreground">{delivery.eventId}</p>
            </div>
          </div>
        </div>

        {/* Error Summary if applicable */}
        {delivery.errorSummary && (
          <div className="rounded-lg border border-rose-300 bg-rose-50/70 p-3 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Delivery Failure Diagnostics
            </div>
            <p className="mt-1 text-[11px] leading-relaxed font-mono">{delivery.errorSummary}</p>
            {delivery.nextRetryAt && (
              <p className="mt-1.5 text-[10px] text-rose-700 dark:text-rose-300">
                Next automatic retry scheduled: {formatDate(delivery.nextRetryAt)}
              </p>
            )}
          </div>
        )}

        {/* Inspector Sub-tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('payload')}
                className={`pb-1 text-xs font-semibold transition-colors ${
                  activeTab === 'payload'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Payload Body
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('headers')}
                className={`pb-1 text-xs font-semibold transition-colors ${
                  activeTab === 'headers'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Request Headers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('attempts')}
                className={`pb-1 text-xs font-semibold transition-colors ${
                  activeTab === 'attempts'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Attempt History ({delivery.attempts.length})
              </button>
            </div>

            {activeTab === 'payload' && (
              <button
                type="button"
                onClick={handleCopyPayload}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {copiedPayload ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copiedPayload ? 'Copied' : 'Copy JSON'}
              </button>
            )}
          </div>

          {activeTab === 'payload' && (
            <pre className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-100 dark:bg-slate-950 overflow-x-auto max-h-56">
              {JSON.stringify(delivery.payload, null, 2)}
            </pre>
          )}

          {activeTab === 'headers' && (
            <div className="rounded-lg border border-border bg-card p-3 space-y-1.5 font-mono text-[11px]">
              {Object.entries(delivery.requestHeaders || {}).map(([key, val]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="font-semibold text-muted-foreground select-none min-w-[160px]">{key}:</span>
                  <span className="text-foreground break-all">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attempts' && (
            <div className="space-y-2">
              {delivery.attempts.map((att) => (
                <div
                  key={att.attemptNumber}
                  className="rounded-lg border border-border bg-card p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Attempt #{att.attemptNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground text-[10px]">
                        {formatDate(att.timestamp)}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          att.httpStatusCode >= 200 && att.httpStatusCode < 300
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        HTTP {att.httpStatusCode}
                      </span>
                      <span className="text-muted-foreground text-[10px]">{att.durationMs}ms</span>
                    </div>
                  </div>

                  {att.errorSummary && (
                    <p className="text-rose-600 dark:text-rose-400 text-[11px] font-mono">
                      {att.errorSummary}
                    </p>
                  )}

                  {att.responseBody && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                        Response Body
                      </span>
                      <pre className="rounded bg-muted p-2 font-mono text-[10px] text-foreground truncate">
                        {att.responseBody}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
