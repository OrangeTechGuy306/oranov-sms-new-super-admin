'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { CommunicationsNotice } from '@/components/communications/CommunicationsNotice';
import { OperationsOverviewPanel } from '@/components/communications/OperationsOverviewPanel';
import { TemplateRegistryPanel } from '@/components/communications/TemplateRegistryPanel';
import { NotificationPoliciesPanel } from '@/components/communications/NotificationPoliciesPanel';
import { ChannelProvidersPanel } from '@/components/communications/ChannelProvidersPanel';
import { DeliveryHistoryPanel } from '@/components/communications/DeliveryHistoryPanel';
import { CampaignPlannerPanel } from '@/components/communications/CampaignPlannerPanel';
import { TenantCommunicationConfigPanel } from '@/components/communications/TenantCommunicationConfigPanel';
import { NotificationPreferencesPanel } from '@/components/communications/NotificationPreferencesPanel';
import { CommunicationExportModal } from '@/components/communications/CommunicationExportModal';
import {
  Bell,
  Mail,
  Sliders,
  Server,
  Send,
  Sparkles,
  Building2,
  Lock,
  Download,
  ArrowRight,
} from 'lucide-react';

export default function CommunicationsGovernancePage() {
  const {
    communicationTemplates,
    notificationPolicies,
    communicationProviders,
    notificationRecords,
    campaignDrafts,
    tenantCommunicationConfigs,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const tabs = [
    {
      id: 'overview',
      label: 'Operations Overview',
      icon: <Bell className="w-3.5 h-3.5" />,
    },
    {
      id: 'templates',
      label: 'Template Registry',
      icon: <Mail className="w-3.5 h-3.5" />,
      count: communicationTemplates.length,
    },
    {
      id: 'policies',
      label: 'Notification Policies',
      icon: <Sliders className="w-3.5 h-3.5" />,
      count: notificationPolicies.length,
    },
    {
      id: 'providers',
      label: 'Channel & Provider Readiness',
      icon: <Server className="w-3.5 h-3.5" />,
      count: communicationProviders.length,
    },
    {
      id: 'delivery',
      label: 'Delivery History & Lifecycle',
      icon: <Send className="w-3.5 h-3.5" />,
      count: notificationRecords.length,
    },
    {
      id: 'campaigns',
      label: 'Campaign & Broadcast Planning',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      count: campaignDrafts.length,
    },
    {
      id: 'tenants',
      label: 'Tenant Settings Visibility',
      icon: <Building2 className="w-3.5 h-3.5" />,
      count: tenantCommunicationConfigs.length,
    },
    {
      id: 'preferences',
      label: 'Preferences & Suppression',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Platform Notifications, Templates & Delivery Governance"
        description="Unified Super-Admin communications control center: multi-channel template authoring, delivery state machines, gateway readiness, and quiet-hours policy enforcement."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Export / Import Package
            </button>
            <Link
              href="/system-health"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              System Health & Ops (E-09.14)
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        }
      />

      {/* Prominent Architectural Model Notice */}
      <CommunicationsNotice />

      {/* Workspace Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Active Panel Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <OperationsOverviewPanel onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'templates' && <TemplateRegistryPanel />}
        {activeTab === 'policies' && <NotificationPoliciesPanel />}
        {activeTab === 'providers' && <ChannelProvidersPanel />}
        {activeTab === 'delivery' && <DeliveryHistoryPanel />}
        {activeTab === 'campaigns' && <CampaignPlannerPanel />}
        {activeTab === 'tenants' && <TenantCommunicationConfigPanel />}
        {activeTab === 'preferences' && <NotificationPreferencesPanel />}
      </div>

      {/* Portability / Export Modal */}
      {isExportModalOpen && (
        <CommunicationExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
