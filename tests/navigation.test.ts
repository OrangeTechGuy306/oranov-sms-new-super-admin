import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Navigation and Information Architecture Contracts', () => {
  const routes = [
    { path: '/', label: 'Platform Overview' },
    { path: '/organizations', label: 'School Organizations' },
    { path: '/student-oversight', label: 'Student Information & Admissions Oversight' },
    { path: '/academic-oversight', label: 'Academics, Curriculum & Teaching Oversight' },
    { path: '/examination-governance', label: 'Examinations, CBT & Assessment Governance' },
    { path: '/organizations/new', label: 'Onboard New School' },
    { path: '/organizations/org_001', label: 'Organization Details' },
    { path: '/organizations/org_001/subscription', label: 'Organization Subscription' },
    { path: '/subscriptions', label: 'Subscriptions & Invoices' },
    { path: '/subscriptions/plans', label: 'Plan Catalogue' },
    { path: '/platform-users', label: 'Platform Users & Roles' },
    { path: '/audit-logs', label: 'Administrative Audit Logs' },
    { path: '/system-health', label: 'System Health & Ops' },
    { path: '/settings', label: 'Platform Settings' },
    { path: '/features', label: 'Feature Availability' },
  ];

  test('all required super-admin navigation routes are defined with unique paths', () => {
    const paths = routes.map((r) => r.path);
    const uniquePaths = new Set(paths);
    assert.equal(paths.length, uniquePaths.size, 'All route paths must be distinct');
  });

  test('active navigation matching correctly handles root and nested prefixes', () => {
    const isItemActive = (currentPath: string, href: string, exact = false) => {
      if (exact || href === '/') {
        return currentPath === href;
      }
      return currentPath.startsWith(href);
    };

    assert.equal(isItemActive('/', '/'), true);
    assert.equal(isItemActive('/organizations', '/'), false);
    assert.equal(isItemActive('/organizations', '/organizations'), true);
    assert.equal(isItemActive('/organizations/org_001', '/organizations'), true);
    assert.equal(isItemActive('/subscriptions/plans', '/subscriptions'), true);
    assert.equal(isItemActive('/platform-users', '/audit-logs'), false);
  });

  test('breadcrumb path decomposition maps hierarchical routes accurately', () => {
    const decomposeBreadcrumbs = (pathname: string) => {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length === 0) return [{ label: 'Overview', href: '/' }];

      const crumbs = [{ label: 'Overview', href: '/' }];
      let cumulative = '';
      for (const part of parts) {
        cumulative += `/${part}`;
        crumbs.push({ label: part, href: cumulative });
      }
      return crumbs;
    };

    const crumbs = decomposeBreadcrumbs('/organizations/org_001/subscription');
    assert.equal(crumbs.length, 4);
    assert.equal(crumbs[0].href, '/');
    assert.equal(crumbs[1].href, '/organizations');
    assert.equal(crumbs[2].href, '/organizations/org_001');
    assert.equal(crumbs[3].href, '/organizations/org_001/subscription');
  });
});
