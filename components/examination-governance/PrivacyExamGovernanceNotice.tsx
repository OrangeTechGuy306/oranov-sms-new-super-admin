'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, AlertCircle } from 'lucide-react';

export function PrivacyExamGovernanceNotice() {
  return (
    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 text-xs space-y-2 text-foreground/90">
      <div className="flex items-center gap-2 font-semibold text-primary">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>Assessment Governance, CBT Integrity & Privacy by Design Principles</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-muted-foreground text-[11px] leading-relaxed">
        <div className="flex items-start gap-2">
          <EyeOff className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Zero Student PII or Scores:</strong> Platform administrators see only aggregated operational indicators, readiness scores, and configuration completion. Individual student identities, marks, and candidate responses are strictly withheld.
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Tenant Academic Autonomy:</strong> Schools independently author questions, set passing thresholds, approve results, and generate report cards. The Super-Admin monitors configuration completeness and conflicts without modifying school policies.
          </span>
        </div>

        <div className="flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Empirical CBT Security Boundaries:</strong> The platform accurately distinguishes physical invigilation from automated proctoring. Anti-cheating or proctoring guarantees are never fabricated without verifiable backend evidence.
          </span>
        </div>
      </div>
    </div>
  );
}
