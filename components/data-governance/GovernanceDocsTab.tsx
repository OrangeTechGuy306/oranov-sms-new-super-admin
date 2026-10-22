'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  RotateCcw,
  ShieldCheck,
  Layers,
  Server,
} from 'lucide-react';
import { exportGovernancePackage } from '@/lib/data-governance/exporter';
import {
  DataCategoryRecord,
  GovernanceRetentionPolicy,
  PrivacyRequestRecord,
  DataLifecycleRuleRecord,
  TenantGovernanceSummary,
  GovernanceExceptionRecord,
  GovernanceAuditRecord,
} from '@/lib/types/data-governance';

interface GovernanceDocsTabProps {
  categories: DataCategoryRecord[];
  policies: GovernanceRetentionPolicy[];
  requests: PrivacyRequestRecord[];
  rules: DataLifecycleRuleRecord[];
  tenants: TenantGovernanceSummary[];
  exceptions: GovernanceExceptionRecord[];
  auditLogs: GovernanceAuditRecord[];
  onResetDefaults: () => void;
  addToast?: (toast: { title: string; message?: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
}

export function GovernanceDocsTab({
  categories,
  policies,
  requests,
  rules,
  tenants,
  exceptions,
  auditLogs,
  onResetDefaults,
  addToast,
}: GovernanceDocsTabProps) {
  const [activeSection, setActiveSection] = useState<'architecture' | 'regulations' | 'matrix' | 'readiness'>('architecture');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      exportGovernancePackage({
        categories,
        policies,
        requests,
        lifecycleRules: rules,
        tenants,
        exceptions,
        auditLogs,
        format,
      });
      if (addToast) {
        addToast({
          title: 'Export Generated',
          message: `Platform Data Governance package successfully downloaded as ${format.toUpperCase()} with formula injection protection.`,
          type: 'success',
        });
      }
    } catch (err: unknown) {
      if (addToast) {
        addToast({
          title: 'Export Failed',
          message: err instanceof Error ? err.message : 'Failed to export governance package.',
          type: 'error',
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const docSections: Array<{ id: 'architecture' | 'regulations' | 'matrix' | 'readiness'; label: string }> = [
    { id: 'architecture', label: '1. Architecture & Data Flow' },
    { id: 'regulations', label: '2. Educational Privacy Regulations' },
    { id: 'matrix', label: '3. Classification & Handling Matrix' },
    { id: 'readiness', label: '4. Future Backend Readiness' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Platform Data Governance Architecture & Readiness Documentation
          </h2>
          <p className="text-xs text-muted-foreground">
            Architectural reference, educational privacy compliance matrix, and future production backend readiness contracts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport('json')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Export JSON Bundle
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Export Safe CSV
          </button>
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo Baseline
          </button>
        </div>
      </div>

      {/* Segmented Documentation Navigation */}
      <div className="flex border-b border-border text-xs font-medium">
        {docSections.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`border-b-2 px-4 py-2.5 transition-colors ${
              activeSection === tab.id
                ? 'border-indigo-600 font-bold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Architecture & Data Flow */}
      {activeSection === 'architecture' && (
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Multi-Tenant Governance Data Model
            </h3>
            <p>
              The platform implements a layered governance model that decouples platform-level declarative policy definition from
              tenant-scoped execution. The Super-Admin console governs standard statutory schedules and default classification baselines,
              while individual tenant institutions retain ultimate legal custody over their pupil and administrative records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border border-border bg-muted/40 p-3.5">
                <div className="font-bold text-foreground text-xs mb-1">1. Classification Registry</div>
                <p className="text-[11px]">
                  Establishes 14 standard school data categories. Categorization binds fields to sensitivity ratings
                  (Public, Internal, Confidential, Restricted) and determines encryption, retention, and access control tiers.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3.5">
                <div className="font-bold text-foreground text-xs mb-1">2. Retention & Lifecycle Schedules</div>
                <p className="text-[11px]">
                  Configures time-based retention horizons anchored to concrete educational events (enrollment departure,
                  fiscal year end, majority age DOB+25). Pauses automatically upon registration of an active litigation hold.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3.5">
                <div className="font-bold text-foreground text-xs mb-1">3. Privacy Request (DSAR) State Machine</div>
                <p className="text-[11px]">
                  Enforces verifiable state progressions (Received → Identity Verification → Under Review → Approved Pending → Processing Simulated → Closed)
                  to prevent premature or unlawful record disclosure or erasure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Educational Privacy Regulations */}
      {activeSection === 'regulations' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Educational Privacy & Compliance Safeguards
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              School data requires stringent regulatory compliance due to the sensitive nature of minors&apos; educational and health records.
              Below is the platform regulatory mapping:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                    <th className="py-2.5 px-3">Statutory Framework</th>
                    <th className="py-2.5 px-3">Key Requirement</th>
                    <th className="py-2.5 px-3">Platform Governance Safeguard</th>
                    <th className="py-2.5 px-3">Enforcement Horizon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-3 font-bold text-foreground whitespace-nowrap">
                      FERPA (34 CFR Part 99)
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Parental/eligible student right to inspect education records; strict limits on disclosure without prior consent.
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Transcript permanent retention (100y); mandatory identity verification gate before DSAR export disclosure.
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                      Mandatory (US K-12/HigherEd)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-foreground whitespace-nowrap">
                      GDPR (Articles 15-21)
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Subject access, rectification, erasure (&apos;right to be forgotten&apos;), data portability, and processing restriction.
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      30-day statutory SLA tracking; synthetic manifest generation; statutory retention override protection.
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                      Mandatory (EU/EEA & UK DPA)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-foreground whitespace-nowrap">
                      COPPA (15 U.S.C. 6501-6506)
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Verifiable parental consent for online collection of personal information from children under 13.
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Restricted classification on pupil biometric & medical data; zero-PII in executive platform views.
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                      Children Under 13
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-foreground whitespace-nowrap">
                      Safeguarding & KCSIE (UK)
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Keeping Children Safe in Education mandates preservation of child protection notes until age 25+.
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      Retention schedule RET-SAFEGUARDING-RECORDS enforces 25,550 days (DOB + 25 years) with restricted access.
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                      Safeguarding Statutory Rule
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Classification & Handling Matrix */}
      {activeSection === 'matrix' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Proposed Data Classification & Handling Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800 dark:text-rose-300 text-xs">
                    RESTRICTED
                  </span>
                  <span className="rounded-md bg-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                    Highest Sensitivity
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Examples:</strong> Pupil safeguarding notes, child protection records, medical condition flags, disciplinary tribunals.
                </p>
                <div className="text-[11px] text-foreground font-semibold">Security Controls:</div>
                <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                  <li>Mandatory field-level envelope encryption (AES-256-GCM with customer KMS key)</li>
                  <li>Role-based access limited to designated safeguarding leads & campus head</li>
                  <li>Explicit dual-authorization required for DSAR disclosure or export</li>
                  <li>Retention: DOB + 25 years statutory schedule</li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 dark:text-amber-300 text-xs">
                    CONFIDENTIAL
                  </span>
                  <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    Restricted Operational
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Examples:</strong> Official examination grades, pupil GPA, admissions application dossiers, staff payroll ledgers.
                </p>
                <div className="text-[11px] text-foreground font-semibold">Security Controls:</div>
                <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                  <li>Tenant isolation enforced via multi-tenant Postgres schema & row-level security (RLS)</li>
                  <li>Authorized teachers, registrar, and billing administrators only</li>
                  <li>Subject to 30-day DSAR access and portability exports</li>
                  <li>Retention: 5 to 7 years post-graduation or fiscal year end</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-800 dark:text-blue-300 text-xs">
                    INTERNAL
                  </span>
                  <span className="rounded-md bg-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-900 dark:bg-blue-900 dark:text-blue-200">
                    Standard Operational
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Examples:</strong> Daily classroom attendance logs, support ticket communications, system audit events.
                </p>
                <div className="text-[11px] text-foreground font-semibold">Security Controls:</div>
                <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                  <li>Encrypted at rest and in transit (TLS 1.3)</li>
                  <li>Standard staff and teacher access with tenant RBAC</li>
                  <li>Automated cold storage archival after 365 days of inactivity</li>
                </ul>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    PUBLIC
                  </span>
                  <span className="rounded-md bg-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                    Publicly Accessible
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Examples:</strong> Published academic calendars, campus building addresses, term dates, fee schedule prospectus.
                </p>
                <div className="text-[11px] text-foreground font-semibold">Security Controls:</div>
                <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                  <li>No PII or confidential operational metadata permitted</li>
                  <li>Cached via CDN for high availability and performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Future Backend Readiness */}
      {activeSection === 'readiness' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Future Backend Implementation Readiness Checklist
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Phase E-09.20 delivers complete frontend typing, UI management, deterministic mock fixtures, and validation state machines.
              The production backend must implement the following server-side capabilities before enabling live enforcement:
            </p>

            <div className="space-y-3">
              {[
                {
                  title: '1. Scheduled Lifecycle Worker & Cron Service',
                  desc: 'Background queue worker (e.g., BullMQ, Temporal) executing periodic scans against data category tables to transition records past their retention duration into cold storage or soft deletion.',
                  status: 'Contract Defined • Pending Backend Service',
                },
                {
                  title: '2. Cryptographic Identity Verification for DSAR Requests',
                  desc: 'Multi-factor authentication challenge and legal identity verification webhook to certify parent/student identity before releasing access exports or processing erasures.',
                  status: 'State Machine Ready • Pending Auth Service',
                },
                {
                  title: '3. Immutable WORM Storage for Governance Audit Logs',
                  desc: 'Tamper-proof append-only storage (e.g., AWS S3 Object Lock in compliance mode) ensuring governance reviews and exception determinations cannot be altered or purged.',
                  status: 'Local Store Active • Pending Storage Pipeline',
                },
                {
                  title: '4. Legal Hold Interceptor Middleware',
                  desc: 'Database pre-delete triggers and ORM middleware checking active exceptions table before allowing any hard deletion or automated purges on a tenant record.',
                  status: 'Exception Model Complete • Pending DB Triggers',
                },
                {
                  title: '5. Tenant-Level Data Redaction & Secure Portability Pipeline',
                  desc: 'Asynchronous streaming export pipeline generating encrypted ZIP archives containing sanitized JSON/CSV records with zero third-party disclosure.',
                  status: 'Manifest Synthetic Preview • Pending Worker',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{item.title}</span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
