'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  IntegrationRecord,
  ApiClientRecord,
  WebhookEndpointRecord,
  WebhookDeliveryRecord,
} from '@/lib/types/integrations';
import { exportIntegrationsGovernancePackage } from '@/lib/integrations/exporter';

// Workspace Components
import { IntegrationsNotice } from '@/components/integrations/IntegrationsNotice';
import { IntegrationOverviewTab } from '@/components/integrations/IntegrationOverviewTab';
import { IntegrationRegistryTab } from '@/components/integrations/IntegrationRegistryTab';
import { ApiClientsTab } from '@/components/integrations/ApiClientsTab';
import { WebhookEndpointsTab } from '@/components/integrations/WebhookEndpointsTab';
import { WebhookDeliveryLogsTab } from '@/components/integrations/WebhookDeliveryLogsTab';
import { IntegrationHealthTab } from '@/components/integrations/IntegrationHealthTab';
import { IntegrationAuditTab } from '@/components/integrations/IntegrationAuditTab';
import { IntegrationDocsTab } from '@/components/integrations/IntegrationDocsTab';

// Modals & Drawers
import { IntegrationDetailModal } from '@/components/integrations/IntegrationDetailModal';
import { IntegrationConfigModal } from '@/components/integrations/IntegrationConfigModal';
import { SafeCredentialsModal } from '@/components/integrations/SafeCredentialsModal';
import { CreateApiClientModal } from '@/components/integrations/CreateApiClientModal';
import { CreateWebhookEndpointModal } from '@/components/integrations/CreateWebhookEndpointModal';
import { TestDeliveryModal } from '@/components/integrations/TestDeliveryModal';
import { DeliveryDetailDrawer } from '@/components/integrations/DeliveryDetailDrawer';

import {
  Layers,
  KeyRound,
  Webhook,
  Send,
  RotateCcw,
  Activity,
  ShieldCheck,
  FileText,
  BookOpen,
  Download,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

function IntegrationsGovernanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const {
    integrations,
    apiClients,
    webhookEndpoints,
    webhookDeliveries,
    auditEvents,
    getIntegrationMetrics,
    getIntegrationHealthIndicators,
    updateIntegrationConfig,
    toggleIntegration,
    simulateVerifyIntegration,
    createApiClient,
    revokeApiClient,
    createWebhookEndpoint,
    updateWebhookEndpoint,
    toggleWebhookEndpoint,
    simulateTestWebhookDelivery,
    simulateRetryWebhookDelivery,
    addToast,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [, startTransition] = useTransition();

  // Modals state
  const [inspectIntegration, setInspectIntegration] = useState<IntegrationRecord | null>(null);
  const [configIntegration, setConfigIntegration] = useState<IntegrationRecord | null>(null);
  const [credentialsClient, setCredentialsClient] = useState<ApiClientRecord | null>(null);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isCreateEndpointOpen, setIsCreateEndpointOpen] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState<WebhookEndpointRecord | null>(null);
  const [testEndpoint, setTestEndpoint] = useState<WebhookEndpointRecord | null>(null);
  const [inspectDelivery, setInspectDelivery] = useState<WebhookDeliveryRecord | null>(null);
  const [deliveryLogEndpointFilter, setDeliveryLogEndpointFilter] = useState<string>('all');

  const metrics = getIntegrationMetrics();
  const healthIndicators = getIntegrationHealthIndicators();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    startTransition(() => {
      router.replace(`/integrations?tab=${tabId}`, { scroll: false });
    });
  };

  const handleNavigateToDeliveryLogs = (endpointId?: string) => {
    if (endpointId) {
      setDeliveryLogEndpointFilter(endpointId);
    }
    handleTabChange('delivery-logs');
  };

  const handleExportGovernancePackage = () => {
    const jsonStr = exportIntegrationsGovernancePackage(integrations, apiClients, webhookEndpoints);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `integrations_governance_package_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Governance Package Exported',
      message: 'Sanitized JSON package downloaded with zero sensitive credentials.',
    });
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'registry',
      label: 'Integration Registry',
      icon: <Activity className="w-3.5 h-3.5" />,
      count: integrations.length,
    },
    {
      id: 'api-clients',
      label: 'API Clients',
      icon: <KeyRound className="w-3.5 h-3.5" />,
      count: metrics.activeApiClients,
    },
    {
      id: 'webhooks',
      label: 'Webhook Endpoints',
      icon: <Webhook className="w-3.5 h-3.5" />,
      count: webhookEndpoints.length,
    },
    {
      id: 'delivery-logs',
      label: 'Delivery Logs',
      icon: <RotateCcw className="w-3.5 h-3.5" />,
      count: metrics.failedDeliveriesCount > 0 ? metrics.failedDeliveriesCount : undefined,
      badgeVariant: 'error' as const,
    },
    {
      id: 'health',
      label: 'Health & Diagnostics',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      count: metrics.configWarningsCount > 0 ? metrics.configWarningsCount : undefined,
      badgeVariant: 'warning' as const,
    },
    {
      id: 'audit',
      label: 'Integration Audit',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: 'docs',
      label: 'Architecture & Catalogue',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Platform API Management, Webhooks & Integration Governance"
        description="Centralized Super-Admin governance console for managing third-party provider configurations, API client identities, webhook event dispatch subscriptions, simulated deliveries, and integration health."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportGovernancePackage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Export Governance JSON
            </button>
            <Link
              href="/system-health"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              System Health & Ops
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        }
      />

      {/* Prominent Architectural Demonstration Notice */}
      <IntegrationsNotice />

      {/* Workspace Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <IntegrationOverviewTab
            metrics={metrics}
            integrations={integrations}
            apiClients={apiClients}
            endpoints={webhookEndpoints}
            deliveries={webhookDeliveries}
            onNavigateTab={handleTabChange}
            onInspectDelivery={setInspectDelivery}
            onOpenCreateClient={() => setIsCreateClientOpen(true)}
            onOpenCreateEndpoint={() => setIsCreateEndpointOpen(true)}
          />
        )}

        {activeTab === 'registry' && (
          <IntegrationRegistryTab
            integrations={integrations}
            onOpenDetails={setInspectIntegration}
            onOpenConfig={setConfigIntegration}
            onToggleEnabled={toggleIntegration}
            onVerifyConnection={simulateVerifyIntegration}
          />
        )}

        {activeTab === 'api-clients' && (
          <ApiClientsTab
            apiClients={apiClients}
            onOpenCreate={() => setIsCreateClientOpen(true)}
            onOpenCredentials={setCredentialsClient}
            onRevokeClient={revokeApiClient}
          />
        )}

        {activeTab === 'webhooks' && (
          <WebhookEndpointsTab
            endpoints={webhookEndpoints}
            onOpenCreate={() => setIsCreateEndpointOpen(true)}
            onOpenEdit={setEditEndpoint}
            onOpenTest={setTestEndpoint}
            onToggleEnabled={toggleWebhookEndpoint}
            onViewLogs={handleNavigateToDeliveryLogs}
          />
        )}

        {activeTab === 'delivery-logs' && (
          <WebhookDeliveryLogsTab
            deliveries={webhookDeliveries}
            endpoints={webhookEndpoints}
            onInspectDelivery={setInspectDelivery}
            onRetryDelivery={simulateRetryWebhookDelivery}
            initialEndpointFilter={deliveryLogEndpointFilter}
          />
        )}

        {activeTab === 'health' && (
          <IntegrationHealthTab
            indicators={healthIndicators}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'audit' && (
          <IntegrationAuditTab auditEvents={auditEvents} />
        )}

        {activeTab === 'docs' && <IntegrationDocsTab />}
      </div>

      {/* Modals & Inspection Drawers */}
      {inspectIntegration && (
        <IntegrationDetailModal
          isOpen={!!inspectIntegration}
          onClose={() => setInspectIntegration(null)}
          integration={inspectIntegration}
          onOpenConfig={setConfigIntegration}
          onVerify={(int) => simulateVerifyIntegration(int.id)}
        />
      )}

      {configIntegration && (
        <IntegrationConfigModal
          isOpen={!!configIntegration}
          onClose={() => setConfigIntegration(null)}
          integration={configIntegration}
          onSave={updateIntegrationConfig}
        />
      )}

      {credentialsClient && (
        <SafeCredentialsModal
          isOpen={!!credentialsClient}
          onClose={() => setCredentialsClient(null)}
          client={credentialsClient}
        />
      )}

      {isCreateClientOpen && (
        <CreateApiClientModal
          isOpen={isCreateClientOpen}
          onClose={() => setIsCreateClientOpen(false)}
          onSubmit={createApiClient}
        />
      )}

      {isCreateEndpointOpen && (
        <CreateWebhookEndpointModal
          isOpen={isCreateEndpointOpen}
          onClose={() => setIsCreateEndpointOpen(false)}
          onSubmit={createWebhookEndpoint}
        />
      )}

      {editEndpoint && (
        <CreateWebhookEndpointModal
          isOpen={!!editEndpoint}
          onClose={() => setEditEndpoint(null)}
          onSubmit={(input) => updateWebhookEndpoint(editEndpoint.id, input)}
          initialEndpoint={editEndpoint}
        />
      )}

      {testEndpoint && (
        <TestDeliveryModal
          isOpen={!!testEndpoint}
          onClose={() => setTestEndpoint(null)}
          endpoint={testEndpoint}
          onDispatch={simulateTestWebhookDelivery}
        />
      )}

      {inspectDelivery && (
        <DeliveryDetailDrawer
          isOpen={!!inspectDelivery}
          onClose={() => setInspectDelivery(null)}
          delivery={inspectDelivery}
          onRetry={simulateRetryWebhookDelivery}
        />
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading integrations governance console...</div>}>
      <IntegrationsGovernanceContent />
    </Suspense>
  );
}
