/**
 * Domain contracts for Platform Administrators and Roles.
 * NOTE: Platform users are SaaS super-administrators, operators, and auditors.
 * They are strictly separate from school-level tenant roles (Principals, Teachers, Students, Parents).
 */

export type PlatformRoleKey = 
  | 'super_admin' 
  | 'platform_operator' 
  | 'support_lead' 
  | 'compliance_auditor';

export type PlatformUserStatus = 'active' | 'suspended' | 'pending_invite';

export interface PlatformRoleDefinition {
  key: PlatformRoleKey;
  label: string;
  description: string;
  permissions: string[];
  isPrivileged: boolean;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRoleKey;
  status: PlatformUserStatus;
  avatarUrl?: string;
  department?: string;
  lastLoginAt?: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  notes?: string;
}

export interface CreatePlatformUserInput {
  name: string;
  email: string;
  role: PlatformRoleKey;
  department?: string;
  notes?: string;
}
