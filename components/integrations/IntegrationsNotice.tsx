'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Lock, Webhook, KeyRound, Server } from 'lucide-react';

export function IntegrationsNotice() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-600/10 p-2 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold tracking-tight text-foreground">
                Platform API Management & Webhook Governance Workspace
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-900/70 dark:text-blue-300">
                Phase E-09.19 Demonstration Console
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This Super-Admin governance console manages registered API integrations, client access tokens, and webhook
              event dispatch subscriptions. All credential tokens, delivery logs, and network verification handshakes are
              executed against local frontend demonstration state. <strong>No real credentials exist and no external HTTP requests are made.</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-300/60 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-blue-900 transition-colors hover:bg-white dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60"
        >
          {isExpanded ? (
            <>
              Hide Architectural Guide <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Security & Architecture Scope <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid gap-3 border-t border-blue-200/60 pt-3 dark:border-blue-800/60 sm:grid-cols-3">
          <div className="rounded-lg bg-white/70 p-3 shadow-2xs dark:bg-blue-900/20">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <KeyRound className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              API Client Governance
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
              Simulates OAuth 2.0 client credentials, scoped RBAC permissions, and safe key generation. Production requires HSM/KMS-backed secret hashing (SHA-256) and mutual TLS.
            </p>
          </div>

          <div className="rounded-lg bg-white/70 p-3 shadow-2xs dark:bg-blue-900/20">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Webhook className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Webhook Security & Replay
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
              Models HMAC SHA-256 signing headers (<code className="rounded bg-muted px-1 py-0.2">X-SMS-Signature</code>), timestamp replay tolerance (<code className="rounded bg-muted px-1 py-0.2">X-SMS-Timestamp</code>), and retry backoff state transitions.
            </p>
          </div>

          <div className="rounded-lg bg-white/70 p-3 shadow-2xs dark:bg-blue-900/20">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Server className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Outbound Dispatch Architecture
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
              Client-side URL format check is demonstrative. Production webhooks require isolated asynchronous worker queues (Celery/BullMQ), DNS rebinding guards, and strict SSRF egress filters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
