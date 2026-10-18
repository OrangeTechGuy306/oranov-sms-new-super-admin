'use client';

import React from 'react';
import { StudentPopulationLifecycleBreakdown } from '@/lib/types/student-oversight';
import { Users2 } from 'lucide-react';

interface StudentPopulationDistributionCardProps {
  population: StudentPopulationLifecycleBreakdown;
}

export function StudentPopulationDistributionCard({ population }: StudentPopulationDistributionCardProps) {
  const total = population.totalTracked || 1;

  const segments = [
    {
      label: 'Enrolled & Active',
      count: population.enrolledCount,
      percentage: Math.round((population.enrolledCount / total) * 100),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      description: 'Currently attending classes',
    },
    {
      label: 'Admitted (Pre-Enrolled)',
      count: population.admittedCount,
      percentage: Math.round((population.admittedCount / total) * 100),
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      description: 'Accepted offers awaiting start',
    },
    {
      label: 'Graduated Alumni',
      count: population.graduatedCount,
      percentage: Math.round((population.graduatedCount / total) * 100),
      color: 'bg-purple-500',
      textColor: 'text-purple-700 dark:text-purple-300',
      description: 'Completed final grade cohort',
    },
    {
      label: 'Transferred Out',
      count: population.transferredCount,
      percentage: Math.round((population.transferredCount / total) * 100),
      color: 'bg-indigo-400',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      description: 'Moved to destination school',
    },
    {
      label: 'Withdrawn',
      count: population.withdrawnCount,
      percentage: Math.round((population.withdrawnCount / total) * 100),
      color: 'bg-amber-400',
      textColor: 'text-amber-700 dark:text-amber-300',
      description: 'Voluntary early departure',
    },
    {
      label: 'Suspended (Hold)',
      count: population.suspendedCount,
      percentage: Math.round((population.suspendedCount / total) * 100),
      color: 'bg-rose-400',
      textColor: 'text-rose-700 dark:text-rose-300',
      description: 'Administrative or compliance hold',
    },
    {
      label: 'Archived / Inactive',
      count: population.archivedCount,
      percentage: Math.round((population.archivedCount / total) * 100),
      color: 'bg-slate-400',
      textColor: 'text-slate-700 dark:text-slate-300',
      description: 'Historical records retained',
    },
  ];

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
            <Users2 className="w-4 h-4 text-primary" />
            Student Population Lifecycle & Status Composition
          </h3>
          <p className="text-xs text-muted-foreground">
            Strict separation between actively enrolled learners, alumni graduates, departed students, and archived files.
          </p>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Total Tracked Records: <span className="font-bold text-foreground">{population.totalTracked.toLocaleString()}</span>
        </div>
      </div>

      {/* Composition Multi-Segment Bar */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
          {segments.map((seg) => {
            if (seg.percentage <= 0) return null;
            return (
              <div
                key={seg.label}
                title={`${seg.label}: ${seg.count.toLocaleString()} (${seg.percentage}%)`}
                style={{ width: `${seg.percentage}%` }}
                className={`${seg.color} transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-90`}
              />
            );
          })}
        </div>
      </div>

      {/* Grid of Segments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${seg.color} shrink-0`} />
              <span className="text-xs font-medium text-foreground truncate">{seg.label}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-bold text-foreground tracking-tight">
                {seg.count.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{seg.percentage}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{seg.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
