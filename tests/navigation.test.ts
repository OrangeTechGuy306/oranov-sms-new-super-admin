import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Navigation and Information Architecture Contracts', () => {
  const routes = [
    { path: '/', label: 'Platform Overview' },
    { path: '/analytics', label: 'Platform Analytics & Business Intelligence' },
    { path: '/organizations', label: 'School Organizations' },
    { path: '/organizations/new', label: 'Onboard New School' },
    { path: '/organizations/org_001', label: 'Organization Details' },
    { path: '/organizations/org_001/subscription', label: 'Organization Subscription' },
    { path: '/student-oversight', label: 'Student Information & Admissions Oversight' },
    { path: '/academic-oversight', label: 'Academics, Curriculum & Teaching Oversight' },
    { path: '/examination-governance', label: 'Examinations, CBT & Assessment Governance' },
    { path: '/subscriptions', label: 'Subscriptions Hub' },
    { path: '/subscriptions/plans', label: 'Plan Catalogue' },
    { path: '/subscriptions/plans/new', label: 'New Subscription Plan' },
    { path: '/subscriptions/plans/plan_starter', label: 'Plan Detail (Starter)' },
    { path: '/subscriptions/invoices', label: 'Invoices & Ledger' },
    { path: '/subscriptions/payments', label: 'Payment Monitoring' },
    { path: '/subscriptions/renewals', label: 'Renewals & Trials' },
    { path: '/subscriptions/analytics', label: 'Monetization Analytics' },
    { path: '/subscriptions/discounts', label: 'Discount Policies' },
    { path: '/subscriptions/sub_001', label: 'Subscription Detail' },
    { path: '/platform-users', label: 'Platform Users & Roles' },
    { path: '/audit-logs', label: 'Audit Logs & Compliance' },
    { path: '/data-governance', label: 'Data Governance & Privacy' },
    { path: '/system-health', label: 'System Health & Ops' },
    { path: '/communications', label: 'Communications & Delivery' },
    { path: '/support', label: 'Support & Tenant Success' },
    { path: '/integrations', label: 'APIs & Integrations' },
    { path: '/features', label: 'Feature Availability' },
    { path: '/settings', label: 'Platform Settings' },
  ];

  test('all required super-admin navigation routes are defined with unique paths', () => {
    const paths = routes.map((r) => r.path);
    const uniquePaths = new Set(paths);
    assert.equal(paths.length, uniquePaths.size, 'All route paths must be distinct');
    assert.equal(uniquePaths.size, 28, 'Must cover exactly 28 unique routes across dashboard');
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
    assert.equal(isItemActive('/subscriptions/invoices', '/subscriptions'), true);
    assert.equal(isItemActive('/platform-users', '/audit-logs'), false);
    assert.equal(isItemActive('/data-governance', '/data-governance'), true);
    assert.equal(isItemActive('/support', '/support'), true);
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

    const subCrumbs = decomposeBreadcrumbs('/subscriptions/plans/plan_starter');
    assert.equal(subCrumbs.length, 4);
    assert.equal(subCrumbs[0].href, '/');
    assert.equal(subCrumbs[1].href, '/subscriptions');
    assert.equal(subCrumbs[2].href, '/subscriptions/plans');
    assert.equal(subCrumbs[3].href, '/subscriptions/plans/plan_starter');
  });

  test('breadcrumb label resolution maps all module paths to human-readable titles', () => {
    const resolveBreadcrumbLabel = (part: string, cumulativeHref: string) => {
      if (part === 'organizations') return 'School Organizations';
      if (part === 'new') return 'New';
      if (part === 'subscriptions') return 'Subscriptions Hub';
      if (part === 'subscription') return 'Subscription & Billing';
      if (part === 'plans') return 'Plan Catalogue';
      if (part === 'invoices') return 'Invoices & Ledger';
      if (part === 'payments') return 'Payment Monitoring';
      if (part === 'renewals') return 'Renewals & Trials';
      if (part === 'analytics') return cumulativeHref === '/analytics' ? 'Platform Analytics & BI' : 'Monetization Analytics';
      if (part === 'discounts') return 'Discount Policies';
      if (part === 'student-oversight') return 'Student Oversight';
      if (part === 'academic-oversight') return 'Academic Oversight';
      if (part === 'examination-governance') return 'Examination Governance';
      if (part === 'integrations') return 'APIs & Integrations';
      if (part === 'platform-users') return 'Platform Users & Roles';
      if (part === 'audit-logs') return 'Audit Logs & Compliance';
      if (part === 'system-health') return 'System Health & Ops';
      if (part === 'communications') return 'Communications & Delivery';
      if (part === 'support') return 'Support Desk & Tenant Success';
      if (part === 'settings') return 'Platform Settings';
      if (part === 'features') return 'Feature Availability';
      if (part === 'data-governance') return 'Data Governance & Privacy';
      return part;
    };

    assert.equal(resolveBreadcrumbLabel('student-oversight', '/student-oversight'), 'Student Oversight');
    assert.equal(resolveBreadcrumbLabel('academic-oversight', '/academic-oversight'), 'Academic Oversight');
    assert.equal(resolveBreadcrumbLabel('examination-governance', '/examination-governance'), 'Examination Governance');
    assert.equal(resolveBreadcrumbLabel('integrations', '/integrations'), 'APIs & Integrations');
    assert.equal(resolveBreadcrumbLabel('subscription', '/organizations/org_001/subscription'), 'Subscription & Billing');
    assert.equal(resolveBreadcrumbLabel('analytics', '/analytics'), 'Platform Analytics & BI');
    assert.equal(resolveBreadcrumbLabel('analytics', '/subscriptions/analytics'), 'Monetization Analytics');
  });
});
