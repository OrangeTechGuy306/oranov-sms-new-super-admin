import { INITIAL_ORGANIZATIONS } from '@/lib/data/initial-data';
import { OrganizationSubscriptionClient } from './OrganizationSubscriptionClient';

export function generateStaticParams() {
  return INITIAL_ORGANIZATIONS.map((org) => ({
    organizationId: org.id,
  }));
}

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationSubscriptionPage({ params }: PageProps) {
  const { organizationId } = await params;
  return <OrganizationSubscriptionClient organizationId={organizationId} />;
}
