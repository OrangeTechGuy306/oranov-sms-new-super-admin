/**
 * Phase E-09.12: Identity and Access Management (IAM), Platform Roles,
 * Permissions Catalogue, and Administrative Access Governance Domain Contracts.
 *
 * NOTE: These types represent the Super-Admin / Platform-Owner access control plane.
 * They are strictly isolated from tenant-level school roles (Teachers, Students, Parents, etc.).
 * All access evaluations on the frontend are for visualization and administrative oversight;
 * cryptographic enforcement and session authorization must be implemented on the backend.
 */

import { PlatformRoleKey, PlatformUserStatus } from './platform-users';

export type PlatformPermissionAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'manage'
  | 'approve';

export type PlatformPermissionDomain =
  | 'platform.overview'
  | 'organizations'
  | 'tenants.lifecycle'
  | 'modules.registry'
  | 'oversight.students'
  | 'oversight.academics'
  | 'governance.examinations'
  | 'billing.monetization'
  | 'iam.users'
  | 'iam.roles'
  | 'audit.logs'
  | 'system.operations'
  | 'platform.settings';

export type PermissionRiskLevel = 'standard' | 'elevated' | 'privileged' | 'critical';

export interface PlatformPermission {
  id: string; // e.g. "iam.users.create", "billing.subscriptions.manage"
  label: string;
  domain: PlatformPermissionDomain;
  action: PlatformPermissionAction;
  description: string;
  riskLevel: PermissionRiskLevel;
  isPrivileged: boolean;
  isSystemManaged: boolean;
  status: 'implemented' | 'planned';
}

export type PlatformRoleCategory = 'system' | 'custom';

export interface PlatformRole {
  id: string;
  name: string;
  description: string;
  category: PlatformRoleCategory;
  isSystemManaged: boolean;
  isPrivileged: boolean;
  permissions: string[]; // Permission IDs
  assignmentCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EffectivePermissionsSummary {
  userId: string;
  userName: string;
  userEmail: string;
  assignedRoleIds: string[];
  assignedRoles: PlatformRole[];
  effectivePermissions: PlatformPermission[];
  privilegedPermissions: PlatformPermission[];
  inheritedFrom: Record<string, string[]>; // permissionId -> roleIds
  invalidRoleReferences: string[];
  invalidPermissionReferences: string[];
  totalPermissionCount: number;
  isSuperAdmin: boolean;
}

export interface IamGovernanceMetrics {
  totalPlatformUsers: number;
  activePlatformUsers: number;
  suspendedPlatformUsers: number;
  pendingInviteUsers: number;
  privilegedUsersCount: number;
  totalRolesCount: number;
  systemRolesCount: number;
  customRolesCount: number;
  totalPermissionsCount: number;
  privilegedPermissionsCount: number;
  unmappedAssignmentsCount: number;
}

export interface PlatformUserFilterState {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  departmentFilter: string;
}

export interface PlatformRoleFilterState {
  searchQuery: string;
  categoryFilter: 'all' | 'system' | 'custom';
  privilegeFilter: 'all' | 'privileged' | 'standard';
}

export interface PlatformPermissionFilterState {
  searchQuery: string;
  domainFilter: string;
  privilegeFilter: 'all' | 'privileged' | 'standard';
  actionFilter: string;
}

export interface CreateCustomRoleInput {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isPrivileged?: boolean;
}

export interface RoleAssignmentValidationResult {
  valid: boolean;
  error?: string;
  isPrivilegedChange?: boolean;
  requiresConfirmation?: boolean;
}
