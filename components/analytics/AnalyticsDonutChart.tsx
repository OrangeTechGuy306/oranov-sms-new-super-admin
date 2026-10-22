'use client';

import React, { useState } from 'react';
import { CategoryBreakdownItem } from '@/lib/types/analytics';
import { Table, PieChart } from 'lucide-react';

interface AnalyticsDonutChartProps {
  title: string;
  description?: string;
  items: CategoryBreakdownItem[];
  centerLabel?: string;
  centerValue?: string | number;
}

export function AnalyticsDonutChart({
  title,
  description,
  items,
  centerLabel = 'Total',
  centerValue,
}: AnalyticsDonutChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const totalCount = items.reduce((acc, it) => acc + it.count, 0);

  if (!items || items.length === 0 || totalCount === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
        <div className="h-44 flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
          No distribution data available for current scope.
        </div>
      </div>
    );
  }

  const palette = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#64748b', // slate
  ];

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = items.reduce<
    Array<(typeof items)[number] & { strokeDasharray: string; strokeDashoffset: number; color: string }>
  >((acc, it, idx) => {
    const fraction = it.count / totalCount;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const previousOffset = acc.reduce((sum, seg) => sum + (seg.count / totalCount), 0);
    const strokeDashoffset = -previousOffset * circumference;
    const color = it.colorHex || palette[idx % palette.length];

    acc.push({
      ...it,
      strokeDasharray,
      strokeDashoffset,
      color,
    });
    return acc;
  }, []);

  const displayCenterValue = centerValue !== undefined ? centerValue : totalCount.toLocaleString();

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
          aria-label={showTable ? 'Switch to donut chart' : 'Switch to tabular representation'}
        >
          {showTable ? (
            <>
              <PieChart className="w-3 h-3" /> Chart View
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
                <th className="p-2">Segment</th>
                <th className="p-2 text-right">Count</th>
                <th className="p-2 text-right">Share (%)</th>
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
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
          {/* SVG Donut */}
          <div className="relative w-40 h-40 shrink-0">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full -rotate-90 transform overflow-visible"
            >
              {segments.map((seg) => {
                const isHovered = hoverKey === seg.key;
                return (
                  <circle
                    key={seg.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoverKey(seg.key)}
                    onMouseLeave={() => setHoverKey(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-xl font-black text-foreground tracking-tight">
                {displayCenterValue}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {centerLabel}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-1.5 min-w-[140px] text-xs">
            {segments.map((seg) => {
              const isHovered = hoverKey === seg.key;
              return (
                <div
                  key={seg.key}
                  onMouseEnter={() => setHoverKey(seg.key)}
                  onMouseLeave={() => setHoverKey(null)}
                  className={`flex items-center justify-between p-1.5 rounded-md transition-colors cursor-pointer ${
                    isHovered ? 'bg-muted/70 font-bold' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-foreground truncate">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-muted-foreground text-[11px] shrink-0">
                    <span className="font-bold text-foreground">{seg.count}</span>
                    <span>({seg.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
