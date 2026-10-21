'use client';

import React from 'react';
import { BackupReadinessRecord, ReadinessState } from '@/lib/system-health/types';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  ShieldCheck,
  Database,
  HardDrive,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  ListChecks,
  ExternalLink,
  Info,
} from 'lucide-react';

interface BackupReadinessWorkspaceProps {
  backupRecords: BackupReadinessRecord[];
}

export function BackupReadinessWorkspace({
  backupRecords,
}: BackupReadinessWorkspaceProps) {
  const verifiedCount = backupRecords.filter((b) => b.verificationStatus === 'verified_checksum').length;
  const simulatedCount = backupRecords.filter((b) => b.verificationStatus === 'simulated').length;

  const getReadinessBadge = (state: ReadinessState) => {
    switch (state) {
      case 'verified':
        return <Badge variant="success" size="sm" dot>VERIFIED AUDIT</Badge>;
      case 'simulated':
        return <Badge variant="info" size="sm" dot>SIMULATED FIXTURE</Badge>;
      case 'reported':
        return <Badge variant="warning" size="sm">REPORTED (UNVERIFIED)</Badge>;
      case 'not_connected':
        return <Badge variant="neutral" size="sm">NOT CONNECTED</Badge>;
      case 'not_configured':
        return <Badge variant="error" size="sm">NOT CONFIGURED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{state.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Non-Negotiable Disaster Recovery Honesty Notice */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">Disaster Recovery Readiness Disclaimer</Badge>
          <span className="font-bold text-foreground">E-09.14 Compliance Invariant:</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          The presence of this user interface does NOT constitute verified production disaster recovery readiness. In accordance with platform governance rules, backup verification records and restore-test drills are explicit demonstration fixtures. Live disaster recovery certification requires automated cryptographic checksum validation against offsite cold storage.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Backup Scopes Monitored"
          value={backupRecords.length}
          subtitle="Storage tiers covered"
          icon={<Database className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Checksum Verified"
          value={verifiedCount}
          subtitle="Cryptographically tested"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Simulated Fixtures"
          value={simulatedCount}
          subtitle="Mock drill records"
          icon={<Clock className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Runbooks Documented"
          value={backupRecords.filter((b) => b.recoveryRunbookStatus === 'documented_available').length}
          subtitle="Standard operating procedures"
          icon={<FileCheck className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Backup Scopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {backupRecords.map((record) => (
          <div
            key={record.id}
            className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3.5 text-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-foreground text-xs">{record.scope}</h4>
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    {record.storageLocation}
                  </span>
                </div>
                {getReadinessBadge(record.readinessState)}
              </div>

              {/* RPO / RTO Benchmarks */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Recovery Point Objective (RPO):</span>
                  <span className="font-bold text-foreground">
                    {record.rpoTargetMinutes !== undefined
                      ? record.rpoTargetMinutes === 0
                        ? '0 mins (Real-Time)'
                        : `${record.rpoTargetMinutes} mins`
                      : 'Not Configured'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Recovery Time Objective (RTO):</span>
                  <span className="font-bold text-foreground">
                    {record.rtoTargetHours !== undefined
                      ? `${record.rtoTargetHours} hours`
                      : 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* Checksum & Restore Drill */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Checksum Verification:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {record.verificationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Reported Restore Test:</span>
                  <span className="font-mono text-foreground">
                    {record.lastRestoreTestTime ? formatDate(record.lastRestoreTestTime, true) : 'Never Simulated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recovery Runbook:</span>
                  <Badge
                    variant={record.recoveryRunbookStatus === 'documented_available' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {record.recoveryRunbookStatus === 'documented_available' ? 'Available' : 'Draft / Missing'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
              <span>Last Backup: {formatDate(record.lastReportedBackupTime, true)}</span>
              <span>Team: {record.responsibleTeam}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Future Operational DR Requirements Checklist */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3 text-xs">
        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          Disaster Recovery Operational Readiness Checklist (Roadmap)
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          The following mandatory infrastructure controls must be completed prior to production SLA accreditation:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Automated Offsite Cross-Region Replication
            </div>
            <p className="text-[11px] text-muted-foreground">
              Daily PostgreSQL snapshots and S3 asset vaults replicated to secondary cloud region (eu-central-1).
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Quarterly Automated Restore Simulation Drill
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automated synthetic test database spin-up and data integrity assertions running on staging cluster.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Point-in-Time Recovery (PITR) to Any Second
            </div>
            <p className="text-[11px] text-muted-foreground">
              PostgreSQL continuous WAL archiving with 14-day retention window for granular rollback.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Lock className="w-3.5 h-3.5 text-purple-500" />
              Immutable WORM (Write-Once-Read-Many) Storage
            </div>
            <p className="text-[11px] text-muted-foreground">
              Object Lock retention policy preventing ransomware deletion on compliance audit snapshots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
