import { INITIAL_PLANS } from '@/lib/data/initial-data';
import { PlanDetailClient } from './PlanDetailClient';

export function generateStaticParams() {
  return INITIAL_PLANS.map((p) => ({
    planId: p.id,
  }));
}

interface PageProps {
  params: Promise<{ planId: string }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { planId } = await params;
  return <PlanDetailClient planId={planId} />;
}
