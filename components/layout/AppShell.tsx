'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ThemeProvider } from '../providers/ThemeContext';
import { PlatformStoreProvider } from '../providers/PlatformStoreContext';
import { PlatformAuthProvider } from '../providers/PlatformAuthContext';
import { PlatformProtectedRoute } from '../auth/PlatformProtectedRoute';
import { isPlatformPublicAuthPath } from '@/lib/auth/platformAuthConfig';
import { X } from 'lucide-react';

interface AppShellInnerProps {
  children: React.ReactNode;
}

function AppShellInner({ children }: AppShellInnerProps) {
  const pathname = usePathname();
  const isPublicAuth = isPlatformPublicAuthPath(pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSandboxBanner, setShowSandboxBanner] = useState(true);

  // Authentication pages (/login, /forgot-password, /reset-password, /accept-invitation, /2fa, /403)
  // render cleanly without protected Sidebar or TopBar chrome.
  if (isPublicAuth) {
    return (
      <PlatformProtectedRoute>
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
              Loading authentication portal...
            </div>
          }
        >
          {children}
        </React.Suspense>
      </PlatformProtectedRoute>
    );
  }

  return (
    <PlatformProtectedRoute>
      <div className="min-h-screen flex bg-background text-foreground">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <React.Suspense fallback={<aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border" />}>
            <Sidebar
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </React.Suspense>
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-72 h-full bg-sidebar">
              <React.Suspense fallback={null}>
                <Sidebar
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </React.Suspense>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Sandbox Warning Banner */}
          {showSandboxBanner && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between gap-3 shrink-0 border-b border-indigo-700/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-extrabold px-1.5 py-0.2 bg-white/20 rounded text-[9px] tracking-wider uppercase shrink-0">
                  Frontend Simulation Sandbox
                </span>
                <p className="truncate opacity-90">
                  Super-Admin Control Plane: Authentication, IAM state, organizations, and billing run in frontend simulation mode. Production backend endpoints & RBAC enforcement follow in subsequent phases.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSandboxBanner(false)}
                className="text-white/70 hover:text-white shrink-0 p-0.5"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TopBar Header */}
          <React.Suspense fallback={<header className="h-16 border-b border-border bg-background" />}>
            <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          </React.Suspense>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading workspace...</div>}>
              {children}
            </React.Suspense>
          </main>
        </div>
      </div>
    </PlatformProtectedRoute>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PlatformAuthProvider>
        <PlatformStoreProvider>
          <AppShellInner>{children}</AppShellInner>
        </PlatformStoreProvider>
      </PlatformAuthProvider>
    </ThemeProvider>
  );
}
