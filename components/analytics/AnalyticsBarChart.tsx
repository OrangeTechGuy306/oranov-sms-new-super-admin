'use client';

import React, { useState } from 'react';
import { CategoryBreakdownItem } from '@/lib/types/analytics';
import { Table, BarChart2 } from 'lucide-react';

interface AnalyticsBarChartProps {
  title: string;
  description?: string;
  items: CategoryBreakdownItem[];
  unit?: string;
  barColor?: string;
  showPercentages?: boolean;
}

export function AnalyticsBarChart({
  title,
  description,
  items,
  unit = 'Count',
  barColor = '#3b82f6',
  showPercentages = true,
}: AnalyticsBarChartProps) {
  const [showTable, setShowTable] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
        <div className="h-36 flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
          No comparison categories available.
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...items.map((i) => i.count), 1);

  // Default color palette for varying bars
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#6366f1', // indigo
    '#f43f5e', // rose
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-foreground">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 rounded bg-primary/5 cursor-pointer"
          aria-label={showTable ? 'Switch to bar chart' : 'Switch to tabular representation'}
        >
          {showTable ? (
            <>
              <BarChart2 className="w-3 h-3" /> Chart View
            </>
          ) : (
            <>
              <Table className="w-3 h-3" /> Table View
            </>
          )}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto border border-border rounded-lg max-h-56">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold sticky top-0">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2 text-right">{unit}</th>
                <th className="p-2 text-right">Proportion (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.key} className="hover:bg-muted/20">
                  <td className="p-2 text-foreground font-medium">{it.label}</td>
                  <td className="p-2 text-right font-mono font-bold text-foreground">
                    {it.count.toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-mono text-muted-foreground">
                    {it.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {items.map((it, idx) => {
            const widthPct = Math.max(2, Math.round((it.count / maxVal) * 100));
            const fill = it.colorHex || barColor || colors[idx % colors.length];

            return (
              <div key={it.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                    {it.label}
                  </span>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-bold text-foreground">{it.count.toLocaleString()}</span>
                    {showPercentages && (
                      <span className="text-[11px] text-muted-foreground w-12 text-right">
                        ({it.percentage}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar line */}
                <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%`, backgroundColor: fill }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
