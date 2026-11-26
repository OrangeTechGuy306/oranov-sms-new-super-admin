'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { isPlatformDevControlsEnabled } from '@/lib/auth/platformAuthConfig';
import { SupportNotice } from '@/components/support/SupportNotice';
import { SupportOperationsOverviewPanel } from '@/components/support/SupportOperationsOverviewPanel';
import { TicketRegistryPanel } from '@/components/support/TicketRegistryPanel';
import { CustomerSuccessAccountsPanel } from '@/components/support/CustomerSuccessAccountsPanel';
import { CustomerSuccessTasksPanel } from '@/components/support/CustomerSuccessTasksPanel';
import { SlaPolicyManagementPanel } from '@/components/support/SlaPolicyManagementPanel';
import { KnowledgeBasePanel } from '@/components/support/KnowledgeBasePanel';
import { CustomerSatisfactionPanel } from '@/components/support/CustomerSatisfactionPanel';
import { SupportAnalyticsPanel } from '@/components/support/SupportAnalyticsPanel';
import {
  LifeBuoy,
  Inbox,
  Building2,
  Calendar,
  Timer,
  BookOpen,
  Star,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function SupportDeskGovernancePage() {
  const { user, can } = usePlatformAuth();
  const {
    supportTickets,
    slaPolicies,
    kbArticles,
    csatRecords,
    csTasks,
    resetToDefaults,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [ticketFilters, setTicketFilters] = useState<Record<string, any>>({});
  const [initialTicketId, setInitialTicketId] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const authenticatedActorId = user?.id || '';
  const canResetFixtures =
    isPlatformDevControlsEnabled() && can('system.maintenance.manage');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const ticketParam = params.get('ticket');
      const orgParam = params.get('organizationId');
      if (ticketParam) {
        setInitialTicketId(ticketParam);
        setActiveTab('tickets');
      } else if (orgParam) {
        setTicketFilters({ organizationId: orgParam });
        setActiveTab('tickets');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Helper for cross-panel navigation
  const handleNavigateTab = (tabId: string, filters?: Record<string, any>) => {
    if (filters) {
      setTicketFilters(filters);
    }
    setActiveTab(tabId);
  };

  const openTicketsCount = supportTickets.filter(
    (t) => t.status !== 'resolved' && t.status !== 'closed'
  ).length;

  const tabs = [
    {
      id: 'overview',
      label: 'Operations Overview',
      icon: <LifeBuoy className="w-3.5 h-3.5" />,
    },
    {
      id: 'tickets',
      label: 'Ticket Management',
      icon: <Inbox className="w-3.5 h-3.5" />,
      count: openTicketsCount,
    },
    {
      id: 'cs_accounts',
      label: 'Customer Success & Health',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'cs_tasks',
      label: 'Follow-up Tasks',
      icon: <Calendar className="w-3.5 h-3.5" />,
      count: csTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length,
    },
    {
      id: 'sla_policies',
      label: 'SLA Policies & Sandbox',
      icon: <Timer className="w-3.5 h-3.5" />,
      count: slaPolicies.length,
    },
    {
      id: 'kb',
      label: 'Knowledge Base',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      count: kbArticles.length,
    },
    {
      id: 'csat',
      label: 'Satisfaction (CSAT)',
      icon: <Star className="w-3.5 h-3.5" />,
      count: csatRecords.length,
    },
    {
      id: 'analytics',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <PageHeader
        title="Support Desk & Customer Success Governance"
        description="Enterprise multi-tenant assistance workspace, ticket lifecycle workflows, neutral age tracking, internal notes, and school success monitoring."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <LifeBuoy className="w-3 h-3" />
            P0-6 Support Workflows Active
          </span>
        }
        actions={
          canResetFixtures ? (
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              title="Reset demonstration fixtures (dev mode)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Fixtures
            </button>
          ) : null
        }
      />

      {/* Non-negotiable Architecture Notice */}
      <SupportNotice />

      {/* Tab Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <SupportOperationsOverviewPanel
            onNavigateTab={handleNavigateTab}
            currentActorId={authenticatedActorId}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketRegistryPanel
            key={initialTicketId || 'default'}
            currentActorId={authenticatedActorId}
            initialFilters={ticketFilters}
            initialSelectedTicketId={initialTicketId}
          />
        )}

        {activeTab === 'cs_accounts' && (
          <CustomerSuccessAccountsPanel
            onNavigateTab={handleNavigateTab}
            currentActorId={authenticatedActorId}
          />
        )}

        {activeTab === 'cs_tasks' && (
          <CustomerSuccessTasksPanel currentActorId={authenticatedActorId} />
        )}

        {activeTab === 'sla_policies' && <SlaPolicyManagementPanel />}

        {activeTab === 'kb' && <KnowledgeBasePanel />}

        {activeTab === 'csat' && <CustomerSatisfactionPanel />}

        {activeTab === 'analytics' && <SupportAnalyticsPanel />}
      </div>

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={() => {
          resetToDefaults();
          setIsResetDialogOpen(false);
        }}
        title="Reset Development Support Fixtures?"
        description="This restores local browser demonstration tickets, tasks, and knowledge base records to initial sandbox values. Production data is unaffected."
        confirmLabel="Reset Local Fixtures"
        variant="warning"
      />
    </div>
  );
}
