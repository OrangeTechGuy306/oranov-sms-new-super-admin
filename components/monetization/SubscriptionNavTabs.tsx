'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  Layers,
  FileText,
  DollarSign,
  Clock,
  BarChart3,
  Tag,
} from 'lucide-react';

export function SubscriptionNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Subscriptions Hub',
      href: '/subscriptions',
      exact: true,
      icon: CreditCard,
    },
    {
      label: 'Plan Catalogue',
      href: '/subscriptions/plans',
      exact: false,
      icon: Layers,
    },
    {
      label: 'Invoices & Ledger',
      href: '/subscriptions/invoices',
      exact: false,
      icon: FileText,
    },
    {
      label: 'Payments & Failures',
      href: '/subscriptions/payments',
      exact: false,
      icon: DollarSign,
    },
    {
      label: 'Renewals & Trials',
      href: '/subscriptions/renewals',
      exact: false,
      icon: Clock,
    },
    {
      label: 'Monetization Analytics',
      href: '/subscriptions/analytics',
      exact: false,
      icon: BarChart3,
    },
    {
      label: 'Discount Policies',
      href: '/subscriptions/discounts',
      exact: false,
      icon: Tag,
    },
  ];

  const isTabActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 rounded-xl border border-border/80 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const active = isTabActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              active
                ? 'bg-card text-foreground shadow-2xs font-bold border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
