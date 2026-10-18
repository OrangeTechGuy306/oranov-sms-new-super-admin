'use client';

import React, { useState } from 'react';
import { OrganizationExamGovernance } from '@/lib/types/examination-governance';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Clock,
  Award,
  MonitorCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Info,
  MapPin,
} from 'lucide-react';

interface OrganizationExamGovernanceDetailModalProps {
  org: OrganizationExamGovernance | null;
  onClose: () => void;
}

export function OrganizationExamGovernanceDetailModal({
  org,
  onClose,
}: OrganizationExamGovernanceDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'entitlements' | 'assessments' | 'cbt' | 'timetables' | 'grading' | 'readiness' | 'audit'
  >('entitlements');

  if (!org) return null;

  const readiness = org.readiness;
  const isReady = readiness.level === 'ready';
  const isPartial = readiness.level === 'partially_ready';
  const isBlocked = readiness.level === 'not_ready';

  return (
    <Modal
      isOpen={Boolean(org)}
      onClose={onClose}
      title={`${org.organizationName} (${org.organizationCode})`}
      description={`Assessment Governance & Examination Readiness Audit • ${org.academicSession} (${org.activePeriod})`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Header Summary Strip */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                <span>{org.organizationName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isReady
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : isPartial
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : isBlocked
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {readiness.level.replace('_', ' ')} ({readiness.overallScore}%)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-muted-foreground text-[11px]">
                <span className="capitalize">{org.classification.replace('_', ' ')}</span>
                <span>•</span>
                <span>Plan: <strong className="text-foreground uppercase">{org.planId.replace('plan_', '')}</strong></span>
                <span>•</span>
                <span>Delivery Mode: <strong className="text-foreground">{org.deliveryMode.replace('_', ' ')}</strong></span>
                <span>•</span>
                <span>{org.campuses ? org.campuses.length : 0} campuses</span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-muted-foreground">
            <span>Last Updated: </span>
            <span className="font-mono text-foreground">
              {org.lastUpdated ? new Date(org.lastUpdated).toLocaleDateString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('entitlements')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entitlements'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Entitlements & Campuses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assessments')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assessments'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Series & Assessments ({org.assessments.totalAssessments})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cbt')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cbt'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MonitorCheck className="w-3.5 h-3.5" />
            <span>CBT & Question Bank ({org.cbt.totalCbtExams})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timetables')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timetables'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timetable & Clashes ({org.timetable.totalSlots})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'grading'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Grading & Publication</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('readiness')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'readiness'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Readiness Checklist ({readiness.passedChecksCount}/8)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Audit Findings ({org.dataQualityIssues.length})</span>
          </button>
        </div>

        {/* Tab 1: Entitlements & Campuses */}
        {activeTab === 'entitlements' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Examinations Module</span>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {org.hasExaminationsModule ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>{org.hasExaminationsModule ? 'Active (mod_examinations)' : 'Not Licensed'}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">CBT Engine Module</span>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {org.hasCbtModule ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>{org.hasCbtModule ? 'Active (sub_exam_cbt)' : 'Not Licensed / Exempt'}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Results & Report Cards</span>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {org.hasResultsModule ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>{org.hasResultsModule ? 'Active (mod_results)' : 'Not Licensed'}</span>
                </div>
              </div>
            </div>

            {/* Campuses Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Associated Branches & Campuses ({org.campuses.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {org.campuses.map((campus) => (
                  <div key={campus.campusId} className="p-3 bg-background border border-border rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground">{campus.campusName}</strong>
                      {campus.isMainCampus && (
                        <Badge variant="neutral" className="text-[9px] py-0 px-1 bg-primary/10 text-primary">
                          Main
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span className="font-mono">{campus.campusCode}</span>
                      <span>•</span>
                      <span>{campus.scheduledExamsCount} scheduled</span>
                      <span>•</span>
                      <span>{campus.completedCount} completed</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                      <span>Campus Readiness:</span>
                      <strong className="font-mono text-foreground">{campus.readinessScore}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Assessments Lifecycle */}
        {activeTab === 'assessments' && (
          <div className="space-y-4 text-xs">
            {/* Active Exam Period Info */}
            <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs">
                  Active Examination Series: {org.activeExamPeriodName || 'None Configured'}
                </span>
                <Badge variant="neutral" className="text-[10px]">
                  {org.activeExamPeriodCategory || 'Standard'}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                <span>
                  Date Window:{' '}
                  <strong className="text-foreground font-mono">
                    {org.activeExamPeriodDates
                      ? `${org.activeExamPeriodDates.start} to ${org.activeExamPeriodDates.end}`
                      : 'Unscheduled'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Total Series Configured: <strong className="text-foreground">{org.examPeriodsCount}</strong>
                </span>
              </div>
            </div>

            {/* Assessment Status Progression */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                <span className="text-muted-foreground text-[11px]">Scheduled</span>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {org.assessments.scheduledCount}
                </div>
              </div>

              <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                <span className="text-muted-foreground text-[11px]">Marks Entry</span>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {org.assessments.marksEntryCount}
                </div>
              </div>

              <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                <span className="text-muted-foreground text-[11px]">Under Review</span>
                <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                  {org.assessments.underReviewCount}
                </div>
              </div>

              <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                <span className="text-muted-foreground text-[11px]">Published</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {org.assessments.publishedCount}
                </div>
              </div>
            </div>

            {/* Component Types Breakdown */}
            <div className="p-3.5 bg-background border border-border rounded-xl space-y-2">
              <span className="font-semibold text-foreground text-xs">Configured Assessment Types</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(org.assessments.byType || {})
                  .filter(([, v]) => (v as number) > 0)
                  .map(([typeKey, count]) => (
                    <div key={typeKey} className="px-2.5 py-1 bg-muted/20 border border-border rounded-md text-[11px] flex items-center gap-1.5">
                      <span className="text-muted-foreground">{typeKey.replace(/_/g, ' ')}:</span>
                      <strong className="font-mono text-foreground">{count as number}</strong>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CBT & Question Bank */}
        {activeTab === 'cbt' && (
          <div className="space-y-4 text-xs">
            {org.cbt.isEnabled ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                    <span className="text-muted-foreground text-[11px]">CBT Exams</span>
                    <div className="text-base font-bold text-foreground">{org.cbt.totalCbtExams}</div>
                  </div>

                  <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                    <span className="text-muted-foreground text-[11px]">Total Attempts</span>
                    <div className="text-base font-bold text-foreground">{org.cbt.totalAttempts}</div>
                  </div>

                  <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                    <span className="text-muted-foreground text-[11px]">Completed</span>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {org.cbt.completedAttempts}
                    </div>
                  </div>

                  <div className="p-2.5 bg-background border border-border rounded-lg text-center space-y-1">
                    <span className="text-muted-foreground text-[11px]">Timed Out</span>
                    <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {org.cbt.timedOutAttempts}
                    </div>
                  </div>
                </div>

                {/* Question Bank Summary */}
                <div className="p-3.5 bg-background border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-xs">
                      Question Bank Repository: {org.questionBank.totalQuestions} Questions
                    </span>
                    <Badge variant="neutral" className="text-[10px]">
                      {org.questionBank.approvedQuestions} Approved for Testing
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-muted/20 rounded-md">
                      <span className="text-muted-foreground">Draft:</span>{' '}
                      <strong className="font-mono text-foreground">{org.questionBank.draftQuestions}</strong>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-md">
                      <span className="text-muted-foreground">Under Review:</span>{' '}
                      <strong className="font-mono text-foreground">{org.questionBank.underReviewQuestions}</strong>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-md">
                      <span className="text-muted-foreground">Collections:</span>{' '}
                      <strong className="font-mono text-foreground">{org.questionBank.totalCollections}</strong>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-md">
                      <span className="text-muted-foreground">Active Blueprints:</span>{' '}
                      <strong className="font-mono text-foreground">{org.questionBank.activeBlueprintsCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Proctoring Policy Notice */}
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[11px] text-muted-foreground space-y-1">
                  <div className="font-semibold text-primary flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Security & Invigilation Architecture</span>
                  </div>
                  <p>{org.cbt.securityLimitationsNote}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-muted/20 border border-border rounded-xl text-center space-y-2 text-muted-foreground">
                <MonitorCheck className="w-8 h-8 mx-auto text-muted-foreground/60" />
                <h4 className="font-semibold text-foreground text-sm">Paper-Based Examination Protocols</h4>
                <p className="text-xs">
                  This school operates exclusively paper-based physical examinations and is exempted from CBT question bank requirements.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Timetable & Clashes */}
        {activeTab === 'timetables' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Scheduled Exam Slots</span>
                <div className="text-base font-bold text-foreground">{org.timetable.totalSlots} Slots</div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Invigilation Coverage</span>
                <div className="text-base font-bold text-foreground">
                  {org.timetable.invigilatorsAssignedCount} / {org.timetable.totalSlots}
                </div>
                {org.timetable.unassignedInvigilatorsCount > 0 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    {org.timetable.unassignedInvigilatorsCount} unassigned
                  </span>
                )}
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Collision Analysis</span>
                <div
                  className={`text-base font-bold ${
                    org.timetable.criticalConflictsCount > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {org.timetable.criticalConflictsCount} Critical Clashes
                </div>
              </div>
            </div>

            {/* List of Conflicts */}
            {org.timetable.conflicts.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Detected Schedule Collisions ({org.timetable.conflicts.length})</span>
                </h4>

                <div className="space-y-2">
                  {org.timetable.conflicts.map((conf) => (
                    <div
                      key={conf.id}
                      className="p-3 bg-background border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={conf.severity === 'CRITICAL' ? 'error' : 'warning'}
                            className="text-[10px] uppercase font-bold"
                          >
                            {conf.conflictType.replace(/_/g, ' ')}
                          </Badge>
                          <strong className="text-foreground">{conf.description}</strong>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Affected: {conf.affectedEntities.join(', ')}
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-muted-foreground font-mono text-[11px]">
                        {conf.examDate} · {conf.timeWindow}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  No room double-bookings, invigilator teacher conflicts, or class concurrency clashes detected in this timetable.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Grading & Publication */}
        {activeTab === 'grading' && (
          <div className="space-y-4 text-xs">
            {/* Grading Scale */}
            <div className="p-3.5 bg-background border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground text-xs">
                    Standard Grading Scale: {org.grading.scaleName}
                  </span>
                  <div className="text-[11px] text-muted-foreground">
                    Scale Type: <strong className="text-foreground">{org.grading.scaleType}</strong> · Pass Mark:{' '}
                    <strong className="text-foreground">{org.grading.passMark}%</strong>
                  </div>
                </div>
                <Badge variant="neutral" className="text-[10px]">
                  {org.grading.totalBands} Bands
                </Badge>
              </div>

              <div className="p-2.5 bg-muted/20 rounded-lg text-[11px] font-mono text-foreground leading-relaxed">
                {org.grading.bandsSummary}
              </div>
            </div>

            {/* Results Publication Pipeline */}
            <div className="p-3.5 bg-background border border-border rounded-xl space-y-2">
              <span className="font-semibold text-foreground text-xs">Publication & Broadsheet Status</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                <div className="p-2.5 bg-muted/20 rounded-lg space-y-1">
                  <span className="text-muted-foreground">Publication Status:</span>
                  <div className="font-bold text-foreground">{org.resultsPublication.publicationStatus}</div>
                </div>

                <div className="p-2.5 bg-muted/20 rounded-lg space-y-1">
                  <span className="text-muted-foreground">Report Card Template:</span>
                  <div className="font-bold text-foreground">
                    {org.resultsPublication.reportCardTemplateReady ? 'Verified Ready' : 'Pending Verification'}
                  </div>
                </div>

                <div className="p-2.5 bg-muted/20 rounded-lg space-y-1">
                  <span className="text-muted-foreground">Class Broadsheet:</span>
                  <div className="font-bold text-foreground">
                    {org.resultsPublication.broadsheetReady ? 'Active' : 'Unconfigured'}
                  </div>
                </div>

                <div className="p-2.5 bg-muted/20 rounded-lg space-y-1">
                  <span className="text-muted-foreground">Digital QR Verification:</span>
                  <div className="font-bold text-foreground">
                    {org.resultsPublication.digitalVerificationEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Readiness Checklist */}
        {activeTab === 'readiness' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="font-semibold text-foreground text-xs">
                8-Point Canonical Prerequisite Checklist
              </span>
              <span className="text-muted-foreground text-[11px]">
                Passed {readiness.passedChecksCount} of {readiness.totalApplicableChecks} applicable dimensions
              </span>
            </div>

            <div className="space-y-2">
              {readiness.checks.map((check) => {
                const isCheckPassed = check.status === 'passed';
                const isCheckWarn = check.status === 'warning';
                const isCheckExempt = check.status === 'not_applicable';

                return (
                  <div
                    key={check.id}
                    className="p-3 bg-background border border-border rounded-xl space-y-1.5 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCheckPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : isCheckWarn ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : isCheckExempt ? (
                          <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-semibold text-foreground text-xs">{check.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">[{check.category}]</span>
                      </div>

                      <Badge
                        variant={
                          isCheckPassed
                            ? 'success'
                            : isCheckWarn
                            ? 'warning'
                            : isCheckExempt
                            ? 'neutral'
                            : 'error'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {check.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                      {check.message}
                    </p>

                    {!isCheckPassed && !isCheckExempt && (
                      <div className="text-[11px] text-foreground font-medium pl-6 pt-0.5">
                        <strong className="text-primary font-semibold">Remediation:</strong> {check.remediationGuidance}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 7: Audit Findings */}
        {activeTab === 'audit' && (
          <div className="space-y-3 text-xs">
            {org.dataQualityIssues.length > 0 ? (
              <div className="space-y-2">
                {org.dataQualityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 bg-background border border-border rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          issue.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : issue.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <strong className="text-foreground">{issue.title}</strong>
                      <span className="text-muted-foreground font-mono text-[11px]">[{issue.category}]</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="text-[11px] text-foreground font-medium pt-0.5">
                      <strong className="text-primary font-semibold">Recommended Fix:</strong> {issue.remediationRecommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center space-y-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-sm">Zero Governance Audit Discrepancies</h4>
                <p className="text-xs text-muted-foreground">
                  This school satisfies all assessment integrity guidelines, with zero room clashes or unconfigured grading scales.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
