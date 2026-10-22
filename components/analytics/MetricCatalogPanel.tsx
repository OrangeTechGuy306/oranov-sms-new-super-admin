'use client';

import React, { useState } from 'react';
import { METRIC_CATALOG } from '@/lib/analytics/metric-catalog';
import { MetricDefinition, MetricCategoryKey } from '@/lib/types/analytics';
import {
  BookOpen,
  Search,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  Code,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';

export function MetricCatalogPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Domains' },
    { key: 'executive', label: 'Executive' },
    { key: 'tenants', label: 'Tenant Growth' },
    { key: 'monetization', label: 'Monetization' },
    { key: 'modules', label: 'Module Registry' },
    { key: 'support', label: 'Support & Success' },
    { key: 'operations', label: 'Operations' },
    { key: 'communications', label: 'Communications' },
    { key: 'governance', label: 'Governance' },
  ];

  const filteredMetrics = METRIC_CATALOG.filter((metric) => {
    if (selectedCategory !== 'all' && metric.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = metric.name.toLowerCase().includes(q);
      const matchId = metric.id.toLowerCase().includes(q);
      const matchDesc = metric.description.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDesc) return false;
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedMetricId(expandedMetricId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Catalog Header & Governance Overview */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Platform Metric Catalog & Governance Dictionary
        </h4>
        <p className="text-muted-foreground">
          Authoritative technical dictionary defining stable identifiers, exact formulas, reporting-period scopes, and data status classifications across the platform.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, formula..."
              className="pl-8 pr-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary w-56 sm:w-72"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCategory(c.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.key
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-muted-foreground shrink-0">
          Showing {filteredMetrics.length} of {METRIC_CATALOG.length} Metrics
        </span>
      </div>

      {/* Metrics List */}
      <div className="space-y-3">
        {filteredMetrics.map((m) => {
          const isExpanded = expandedMetricId === m.id;

          return (
            <div
              key={m.id}
              className={`bg-card border rounded-xl p-4 transition-all space-y-3 shadow-2xs ${
                isExpanded ? 'border-primary/60 ring-1 ring-primary/20' : 'border-border hover:border-primary/30'
              }`}
            >
              <div
                onClick={() => toggleExpand(m.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {m.id}
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {m.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                      {m.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.dataStatus === 'DEMO_FIXTURE'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : m.dataStatus === 'SIMULATED_TELEMETRY'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {m.dataStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {m.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-primary font-semibold shrink-0"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Specs</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Formula & Specs</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Technical Specifications */}
              {isExpanded && (
                <div className="pt-3 border-t border-border/60 space-y-3 text-xs">
                  {/* Mathematical Formula Box */}
                  <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1 font-mono">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-primary" />
                      Mathematical Calculation Formula
                    </span>
                    <div className="text-xs text-foreground font-semibold break-all">
                      {m.formula}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2 p-3 bg-card border border-border/60 rounded-lg">
                      <div>
                        <strong className="text-foreground block">Business Purpose:</strong>
                        <p className="text-muted-foreground">{m.businessPurpose}</p>
                      </div>

                      <div>
                        <strong className="text-foreground block">Unit & Formatting:</strong>
                        <p className="text-muted-foreground font-mono">
                          {m.unit} ({m.formatType})
                        </p>
                      </div>

                      <div>
                        <strong className="text-foreground block">Source Adapter:</strong>
                        <p className="text-muted-foreground font-mono text-[11px]">
                          {m.sourceEntity}
                        </p>
                      </div>

                      <div>
                        <strong className="text-foreground block">Required Fields:</strong>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {m.requiredFields.map((f) => (
                            <span
                              key={f}
                              className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 bg-card border border-border/60 rounded-lg">
                      <div>
                        <strong className="text-foreground block">Reporting Period Semantics:</strong>
                        <p className="text-muted-foreground">{m.dateInterpretation}</p>
                      </div>

                      <div>
                        <strong className="text-foreground block">Known Limitations:</strong>
                        <p className="text-amber-600 dark:text-amber-400">{m.knownLimitations}</p>
                      </div>

                      <div>
                        <strong className="text-foreground block">Future Backend Requirements:</strong>
                        <p className="text-muted-foreground">{m.futureBackendRequirements}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
