'use client';

import React from 'react';
import { getExamCapabilityInventory } from '@/lib/examination-governance/evaluator';
import { CheckCircle2, Clock, Layers, XCircle } from 'lucide-react';

export function ExamCapabilityRegistryTable() {
  const capabilities = getExamCapabilityInventory();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Verified Examination, CBT & Assessment Capabilities</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit inventory of discovered tenant examination workflows in tenant-dashboard/ mapped to Master Module Registry.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
          {capabilities.length} Discovered Capabilities
        </span>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Capability & ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tenant Source Evidence</th>
                <th className="py-3 px-3">Platform Oversight Scope</th>
                <th className="py-3 px-3">Module Link</th>
                <th className="py-3 px-4">Future Backend Dependency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {capabilities.map((cap) => {
                const isImpl = cap.implementationStatus === 'implemented';
                const isPart = cap.implementationStatus === 'partial';
                const isMissing = cap.implementationStatus === 'missing';

                return (
                  <tr key={cap.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{cap.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{cap.id}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground capitalize">
                        {cap.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isImpl
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isPart
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : isMissing
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {isImpl ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isPart ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {cap.implementationStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-[10px] text-foreground">{cap.tenantSourceEvidence.routePath}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {cap.tenantSourceEvidence.typeDefinition}
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-[11px] text-foreground leading-relaxed">{cap.platformOversightScope}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-semibold">
                        {cap.moduleRegistryRef}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{cap.futureBackendDependency}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
