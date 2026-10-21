import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEffectivePermissions,
  validateRoleAssignment,
  validateRoleDefinition,
  computeIamMetrics,
  filterPlatformUsers,
  filterPlatformRoles,
  filterPlatformPermissions,
} from '../lib/iam/evaluator';
import {
  INITIAL_PLATFORM_PERMISSIONS,
  INITIAL_PLATFORM_ROLES,
  ENHANCED_PLATFORM_USERS,
} from '../lib/iam/fixtures';
import { PlatformStore } from '../lib/data/platform-store';
import { PlatformUser, PlatformRoleKey } from '../lib/types/platform-users';
import { PlatformRole } from '../lib/types/iam';

describe('Phase E-09.12: IAM, Platform Roles, Permissions & Access Governance Engine', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  describe('1. Effective Permission Evaluation & Provenance', () => {
    test('resolves all permissions for root super_admin role', () => {
      const superUser = ENHANCED_PLATFORM_USERS.find((u) => u.id === 'usr_super_01')!;
      const summary = evaluateEffectivePermissions(superUser, INITIAL_PLATFORM_ROLES, INITIAL_PLATFORM_PERMISSIONS);

      assert.equal(summary.userId, 'usr_super_01');
      assert.equal(summary.isSuperAdmin, true);
      assert.equal(summary.totalPermissionCount, INITIAL_PLATFORM_PERMISSIONS.length);
      assert.equal(summary.invalidRoleReferences.length, 0);
      assert.equal(summary.invalidPermissionReferences.length, 0);
      assert.ok(summary.privilegedPermissions.length > 0);
    });

    test('deduplicates permissions granted across multiple assigned roles', () => {
      // User with support_lead and custom_operations_intern
      const multiRoleUser: PlatformUser = {
        id: 'usr_test_multi',
        name: 'Multi Role Tester',
        email: 'multi.role@saas-platform.internal',
        role: 'support_lead',
        assignedRoles: ['support_lead', 'custom_operations_intern'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        twoFactorEnabled: true,
      };

      const summary = evaluateEffectivePermissions(multiRoleUser, INITIAL_PLATFORM_ROLES, INITIAL_PLATFORM_PERMISSIONS);

      // Both roles have 'platform.overview.read' and 'organizations.read'
      assert.ok(summary.inheritedFrom['platform.overview.read']);
      assert.equal(summary.inheritedFrom['platform.overview.read'].length, 2);
      assert.ok(summary.inheritedFrom['platform.overview.read'].includes('support_lead'));
      assert.ok(summary.inheritedFrom['platform.overview.read'].includes('custom_operations_intern'));

      // Ensure effective permissions list contains no duplicate permission IDs
      const uniqueIds = new Set(summary.effectivePermissions.map((p) => p.id));
      assert.equal(uniqueIds.size, summary.effectivePermissions.length);
      assert.equal(summary.isSuperAdmin, false);
    });

    test('gracefully handles missing or unmapped role references', () => {
      const brokenUser: PlatformUser = {
        id: 'usr_broken',
        name: 'Broken Role User',
        email: 'broken@saas-platform.internal',
        role: 'unknown_role_key',
        assignedRoles: ['unknown_role_key', 'another_ghost_role'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        twoFactorEnabled: false,
      };

      const summary = evaluateEffectivePermissions(brokenUser, INITIAL_PLATFORM_ROLES, INITIAL_PLATFORM_PERMISSIONS);

      assert.equal(summary.effectivePermissions.length, 0);
      assert.equal(summary.invalidRoleReferences.length, 2);
      assert.ok(summary.invalidRoleReferences.includes('unknown_role_key'));
      assert.ok(summary.invalidRoleReferences.includes('another_ghost_role'));
    });

    test('gracefully flags unmapped permission identifiers in a role', () => {
      const mockRoleWithGhosts: PlatformRole = {
        id: 'ghost_perm_role',
        name: 'Ghost Role',
        description: 'Contains invalid permission IDs for negative testing.',
        category: 'custom',
        isSystemManaged: false,
        isPrivileged: false,
        permissions: ['platform.overview.read', 'nonexistent.permission.action', 'invalid.ghost.perm'],
        createdAt: '2026-01-01T00:00:00Z',
      };

      const testUser: PlatformUser = {
        id: 'usr_test_ghost',
        name: 'Ghost Tester',
        email: 'ghost@saas-platform.internal',
        role: 'ghost_perm_role',
        assignedRoles: ['ghost_perm_role'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        twoFactorEnabled: false,
      };

      const summary = evaluateEffectivePermissions(testUser, [mockRoleWithGhosts], INITIAL_PLATFORM_PERMISSIONS);

      assert.equal(summary.effectivePermissions.length, 1);
      assert.equal(summary.effectivePermissions[0].id, 'platform.overview.read');
      assert.equal(summary.invalidPermissionReferences.length, 2);
      assert.ok(summary.invalidPermissionReferences.includes('nonexistent.permission.action'));
      assert.ok(summary.invalidPermissionReferences.includes('invalid.ghost.perm'));
    });

    test('handles empty or undefined assigned roles safely', () => {
      const emptyUser: PlatformUser = {
        id: 'usr_empty',
        name: 'Empty Roles User',
        email: 'empty@saas-platform.internal',
        role: '' as unknown as PlatformRoleKey,
        assignedRoles: [],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        twoFactorEnabled: false,
      };

      const summary = evaluateEffectivePermissions(emptyUser, INITIAL_PLATFORM_ROLES, INITIAL_PLATFORM_PERMISSIONS);
      assert.equal(summary.totalPermissionCount, 0);
      assert.equal(summary.isSuperAdmin, false);
    });
  });

  describe('2. Invariant Rules & Privileged-Role Safeguards', () => {
    test('enforces continuity safeguard: rejects revoking root privileges from the sole active Super-Admin', () => {
      const alex = ENHANCED_PLATFORM_USERS.find((u) => u.id === 'usr_super_01')!;
      const validation = validateRoleAssignment(alex, 'super_admin', ENHANCED_PLATFORM_USERS, INITIAL_PLATFORM_ROLES, 'remove');

      assert.equal(validation.valid, false);
      assert.ok(validation.error?.includes('Platform Safeguard Violation'));
      assert.ok(validation.error?.includes('at least one active Super-Admin'));
    });

    test('permits revoking super_admin if another active Super-Admin exists', () => {
      const secondAdmin: PlatformUser = {
        id: 'usr_super_02',
        name: 'Second Super Admin',
        email: 'admin2@saas-platform.internal',
        role: 'super_admin',
        assignedRoles: ['super_admin'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        twoFactorEnabled: true,
      };

      const usersWithTwoAdmins = [...ENHANCED_PLATFORM_USERS, secondAdmin];
      const alex = usersWithTwoAdmins.find((u) => u.id === 'usr_super_01')!;
      const validation = validateRoleAssignment(alex, 'super_admin', usersWithTwoAdmins, INITIAL_PLATFORM_ROLES, 'remove');

      assert.equal(validation.valid, true);
      assert.equal(validation.isPrivilegedChange, true);
    });

    test('rejects duplicate role assignment to an administrator', () => {
      const sarah = ENHANCED_PLATFORM_USERS.find((u) => u.id === 'usr_ops_02')!;
      const validation = validateRoleAssignment(sarah, 'platform_operator', ENHANCED_PLATFORM_USERS, INITIAL_PLATFORM_ROLES, 'assign');

      assert.equal(validation.valid, false);
      assert.ok(validation.error?.includes('already holds the role'));
    });

    test('flags privileged role assignment as requiring explicit confirmation', () => {
      const marcus = ENHANCED_PLATFORM_USERS.find((u) => u.id === 'usr_support_03')!;
      const validation = validateRoleAssignment(marcus, 'super_admin', ENHANCED_PLATFORM_USERS, INITIAL_PLATFORM_ROLES, 'assign');

      assert.equal(validation.valid, true);
      assert.equal(validation.isPrivilegedChange, true);
      assert.equal(validation.requiresConfirmation, true);
    });

    test('rejects modifying permissions or deleting core system-managed roles', () => {
      const updateRes = store.updatePlatformRolePermissions('super_admin', ['platform.overview.read']);
      assert.equal(updateRes.success, false);
      assert.ok(updateRes.error?.includes('System Protection'));

      const deleteRes = store.deletePlatformRole('platform_operator');
      assert.equal(deleteRes.success, false);
      assert.ok(deleteRes.error?.includes('System Protection'));
    });

    test('store rejects suspending the last active Super-Admin', () => {
      const alex = store.getPlatformUsers().find((u) => u.id === 'usr_super_01')!;
      const res = store.updatePlatformUserStatus(alex.id, 'suspended');

      assert.equal(res.success, false);
      assert.ok(res.error?.includes('Platform Safeguard Violation'));
    });
  });

  describe('3. Role Authoring & Validation Rules', () => {
    test('validates role identifier formatting and rejects invalid characters or uppercase', () => {
      const invalidSlug = validateRoleDefinition(
        {
          id: 'INVALID-SLUG!',
          name: 'Invalid Slug Role',
          description: 'A role with invalid characters in identifier.',
          permissions: ['platform.overview.read'],
        },
        INITIAL_PLATFORM_ROLES
      );

      assert.equal(invalidSlug.valid, false);
      assert.ok(invalidSlug.errors.some((e) => e.includes('lowercase alphanumeric')));
    });

    test('rejects duplicate role identifier', () => {
      const duplicateRes = validateRoleDefinition(
        {
          id: 'support_lead',
          name: 'Duplicate Support Lead',
          description: 'Attempting to duplicate an existing role identifier.',
          permissions: ['platform.overview.read'],
        },
        INITIAL_PLATFORM_ROLES
      );

      assert.equal(duplicateRes.valid, false);
      assert.ok(duplicateRes.errors.some((e) => e.includes('already exists')));
    });

    test('rejects role creation with missing permissions', () => {
      const noPerms = validateRoleDefinition(
        {
          id: 'empty_perms_role',
          name: 'Empty Permissions',
          description: 'Has no permissions assigned.',
          permissions: [],
        },
        INITIAL_PLATFORM_ROLES
      );

      assert.equal(noPerms.valid, false);
      assert.ok(noPerms.errors.some((e) => e.includes('At least one platform permission')));
    });

    test('validates and creates custom platform role cleanly', () => {
      const res = store.createPlatformRole({
        id: 'regional_field_auditor',
        name: 'Regional Field Auditor',
        description: 'Audits multi-campus records and student oversight reporting across assigned territories.',
        permissions: ['organizations.read', 'oversight.students.read', 'audit.logs.read'],
      });

      assert.equal(res.success, true);
      assert.ok(res.role);
      assert.equal(res.role.category, 'custom');
      assert.equal(res.role.isSystemManaged, false);

      const fetched = store.getPlatformRoleById('regional_field_auditor');
      assert.ok(fetched);
      assert.equal(fetched.permissions.length, 3);
    });
  });

  describe('4. User-Role Assignment & Store Integration', () => {
    test('assigns multiple roles to platform administrator and logs audit event', () => {
      const user = store.getPlatformUsers().find((u) => u.id === 'usr_support_03')!;
      const assignRes = store.assignRoleToUser(user.id, 'custom_operations_intern');

      assert.equal(assignRes.success, true);

      const updatedUser = store.getPlatformUsers().find((u) => u.id === user.id)!;
      assert.ok(updatedUser.assignedRoles?.includes('custom_operations_intern'));
      assert.ok(updatedUser.assignedRoles?.includes('support_lead'));

      // Check audit event
      const recentAudit = store.getAuditEvents().find((e) => e.action === 'PLATFORM_ROLE_ASSIGNED_TO_USER');
      assert.ok(recentAudit);
      assert.equal(recentAudit.targetId, user.id);
    });

    test('removes role from user and updates provenance', () => {
      const tempUser = store.getPlatformUsers().find((u) => u.id === 'usr_temp_07')!;
      assert.ok(tempUser.assignedRoles?.includes('custom_operations_intern'));

      const removeRes = store.removeRoleFromUser(tempUser.id, 'custom_operations_intern');
      assert.equal(removeRes.success, true);

      const updated = store.getPlatformUsers().find((u) => u.id === tempUser.id)!;
      assert.equal(updated.assignedRoles?.includes('custom_operations_intern'), false);

      const recentAudit = store.getAuditEvents().find((e) => e.action === 'PLATFORM_ROLE_REMOVED_FROM_USER');
      assert.ok(recentAudit);
    });

    test('prevents deleting a custom role while administrators are assigned to it', () => {
      const deleteRes = store.deletePlatformRole('custom_operations_intern');
      assert.equal(deleteRes.success, false);
      assert.ok(deleteRes.error?.includes('currently assigned to'));
    });

    test('allows deleting a custom role once unassigned', () => {
      // Create new custom role with 0 assignments
      store.createPlatformRole({
        id: 'temporary_trainee',
        name: 'Temporary Trainee',
        description: 'Temporary training role with read only access to overview.',
        permissions: ['platform.overview.read'],
      });

      const deleteRes = store.deletePlatformRole('temporary_trainee');
      assert.equal(deleteRes.success, true);

      const check = store.getPlatformRoleById('temporary_trainee');
      assert.equal(check, undefined);
    });
  });

  describe('5. Governance Metrics & Query Filters', () => {
    test('computes accurate live governance metrics across users, roles, and permissions', () => {
      const metrics = computeIamMetrics(
        store.getPlatformUsers(),
        store.getPlatformRoles(),
        store.getPlatformPermissions()
      );

      assert.equal(metrics.totalPlatformUsers, store.getPlatformUsers().length);
      assert.ok(metrics.activePlatformUsers >= 4);
      assert.ok(metrics.privilegedUsersCount >= 2);
      assert.ok(metrics.totalRolesCount >= 6);
      assert.ok(metrics.customRolesCount >= 1);
      assert.equal(metrics.totalPermissionsCount, INITIAL_PLATFORM_PERMISSIONS.length);
      assert.equal(metrics.unmappedAssignmentsCount, 0);
    });

    test('filters users by search query across name and corporate email', () => {
      const filtered = filterPlatformUsers(store.getPlatformUsers(), {
        searchQuery: 'sterling',
        roleFilter: 'all',
        statusFilter: 'all',
        departmentFilter: 'all',
      });

      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'usr_super_01');
    });

    test('filters users by status and role', () => {
      const suspended = filterPlatformUsers(store.getPlatformUsers(), {
        searchQuery: '',
        roleFilter: 'all',
        statusFilter: 'suspended',
        departmentFilter: 'all',
      });

      assert.equal(suspended.length, 1);
      assert.equal(suspended[0].id, 'usr_temp_07');
    });

    test('filters permissions by domain and privilege classification', () => {
      const privilegedBilling = filterPlatformPermissions(INITIAL_PLATFORM_PERMISSIONS, {
        searchQuery: '',
        domainFilter: 'billing.monetization',
        privilegeFilter: 'privileged',
        actionFilter: 'all',
      });

      assert.ok(privilegedBilling.length >= 1);
      assert.ok(privilegedBilling.every((p) => p.isPrivileged && p.domain === 'billing.monetization'));
    });

    test('filters roles by category (system vs custom)', () => {
      const customRoles = filterPlatformRoles(store.getPlatformRoles(), {
        searchQuery: '',
        categoryFilter: 'custom',
        privilegeFilter: 'all',
      });

      assert.ok(customRoles.length >= 1);
      assert.ok(customRoles.every((r) => r.category === 'custom'));
    });
  });

  describe('6. Reset & Store Restoration', () => {
    test('resetToDefaults restores clean fixtures and clears custom modifications', () => {
      store.createPlatformRole({
        id: 'transient_role',
        name: 'Transient Test Role',
        description: 'Will be wiped out by resetToDefaults.',
        permissions: ['platform.overview.read'],
      });

      assert.ok(store.getPlatformRoleById('transient_role'));

      store.resetToDefaults();

      assert.equal(store.getPlatformRoleById('transient_role'), undefined);
      assert.equal(store.getPlatformRoles().length, INITIAL_PLATFORM_ROLES.length);
      assert.equal(store.getPlatformUsers().length, ENHANCED_PLATFORM_USERS.length);
    });
  });
});
