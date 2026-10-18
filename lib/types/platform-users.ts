/**
 * Domain contracts for Platform Administrators and Roles.
 * NOTE: Platform users are SaaS super-administrators, operators, and auditors.
 * They are strictly separate from school-level tenant roles (Principals, Teachers, Students, Parents).
 */

export type PlatformRoleKey = 
  | 'super_admin' 
  | 'platform_operator' 
  | 'support_lead' 
  | 'compliance_auditor'
  | 'billing_admin'
  | 'readonly_auditor'
  | (string & {});

export type PlatformUserStatus = 'active' | 'suspended' | 'pending_invite' | 'deactivated';

export interface PlatformRoleDefinition {
  key: PlatformRoleKey;
  label: string;
  description: string;
  permissions: string[];
  isPrivileged: boolean;
  category?: 'system' | 'custom';
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRoleKey; // Primary role identifier (backward compatible)
  assignedRoles?: string[]; // Array of assigned role IDs (multi-role capability)
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
  assignedRoles?: string[];
  department?: string;
  notes?: string;
}
