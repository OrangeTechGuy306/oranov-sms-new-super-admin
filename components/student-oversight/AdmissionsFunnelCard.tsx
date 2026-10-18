'use client';

import React from 'react';
import { AdmissionsFunnelStage } from '@/lib/types/student-oversight';
import {
  FileText,
  Clock,
  CheckCircle,
  UserCheck,
  HelpCircle,
  XCircle,
  CalendarClock,
} from 'lucide-react';

interface AdmissionsFunnelCardProps {
  funnel: AdmissionsFunnelStage;
  title?: string;
  subtitle?: string;
}

export function AdmissionsFunnelCard({
  funnel,
  title = 'Cross-Tenant Admissions Pipeline & Conversion Funnel',
  subtitle = 'Aggregated applicant progression from initial inquiry to completed enrollment across represented schools.',
}: AdmissionsFunnelCardProps) {
  const steps = [
    {
      stage: 'Inquiries',
      count: funnel.inquiryCount,
      description: 'Prospects & lead inquiries',
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-500',
      rate: null,
    },
    {
      stage: 'Applications Submitted',
      count: funnel.submittedCount,
      description: 'Formal applicant dossiers',
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      color: 'bg-indigo-500',
      rate: funnel.inquiryCount > 0 ? `${Math.round((funnel.submittedCount / funnel.inquiryCount) * 100)}% of inquiries` : null,
    },
    {
      stage: 'Under Review',
      count: funnel.underReviewCount + funnel.moreInfoCount,
      description: `${funnel.underReviewCount} reviewing • ${funnel.moreInfoCount} docs requested`,
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      color: 'bg-amber-500',
      rate: funnel.submittedCount > 0 ? `${Math.round(((funnel.underReviewCount + funnel.moreInfoCount) / funnel.submittedCount) * 100)}% in review` : null,
    },
    {
      stage: 'Accepted Offers',
      count: funnel.acceptedCount,
      description: 'Admissions offers issued',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      color: 'bg-emerald-500',
      rate: funnel.submittedCount > 0 ? `${Math.round((funnel.acceptedCount / funnel.submittedCount) * 100)}% acceptance` : null,
    },
    {
      stage: 'Completed Enrollments',
      count: funnel.convertedCount,
      description: 'Admitted student records created',
      icon: <UserCheck className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-600',
      rate: funnel.submittedCount > 0 ? `${funnel.conversionRatePercentage}% total conversion` : null,
    },
  ];

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Conversion Rate: {funnel.conversionRatePercentage}%
          </span>
        </div>
      </div>

      {/* Funnel Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.stage}
            className="p-3.5 rounded-lg border border-border bg-muted/20 relative space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                  {step.icon}
                  {step.stage}
                </span>
                {idx < steps.length - 1 && (
                  <span className="hidden lg:inline-block text-muted-foreground/40 font-mono text-xs">
                    →
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">
                {step.count.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">{step.description}</p>
            </div>

            {step.rate && (
              <div className="pt-2 border-t border-border/40">
                <span className="text-[10px] font-semibold text-primary">{step.rate}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal & Exception Dispositions (Deferred & Rejected) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200">Deferred Admissions</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">Carried forward to subsequent intake cycles</p>
            </div>
          </div>
          <span className="text-base font-bold text-amber-900 dark:text-amber-200 font-mono">
            {funnel.deferredCount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-medium text-rose-900 dark:text-rose-200">Rejected / Ineligible Applications</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">Did not meet minimum academic or credential threshold</p>
            </div>
          </div>
          <span className="text-base font-bold text-rose-900 dark:text-rose-200 font-mono">
            {funnel.rejectedCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
