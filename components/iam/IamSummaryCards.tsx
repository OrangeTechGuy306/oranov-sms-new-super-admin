'use client';

import React from 'react';
import { IamGovernanceMetrics } from '@/lib/types/iam';
import { StatCard } from '@/components/ui/StatCard';
import {
  Users2,
  ShieldCheck,
  ShieldAlert,
  Layers,
  KeyRound,
  Lock,
} from 'lucide-react';

interface IamSummaryCardsProps {
  metrics: IamGovernanceMetrics;
}

export function IamSummaryCards({ metrics }: IamSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Platform Administrators"
        value={metrics.totalPlatformUsers}
        subtitle={`${metrics.activePlatformUsers} Active · ${metrics.pendingInviteUsers} Invited`}
        icon={<Users2 className="w-5 h-5" />}
      />
      <StatCard
        title="Active Operators"
        value={metrics.activePlatformUsers}
        subtitle={`${metrics.suspendedPlatformUsers} Suspended / Inactive`}
        icon={<ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
      />
      <StatCard
        title="Privileged Accounts"
        value={metrics.privilegedUsersCount}
        subtitle="Hold Critical / Root Entitlements"
        icon={<ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
      />
      <StatCard
        title="Governed Roles"
        value={metrics.totalRolesCount}
        subtitle={`${metrics.systemRolesCount} System · ${metrics.customRolesCount} Custom`}
        icon={<Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
      />
      <StatCard
        title="Platform Permissions"
        value={metrics.totalPermissionsCount}
        subtitle={`${metrics.privilegedPermissionsCount} Privileged Capabilities`}
        icon={<KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      />
      <StatCard
        title="Tenant Separation"
        value="Isolated"
        subtitle="Zero Tenant PII or Cross-Access"
        icon={<Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
      />
    </div>
  );
}
