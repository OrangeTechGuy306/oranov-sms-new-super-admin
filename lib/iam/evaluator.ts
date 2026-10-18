/**
 * Phase E-09.12: Pure Evaluation & Safeguards Engine for Platform IAM Governance
 *
 * NOTE: This evaluator is a pure client-side utility for visualization,
 * administrative inspection, and demonstration-state validation.
 * It is NOT a substitute for server-side authorization boundaries.
 */

import {
  PlatformPermission,
  PlatformRole,
  EffectivePermissionsSummary,
  IamGovernanceMetrics,
  PlatformUserFilterState,
  PlatformRoleFilterState,
  PlatformPermissionFilterState,
  RoleAssignmentValidationResult,
} from '@/lib/types/iam';
import { PlatformUser } from '@/lib/types/platform-users';

/**
 * Evaluates effective platform permissions for an administrator account.
 * Aggregates all permissions inherited across assigned roles, deduplicates them,
 * tracks provenance (which role granted what), identifies privileged entitlements,
 * and surfaces invalid/missing references.
 */
export function evaluateEffectivePermissions(
  user: PlatformUser,
  allRoles: PlatformRole[],
  allPermissions: PlatformPermission[]
): EffectivePermissionsSummary {
  const assignedRoleIds = Array.isArray(user.assignedRoles) && user.assignedRoles.length > 0
    ? user.assignedRoles
    : (user.role ? [user.role] : []);

  const assignedRoles: PlatformRole[] = [];
  const invalidRoleReferences: string[] = [];

  for (const rId of assignedRoleIds) {
    const role = allRoles.find((r) => r.id === rId);
    if (role) {
      assignedRoles.push(role);
    } else {
      invalidRoleReferences.push(rId);
    }
  }

  const permissionMap = new Map<string, PlatformPermission>();
  allPermissions.forEach((p) => permissionMap.set(p.id, p));

  const inheritedFrom: Record<string, string[]> = {};
  const effectivePermissionIds = new Set<string>();
  const invalidPermissionReferences: string[] = [];

  for (const role of assignedRoles) {
    for (const permId of role.permissions) {
      if (!permissionMap.has(permId)) {
        if (!invalidPermissionReferences.includes(permId)) {
          invalidPermissionReferences.push(permId);
        }
      } else {
        effectivePermissionIds.add(permId);
        if (!inheritedFrom[permId]) {
          inheritedFrom[permId] = [];
        }
        if (!inheritedFrom[permId].includes(role.id)) {
          inheritedFrom[permId].push(role.id);
        }
      }
    }
  }

  const effectivePermissions: PlatformPermission[] = [];
  const privilegedPermissions: PlatformPermission[] = [];

  for (const pId of effectivePermissionIds) {
    const perm = permissionMap.get(pId);
    if (perm) {
      effectivePermissions.push(perm);
      if (perm.isPrivileged) {
        privilegedPermissions.push(perm);
      }
    }
  }

  // Sort permissions by domain then action
  effectivePermissions.sort((a, b) => a.domain.localeCompare(b.domain) || a.action.localeCompare(b.action));
  privilegedPermissions.sort((a, b) => a.domain.localeCompare(b.domain) || a.action.localeCompare(b.action));

  const isSuperAdmin = assignedRoles.some((r) => r.id === 'super_admin');

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    assignedRoleIds,
    assignedRoles,
    effectivePermissions,
    privilegedPermissions,
    inheritedFrom,
    invalidRoleReferences,
    invalidPermissionReferences,
    totalPermissionCount: effectivePermissions.length,
    isSuperAdmin,
  };
}

/**
 * Validates role assignment or revocation on an administrator account.
 * Enforces business continuity invariant: The platform must retain at least one active Super-Admin.
 */
export function validateRoleAssignment(
  user: PlatformUser,
  targetRoleId: string,
  allUsers: PlatformUser[],
  allRoles: PlatformRole[],
  action: 'assign' | 'remove'
): RoleAssignmentValidationResult {
  if (!user) {
    return { valid: false, error: 'Target user does not exist in platform directory.' };
  }

  const role = allRoles.find((r) => r.id === targetRoleId);
  if (!role) {
    return { valid: false, error: `Platform role "${targetRoleId}" does not exist in role catalogue.` };
  }

  const currentRoleIds = Array.isArray(user.assignedRoles) && user.assignedRoles.length > 0
    ? user.assignedRoles
    : (user.role ? [user.role] : []);

  if (action === 'assign') {
    if (currentRoleIds.includes(targetRoleId)) {
      return { valid: false, error: `User already holds the role "${role.name}".` };
    }

    return {
      valid: true,
      isPrivilegedChange: role.isPrivileged,
      requiresConfirmation: role.isPrivileged,
    };
  }

  // Action is 'remove'
  if (!currentRoleIds.includes(targetRoleId)) {
    return { valid: false, error: `User does not currently hold the role "${role.name}".` };
  }

  // Check Invariant: Minimum 1 active Super-Admin
  if (targetRoleId === 'super_admin') {
    const activeSuperAdmins = allUsers.filter((u) => {
      const uRoles = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0
        ? u.assignedRoles
        : (u.role ? [u.role] : []);
      return u.status === 'active' && uRoles.includes('super_admin');
    });

    if (activeSuperAdmins.length <= 1 && activeSuperAdmins.some((u) => u.id === user.id)) {
      return {
        valid: false,
        error: `Platform Safeguard Violation: Cannot revoke root privileges from ${user.name}. The platform requires at least one active Super-Admin for administrative continuity.`,
      };
    }
  }

  return {
    valid: true,
    isPrivilegedChange: role.isPrivileged,
    requiresConfirmation: role.isPrivileged,
  };
}

/**
 * Validates role creation or editing.
 * Reusable rule checks slug, name, description, and permission references.
 */
export function validateRoleDefinition(
  input: Partial<PlatformRole>,
  existingRoles: PlatformRole[],
  isEditing = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.id || input.id.trim().length < 3) {
    errors.push('Role identifier must be at least 3 characters long.');
  } else {
    const slugRegex = /^[a-z0-9_]+$/;
    if (!slugRegex.test(input.id.trim())) {
      errors.push('Role identifier must contain only lowercase alphanumeric characters and underscores.');
    }
  }

  if (!isEditing && input.id) {
    const existing = existingRoles.find((r) => r.id.toLowerCase() === input.id!.trim().toLowerCase());
    if (existing) {
      errors.push(`A role with identifier "${input.id}" already exists.`);
    }
  }

  if (!input.name || input.name.trim().length < 3) {
    errors.push('Role name must be at least 3 characters long.');
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.push('Role description must be at least 10 characters long.');
  }

  if (!Array.isArray(input.permissions) || input.permissions.length === 0) {
    errors.push('At least one platform permission must be assigned to the role.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Computes live, accurate summary metrics across platform administrators, roles, and permissions.
 */
export function computeIamMetrics(
  users: PlatformUser[],
  roles: PlatformRole[],
  permissions: PlatformPermission[]
): IamGovernanceMetrics {
  const totalPlatformUsers = users.length;
  const activePlatformUsers = users.filter((u) => u.status === 'active').length;
  const suspendedPlatformUsers = users.filter((u) => u.status === 'suspended' || u.status === 'deactivated').length;
  const pendingInviteUsers = users.filter((u) => u.status === 'pending_invite').length;

  const privilegedRoleIds = new Set(roles.filter((r) => r.isPrivileged).map((r) => r.id));

  const privilegedUsersCount = users.filter((u) => {
    const roleIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0
      ? u.assignedRoles
      : (u.role ? [u.role] : []);
    return roleIds.some((rId) => privilegedRoleIds.has(rId));
  }).length;

  const totalRolesCount = roles.length;
  const systemRolesCount = roles.filter((r) => r.category === 'system').length;
  const customRolesCount = roles.filter((r) => r.category === 'custom').length;

  const totalPermissionsCount = permissions.length;
  const privilegedPermissionsCount = permissions.filter((p) => p.isPrivileged).length;

  // Check for any unmapped or missing assignments
  const allRoleIds = new Set(roles.map((r) => r.id));
  const allPermissionIds = new Set(permissions.map((p) => p.id));
  let unmappedAssignmentsCount = 0;

  for (const u of users) {
    const roleIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0
      ? u.assignedRoles
      : (u.role ? [u.role] : []);
    for (const rId of roleIds) {
      if (!allRoleIds.has(rId)) {
        unmappedAssignmentsCount++;
      }
    }
  }

  for (const r of roles) {
    for (const pId of r.permissions) {
      if (!allPermissionIds.has(pId)) {
        unmappedAssignmentsCount++;
      }
    }
  }

  return {
    totalPlatformUsers,
    activePlatformUsers,
    suspendedPlatformUsers,
    pendingInviteUsers,
    privilegedUsersCount,
    totalRolesCount,
    systemRolesCount,
    customRolesCount,
    totalPermissionsCount,
    privilegedPermissionsCount,
    unmappedAssignmentsCount,
  };
}

/**
 * Filter platform users directory by search query, role, and account status.
 */
export function filterPlatformUsers(
  users: PlatformUser[],
  filter: PlatformUserFilterState
): PlatformUser[] {
  return users.filter((user) => {
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchId = user.id.toLowerCase().includes(q);
      const matchDept = user.department ? user.department.toLowerCase().includes(q) : false;
      if (!matchName && !matchEmail && !matchId && !matchDept) return false;
    }

    if (filter.roleFilter !== 'all') {
      const roleIds = Array.isArray(user.assignedRoles) && user.assignedRoles.length > 0
        ? user.assignedRoles
        : (user.role ? [user.role] : []);
      if (!roleIds.includes(filter.roleFilter)) return false;
    }

    if (filter.statusFilter !== 'all' && user.status !== filter.statusFilter) {
      return false;
    }

    if (filter.departmentFilter !== 'all') {
      if (!user.department || user.department !== filter.departmentFilter) return false;
    }

    return true;
  });
}

/**
 * Filter platform roles directory by query, category, and privilege level.
 */
export function filterPlatformRoles(
  roles: PlatformRole[],
  filter: PlatformRoleFilterState
): PlatformRole[] {
  return roles.filter((role) => {
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchName = role.name.toLowerCase().includes(q);
      const matchId = role.id.toLowerCase().includes(q);
      const matchDesc = role.description.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDesc) return false;
    }

    if (filter.categoryFilter !== 'all' && role.category !== filter.categoryFilter) {
      return false;
    }

    if (filter.privilegeFilter === 'privileged' && !role.isPrivileged) return false;
    if (filter.privilegeFilter === 'standard' && role.isPrivileged) return false;

    return true;
  });
}

/**
 * Filter platform permissions catalogue by query, domain, action, and privilege classification.
 */
export function filterPlatformPermissions(
  permissions: PlatformPermission[],
  filter: PlatformPermissionFilterState
): PlatformPermission[] {
  return permissions.filter((perm) => {
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchLabel = perm.label.toLowerCase().includes(q);
      const matchId = perm.id.toLowerCase().includes(q);
      const matchDesc = perm.description.toLowerCase().includes(q);
      if (!matchLabel && !matchId && !matchDesc) return false;
    }

    if (filter.domainFilter !== 'all' && perm.domain !== filter.domainFilter) {
      return false;
    }

    if (filter.actionFilter !== 'all' && perm.action !== filter.actionFilter) {
      return false;
    }

    if (filter.privilegeFilter === 'privileged' && !perm.isPrivileged) return false;
    if (filter.privilegeFilter === 'standard' && perm.isPrivileged) return false;

    return true;
  });
}
