import { INITIAL_SUBSCRIPTIONS } from '@/lib/data/initial-data';
import { SubscriptionDetailClient } from './SubscriptionDetailClient';

export function generateStaticParams() {
  return INITIAL_SUBSCRIPTIONS.map((s) => ({
    subscriptionId: s.id,
  }));
}

interface PageProps {
  params: Promise<{ subscriptionId: string }>;
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const { subscriptionId } = await params;
  return <SubscriptionDetailClient subscriptionId={subscriptionId} />;
}
