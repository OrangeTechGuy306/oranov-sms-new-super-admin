'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MonetizationSimulationBannerProps {
  compact?: boolean;
}

export function MonetizationSimulationBanner({ compact = false }: MonetizationSimulationBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Simulated Financial Environment:</strong> Demonstration data only. No real charges, payment providers, or bank accounts are accessed.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex items-start gap-3.5 shadow-2xs">
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            SaaS Monetization Governance Demonstration Environment
          </h4>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300">
            SIMULATED
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All subscription plans, organization assignments, invoices, payment retries, and MRR analytics in this workspace are strictly simulated in-memory development fixtures. No actual payment provider (e.g. Stripe, Adyen, Flutterwave) or live financial settlement is executed.
        </p>
      </div>
    </div>
  );
}
