'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
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
  const {
    supportTickets,
    slaPolicies,
    kbArticles,
    csatRecords,
    csTasks,
    platformUsers,
    resetToDefaults,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentActorId, setCurrentActorId] = useState<string>('usr_support_03'); // Marcus Brody (Support Lead)
  const [ticketFilters, setTicketFilters] = useState<Record<string, any>>({});

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
        description="Enterprise multi-tenant assistance workspace, SLA policy enforcement, ticket lifecycle management, and school success monitoring."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <LifeBuoy className="w-3 h-3" />
            E-09.17 Governance Active
          </span>
        }
        actions={
          <button
            onClick={() => {
              if (window.confirm('Reset local support state, tickets, and fixtures to default demonstration values?')) {
                resetToDefaults();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            title="Reset demonstration fixtures"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Fixtures
          </button>
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
            currentActorId={currentActorId}
            onChangeActor={setCurrentActorId}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketRegistryPanel
            currentActorId={currentActorId}
            initialFilters={ticketFilters}
          />
        )}

        {activeTab === 'cs_accounts' && (
          <CustomerSuccessAccountsPanel
            onNavigateTab={handleNavigateTab}
            currentActorId={currentActorId}
          />
        )}

        {activeTab === 'cs_tasks' && (
          <CustomerSuccessTasksPanel currentActorId={currentActorId} />
        )}

        {activeTab === 'sla_policies' && <SlaPolicyManagementPanel />}

        {activeTab === 'kb' && <KnowledgeBasePanel />}

        {activeTab === 'csat' && <CustomerSatisfactionPanel />}

        {activeTab === 'analytics' && <SupportAnalyticsPanel />}
      </div>
    </div>
  );
}
