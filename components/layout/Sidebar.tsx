'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { usePlatformStore } from '../providers/PlatformStoreContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  CreditCard,
  Layers,
  Users2,
  FileText,
  Activity,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  FileCheck,
  Receipt,
  DollarSign,
  Clock,
  BarChart3,
  Tag,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
  badgeVariant?: 'warning' | 'default';
  statusDot?: 'operational' | 'warning';
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({ isCollapsed, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { metrics, resetToDefaults } = usePlatformStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'Platform Core',
      items: [
        {
          label: 'Platform Overview',
          href: '/',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: 'School Organizations',
          href: '/organizations',
          icon: Building2,
          badge: metrics.totalOrganizations,
        },
        {
          label: 'Student Oversight',
          href: '/student-oversight',
          icon: GraduationCap,
        },
        {
          label: 'Academic Oversight',
          href: '/academic-oversight',
          icon: BookOpen,
        },
        {
          label: 'Examination Governance',
          href: '/examination-governance',
          icon: FileCheck,
        },
        {
          label: 'Onboard New School',
          href: '/organizations/new',
          icon: UserPlus,
          highlight: true,
        },
      ],
    },
    {
      title: 'Subscriptions & Billing',
      items: [
        {
          label: 'Subscriptions Hub',
          href: '/subscriptions',
          icon: CreditCard,
          exact: true,
          badge: metrics.trialOrganizations > 0 ? `${metrics.trialOrganizations} trial` : undefined,
          badgeVariant: 'warning',
        },
        {
          label: 'Plan Catalogue',
          href: '/subscriptions/plans',
          icon: Layers,
        },
        {
          label: 'Invoices & Ledger',
          href: '/subscriptions/invoices',
          icon: Receipt,
        },
        {
          label: 'Payment Monitoring',
          href: '/subscriptions/payments',
          icon: DollarSign,
        },
        {
          label: 'Renewals & Trials',
          href: '/subscriptions/renewals',
          icon: Clock,
        },
        {
          label: 'Monetization Analytics',
          href: '/subscriptions/analytics',
          icon: BarChart3,
        },
        {
          label: 'Discount Policies',
          href: '/subscriptions/discounts',
          icon: Tag,
        },
      ],
    },
    {
      title: 'Governance & Security',
      items: [
        {
          label: 'Platform Users & Roles',
          href: '/platform-users',
          icon: Users2,
          badge: metrics.activePlatformUsersCount,
        },
        {
          label: 'Administrative Audit Logs',
          href: '/audit-logs',
          icon: FileText,
        },
      ],
    },
    {
      title: 'Operations & Settings',
      items: [
        {
          label: 'System Health & Ops',
          href: '/system-health',
          icon: Activity,
          statusDot: metrics.systemServicesOperational === metrics.systemServicesTotal ? 'operational' : 'warning',
        },
        {
          label: 'Feature Availability',
          href: '/features',
          icon: Sparkles,
        },
        {
          label: 'Platform Settings',
          href: '/settings',
          icon: Sliders,
        },
      ],
    },
  ];

  const isItemActive = (href: string, exact = false) => {
    if (exact || href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden text-sidebar-foreground group"
        >
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-black text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight truncate flex items-center gap-1.5">
                SchoolSaaS
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30">
                  Super-Admin
                </span>
              </span>
              <span className="text-[11px] text-sidebar-foreground/60 truncate">
                Multi-Tenant Console
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 mb-2">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isItemActive(item.href, item.exact);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                        active
                          ? 'bg-sidebar-accent text-sidebar-foreground font-semibold shadow-2xs border-l-3 border-sidebar-primary'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                        isCollapsed && 'justify-center px-0'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          active ? 'text-sidebar-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                        )}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {/* Status dot or badge */}
                      {!isCollapsed && item.statusDot && (
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            item.statusDot === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'
                          )}
                        />
                      )}

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={cn(
                            'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                            item.badgeVariant === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-sidebar-accent text-sidebar-foreground/80 border border-sidebar-border'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Area: Development Reset & Version */}
      <div className="p-3 border-t border-sidebar-border space-y-2 shrink-0">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-lg bg-sidebar-accent/40 border border-sidebar-border text-[11px] space-y-2">
            <div className="flex items-center justify-between text-sidebar-foreground/70">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sidebar-primary" />
                Dev Mock Mode
              </span>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-[10px] hover:text-sidebar-foreground flex items-center gap-1 text-sidebar-foreground/50 hover:underline"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset Data
              </button>
            </div>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
              Client-side state only. No backend connected yet.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title="Reset development fixtures"
              className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetToDefaults();
          setShowResetConfirm(false);
        }}
        title="Reset Development Store Fixtures"
        variant="warning"
        confirmLabel="Reset Fixtures"
        description={
          <p>
            Are you sure you want to reset all organizations, subscriptions, invoices, and ledger records to default demonstration fixtures? Any local edits will be discarded.
          </p>
        }
      />
    </aside>
  );
}
