'use client';

import React, { useState } from 'react';
import { OrganizationAcademicOversight } from '@/lib/types/academic-oversight';
import { Modal } from '@/components/ui/Modal';
import {
  CalendarDays,
  Layers,
  Clock,
  Activity,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  AlertOctagon,
  FileCheck2,
} from 'lucide-react';

interface OrganizationAcademicDetailModalProps {
  org: OrganizationAcademicOversight | null;
  onClose: () => void;
}

export function OrganizationAcademicDetailModal({
  org,
  onClose,
}: OrganizationAcademicDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'calendar' | 'structure' | 'curriculum' | 'timetables' | 'pedagogy' | 'assessment' | 'checklist'
  >('calendar');

  if (!org) return null;

  const readiness = org.readiness;
  const isComplete = readiness.level === 'complete';
  const isAttention = readiness.level === 'attention_required';
  const isBlocker = readiness.level === 'critical_blocker';

  return (
    <Modal
      isOpen={Boolean(org)}
      onClose={onClose}
      title={`${org.organizationName} (${org.organizationCode})`}
      description={`Academic Oversight Inspection • Active Session: ${org.academicSession} • Status: ${org.lifecycleStatus.toUpperCase()}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Top Header Card */}
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
                    isComplete
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : isAttention
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : isBlocker
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {readiness.level.replace('_', ' ')} ({readiness.score}%)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                <span className="capitalize">{org.classification.replace('_', ' ')}</span>
                <span>•</span>
                <span>{org.campuses ? org.campuses.length : 0} campuses</span>
                <span>•</span>
                <span>Active Period: <strong className="text-foreground">{org.activePeriod || 'None'}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-muted-foreground">
            <span>Last Reported: </span>
            <span className="font-mono text-foreground">
              {org.lastReportedAt ? new Date(org.lastReportedAt).toLocaleDateString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendar & Terms</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'structure'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Structure & Allocations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Curriculum & Schemes</span>
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
            <span>Timetables</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pedagogy')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pedagogy'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Pedagogy & Plans</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assessment'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Assessment & Reporting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Readiness Checklist</span>
          </button>
        </div>

        {/* Tab 1: Calendar & Terms */}
        {activeTab === 'calendar' && (
          <div className="space-y-3 text-xs">
            {org.academicYears && org.academicYears.length > 0 ? (
              org.academicYears.map((year) => (
                <div key={year.id} className="p-3.5 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{year.name}</span>
                      {year.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                          CURRENT SESSION
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-secondary text-secondary-foreground">
                        {year.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{year.startDate} → {year.endDate}</span>
                      {year.dateValidity === 'valid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid Dates
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> {year.dateValidity.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Terms List */}
                  {year.periods && year.periods.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-border/60 rounded">
                        <thead className="bg-muted/50 text-[10px] uppercase font-semibold text-muted-foreground">
                          <tr>
                            <th className="py-2 px-3">Sequence</th>
                            <th className="py-2 px-3">Period Name</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">Date Range</th>
                            <th className="py-2 px-3">Teaching Days</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {year.periods.map((period) => (
                            <tr key={period.id} className="hover:bg-muted/20">
                              <td className="py-2 px-3 font-mono">#{period.sequence}</td>
                              <td className="py-2 px-3 font-semibold text-foreground flex items-center gap-1.5">
                                <span>{period.name}</span>
                                {period.isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    ACTIVE
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3">{period.type}</td>
                              <td className="py-2 px-3 text-muted-foreground font-mono">
                                {period.startDate} to {period.endDate}
                              </td>
                              <td className="py-2 px-3">{period.daysCount || 'N/A'} days</td>
                              <td className="py-2 px-3 capitalize">{period.status.toLowerCase()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-[11px]">No terms or semesters defined for this academic year.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border border-border text-center text-muted-foreground">
                No academic session configuration found for this organization.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Structure & Allocations */}
        {activeTab === 'structure' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Departments</span>
                <p className="text-xl font-bold text-foreground mt-0.5">{org.structure.totalDepartments}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Classes & Cohorts</span>
                <p className="text-xl font-bold text-foreground mt-0.5">{org.structure.totalClasses}</p>
                <span className="text-[10px] text-muted-foreground">{org.structure.totalArms} streams/arms</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Curriculum Subjects</span>
                <p className="text-xl font-bold text-foreground mt-0.5">{org.structure.totalSubjects}</p>
                <span className="text-[10px] text-muted-foreground">{org.structure.coreSubjectsCount} core, {org.structure.electiveSubjectsCount} elective</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Teacher Allocation</span>
                <p className="text-xl font-bold text-foreground mt-0.5">{org.structure.teacherAllocationCompletenessPercentage}%</p>
                <span className={`text-[10px] font-semibold ${org.structure.unassignedSubjectsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {org.structure.unassignedSubjectsCount} unassigned
                </span>
              </div>
            </div>

            {/* Campus Breakdown */}
            <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
              <h4 className="font-semibold text-foreground text-xs">Branch & Campus Academic Capacities</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-border/60 rounded">
                  <thead className="bg-muted/50 text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2 px-3">Campus Name</th>
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Designation</th>
                      <th className="py-2 px-3">Classes</th>
                      <th className="py-2 px-3">Arms</th>
                      <th className="py-2 px-3">Faculty</th>
                      <th className="py-2 px-3">Timetable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {org.campuses && org.campuses.length > 0 ? (
                      org.campuses.map((c) => (
                        <tr key={c.campusId}>
                          <td className="py-2 px-3 font-semibold text-foreground">{c.campusName}</td>
                          <td className="py-2 px-3 font-mono">{c.campusCode}</td>
                          <td className="py-2 px-3">{c.isMainCampus ? 'Main Campus' : 'Branch Campus'}</td>
                          <td className="py-2 px-3">{c.classesCount}</td>
                          <td className="py-2 px-3">{c.armsCount}</td>
                          <td className="py-2 px-3">{c.teachersCount}</td>
                          <td className="py-2 px-3">
                            {c.timetablePublished ? (
                              <span className="text-emerald-600 font-semibold">Published</span>
                            ) : (
                              <span className="text-amber-600 font-semibold">Draft / Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-3 text-center text-muted-foreground">No campus records configured.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Curriculum & Schemes */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active Frameworks</span>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {org.curriculum.activeFrameworks.join(', ') || 'None'}
                </p>
                <span className="text-[10px] text-muted-foreground">{org.curriculum.blueprintCount} Blueprints</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Schemes Approval</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                  {org.curriculum.schemesApprovedCount} / {org.curriculum.schemesTotal} Approved
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {org.curriculum.schemesUnderReviewCount} under review, {org.curriculum.schemesDraftCount} draft
                </span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Estimated Coverage</span>
                <p className="font-bold text-foreground text-sm mt-0.5">{org.curriculum.estimatedCoveragePercentage}%</p>
                <span className="text-[10px] text-muted-foreground">Curriculum Readiness: {org.curriculum.curriculumReadinessStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Timetables */}
        {activeTab === 'timetables' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {org.timetables.activeTimetableName || 'Master Schedule'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Status: <strong className="text-foreground">{org.timetables.timetableStatus}</strong> • Version {org.timetables.version} • {org.timetables.totalSlotsCount} Scheduled Slots
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    org.timetables.criticalConflictsCount > 0
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  }`}
                >
                  {org.timetables.criticalConflictsCount > 0
                    ? `${org.timetables.criticalConflictsCount} Critical Conflicts`
                    : 'Zero Conflicts'}
                </span>
              </div>

              {/* Conflict details */}
              {org.timetables.conflicts && org.timetables.conflicts.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="font-semibold text-foreground text-xs">Identified Clashes & Overlaps:</span>
                  <div className="space-y-1.5">
                    {org.timetables.conflicts.map((conf) => (
                      <div
                        key={conf.id}
                        className={`p-2.5 rounded border text-xs flex items-start gap-2 ${
                          conf.severity === 'CRITICAL'
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">{conf.message}</div>
                          <div className="text-[11px] opacity-80 mt-0.5">
                            Entity: {conf.affectedEntity} • Type: {conf.type} {conf.dayOfWeek ? `• ${conf.dayOfWeek}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-emerald-600 dark:text-emerald-400 font-medium text-xs pt-1">
                  ✓ Schedule validated without concurrent teacher, room, or student cohort overlaps.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Pedagogy & Plans */}
        {activeTab === 'pedagogy' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Lesson Notes</span>
                <p className="text-lg font-bold text-foreground mt-0.5">{org.pedagogicalWorkflows.lessonNotesTotal}</p>
                <span className="text-[10px] text-emerald-600">{org.pedagogicalWorkflows.lessonNotesApproved} approved</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Compliance Rate</span>
                <p className="text-lg font-bold text-foreground mt-0.5">{org.pedagogicalWorkflows.lessonNoteComplianceRatePercentage}%</p>
                <span className="text-[10px] text-muted-foreground">Active submission flow</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Daily Plans Delivered</span>
                <p className="text-lg font-bold text-foreground mt-0.5">{org.pedagogicalWorkflows.dailyPlansDelivered}</p>
                <span className="text-[10px] text-muted-foreground">{org.pedagogicalWorkflows.dailyPlansTotal} scheduled</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Verification Rate</span>
                <p className="text-lg font-bold text-foreground mt-0.5">{org.pedagogicalWorkflows.deliveryVerificationRatePercentage}%</p>
                <span className="text-[10px] text-muted-foreground">{org.pedagogicalWorkflows.dailyPlansMissed} missed</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Assessment & Reporting */}
        {activeTab === 'assessment' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {org.assessmentAndReporting.defaultGradingScaleName || 'Grading Standard'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Scale Type: <strong className="text-foreground">{org.assessmentAndReporting.gradingScaleType}</strong> • Passing Threshold: {org.assessmentAndReporting.passMark}%
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-semibold">
                  {org.assessmentAndReporting.academicReportingReadiness.replace('_', ' ')}
                </span>
              </div>

              {/* Grade Bands Table */}
              {org.assessmentAndReporting.bands && org.assessmentAndReporting.bands.length > 0 && (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs border border-border/60 rounded">
                    <thead className="bg-muted/50 text-[10px] uppercase font-semibold text-muted-foreground">
                      <tr>
                        <th className="py-1.5 px-3">Grade</th>
                        <th className="py-1.5 px-3">Score Range</th>
                        <th className="py-1.5 px-3">GPA Point</th>
                        <th className="py-1.5 px-3">Interpretation</th>
                        <th className="py-1.5 px-3">Credit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {org.assessmentAndReporting.bands.map((band) => (
                        <tr key={band.grade}>
                          <td className="py-1.5 px-3 font-bold text-foreground">{band.grade}</td>
                          <td className="py-1.5 px-3 font-mono">{band.minScore} - {band.maxScore}%</td>
                          <td className="py-1.5 px-3 font-mono">{band.gradePoint ?? 'N/A'}</td>
                          <td className="py-1.5 px-3">{band.interpretation}</td>
                          <td className="py-1.5 px-3">
                            {band.isPassing ? (
                              <span className="text-emerald-600 font-semibold">Pass</span>
                            ) : (
                              <span className="text-rose-600 font-semibold">Fail</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Readiness Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-2">
              {readiness.items.map((item) => (
                <div
                  key={item.key}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                    item.isComplete
                      ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20'
                      : item.severityIfMissing === 'blocker'
                      ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20'
                      : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {item.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : item.severityIfMissing === 'blocker' ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                      {item.details && (
                        <p className="text-[11px] font-medium text-foreground/80 mt-1">
                          ↳ Status: {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      item.isComplete
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        : item.severityIfMissing === 'blocker'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                    }`}
                  >
                    {item.isComplete ? 'Complete' : item.severityIfMissing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
