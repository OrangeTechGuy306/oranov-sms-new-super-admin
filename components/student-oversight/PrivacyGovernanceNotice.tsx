'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Info } from 'lucide-react';

export function PrivacyGovernanceNotice() {
  return (
    <div className="bg-card text-card-foreground p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                Privacy by Design Architecture (Phase E-09.8)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Lock className="w-3 h-3" /> Zero Student PII
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <EyeOff className="w-3 h-3" /> Aggregated Telemetry Only
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In strict accordance with student privacy laws (FERPA, GDPR, COPPA), the SaaS Super-Admin platform renders aggregate, organization-level operational figures only. No individual student identities, contact details, home addresses, dates of birth, or guardian contacts are accessible in this workspace. Direct access to student-level records requires future tenant-scoped backend authorization and cryptographic audit logging.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-center">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-mono text-[11px]">Aggregates Verified</span>
        </div>
      </div>
    </div>
  );
}
