import { INITIAL_ORGANIZATIONS } from '@/lib/data/initial-data';
import { OrganizationDetailsClient } from './OrganizationDetailsClient';

export function generateStaticParams() {
  return INITIAL_ORGANIZATIONS.map((org) => ({
    organizationId: org.id,
  }));
}

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationDetailsPage({ params }: PageProps) {
  const { organizationId } = await params;
  return <OrganizationDetailsClient organizationId={organizationId} />;
}
