'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../providers/ThemeContext';
import { usePlatformStore } from '../providers/PlatformStoreContext';
import {
  Menu,
  Sun,
  Moon,
  Search,
  ChevronRight,
  ShieldAlert,
  User,
  LogOut,
  Building2,
  Info,
} from 'lucide-react';
import { getInitials } from '@/lib/utils/formatters';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { organizations, platformUsers } = usePlatformStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signOutNotice, setSignOutNotice] = useState(false);

  // Active super-admin user fixture
  const currentUser = platformUsers[0] || {
    name: 'Alexander Sterling',
    email: 'alexander.s@saas-platform.internal',
    role: 'super_admin',
  };

  // Build breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
      return [{ label: 'Platform Overview', href: '/' }];
    }

    const breadcrumbs = [{ label: 'Overview', href: '/' }];
    let cumulativeHref = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      cumulativeHref += `/${part}`;

      let label = part;
      if (part === 'organizations') label = 'School Organizations';
      else if (part === 'new') label = 'New';
      else if (part === 'subscriptions') label = 'Subscriptions';
      else if (part === 'plans') label = 'Plan Catalogue';
      else if (part === 'invoices') label = 'Invoices & Ledger';
      else if (part === 'payments') label = 'Payment Monitoring';
      else if (part === 'renewals') label = 'Renewals & Trials';
      else if (part === 'analytics') label = cumulativeHref === '/analytics' ? 'Platform Analytics & BI' : 'Monetization Analytics';
      else if (part === 'discounts') label = 'Discount Policies';
      else if (part === 'platform-users') label = 'Platform Users';
      else if (part === 'audit-logs') label = 'Audit Logs';
      else if (part === 'system-health') label = 'System Health';
      else if (part === 'communications') label = 'Communications & Delivery';
      else if (part === 'support') label = 'Support Desk & Tenant Success';
      else if (part === 'settings') label = 'Settings';
      else if (part === 'features') label = 'Features';
      else {
        // Dynamic ID (organization ID)
        const matchedOrg = organizations.find((o) => o.id === part);
        if (matchedOrg) {
          label = matchedOrg.name;
        } else {
          label = part;
        }
      }

      breadcrumbs.push({ label, href: cumulativeHref });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const searchResults = searchQuery.trim()
    ? organizations.filter(
        (o) =>
          o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 sticky top-0 bg-background/95 backdrop-blur-xs border-b border-border z-20 px-4 flex items-center justify-between gap-4">
      {/* Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors truncate max-w-[150px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side controls: Search, Dev notice, Theme toggle, User menu */}
      <div className="flex items-center gap-2.5">
        {/* Quick search button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Quick Find...</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono">
              /
            </kbd>
          </button>

          {/* Quick search dropdown */}
          {searchOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setSearchOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-xl z-40 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search schools by name or code..."
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 text-xs bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-border/50 text-xs">
                  {searchResults.length > 0 ? (
                    searchResults.map((org) => (
                      <div
                        key={org.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          router.push(`/organizations/${org.id}`);
                        }}
                        className="p-2.5 hover:bg-muted rounded-lg cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{org.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {org.code} • {org.subdomain}.schoolsaas.internal
                          </p>
                        </div>
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </div>
                    ))
                  ) : searchQuery.trim() ? (
                    <div className="p-4 text-center text-muted-foreground text-xs">
                      No schools found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <div className="p-3 text-muted-foreground text-[11px]">
                      Type to search tenant organizations across the platform.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Development badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Frontend Sandbox</span>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Super-admin Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-foreground">{currentUser.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">Super-Admin</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl border border-border shadow-xl z-40 p-2 space-y-1 text-xs">
                <div className="p-3 border-b border-border bg-muted/30 rounded-lg mb-1">
                  <p className="font-semibold text-foreground">{currentUser.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                    SaaS Platform Super-Admin
                  </span>
                </div>

                <Link
                  href="/platform-users"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Manage Platform Users
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                  Security & Settings
                </Link>

                <div className="pt-1 border-t border-border mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setSignOutNotice(true);
                      setTimeout(() => setSignOutNotice(false), 4500);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out (Demo)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {signOutNotice && (
        <div className="fixed top-4 right-4 z-50 p-3 bg-card border border-border shadow-lg rounded-xl flex items-center gap-2.5 text-xs text-foreground max-w-sm">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <p className="flex-1">
            Simulated sign out. Full session invalidation will be implemented by the backend authentication service.
          </p>
          <button
            type="button"
            onClick={() => setSignOutNotice(false)}
            className="text-muted-foreground hover:text-foreground ml-1 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
}
