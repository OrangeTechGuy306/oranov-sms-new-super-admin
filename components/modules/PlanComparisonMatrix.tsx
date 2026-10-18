'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { TenantModuleDefinition } from '@/lib/modules/types';
import { CATEGORY_METADATA } from '@/lib/modules/registry-data';
import { Check, X, Sparkles } from 'lucide-react';

interface PlanComparisonMatrixProps {
  modules: TenantModuleDefinition[];
  onSelectModule?: (module: TenantModuleDefinition) => void;
}

export function PlanComparisonMatrix({ modules, onSelectModule }: PlanComparisonMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'top_only' | 'diff_only'>('all');

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !mod.name.toLowerCase().includes(q) &&
          !mod.code.toLowerCase().includes(q) &&
          !mod.id.toLowerCase().includes(q) &&
          !mod.href.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && mod.category !== selectedCategory) {
        return false;
      }

      if (filterType === 'top_only' && mod.parentId) {
        return false;
      }

      if (filterType === 'diff_only') {
        const inStarter = mod.includedInPlans.includes('starter');
        const inGrowth = mod.includedInPlans.includes('growth');
        const inEnterprise = mod.includedInPlans.includes('enterprise');
        // Diff only if not identical across all three
        if (inStarter && inGrowth && inEnterprise) return false;
      }

      return true;
    });
  }, [modules, searchQuery, selectedCategory, filterType]);

  const categoryOptions = useMemo(() => {
    const categories = new Set(modules.map((m) => m.category));
    return Array.from(categories).map((c) => ({
      key: c,
      label: CATEGORY_METADATA[c]?.label || c.replace(/_/g, ' '),
    }));
  }, [modules]);

  return (
    <div className="space-y-4">
      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter matrix by module name, code, or route..."
          resultCount={filteredModules.length}
          onReset={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setFilterType('all');
          }}
        />

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium focus:outline-none"
            aria-label="Filter matrix by category"
          >
            <option value="all">All Categories ({categoryOptions.length})</option>
            {categoryOptions.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'top_only' | 'diff_only')}
            className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium focus:outline-none"
            aria-label="Filter matrix view scope"
          >
            <option value="all">All Modules ({modules.length})</option>
            <option value="top_only">Top-Level Only (56)</option>
            <option value="diff_only">Tier Differences Only</option>
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3.5 font-semibold text-foreground min-w-[240px]">
                  Registered Module & Scope
                </th>
                <th className="p-3.5 font-semibold text-foreground min-w-[140px]">
                  Domain Category
                </th>
                <th className="p-3.5 font-semibold text-foreground text-center min-w-[120px] bg-muted/20">
                  <div className="flex flex-col items-center">
                    <span>Starter Academy</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Tier: Starter</span>
                  </div>
                </th>
                <th className="p-3.5 font-semibold text-foreground text-center min-w-[120px] bg-primary/5">
                  <div className="flex flex-col items-center">
                    <span className="text-primary font-bold">Growth Campus</span>
                    <span className="text-[10px] text-primary/80 font-normal">Tier: Growth</span>
                  </div>
                </th>
                <th className="p-3.5 font-semibold text-foreground text-center min-w-[120px] bg-muted/20">
                  <div className="flex flex-col items-center">
                    <span>Enterprise Network</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Tier: Enterprise</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                    No modules match the current matrix search filters.
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => {
                  const inStarter = mod.includedInPlans.includes('starter');
                  const inGrowth = mod.includedInPlans.includes('growth');
                  const inEnterprise = mod.includedInPlans.includes('enterprise');
                  const catLabel = CATEGORY_METADATA[mod.category]?.label || mod.category;

                  return (
                    <tr
                      key={mod.id}
                      onClick={() => onSelectModule && onSelectModule(mod)}
                      className={`hover:bg-muted/30 transition-colors ${
                        onSelectModule ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {mod.parentId ? (
                            <span className="text-muted-foreground/60 text-xs ml-3 font-mono">└─</span>
                          ) : null}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{mod.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {mod.code}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono truncate block max-w-xs">
                              {mod.href}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge variant="neutral" className="text-[10px]">
                          {catLabel}
                        </Badge>
                      </td>

                      {/* Starter Column */}
                      <td className="p-3.5 text-center bg-muted/10">
                        {inStarter ? (
                          <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <Check className="w-4 h-4" />
                            <span>Included</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-muted-foreground/50 text-xs">
                            <X className="w-3.5 h-3.5" />
                            <span>Excluded</span>
                          </div>
                        )}
                      </td>

                      {/* Growth Column */}
                      <td className="p-3.5 text-center bg-primary/5">
                        {inGrowth ? (
                          <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <Check className="w-4 h-4" />
                            <span>Included</span>
                          </div>
                        ) : mod.requiresAddonLicense ? (
                          <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Add-on</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-muted-foreground/50 text-xs">
                            <X className="w-3.5 h-3.5" />
                            <span>Excluded</span>
                          </div>
                        )}
                      </td>

                      {/* Enterprise Column */}
                      <td className="p-3.5 text-center bg-muted/10">
                        {inEnterprise ? (
                          <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <Check className="w-4 h-4" />
                            <span>Included</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-muted-foreground/50 text-xs">
                            <X className="w-3.5 h-3.5" />
                            <span>Excluded</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
