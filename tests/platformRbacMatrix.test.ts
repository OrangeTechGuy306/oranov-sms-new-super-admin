import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  INITIAL_PLATFORM_ROLES,
  INITIAL_PLATFORM_PERMISSIONS,
  ENHANCED_PLATFORM_USERS,
} from '@/lib/iam/fixtures';
import {
  hasPlatformPermission,
  hasAnyPlatformPermission,
  hasAllPlatformPermissions,
  hasPlatformRole,
  hasAnyPlatformRole,
  resolvePlatformRoutePolicy,
  evaluatePlatformRouteAccess,
  canPerformPlatformAction,
  getAccessiblePlatformNavigation,
  getSafePlatformHomeRoute,
  isKnownPlatformPermission,
} from '@/lib/iam/rbac';
import { isPlatformPublicAuthPath } from '@/lib/auth/platformAuthConfig';

function walkConsoleRoutes(dir: string, prefix = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  let out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out = out.concat(walkConsoleRoutes(p, `${prefix}/${ent.name}`));
    } else if (ent.name === 'page.tsx') {
      const route = prefix || '/';
      if (!isPlatformPublicAuthPath(route)) {
        out.push(route);
      }
    }
  }
  return out;
}

function actorForRole(roleId: string, overrides: Record<string, unknown> = {}) {
  const role = INITIAL_PLATFORM_ROLES.find((r) => r.id === roleId);
  assert.ok(role, `Missing platform role '${roleId}'`);
  return {
    user: {
      id: `test-${roleId}`,
      name: role.name,
      role: role.id,
      status: 'active',
      ...overrides,
    },
    primaryRole: role.id,
    permissions: [...role.permissions],
  };
}

describe('Platform (Super Admin) RBAC Engine, Route Matrix & Security Boundaries', () => {
  describe('1. Route Registry Completeness (All 28 Console Routes)', () => {
    it('covers every non-auth page route in app/ without leaving any route unprotected', () => {
      const routes = walkConsoleRoutes(path.join(process.cwd(), 'app'));
      assert.ok(routes.length >= 28, `Expected at least 28 console routes, saw ${routes.length}`);
      const unmatched = routes.filter((r) => !resolvePlatformRoutePolicy(r));
      assert.deepEqual(unmatched, [], `Unprotected platform routes: ${unmatched.join(', ')}`);
    });

    it('matches dynamic routes cleanly', () => {
      assert.equal(resolvePlatformRoutePolicy('/organizations/org_001')?.pattern, '/organizations/[organizationId]');
      assert.equal(
        resolvePlatformRoutePolicy('/organizations/org_001/subscription')?.pattern,
        '/organizations/[organizationId]/subscription'
      );
      assert.equal(resolvePlatformRoutePolicy('/subscriptions/sub_01')?.pattern, '/subscriptions/[subscriptionId]');
      assert.equal(resolvePlatformRoutePolicy('/subscriptions/plans/plan_pro')?.pattern, '/subscriptions/plans/[planId]');
    });
  });

  describe('2. Role-to-Route & Role-to-Action Matrix Across All 7 Platform Roles', () => {
    it('grants super_admin full access across all registered console routes', () => {
      const routes = walkConsoleRoutes(path.join(process.cwd(), 'app'));
      const superAdmin = actorForRole('super_admin');
      for (const route of routes) {
        assert.equal(
          evaluatePlatformRouteAccess(superAdmin, route).allowed,
          true,
          `super_admin must access ${route}`
        );
      }
      assert.equal(INITIAL_PLATFORM_PERMISSIONS.length, 50);
      assert.equal(superAdmin.permissions.length, 50);
      assert.equal(canPerformPlatformAction(superAdmin, 'operations.approvals.manage'), true);
      assert.equal(canPerformPlatformAction(superAdmin, 'audit.governance.manage'), true);
    });

    it('enforces least-privilege separation for platform_operator, support_lead, and billing_admin', () => {
      const ops = actorForRole('platform_operator');
      assert.equal(evaluatePlatformRouteAccess(ops, '/organizations/new').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(ops, '/system-health').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(ops, '/features').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(ops, '/platform-users').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(ops, '/subscriptions/discounts').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(ops, '/subscriptions/payments').allowed, false);
      assert.equal(canPerformPlatformAction(ops, 'iam.users.create'), false);

      const support = actorForRole('support_lead');
      assert.equal(evaluatePlatformRouteAccess(support, '/support').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(support, '/organizations').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(support, '/subscriptions/invoices').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(support, '/platform-users').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(support, '/subscriptions/payments').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(support, '/subscriptions/discounts').allowed, false);
      assert.equal(canPerformPlatformAction(support, 'organizations.lifecycle.manage'), false);

      const billing = actorForRole('billing_admin');
      assert.equal(evaluatePlatformRouteAccess(billing, '/subscriptions').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(billing, '/subscriptions/payments').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(billing, '/subscriptions/discounts').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(billing, '/organizations').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(billing, '/organizations/new').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(billing, '/platform-users').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(billing, '/student-oversight').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(billing, '/examination-governance').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(billing, '/system-health').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(billing, '/integrations').allowed, false);
    });

    it('enforces read-only governance on compliance_auditor, readonly_auditor, and custom_operations_intern', () => {
      const compliance = actorForRole('compliance_auditor');
      assert.equal(evaluatePlatformRouteAccess(compliance, '/platform-users').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(compliance, '/audit-logs').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(compliance, '/data-governance').allowed, true);
      assert.equal(canPerformPlatformAction(compliance, 'iam.users.create'), false);
      assert.equal(canPerformPlatformAction(compliance, 'iam.roles.manage'), false);
      assert.equal(canPerformPlatformAction(compliance, 'iam.users.roles.assign'), false);
      assert.equal(canPerformPlatformAction(compliance, 'platform.settings.update'), false);
      assert.equal(canPerformPlatformAction(compliance, 'audit.governance.manage'), false);
      assert.equal(canPerformPlatformAction(compliance, 'operations.approvals.manage'), false);
      assert.equal(canPerformPlatformAction(compliance, 'operations.approvals.read'), true);
      assert.equal(canPerformPlatformAction(compliance, 'operations.exceptions.read'), true);

      const readonly = actorForRole('readonly_auditor');
      assert.equal(evaluatePlatformRouteAccess(readonly, '/').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(readonly, '/student-oversight').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(readonly, '/platform-users').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(readonly, '/audit-logs').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(readonly, '/organizations/new').allowed, false);

      const intern = actorForRole('custom_operations_intern');
      assert.equal(evaluatePlatformRouteAccess(intern, '/').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(intern, '/organizations').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(intern, '/student-oversight').allowed, true);
      assert.equal(evaluatePlatformRouteAccess(intern, '/system-health').allowed, true);
      for (const blocked of [
        '/platform-users',
        '/subscriptions',
        '/subscriptions/invoices',
        '/settings',
        '/features',
        '/analytics',
        '/audit-logs',
        '/data-governance',
        '/support',
        '/approvals',
        '/exceptions',
        '/communications',
        '/integrations',
      ]) {
        assert.equal(evaluatePlatformRouteAccess(intern, blocked).allowed, false, `intern denied ${blocked}`);
      }
    });
  });

  describe('3. Navigation Filtering & Negative Fail-Closed Checks', () => {
    it('filters sidebar groups cleanly and removes empty groups for constrained roles', () => {
      const navGroups = [
        {
          title: 'Core',
          items: [
            { href: '/', label: 'Overview' },
            { href: '/organizations', label: 'Organizations' },
            { href: '/student-oversight', label: 'Student Oversight' },
          ],
        },
        {
          title: 'Billing',
          items: [
            { href: '/subscriptions', label: 'Hub' },
            { href: '/subscriptions/discounts', label: 'Discounts' },
          ],
        },
        {
          title: 'Governance',
          items: [
            { href: '/platform-users', label: 'Users & Roles' },
            { href: '/audit-logs', label: 'Audit Logs' },
          ],
        },
      ];

      const internNav = getAccessiblePlatformNavigation(actorForRole('custom_operations_intern'), navGroups);
      assert.equal(internNav.length, 1);
      assert.equal(internNav[0].title, 'Core');
      assert.deepEqual(internNav[0].items.map((i) => i.href), ['/', '/organizations', '/student-oversight']);

      const billingNav = getAccessiblePlatformNavigation(actorForRole('billing_admin'), navGroups);
      assert.equal(billingNav.length, 3);
      assert.deepEqual(billingNav[2].items.map((i) => i.href), ['/audit-logs']);
    });

    it('fails closed on missing users, suspended accounts, empty/unknown permissions, and unknown routes', () => {
      assert.equal(isKnownPlatformPermission('*'), false);
      assert.equal(isKnownPlatformPermission('tenant.students.view'), false);
      assert.equal(hasPlatformPermission([], 'platform.overview.read'), false);
      assert.equal(hasPlatformPermission(null, 'platform.overview.read'), false);
      assert.equal(hasPlatformPermission(['*'], 'platform.overview.read'), false);
      assert.equal(hasAnyPlatformPermission(['platform.overview.read'], []), false);
      assert.equal(hasAllPlatformPermissions(['platform.overview.read'], []), false);
      assert.equal(hasPlatformRole(null, 'super_admin'), false);
      assert.equal(hasAnyPlatformRole(actorForRole('billing_admin'), ['super_admin']), false);

      assert.equal(evaluatePlatformRouteAccess(null, '/').allowed, false);
      assert.equal(evaluatePlatformRouteAccess(actorForRole('super_admin'), '/secret-backdoor').reason, 'UNKNOWN_ROUTE');

      const suspendedAdmin = actorForRole('super_admin', { status: 'suspended' });
      assert.equal(evaluatePlatformRouteAccess(suspendedAdmin, '/').allowed, false);
      assert.equal(canPerformPlatformAction(suspendedAdmin, 'iam.users.create'), false);
      assert.equal(getSafePlatformHomeRoute(null), '/access-denied');

      // Existing platform demo fixtures never carry tenant wildcard strings
      for (const usr of ENHANCED_PLATFORM_USERS) {
        assert.ok(!usr.assignedRoles?.includes('super_admin') || usr.role === 'super_admin');
      }
    });
  });
});
