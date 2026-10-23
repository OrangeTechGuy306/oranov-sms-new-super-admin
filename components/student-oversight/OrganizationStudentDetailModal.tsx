'use client';

import React from 'react';
import Link from 'next/link';
import { OrganizationStudentOversight } from '@/lib/types/student-oversight';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  MapPin,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface OrganizationStudentDetailModalProps {
  organization: OrganizationStudentOversight | null;
  onClose: () => void;
}

export function OrganizationStudentDetailModal({
  organization,
  onClose,
}: OrganizationStudentDetailModalProps) {
  if (!organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card text-card-foreground border border-border w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drilldown-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-4 bg-muted/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-foreground" id="drilldown-title">
                {organization.organizationName}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {organization.organizationCode}
              </span>
              <Badge
                variant={organization.lifecycleStatus === 'active' ? 'success' : 'neutral'}
                size="sm"
              >
                {organization.lifecycleStatus}
              </Badge>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {organization.academicSession}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="capitalize">{organization.classification.replace('_', ' ')}</span>
              <span>•</span>
              <span>Last Reported: {organization.lastReportedAt ? new Date(organization.lastReportedAt).toLocaleString() : 'N/A'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Privacy Notice Banner */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Privacy-Preserving Tenant View:</strong> All figures displayed are macro-level counts aggregated across campus departments. Zero identifiable student records or documents are exposed.
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-semibold text-primary shrink-0">
              <Lock className="w-3 h-3" /> Aggregated Only
            </span>
          </div>

          {/* Not Reporting Explanation if Applicable */}
          {!organization.isReporting && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Telemetry Reporting Dormant or Unprovisioned
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {organization.statusExplanation || 'This tenant organization has not yet provisioned live SIS telemetry reporting or is in an onboarding review phase.'}
              </p>
            </div>
          )}

          {/* Top KPI Cards for this School */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
              <span className="text-muted-foreground font-medium">Enrolled Students</span>
              <p className="text-xl font-bold text-foreground">
                {organization.isReporting ? organization.population.enrolledCount.toLocaleString() : 'N/A'}
              </p>
              <p className="text-[10px] text-muted-foreground">Active in classes</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
              <span className="text-muted-foreground font-medium">Applications Intake</span>
              <p className="text-xl font-bold text-foreground">
                {organization.isReporting ? organization.admissions.submittedCount.toLocaleString() : '0'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {organization.isReporting ? `${organization.admissions.convertedCount} converted (${organization.admissions.conversionRatePercentage}%)` : '0%'}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
              <span className="text-muted-foreground font-medium">Physical Campuses</span>
              <p className="text-xl font-bold text-foreground">{organization.campuses.length}</p>
              <p className="text-[10px] text-muted-foreground">Active branch facilities</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
              <span className="text-muted-foreground font-medium">Graduating Class</span>
              <p className="text-xl font-bold text-foreground">
                {organization.isReporting ? organization.promotions.graduatedCohortCount.toLocaleString() : '0'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{organization.promotions.graduatingClassName}</p>
            </div>
          </div>

          {/* Campus Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Campus Facilities & Utilization
            </h4>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground border-b border-border text-left">
                    <th className="py-2 px-3">Campus Name</th>
                    <th className="py-2 px-3 text-center">Designation</th>
                    <th className="py-2 px-3 text-right">Capacity</th>
                    <th className="py-2 px-3 text-right">Enrolled</th>
                    <th className="py-2 px-3 text-center">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {organization.campuses.map((campus) => (
                    <tr key={campus.campusId} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium text-foreground">
                        {campus.campusName} <span className="font-mono text-muted-foreground text-[10px]">({campus.campusCode})</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={campus.isMainCampus ? 'purple' : 'neutral'} size="sm">
                          {campus.isMainCampus ? 'Main' : 'Branch'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">{campus.studentCapacity}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                        {organization.isReporting ? campus.enrolledStudents : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        {organization.isReporting ? `${campus.capacityUtilizationPercentage}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admissions Pipeline Stages for this School */}
          {organization.isReporting && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                Admissions Progression Stages
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">Inquiries</span>
                  <p className="font-bold text-foreground text-sm">{organization.admissions.inquiryCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">Submitted</span>
                  <p className="font-bold text-foreground text-sm">{organization.admissions.submittedCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">Under Review</span>
                  <p className="font-bold text-foreground text-sm">{organization.admissions.underReviewCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">More Info Req</span>
                  <p className="font-bold text-foreground text-sm">{organization.admissions.moreInfoCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">Accepted</span>
                  <p className="font-bold text-emerald-600 text-sm">{organization.admissions.acceptedCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">Converted</span>
                  <p className="font-bold text-teal-600 text-sm">{organization.admissions.convertedCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border">
                  <span className="text-[10px] text-muted-foreground">Rejected</span>
                  <p className="font-bold text-rose-600 text-sm">{organization.admissions.rejectedCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* School Divisions Breakdown */}
          {organization.isReporting && organization.gradeDivisions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Enrollment Distribution by Academic Division
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {organization.gradeDivisions.map((div) => (
                  <div key={div.divisionLabel} className="p-2.5 rounded-lg border border-border bg-background space-y-1 text-xs">
                    <span className="text-muted-foreground text-[11px] truncate block">{div.divisionLabel}</span>
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-sm font-bold text-foreground">{div.enrolledCount}</span>
                      <span className="text-[10px] text-muted-foreground">{div.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Quality Issues if Any */}
          {organization.dataQualityIssues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Data Quality & Governance Audit Notices
              </h4>

              <div className="space-y-2">
                {organization.dataQualityIssues.map((issue) => (
                  <div key={issue.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 text-xs space-y-1">
                    <p className="font-semibold">{issue.title}</p>
                    <p className="text-[11px] opacity-90">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <Link
            href={`/organizations/${organization.organizationId}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-xs rounded-lg transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            View Master School Profile
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-xs rounded-lg transition-colors"
          >
            Close Drill-down
          </button>
        </div>
      </div>
    </div>
  );
}
