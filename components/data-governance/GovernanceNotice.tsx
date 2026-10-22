'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Clock,
  UserCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export function GovernanceNotice() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950 shadow-2xs dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-indigo-600/10 p-2 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold tracking-tight text-foreground text-sm">
                Platform Data Governance, Privacy & Lifecycle Management Workspace
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-300">
                Phase E-09.20 Demonstration Console
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/70 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Simulation & Sandboxed Metadata
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs">
              This Super-Admin governance console establishes structured oversight for multi-tenant educational records.
              All data categories, classification schemes, retention rules, and privacy requests (DSARs) are maintained in{' '}
              <strong>frontend demonstration state with zero personal data (PII)</strong>. Configured policies do not perform
              real database deletions, exports, or anonymizations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-indigo-300/60 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-indigo-900 transition-colors hover:bg-white dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
        >
          {isExpanded ? (
            <>
              Hide Architectural Scope <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Status & Safety Scope <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white/80 p-3 shadow-2xs dark:bg-indigo-900/20">
              <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Data Inventory & Classification
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                14 fictional school data categories spanning pupil core data, safeguarding records, grades, and financial ledgers.
                Sensitivity ratings (Public, Internal, Confidential, Restricted) are proposed baselines requiring tenant institutional review.
              </p>
            </div>

            <div className="rounded-lg bg-white/80 p-3 shadow-2xs dark:bg-indigo-900/20">
              <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Retention & Lifecycle Simulation
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                Configured schedules demonstrate statutory retention horizons (e.g. 7-year finance, DOB+25 safeguarding).
                Rules simulate state progression (Archived, Tombstoned) without executing destructive operations against customer databases.
              </p>
            </div>

            <div className="rounded-lg bg-white/80 p-3 shadow-2xs dark:bg-indigo-900/20">
              <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Privacy Requests (DSARs)
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                Demonstrates request intake, validation state machines, and synthetic manifest generation. Uses synthetic token identifiers
                with zero real names, emails, or personal identifiers.
              </p>
            </div>
          </div>

          {/* Honest Status Label Legend */}
          <div className="rounded-lg border border-indigo-200/70 bg-white/60 p-3 dark:border-indigo-800/50 dark:bg-indigo-950/20">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px] mb-2">
              <HelpCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Honest Data Status Semantics Legend
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span><strong>Demo Fixture:</strong> Deterministic seed data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span><strong>Static Config:</strong> Declarative baseline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span><strong>Simulated:</strong> Mock workflow execution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span><strong>Unverified:</strong> Awaiting compliance review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span><strong>Enforcement Unknown:</strong> No backend job</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
