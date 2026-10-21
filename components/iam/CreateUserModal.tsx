'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { PlatformRoleKey, PlatformUser } from '@/lib/types/platform-users';
import { PlatformRole } from '@/lib/types/iam';
import { ShieldCheck, Mail, Building, User, FileText } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRoles: PlatformRole[];
  onCreateUser: (input: {
    name: string;
    email: string;
    role: PlatformRoleKey;
    assignedRoles?: string[];
    department?: string;
    notes?: string;
  }) => { success: boolean; user?: PlatformUser; error?: string };
}

export function CreateUserModal({
  isOpen,
  onClose,
  allRoles,
  onCreateUser,
}: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PlatformRoleKey>('support_lead');
  const [department, setDepartment] = useState('Platform Operations');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = onCreateUser({
      name,
      email,
      role,
      assignedRoles: [role],
      department,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      setName('');
      setEmail('');
      setRole('support_lead');
      setDepartment('Platform Operations');
      setNotes('');
      onClose();
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Platform Administrator"
      description="Add an administrator identity to the platform operations roster. (Simulated demonstration record only)"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && <AlertBanner variant="error">{error}</AlertBanner>}

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan Vance"
            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Corporate Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jordan.v@saas-platform.internal"
            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
          <span className="text-[10px] text-muted-foreground block">
            Synthetic fixture email. No actual email messages will be dispatched.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            Initial Platform Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRoleKey)}
            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          >
            {allRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.permissions.length} perms ({r.category === 'system' ? 'System' : 'Custom'})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-muted-foreground" />
            Department / Operations Unit
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Cloud Operations & Support"
            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            Administrative Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Operational justification or scope of assignment..."
            rows={2}
            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground flex gap-2 border border-border/70">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Simulated Invitation Flow:</strong> Submitting this record updates local state and emits an administrative audit event. Live hardware token WebAuthn enrollment or IdP directory synchronization will occur in future backend integration.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            Create Administrator
          </button>
        </div>
      </form>
    </Modal>
  );
}
