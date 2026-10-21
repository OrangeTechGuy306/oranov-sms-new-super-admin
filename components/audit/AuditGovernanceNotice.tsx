'use client';

import React from 'react';
import { ShieldAlert, Database, Lock, AlertCircle } from 'lucide-react';

export function AuditGovernanceNotice() {
  return (
    <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              Platform Audit & Governance Simulation Notice
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
              Frontend Development Sandbox
            </span>
          </div>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            Audit trails, security events, compliance controls, and retention policies displayed in this control plane are client-generated development fixtures and local demonstration state. They do not constitute an authoritative, immutable, or cryptographically tamper-evident compliance record.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px] border-t border-amber-200 dark:border-amber-900/40">
        <div className="flex items-start gap-2 text-amber-900/90 dark:text-amber-300/90">
          <Lock className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <span>
            <strong>Immutable Storage Required:</strong> Production compliance requires backend append-only WORM storage (e.g. AWS S3 Glacier with Object Lock).
          </span>
        </div>
        <div className="flex items-start gap-2 text-amber-900/90 dark:text-amber-300/90">
          <Database className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <span>
            <strong>Zero Real Data Purging:</strong> Retention policies demonstrate statutory schedules only. No physical record deletion occurs in this sandbox.
          </span>
        </div>
        <div className="flex items-start gap-2 text-amber-900/90 dark:text-amber-300/90">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <span>
            <strong>Telemetry Disconnected:</strong> Live SIEM, IDS/IPS, and server-side authentication event streams are deferred to backend infrastructure.
          </span>
        </div>
      </div>
    </div>
  );
}
