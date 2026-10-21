'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { Sliders, Moon, Lock, Info, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export function NotificationPreferencesPanel() {
  const { notificationPreferenceGovernance } = usePlatformStore();
  const { categoryRules, quietHoursDefault, globalSmsRateLimitPerHour } = notificationPreferenceGovernance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          Notification Preferences & Suppression Rules Governance
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Establish mandatory communication categories, global recipient opt-out boundaries, and dispatch rate caps.
        </p>
      </div>

      {/* Mandatory vs Optional Communications Matrix */}
      <Card className="p-4 bg-muted/20 border-border/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Lock className="w-4 h-4 text-amber-500" />
          <span>Mandatory vs. Optional Communications Governance</span>
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11.5px]">
          In SaaS school systems, certain transactional dispatches (such as 2FA security tokens, account lockouts, compliance holds, and past-due billing notices) are classified as <strong>Mandatory Service Notifications</strong>. Recipients cannot opt out of mandatory notices, and they bypass quiet-hours suppression when priority is set to Critical. Non-mandatory communications (such as marketing announcements, feature newsletters, and admissions welcome guides) strictly honor quiet hours and recipient unsubscribe preferences.
        </p>
      </Card>

      {/* Categories Table */}
      <Card className="overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Notification Category</th>
                <th className="py-3 px-3">Legal Classification</th>
                <th className="py-3 px-3">Recipient Opt-Out Policy</th>
                <th className="py-3 px-3">Allowed Channels</th>
                <th className="py-3 px-4 text-right">Hourly Rate Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categoryRules.map((rule) => (
                <tr key={rule.category} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground capitalize">
                        {rule.category.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[11px] text-muted-foreground max-w-md line-clamp-1">
                        {rule.description}
                      </p>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {rule.isMandatory ? (
                      <Badge variant="error">Mandatory Notice</Badge>
                    ) : (
                      <Badge variant="neutral">Optional / Informational</Badge>
                    )}
                  </td>

                  <td className="py-3 px-3 text-[11.5px]">
                    {rule.isMandatory ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Exempt from Unsubscribe
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Honors Opt-Out & Quiet Hours
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.allowedChannels.map((ch) => (
                        <span key={ch} className="font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded uppercase">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-xs font-semibold">
                    {rule.defaultFrequencyCapPerHour} / hour
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Global Suppression & Rate Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card className="p-4 space-y-2 border border-border">
          <span className="font-semibold text-foreground flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Platform Default Quiet Hours Baseline
          </span>
          <p className="text-muted-foreground text-[11.5px]">
            Default quiet window: <strong>{quietHoursDefault.startTimeUtc} - {quietHoursDefault.endTimeUtc} UTC</strong>. Non-critical notifications generated during this window are queued or suppressed.
          </p>
        </Card>

        <Card className="p-4 space-y-2 border border-border">
          <span className="font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Global Cellular Dispatch Throughput Guard
          </span>
          <p className="text-muted-foreground text-[11.5px]">
            Platform-wide SMS rate limit: <strong>{globalSmsRateLimitPerHour} SMS / hour</strong>. Prevents runaway telecommunication carrier billing and protects external gateway relays.
          </p>
        </Card>
      </div>
    </div>
  );
}
