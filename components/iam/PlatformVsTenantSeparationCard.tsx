'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Building2,
  KeyRound,
  Lock,
  Server,
  FileCheck2,
} from 'lucide-react';

export function PlatformVsTenantSeparationCard() {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-sm">
            Architectural Access Boundary: Platform Plane vs. Tenant Plane
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The School Management SaaS architecture maintains strict cryptographic and organizational isolation between the <strong>Platform Control Plane</strong> (governed in this Super-Admin dashboard) and the <strong>School Tenant Data Plane</strong> (governed within individual school tenant portals). Platform administrator roles never directly inherit school tenant permissions.
        </p>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Platform Plane */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5 text-xs">
                <Server className="w-4 h-4" />
                Platform Control Plane (Super-Admin)
              </span>
              <Badge variant="purple" size="sm">Global SaaS Scope</Badge>
            </div>
            <ul className="space-y-2 text-muted-foreground text-[11px]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Governed Roles:</strong> Platform Owner, Operations Administrator, Support Lead, Billing Admin, Compliance Auditor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Resource Authority:</strong> Multi-tenant lifecycle state machine, commercial plan authoring, subscription invoices, global module entitlements, infrastructure health.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Data Minimization:</strong> Inspects cross-tenant aggregated telemetry only (enrollment totals, capacity counts, curriculum completion percentages). Zero student or parent PII.</span>
              </li>
            </ul>
          </div>

          {/* Tenant Plane */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Tenant Data Plane (School Portals)
              </span>
              <Badge variant="info" size="sm">Tenant Bounded</Badge>
            </div>
            <ul className="space-y-2 text-muted-foreground text-[11px]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Governed Roles:</strong> School Principal, Vice-Principal, Teacher, Class Master, School Bursar, Student, Guardian / Parent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Resource Authority:</strong> Student admissions, class attendance registers, term exam questions, student report cards, tuition fee collections, guardian messaging.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Isolation Guarantee:</strong> Strictly scoped to a single `organization_id` and campus branch. Cross-school queries are physically impossible in tenant schema.</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Delegated Support Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold">
            <KeyRound className="w-4 h-4" />
            <span>1. Ticket-Justified Delegation</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Platform support specialists cannot arbitrarily browse school records. Delegated tenant access requires an active support ticket reference and institutional authorization.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <Lock className="w-4 h-4" />
            <span>2. Time-Bounded Sessions</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Future backend authentication mandates ephemeral session grants (e.g., 30-minute maximum TTL) with immediate revocation capability upon ticket resolution.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <FileCheck2 className="w-4 h-4" />
            <span>3. Dual-Sided Audit Logging</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Any delegated interaction generates dual immutable audit entries: visible to the platform compliance auditor and visible to the school principal in their local audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
