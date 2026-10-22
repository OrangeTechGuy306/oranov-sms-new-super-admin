'use client';

import React, { useState } from 'react';
import { WEBHOOK_EVENT_CATALOGUE, API_SCOPES_CATALOGUE } from '@/lib/integrations/fixtures';
import { WebhookEventType } from '@/lib/types/integrations';
import {
  Code,
  BookOpen,
  KeyRound,
  Webhook,
  ShieldCheck,
  Copy,
  Check,
  Server,
  Terminal,
  FileCheck2,
} from 'lucide-react';

export function IntegrationDocsTab() {
  const [selectedEventId, setSelectedEventId] = useState<string>(WEBHOOK_EVENT_CATALOGUE[0].id);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const selectedEvent =
    WEBHOOK_EVENT_CATALOGUE.find((e) => e.id === selectedEventId) || WEBHOOK_EVENT_CATALOGUE[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const nodeJsSnippet = `const crypto = require('crypto');

function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  // Extract sha256 hash from header format: "sha256=abcdef..."
  const expectedSignature = signatureHeader.replace('sha256=', '');
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Constant-time string comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(computedSignature, 'utf8')
  );
}`;

  const pythonSnippet = `import hmac
import hashlib

def verify_webhook_signature(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = signature_header.replace('sha256=', '')
    computed = hmac.new(
        secret.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    
    # Constant-time comparison
    return hmac.compare_digest(expected, computed)`;

  return (
    <div className="space-y-6 text-xs">
      {/* Header Notice */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h3 className="font-bold text-foreground text-sm">
          Platform API Architecture & Integration Guide
        </h3>
        <p className="text-muted-foreground text-xs mt-0.5">
          Standardized contracts, HMAC signature protocols, event catalogues, and future backend implementation guidelines.
        </p>
      </div>

      {/* Grid: Event Catalogue on Left, Signature Verification on Right */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Event Catalogue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Webhook Event Catalogue ({WEBHOOK_EVENT_CATALOGUE.length})
                </h4>
              </div>
              <span className="text-[10px] text-muted-foreground">Fictional payloads (zero PII)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {WEBHOOK_EVENT_CATALOGUE.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selectedEventId === ev.id
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-2xs'
                      : 'border-border bg-muted/20 text-foreground hover:bg-muted/50'
                  }`}
                >
                  <code className="font-mono text-[10px] block truncate">{ev.id}</code>
                  <span className="text-[10px] text-muted-foreground block truncate capitalize">
                    {ev.category}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Event Details & Payload */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground text-sm">{selectedEvent.name}</span>
                  <p className="text-muted-foreground text-xs">{selectedEvent.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(JSON.stringify(selectedEvent.examplePayload, null, 2), 'payload')
                  }
                  className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                >
                  {copiedSnippet === 'payload' ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedSnippet === 'payload' ? 'Copied' : 'Copy JSON'}
                </button>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Illustrative Payload Shape
                </span>
                <pre className="rounded bg-slate-900 p-3 font-mono text-[11px] text-slate-100 dark:bg-slate-950 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedEvent.examplePayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* API Scopes Catalogue */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                API Permission Scope Reference
              </h4>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {API_SCOPES_CATALOGUE.map((scope) => (
                <div
                  key={scope.key}
                  className="flex items-start justify-between gap-3 p-2 rounded-lg border border-border bg-muted/20"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono font-bold text-foreground text-xs">{scope.key}</code>
                      {scope.isElevated && (
                        <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.2 text-[9px] font-bold">
                          Elevated
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground capitalize">({scope.category})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{scope.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Security & Implementation Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* HMAC Signature Verification */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  HMAC SHA-256 Webhook Verification
                </h4>
              </div>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Every outbound webhook request must be verified by comparing the signature header with an HMAC hash calculated from your secret and the raw request body.
            </p>

            <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-[11px]">
              <div>
                <strong className="text-foreground">X-SMS-Signature:</strong>{' '}
                <span className="text-muted-foreground">sha256=&lt;hex_digest&gt;</span>
              </div>
              <div>
                <strong className="text-foreground">X-SMS-Delivery-Id:</strong>{' '}
                <span className="text-muted-foreground">del_wh_...</span>
              </div>
              <div>
                <strong className="text-foreground">X-SMS-Event-Type:</strong>{' '}
                <span className="text-muted-foreground">organization.created</span>
              </div>
            </div>

            {/* Node.js Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-foreground">Node.js (crypto)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(nodeJsSnippet, 'nodejs')}
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {copiedSnippet === 'nodejs' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedSnippet === 'nodejs' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded bg-slate-900 p-2.5 font-mono text-[10px] text-slate-100 dark:bg-slate-950 overflow-x-auto">
                {nodeJsSnippet}
              </pre>
            </div>

            {/* Python Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-foreground">Python (hmac)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(pythonSnippet, 'python')}
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {copiedSnippet === 'python' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedSnippet === 'python' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded bg-slate-900 p-2.5 font-mono text-[10px] text-slate-100 dark:bg-slate-950 overflow-x-auto">
                {pythonSnippet}
              </pre>
            </div>
          </div>

          {/* Future Backend Readiness Checklist */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Server className="h-4 w-4 text-primary" />
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                Future Backend Readiness Checklist
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Asynchronous Delivery Workers</span>
                  <p className="text-muted-foreground text-[11px]">
                    Queues with exponential backoff & dead-letter archival (Celery/BullMQ/Cloud Tasks).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">SSRF & DNS Rebinding Egress Defense</span>
                  <p className="text-muted-foreground text-[11px]">
                    Strict resolution blocking for private IP ranges (RFC 1918, RFC 3927, loopback).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Cryptographic Secret Storage</span>
                  <p className="text-muted-foreground text-[11px]">
                    HSM / KMS-encrypted key envelopes and salted SHA-256 tokens.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Rate Limiting & Abuse Prevention</span>
                  <p className="text-muted-foreground text-[11px]">
                    Redis sliding-window rate limiters per API client token and endpoint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
