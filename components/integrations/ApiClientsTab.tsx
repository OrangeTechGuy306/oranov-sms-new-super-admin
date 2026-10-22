'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ApiClientRecord } from '@/lib/types/integrations';
import { filterApiClients } from '@/lib/integrations/evaluator';
import { formatDate } from '@/lib/utils/formatters';
import {
  KeyRound,
  Search,
  Plus,
  Lock,
  ShieldAlert,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';

interface ApiClientsTabProps {
  apiClients: ApiClientRecord[];
  onOpenCreate: () => void;
  onOpenCredentials: (client: ApiClientRecord) => void;
  onRevokeClient: (id: string, reason: string) => void;
}

export function ApiClientsTab({
  apiClients,
  onOpenCreate,
  onOpenCredentials,
  onRevokeClient,
}: ApiClientsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Revocation state
  const [revokingClient, setRevokingClient] = useState<ApiClientRecord | null>(null);
  const [revocationReason, setRevocationReason] = useState('Administrative credential rotation requested.');

  const filtered = useMemo(() => {
    return filterApiClients(apiClients, searchQuery, typeFilter, statusFilter);
  }, [apiClients, searchQuery, typeFilter, statusFilter]);

  const clientTypeLabels: Record<string, string> = {
    first_party_console: 'First-Party Console',
    tenant_backend: 'Tenant Dedicated',
    partner_sis: 'Partner SIS / LMS',
    bi_analytics: 'BI Pipeline',
    automation_worker: 'Cron Worker',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'disabled':
        return <Badge variant="warning">Disabled</Badge>;
      case 'revoked':
        return <Badge variant="error">Revoked</Badge>;
      case 'expired':
        return <Badge variant="neutral">Expired</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header & Registration bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="space-y-0.5">
          <h3 className="font-bold text-foreground text-sm">Platform API Client Registrations</h3>
          <p className="text-muted-foreground text-xs">
            Manage authenticated API application identities, assigned RBAC scopes, IP whitelists, and lifecycle revocation.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
        >
          <Plus className="h-4 w-4" />
          Register New API Client
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, identifier, or keyword..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Classifications</option>
            <option value="first_party_console">First-Party Console</option>
            <option value="tenant_backend">Tenant Dedicated</option>
            <option value="partner_sis">Partner SIS / LMS</option>
            <option value="bi_analytics">BI & Telemetry</option>
            <option value="automation_worker">Cron Workers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {apiClients.length} clients
        </div>
      </div>

      {/* API Clients Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Client Name & ID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Owner / Scope</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Assigned Scopes</th>
                <th className="py-2.5 px-4">Security Policies</th>
                <th className="py-2.5 px-4">Expires</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((client) => {
                const hasElevated = client.assignedScopes.some(
                  (s) => s.includes('write') || s.includes('manage') || s.includes('audit')
                );

                return (
                  <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">{client.name}</span>
                        <code className="font-mono text-[11px] text-muted-foreground">
                          {client.clientId}
                        </code>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] text-secondary-foreground font-medium">
                        {clientTypeLabels[client.clientType] || client.clientType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-foreground font-medium block">
                        {client.organizationName || 'Platform'}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        Last used: {client.lastUsedAt ? formatDate(client.lastUsedAt) : 'Never'}
                      </span>
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(client.status)}</td>

                    <td className="py-3 px-4">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {client.assignedScopes.length} scopes
                          </span>
                          {hasElevated && (
                            <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 text-[9px] font-bold">
                              Elevated
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {client.assignedScopes.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="rounded bg-muted px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground truncate max-w-[90px]"
                            >
                              {s}
                            </span>
                          ))}
                          {client.assignedScopes.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{client.assignedScopes.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="text-muted-foreground block">
                          Limit: <strong className="text-foreground">{client.rateLimitRps} RPS</strong>
                        </span>
                        <span className="text-muted-foreground block truncate max-w-[120px]">
                          IPs:{' '}
                          {client.ipWhitelist && client.ipWhitelist.length > 0 ? (
                            <span className="text-foreground font-mono">{client.ipWhitelist.length} CIDRs</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">Any IP</span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {client.expiresAt ? formatDate(client.expiresAt) : 'Permanent'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenCredentials(client)}
                          title="View safe demonstration credential details"
                          className="rounded border border-border p-1.5 text-foreground hover:bg-muted transition-colors"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-primary" />
                        </button>

                        {client.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => setRevokingClient(client)}
                            title="Revoke client credentials"
                            className="rounded border border-border p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Confirmation Dialog */}
      {revokingClient && (
        <ConfirmDialog
          isOpen={!!revokingClient}
          onClose={() => setRevokingClient(null)}
          onConfirm={() => {
            onRevokeClient(revokingClient.id, revocationReason);
            setRevokingClient(null);
          }}
          title={`Revoke Client Credentials: ${revokingClient.name}`}
          variant="danger"
          confirmLabel="Revoke Client Now"
          description={
            <div className="space-y-3 text-xs">
              <p>
                Are you sure you want to revoke credentials for client{' '}
                <strong className="font-mono text-foreground">{revokingClient.clientId}</strong>?
                All future API requests bearing this credential will immediately be rejected with HTTP 401 Unauthorized.
              </p>
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Revocation Audit Reason:
                </label>
                <input
                  type="text"
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
                />
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
