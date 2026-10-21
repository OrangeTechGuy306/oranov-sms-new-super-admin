'use client';

import React from 'react';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ShieldAlert, Info, BellRing } from 'lucide-react';

export function CommunicationsNotice() {
  return (
    <div className="space-y-3">
      <AlertBanner
        variant="notice"
        title="Demonstration Operational Model — Phase E-09.16 Communications & Delivery Governance"
        dismissible
      >
        <div className="space-y-1.5 text-xs leading-relaxed">
          <p>
            This workspace demonstrates platform-level communication governance, notification template authoring, delivery state machines, and channel readiness for Super-Admins in a multi-tenant SaaS environment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-border/50">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span><strong>Client Simulation:</strong> Local state updates only</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-border/50">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span><strong>Zero External Dispatches:</strong> No real emails, SMS, or pushes</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-border/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>Zero-Secret Guarantee:</strong> No provider API keys in browser</span>
            </div>
          </div>
        </div>
      </AlertBanner>
    </div>
  );
}
