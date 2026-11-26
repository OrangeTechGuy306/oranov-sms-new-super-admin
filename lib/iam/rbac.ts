/**
 * Platform (Super Admin) RBAC Engine, Route Policy Registry & Action Utilities.
 *
 * Strictly bound to the platform IAM definitions (`PlatformPermission` & `PlatformRole`)
 * from `lib/iam/fixtures.ts` and `lib/types/iam.ts`.
 * Completely isolated from Tenant Dashboard roles and permissions.
 *
 * SECURITY BOUNDARY NOTICE:
 * Controls client console UI visibility and simulated store mutations only.
 * Server middleware / backend APIs must enforce identical authorization server-side.
 */

import type { PlatformRoleKey } from '@/lib/types/platform-users';
import {
  INITIAL_PLATFORM_PERMISSIONS,
  INITIAL_PLATFORM_ROLES,
} from './fixtures';

export interface PlatformAccessContext {
  user?: {
    id?: string;
    name?: string;
    role?: PlatformRoleKey | string;
    roleIds?: PlatformRoleKey[] | string[];
    status?: string;
  } | null;
  primaryRole?: PlatformRoleKey | string | null;
  permissions?: readonly string[] | null;
}

export type PlatformRouteDenialReason =
  | 'UNAUTHENTICATED'
  | 'INSUFFICIENT_PERMISSION'
  | 'ROLE_NOT_PERMITTED'
  | 'UNKNOWN_ROUTE';

export interface PlatformRouteAccessDecision {
  allowed: boolean;
  reason?: PlatformRouteDenialReason;
  message?: string;
  requiredPermission?: string;
}

export interface PlatformRoutePolicy {
  pattern: string;
  label: string;
  requiredPermissions?: string[];
  anyPermissions?: string[];
  allowedRoles?: PlatformRoleKey[];
  deniedRoles?: PlatformRoleKey[];
}

const KNOWN_PLATFORM_PERMISSION_IDS = new Set(
  INITIAL_PLATFORM_PERMISSIONS.map((p) => p.id)
);

export function isKnownPlatformPermission(permissionId: string | undefined | null): boolean {
  if (!permissionId || typeof permissionId !== 'string') return false;
  return KNOWN_PLATFORM_PERMISSION_IDS.has(permissionId.trim());
}

/**
 * Resolves effective permissions for a platform actor (FAIL-CLOSED).
 * Unknown users, inactive/suspended accounts, or empty permissions never escalate.
 */
export function resolveEffectivePlatformPermissions(
  context: PlatformAccessContext | undefined | null
): string[] {
  if (!context?.user) return [];
  if (context.user.status && context.user.status !== 'ACTIVE' && context.user.status !== 'active') {
    return [];
  }
  if (Array.isArray(context.permissions)) {
    return context.permissions.filter((p) => typeof p === 'string' && KNOWN_PLATFORM_PERMISSION_IDS.has(p));
  }
  return [];
}

/**
 * Checks whether platform permissions include `requiredPermission` (NO wildcard escalation defaults).
 */
export function hasPlatformPermission(
  permissions: readonly string[] | undefined | null,
  requiredPermission: string | undefined | null
): boolean {
  if (!requiredPermission || typeof requiredPermission !== 'string') return false;
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  const clean = requiredPermission.trim();
  if (!KNOWN_PLATFORM_PERMISSION_IDS.has(clean)) {
    return false;
  }
  return permissions.includes(clean);
}

export function hasAnyPlatformPermission(
  permissions: readonly string[] | undefined | null,
  candidates: readonly string[] | undefined | null
): boolean {
  if (!candidates || candidates.length === 0) return false;
  if (!permissions || permissions.length === 0) return false;
  return candidates.some((perm) => hasPlatformPermission(permissions, perm));
}

export function hasAllPlatformPermissions(
  permissions: readonly string[] | undefined | null,
  requirements: readonly string[] | undefined | null
): boolean {
  if (!requirements || requirements.length === 0) return false;
  if (!permissions || permissions.length === 0) return false;
  return requirements.every((perm) => hasPlatformPermission(permissions, perm));
}

export function hasPlatformRole(
  context: PlatformAccessContext | undefined | null,
  role: PlatformRoleKey | string | undefined | null
): boolean {
  if (!context?.user || !role) return false;
  const normalized = role.toLowerCase();
  if (context.primaryRole?.toLowerCase() === normalized) return true;
  if (context.user.role?.toLowerCase() === normalized) return true;
  if (Array.isArray(context.user.roleIds)) {
    return context.user.roleIds.some((r) => r.toLowerCase() === normalized);
  }
  return false;
}

export function hasAnyPlatformRole(
  context: PlatformAccessContext | undefined | null,
  roles: readonly (PlatformRoleKey | string)[] | undefined | null
): boolean {
  if (!context?.user || !roles || roles.length === 0) return false;
  return roles.some((r) => hasPlatformRole(context, r));
}

/**
 * Authoritative registry of all 28 Super Admin Console routes + dynamic/nested routes.
 */
export const PLATFORM_ROUTE_POLICIES: PlatformRoutePolicy[] = [
  {
    pattern: '/',
    label: 'Platform Overview',
    anyPermissions: ['platform.overview.read'],
  },
  {
    pattern: '/analytics',
    label: 'Platform Analytics & BI',
    anyPermissions: [
      'platform.overview.export',
      'oversight.academics.read',
      'billing.subscriptions.read',
    ],
  },
  {
    pattern: '/organizations/new',
    label: 'Onboard New School',
    anyPermissions: ['organizations.create'],
  },
  {
    pattern: '/organizations/[organizationId]/subscription',
    label: 'Organization Subscription & Billing',
    anyPermissions: ['billing.subscriptions.read', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/organizations/[organizationId]',
    label: 'Organization Details',
    anyPermissions: ['organizations.read'],
  },
  {
    pattern: '/organizations',
    label: 'School Organizations Directory',
    anyPermissions: ['organizations.read'],
  },
  {
    pattern: '/student-oversight',
    label: 'Student Information & Admissions Oversight',
    anyPermissions: ['oversight.students.read'],
  },
  {
    pattern: '/academic-oversight',
    label: 'Academic & Curriculum Oversight',
    anyPermissions: ['oversight.academics.read'],
  },
  {
    pattern: '/examination-governance',
    label: 'Examinations & CBT Governance',
    anyPermissions: ['governance.examinations.read'],
  },
  {
    pattern: '/subscriptions/plans/new',
    label: 'Create Subscription Plan',
    anyPermissions: ['billing.subscriptions.manage'],
  },
  {
    pattern: '/subscriptions/plans/[planId]',
    label: 'Subscription Plan Detail',
    anyPermissions: ['billing.subscriptions.read', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/subscriptions/plans',
    label: 'Plan Catalogue',
    anyPermissions: ['billing.subscriptions.read', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/subscriptions/invoices',
    label: 'Invoices & Ledger',
    anyPermissions: ['billing.invoices.manage', 'billing.subscriptions.read'],
  },
  {
    pattern: '/subscriptions/payments',
    label: 'Payment Monitoring',
    anyPermissions: ['billing.payments.manage', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/subscriptions/renewals',
    label: 'Renewals & Trials',
    anyPermissions: ['billing.subscriptions.read', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/subscriptions/analytics',
    label: 'Monetization Analytics',
    anyPermissions: ['billing.subscriptions.manage', 'platform.overview.export'],
  },
  {
    pattern: '/subscriptions/discounts',
    label: 'Discount Policies',
    anyPermissions: ['billing.discounts.manage'],
  },
  {
    pattern: '/subscriptions/[subscriptionId]',
    label: 'Subscription Detail',
    anyPermissions: ['billing.subscriptions.read', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/subscriptions',
    label: 'Subscriptions Hub',
    anyPermissions: ['billing.subscriptions.read', 'billing.subscriptions.manage'],
  },
  {
    pattern: '/platform-users',
    label: 'Platform Users, Roles & Permissions',
    anyPermissions: ['iam.users.read', 'iam.roles.read', 'iam.permissions.view'],
  },
  {
    pattern: '/audit-logs',
    label: 'Audit Logs & Compliance',
    anyPermissions: ['audit.logs.read'],
  },
  {
    pattern: '/data-governance',
    label: 'Data Governance & Privacy Workflows',
    anyPermissions: ['audit.logs.read', 'system.maintenance.manage', 'platform.settings.update'],
  },
  {
    pattern: '/system-health',
    label: 'System Health & Operations',
    anyPermissions: ['system.operations.read'],
  },
  {
    pattern: '/communications',
    label: 'Communications & Delivery Governance',
    anyPermissions: ['system.maintenance.manage', 'platform.settings.update', 'organizations.update'],
  },
  {
    pattern: '/support',
    label: 'Support & Tenant Success Desk',
    anyPermissions: ['organizations.update', 'tenants.campuses.manage', 'platform.settings.update'],
  },
  {
    pattern: '/integrations',
    label: 'APIs, Webhooks & Integrations',
    requiredPermissions: ['system.operations.read', 'modules.registry.read'],
  },
  {
    pattern: '/features',
    label: 'Feature Availability & Entitlements',
    anyPermissions: ['modules.registry.read', 'modules.registry.manage', 'system.features.toggle'],
  },
  {
    pattern: '/settings',
    label: 'Platform Settings & Configuration',
    anyPermissions: ['platform.settings.read', 'platform.settings.update'],
  },
];

export function normalizePlatformPathname(rawPathname: string): string {
  const withoutQuery = rawPathname.split('?')[0]?.split('#')[0] || '/';
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || '/';
}

function scorePolicySpecificity(pattern: string): number {
  const segments = pattern.split('/').filter(Boolean);
  let score = segments.length * 100;
  for (const seg of segments) {
    if (seg === '**') score -= 50;
    else if (seg.startsWith('[') && seg.endsWith(']')) score += 5;
    else score += 20;
  }
  return score;
}

const SORTED_PLATFORM_ROUTE_POLICIES = [...PLATFORM_ROUTE_POLICIES].sort(
  (a, b) => scorePolicySpecificity(b.pattern) - scorePolicySpecificity(a.pattern)
);

export function matchPlatformRoutePattern(pattern: string, rawPathname: string): boolean {
  const pathname = normalizePlatformPathname(rawPathname);
  const normalizedPattern = normalizePlatformPathname(pattern);
  if (normalizedPattern === pathname) return true;

  const patSegs = normalizedPattern.split('/').filter(Boolean);
  const pathSegs = pathname.split('/').filter(Boolean);

  for (let i = 0; i < patSegs.length; i++) {
    const pSeg = patSegs[i];
    if (pSeg === '**') return i <= pathSegs.length;
    if (i >= pathSegs.length) return false;
    const uSeg = pathSegs[i];
    if (pSeg.startsWith('[') && pSeg.endsWith(']')) {
      if (!uSeg) return false;
      continue;
    }
    if (pSeg !== uSeg) return false;
  }

  return patSegs.length === pathSegs.length;
}

export function resolvePlatformRoutePolicy(rawPathname: string): PlatformRoutePolicy | null {
  const pathname = normalizePlatformPathname(rawPathname);
  for (const policy of SORTED_PLATFORM_ROUTE_POLICIES) {
    if (matchPlatformRoutePattern(policy.pattern, pathname)) {
      return policy;
    }
  }
  return null;
}

export function evaluatePlatformRouteAccess(
  context: PlatformAccessContext | undefined | null,
  rawPathname: string
): PlatformRouteAccessDecision {
  const pathname = normalizePlatformPathname(rawPathname);
  const effectivePermissions = resolveEffectivePlatformPermissions(context);

  if (!context?.user) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      message: 'Super Admin authentication is required to access this control plane.',
    };
  }

  const policy = resolvePlatformRoutePolicy(pathname);
  if (!policy) {
    return {
      allowed: false,
      reason: 'UNKNOWN_ROUTE',
      message: `Control plane route '${pathname}' has no registered authorization policy.`,
    };
  }

  if (policy.deniedRoles && hasAnyPlatformRole(context, policy.deniedRoles)) {
    return {
      allowed: false,
      reason: 'ROLE_NOT_PERMITTED',
      message: `Your platform role cannot access ${policy.label}.`,
      requiredPermission: policy.anyPermissions?.[0] || policy.requiredPermissions?.[0],
    };
  }

  if (policy.allowedRoles && policy.allowedRoles.length > 0 && !hasAnyPlatformRole(context, policy.allowedRoles)) {
    return {
      allowed: false,
      reason: 'ROLE_NOT_PERMITTED',
      message: `${policy.label} is restricted to specific platform roles.`,
      requiredPermission: policy.allowedRoles.join(', '),
    };
  }

  if (policy.requiredPermissions && policy.requiredPermissions.length > 0) {
    if (!hasAllPlatformPermissions(effectivePermissions, policy.requiredPermissions)) {
      return {
        allowed: false,
        reason: 'INSUFFICIENT_PERMISSION',
        message: `You lack the required permission(s) for ${policy.label}.`,
        requiredPermission: policy.requiredPermissions.join(', '),
      };
    }
  }

  if (policy.anyPermissions && policy.anyPermissions.length > 0) {
    if (!hasAnyPlatformPermission(effectivePermissions, policy.anyPermissions)) {
      return {
        allowed: false,
        reason: 'INSUFFICIENT_PERMISSION',
        message: `Your assigned platform role does not permit access to ${policy.label}.`,
        requiredPermission: policy.anyPermissions[0],
      };
    }
  }

  return { allowed: true };
}

export function canPerformPlatformAction(
  context: PlatformAccessContext | undefined | null,
  requiredPermission: string,
  options?: { anyPermissions?: string[] }
): boolean {
  const perms = resolveEffectivePlatformPermissions(context);
  if (perms.length === 0) return false;
  if (options?.anyPermissions && options.anyPermissions.length > 0) {
    return hasAnyPlatformPermission(perms, options.anyPermissions);
  }
  return hasPlatformPermission(perms, requiredPermission);
}

export function getAccessiblePlatformNavigation<
  TItem extends { href: string },
  TGroup extends { title: string; items: TItem[] }
>(
  context: PlatformAccessContext | undefined | null,
  groups: readonly TGroup[]
): Array<TGroup & { items: TItem[] }> {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => evaluatePlatformRouteAccess(context, item.href).allowed
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export function getSafePlatformHomeRoute(
  context: PlatformAccessContext | undefined | null
): string {
  const candidates = ['/', '/organizations', '/system-health', '/platform-users'];
  for (const href of candidates) {
    if (evaluatePlatformRouteAccess(context, href).allowed) {
      return href;
    }
  }
  return '/access-denied';
}

export function getRoleDefinitionById(roleId: string) {
  return INITIAL_PLATFORM_ROLES.find((r) => r.id === roleId);
}
