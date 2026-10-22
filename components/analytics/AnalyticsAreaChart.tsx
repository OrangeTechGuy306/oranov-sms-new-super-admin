'use client';

import React, { useState } from 'react';
import { TimeSeriesDataPoint } from '@/lib/types/analytics';
import { Table, BarChart2 } from 'lucide-react';

interface AnalyticsAreaChartProps {
  title: string;
  description?: string;
  data: TimeSeriesDataPoint[];
  unit?: string;
  color?: string; // e.g. '#3b82f6'
  gradientId?: string;
  height?: number;
}

export function AnalyticsAreaChart({
  title,
  description,
  data,
  unit = 'Units',
  color = '#3b82f6',
  gradientId = 'areaChartGrad',
  height = 220,
}: AnalyticsAreaChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
        <div className="h-44 flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
          No time series observations recorded for this reporting scope.
        </div>
      </div>
    );
  }

  // Chart coordinate calculations
  const width = 640;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = 0;
  const range = maxVal - minVal;

  const getX = (idx: number) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (idx / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  // Build SVG path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${padding.top + chartHeight} L ${getX(0)},${padding.top + chartHeight} Z`;

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

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
          aria-label={showTable ? 'Switch to chart visualization' : 'Switch to tabular representation'}
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
        <div className="overflow-x-auto max-h-56 border border-border rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold sticky top-0">
              <tr>
                <th className="p-2">Period / Date</th>
                <th className="p-2 text-right">Value ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((d, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="p-2 text-foreground font-medium">{d.label || d.date}</td>
                  <td className="p-2 text-right font-mono font-bold text-primary">{d.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = padding.top + chartHeight * pct;
              const valLabel = Math.round(maxVal - pct * range);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fontSize="9"
                    textAnchor="end"
                    className="fill-muted-foreground font-mono"
                  >
                    {valLabel}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Line stroke */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points & hover detection */}
            {data.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.value);
              const isHovered = hoverIndex === i;
              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? '#ffffff' : color}
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all"
                  />
                  {/* Invisible hit-target for ease of touch/hover */}
                  <circle cx={cx} cy={cy} r="14" fill="transparent" />
                </g>
              );
            })}

            {/* X-axis labels */}
            {data.map((d, i) => {
              // Show label every N steps depending on density
              const show = data.length <= 8 || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0;
              if (!show) return null;
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 8}
                  fontSize="9"
                  textAnchor="middle"
                  className="fill-muted-foreground font-medium"
                >
                  {d.label || d.date}
                </text>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && hoverIndex !== null && (
            <div
              className="absolute z-10 pointer-events-none bg-popover text-popover-foreground border border-border px-2.5 py-1.5 rounded-lg shadow-lg text-[11px] font-medium"
              style={{
                left: `${(getX(hoverIndex) / width) * 100}%`,
                top: '10px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold text-foreground">{hoveredPoint.label || hoveredPoint.date}</div>
              <div className="text-primary font-mono font-bold">
                {hoveredPoint.value.toLocaleString()} {unit}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
