'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { WebhookEndpointRecord, WebhookEventType } from '@/lib/types/integrations';
import { WEBHOOK_EVENT_CATALOGUE } from '@/lib/integrations/fixtures';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck, Play, Code } from 'lucide-react';

interface TestDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: WebhookEndpointRecord | null;
  onDispatch: (endpointId: string, eventTypeId: string, simulateSuccess: boolean) => void;
}

export function TestDeliveryModal({
  isOpen,
  onClose,
  endpoint,
  onDispatch,
}: TestDeliveryModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('organization.created');
  const [simulateSuccess, setSimulateSuccess] = useState(true);
  const [showPayload, setShowPayload] = useState(false);

  if (!endpoint) return null;

  const currentEvent =
    WEBHOOK_EVENT_CATALOGUE.find((e) => e.id === selectedEventId) || WEBHOOK_EVENT_CATALOGUE[0];

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatch(endpoint.id, selectedEventId, simulateSuccess);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground">Simulate Webhook Test Dispatch</span>
            <span className="block text-xs font-normal text-muted-foreground">{endpoint.name}</span>
          </div>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSendTest} className="space-y-4 text-xs">
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Frontend Simulation Boundary
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
            Executing this test will create a simulated delivery record in the local store, demonstrating payload format,
            signature headers, response latency, and attempt logging. <strong>No external network call is dispatched.</strong>
          </p>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Target Endpoint URL</label>
          <div className="rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-xs text-foreground truncate">
            {endpoint.destinationUrl}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Select Event Type to Emit</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            {WEBHOOK_EVENT_CATALOGUE.map((event) => (
              <option key={event.id} value={event.id}>
                {event.id} — {event.name} ({event.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Simulated Receiver Response</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSimulateSuccess(true)}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                simulateSuccess
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-700'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>HTTP 200 OK</span>
            </button>

            <button
              type="button"
              onClick={() => setSimulateSuccess(false)}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                !simulateSuccess
                  ? 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-700'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>HTTP 504 Timeout</span>
            </button>
          </div>
        </div>

        {/* Payload Preview Toggle */}
        <div className="border border-border rounded-lg p-2.5 bg-muted/20">
          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="flex items-center justify-between w-full text-foreground font-semibold"
          >
            <span className="flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-primary" />
              Preview Fictional Event Payload
            </span>
            <span className="text-[11px] text-primary hover:underline">
              {showPayload ? 'Hide' : 'Show Payload'}
            </span>
          </button>

          {showPayload && (
            <pre className="mt-2 p-2 rounded bg-slate-900 text-slate-100 dark:bg-slate-950 font-mono text-[10px] overflow-x-auto max-h-40">
              {JSON.stringify(currentEvent.examplePayload, null, 2)}
            </pre>
          )}
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-3.5 w-3.5" />
            Dispatch Simulation
          </button>
        </div>
      </form>
    </Modal>
  );
}
