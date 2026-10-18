'use client';

import React from 'react';
import { OrganizationStudentOversight } from '@/lib/types/student-oversight';
import { aggregateClearanceBottlenecks } from '@/lib/student-oversight/evaluator';
import {
  ArrowRightLeft,
  AlertCircle,
  BookOpen,
  Building,
  Laptop,
  CreditCard,
  GraduationCap,
} from 'lucide-react';

interface TransfersClearanceCardProps {
  records: OrganizationStudentOversight[];
}

export function TransfersClearanceCard({ records }: TransfersClearanceCardProps) {
  const bottlenecks = aggregateClearanceBottlenecks(records);

  const totalOutgoing = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.outgoingTransfersTotal : 0), 0);
  const totalOutgoingInProgress = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.outgoingClearanceInProgress : 0), 0);
  const totalOutgoingApproved = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.outgoingApproved : 0), 0);
  const totalOutgoingCompleted = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.outgoingCompleted : 0), 0);

  const totalIncoming = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.incomingTransfersTotal : 0), 0);
  const totalIncomingUnderReview = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.incomingUnderReview : 0), 0);
  const totalIncomingEnrolled = records.reduce((acc, r) => acc + (r.isReporting ? r.transfers.incomingEnrolled : 0), 0);

  const totalEvaluated = records.reduce((acc, r) => acc + (r.isReporting ? r.promotions.evaluatedStudentsCount : 0), 0);
  const totalPromoted = records.reduce((acc, r) => acc + (r.isReporting ? r.promotions.promotedCount : 0), 0);
  const totalTrial = records.reduce((acc, r) => acc + (r.isReporting ? r.promotions.promotedOnTrialCount : 0), 0);
  const totalRepeat = records.reduce((acc, r) => acc + (r.isReporting ? r.promotions.repeatCount : 0), 0);
  const totalGraduated = records.reduce((acc, r) => acc + (r.isReporting ? r.promotions.graduatedCohortCount : 0), 0);

  const departmentIcons = {
    LIBRARY: <BookOpen className="w-4 h-4 text-blue-500" />,
    HOSTEL: <Building className="w-4 h-4 text-indigo-500" />,
    ASSETS: <Laptop className="w-4 h-4 text-amber-500" />,
    FINANCE: <CreditCard className="w-4 h-4 text-emerald-500" />,
  };

  const departmentNames = {
    LIBRARY: 'Library & Learning Media',
    HOSTEL: 'Hostel & Residential Boarding',
    ASSETS: 'IT Equipment & Lab Assets',
    FINANCE: 'Bursary & Accounts Ledger',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left Column: Student Transfers & Clearance Bottlenecks */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="border-b border-border/50 pb-3">
          <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            Student Mobility & Department Clearance Oversight
          </h3>
          <p className="text-xs text-muted-foreground">
            Clearance verification progress for outgoing departures and credit evaluations for incoming transfers.
          </p>
        </div>

        {/* Mobility Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
            <span className="text-muted-foreground font-medium">Outgoing Transfer Requests</span>
            <p className="text-xl font-bold text-foreground">{totalOutgoing.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">
              {totalOutgoingInProgress} in clearance • {totalOutgoingApproved} approved • {totalOutgoingCompleted} completed
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
            <span className="text-muted-foreground font-medium">Incoming Transfer Intake</span>
            <p className="text-xl font-bold text-foreground">{totalIncoming.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">
              {totalIncomingUnderReview} credit reviews • {totalIncomingEnrolled} matriculated
            </p>
          </div>
        </div>

        {/* Clearance Bottlenecks Breakdown */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Clearance Verification by Department
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(['LIBRARY', 'HOSTEL', 'ASSETS', 'FINANCE'] as const).map((dept) => {
              const data = bottlenecks[dept];
              return (
                <div key={dept} className="p-2.5 rounded-lg border border-border bg-background space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-foreground truncate">
                      {departmentIcons[dept]}
                      {departmentNames[dept]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                    <span className="text-amber-600 dark:text-amber-400">
                      {data.pending} Pending
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">
                      {data.blocked} Blocked
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {data.cleared} Cleared
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Academic Promotions & Cohort Graduation */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="border-b border-border/50 pb-3">
          <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Academic Promotion Eligibility & Graduation Cohorts
          </h3>
          <p className="text-xs text-muted-foreground">
            Year-end promotion rule evaluations, conditional progressions, and terminal graduating cohorts.
          </p>
        </div>

        {/* Promotion KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">Promoted Clean</p>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
              {totalPromoted.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {totalEvaluated > 0 ? `${Math.round((totalPromoted / totalEvaluated) * 100)}%` : '0%'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">On Trial</p>
            <p className="text-lg font-bold text-amber-900 dark:text-amber-200 mt-0.5">
              {totalTrial.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {totalEvaluated > 0 ? `${Math.round((totalTrial / totalEvaluated) * 100)}%` : '0%'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300">Repeat Year</p>
            <p className="text-lg font-bold text-rose-900 dark:text-rose-200 mt-0.5">
              {totalRepeat.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {totalEvaluated > 0 ? `${Math.round((totalRepeat / totalEvaluated) * 100)}%` : '0%'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-[11px] font-medium text-purple-800 dark:text-purple-300">Graduated Alumni</p>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-200 mt-0.5">
              {totalGraduated.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Completed Cohort</p>
          </div>
        </div>

        {/* Promotion Safeguards & Governance Note */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1.5 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-primary" />
            Administrative Safety Notice
          </p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            The platform Super-Admin dashboard tracks macro academic progression metrics across tenant organizations for reporting and capacity planning. In accordance with tenant autonomy principles, the platform Super-Admin does not initiate or execute bulk promotion or student transfer operations directly.
          </p>
        </div>
      </div>
    </div>
  );
}
