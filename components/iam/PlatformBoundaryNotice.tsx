'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, KeyRound } from 'lucide-react';

export function PlatformBoundaryNotice() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs space-y-2 text-foreground">
      <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>Strict Architectural Separation: SaaS Platform Super-Admin vs. School Tenant Identities</span>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        <strong>Security Plane Isolation:</strong> Identities, roles, and permissions configured within this workspace govern <strong>SaaS platform infrastructure, tenant provisioning, cross-organization subscriptions, and platform telemetry</strong>. They are strictly separate from school tenant roles (Principals, Teachers, Bursars, Students, and Parents) managed inside school directories.
      </p>
      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-muted-foreground border-t border-amber-500/20 font-mono">
        <span className="flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          Zero Tenant PII Exposure
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          No Cross-Tenant Impersonation
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Deterministic Local State Simulation
        </span>
      </div>
    </div>
  );
}
