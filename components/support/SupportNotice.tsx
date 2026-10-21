'use client';

import React from 'react';
import { ShieldCheck, Info, AlertTriangle, LifeBuoy } from 'lucide-react';

export function SupportNotice() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <LifeBuoy className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Platform Support Desk, SLA Governance & Customer Success Console (E-09.17)
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Frontend Development Workspace
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Zero Server Persistence
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Centralized platform assistance and customer success cockpit for Super-Admins. Governs ticket intake,
            linear lifecycle state machines, team assignment queues, priority escalations, SLA compliance evaluation,
            internal operator notes, and school account health tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px] text-muted-foreground border-t border-border/60">
        <div className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">Honest Local Evaluation:</strong> SLA timers, approaching-target alerts, and resolution metrics are computed dynamically from client fixtures. No real-time server escalation daemon is running.
          </span>
        </div>
        <div className="flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">Zero Real Notifications:</strong> Composing replies or internal notes updates browser memory only. No outbound emails, SMS, WhatsApp, or live-chat messages are sent.
          </span>
        </div>
        <div className="flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">Privacy & Zero PII Guard:</strong> Support tickets reference school administrator contacts only. No confidential student grades, medical records, or passwords are saved.
          </span>
        </div>
      </div>
    </div>
  );
}
