'use client';

import React, { useState, useMemo } from 'react';
import {
  OperationalComponent,
  MetricDefinition,
  MetricObservation,
  MetricTimeWindow,
  MetricAggregationType,
} from '@/lib/system-health/types';
import {
  METRIC_DEFINITIONS,
  DETERMINISTIC_METRIC_OBSERVATIONS,
} from '@/lib/system-health/fixtures';
import {
  filterMetricObservations,
  aggregateMetricSeries,
  exportMetricsToCsv,
} from '@/lib/system-health/evaluator';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  BarChart2,
  LineChart,
  Table as TableIcon,
  Download,
  Calendar,
  Clock,
  RotateCcw,
  Info,
  Layers,
  Activity,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MetricExplorerWorkspaceProps {
  components: OperationalComponent[];
}

export function MetricExplorerWorkspace({ components }: MetricExplorerWorkspaceProps) {
  // Selection state
  const [selectedComponentId, setSelectedComponentId] = useState<string>(
    'comp_core_api_gateway'
  );
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    'metric_request_volume'
  );
  const [timeWindow, setTimeWindow] = useState<MetricTimeWindow>('24h');
  const [aggregation, setAggregation] = useState<MetricAggregationType>('average');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; obs: MetricObservation } | null>(null);

  // Find component & metric definition
  const selectedComponent = useMemo(
    () => components.find((c) => c.id === selectedComponentId) || components[0],
    [components, selectedComponentId]
  );

  const selectedMetric = useMemo(
    () => METRIC_DEFINITIONS.find((m) => m.id === selectedMetricId) || METRIC_DEFINITIONS[0],
    [selectedMetricId]
  );

  // Filter observations
  const observations = useMemo(() => {
    return filterMetricObservations(
      DETERMINISTIC_METRIC_OBSERVATIONS,
      {
        componentId: selectedComponentId,
        metricId: selectedMetricId,
        timeWindow,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        aggregation,
      }
    );
  }, [selectedComponentId, selectedMetricId, timeWindow, startDate, endDate, aggregation]);

  // Aggregate statistics
  const stats = useMemo(() => {
    return aggregateMetricSeries(observations);
  }, [observations]);

  const handleResetFilters = () => {
    setSelectedComponentId('comp_core_api_gateway');
    setSelectedMetricId('metric_request_volume');
    setTimeWindow('24h');
    setAggregation('average');
    setStartDate('');
    setEndDate('');
  };

  const handleExportCsv = () => {
    const csv = exportMetricsToCsv(
      observations,
      selectedMetric.name,
      selectedComponent?.name || selectedComponentId
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetry_${selectedComponentId}_${selectedMetricId}_${timeWindow}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Calculation
  const chartData = useMemo(() => {
    const validObs = observations.filter((o) => !o.isMissing && o.value !== null);
    if (validObs.length === 0) return null;

    const width = 800;
    const height = 240;
    const padding = { top: 20, right: 30, bottom: 35, left: 55 };

    const minVal = Math.min(...validObs.map((o) => o.value as number));
    const maxVal = Math.max(...validObs.map((o) => o.value as number));
    const range = Math.max(1, maxVal - minVal);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = observations.map((obs, idx) => {
      const x = padding.left + (idx / Math.max(1, observations.length - 1)) * chartWidth;
      const y = obs.isMissing || obs.value === null
        ? null
        : padding.top + chartHeight - (((obs.value as number) - minVal) / range) * chartHeight;
      return { x, y, obs };
    });

    // Generate SVG path for line
    let pathD = '';
    let areaD = '';
    let firstPoint = true;

    points.forEach((pt) => {
      if (pt.y !== null) {
        if (firstPoint) {
          pathD += `M ${pt.x} ${pt.y}`;
          areaD += `M ${pt.x} ${padding.top + chartHeight} L ${pt.x} ${pt.y}`;
          firstPoint = false;
        } else {
          pathD += ` L ${pt.x} ${pt.y}`;
          areaD += ` L ${pt.x} ${pt.y}`;
        }
      }
    });

    if (areaD) {
      const lastValid = [...points].reverse().find((p) => p.y !== null);
      if (lastValid) {
        areaD += ` L ${lastValid.x} ${padding.top + chartHeight} Z`;
      }
    }

    return {
      width,
      height,
      padding,
      minVal,
      maxVal,
      points,
      pathD,
      areaD,
      chartHeight,
      chartWidth,
    };
  }, [observations]);

  return (
    <div className="space-y-6">
      {/* Demonstration Banner */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="info" size="md" dot>
            Demo data — no live monitoring connection
          </Badge>
          <span className="text-muted-foreground">
            Deterministic baseline fixtures. Units, time filters, and P95 aggregations operate purely in client memory.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showDefinitions ? 'Hide Metric Specs' : 'Metric Documentation'}
          </button>
        </div>
      </div>

      {/* Metric Definitions Card */}
      {showDefinitions && (
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Observability Metric Specification & Expected Telemetry Sources
            </h4>
            <Badge variant="purple" size="sm">Architecture Schema</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {METRIC_DEFINITIONS.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{m.name}</span>
                  <Badge variant="neutral" size="sm">{m.unit}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{m.description}</p>
                <div className="pt-1.5 border-t border-border/40 text-[10px] space-y-0.5 font-mono text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Source:</span> {m.expectedSource}</p>
                  <p><span className="font-semibold text-foreground">Backend Req:</span> {m.backendIntegrationRequirement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Exploration Controls */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Component Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Target Component
            </label>
            <select
              value={selectedComponentId}
              onChange={(e) => setSelectedComponentId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Telemetry Metric
            </label>
            <select
              value={selectedMetricId}
              onChange={(e) => setSelectedMetricId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {METRIC_DEFINITIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Time Window Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Rolling Time Window
            </label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as MetricTimeWindow)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Aggregation Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Aggregation Method
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as MetricAggregationType)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="average">Average (Mean)</option>
              <option value="p95">95th Percentile (P95)</option>
              <option value="max">Maximum Peak</option>
              <option value="sum">Summed Volume</option>
            </select>
          </div>
        </div>

        {/* Custom Date Filters if active */}
        {timeWindow === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Start:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">End:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              Chart View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Tabular Breakdown ({observations.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={observations.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-muted text-foreground border border-border rounded-lg font-semibold text-xs cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Export Filtered CSV
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset metric explorer filters"
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Current Telemetry"
          value={stats.current !== null ? `${stats.current} ${selectedMetric.unit}` : 'Missing'}
          subtitle="Latest observation"
          icon={<Activity className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Minimum Observed"
          value={stats.min !== null ? `${stats.min} ${selectedMetric.unit}` : '—'}
          subtitle="Window lowest"
          icon={<Clock className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Maximum Peak"
          value={stats.max !== null ? `${stats.max} ${selectedMetric.unit}` : '—'}
          subtitle="Window peak"
          icon={<BarChart2 className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Average (Mean)"
          value={stats.avg !== null ? `${stats.avg} ${selectedMetric.unit}` : '—'}
          subtitle="Window average"
          icon={<Layers className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="95th Percentile"
          value={stats.p95 !== null ? `${stats.p95} ${selectedMetric.unit}` : '—'}
          subtitle="Tail distribution"
          icon={<Activity className="w-4 h-4 text-purple-500" />}
        />
        <StatCard
          title="Missing Observations"
          value={stats.missingCount}
          subtitle={stats.missingCount > 0 ? 'Explicitly isolated' : 'Complete dataset'}
          icon={<AlertCircle className={`w-4 h-4 ${stats.missingCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />}
        />
      </div>

      {/* Presentation View (Chart or Table) */}
      {viewMode === 'chart' ? (
        <div className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <LineChart className="w-4 h-4 text-primary" />
                {selectedMetric.name} Trend Analysis
              </h3>
              <p className="text-xs text-muted-foreground">
                Displaying deterministic observations for {selectedComponent?.name}. Time range: {timeWindow}.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span>Unit: {selectedMetric.unit}</span>
              <span>•</span>
              <span>Observations: {observations.length}</span>
            </div>
          </div>

          {/* SVG Interactive Chart */}
          {chartData ? (
            <div className="relative w-full overflow-hidden select-none">
              <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                className="w-full h-64 sm:h-72 overflow-visible"
              >
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = chartData.padding.top + chartData.chartHeight * pct;
                  const labelVal = Number((chartData.maxVal - pct * (chartData.maxVal - chartData.minVal)).toFixed(1));
                  return (
                    <g key={idx}>
                      <line
                        x1={chartData.padding.left}
                        y1={y}
                        x2={chartData.width - chartData.padding.right}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={chartData.padding.left - 8}
                        y={y + 3}
                        fontSize="9"
                        textAnchor="end"
                        className="fill-muted-foreground font-mono"
                      >
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                {chartData.areaD && (
                  <path d={chartData.areaD} fill="url(#metricGradient)" />
                )}

                {/* Main line */}
                {chartData.pathD && (
                  <path
                    d={chartData.pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {chartData.points.map((pt, idx) => {
                  if (pt.y === null) {
                    // Render missing indicator
                    return (
                      <g key={idx}>
                        <line
                          x1={pt.x}
                          y1={chartData.padding.top}
                          x2={pt.x}
                          y2={chartData.padding.top + chartData.chartHeight}
                          stroke="#ef4444"
                          strokeDasharray="2 2"
                          strokeOpacity="0.4"
                        />
                        <text
                          x={pt.x}
                          y={chartData.padding.top + chartData.chartHeight - 4}
                          fontSize="8"
                          textAnchor="middle"
                          fill="#ef4444"
                          className="font-mono font-bold"
                        >
                          MISSING
                        </text>
                      </g>
                    );
                  }

                  const validY = pt.y;

                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={validY}
                      r="4"
                      className="fill-primary stroke-background cursor-pointer hover:r-6 transition-all"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint({ x: pt.x, y: validY, obs: pt.obs })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}

                {/* X-axis baseline */}
                <line
                  x1={chartData.padding.left}
                  y1={chartData.padding.top + chartData.chartHeight}
                  x2={chartData.width - chartData.padding.right}
                  y2={chartData.padding.top + chartData.chartHeight}
                  stroke="currentColor"
                  strokeOpacity="0.3"
                />

                {/* X-axis timestamps */}
                {chartData.points.map((pt, idx) => {
                  if (idx % Math.ceil(chartData.points.length / 5) !== 0 && idx !== chartData.points.length - 1) {
                    return null;
                  }
                  return (
                    <text
                      key={idx}
                      x={pt.x}
                      y={chartData.height - 10}
                      fontSize="9"
                      textAnchor="middle"
                      className="fill-muted-foreground font-mono"
                    >
                      {formatDate(pt.obs.timestamp, true).split(',')[1] || pt.obs.timestamp.slice(11, 16)}
                    </text>
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute bg-popover text-popover-foreground p-2 rounded-lg border border-border shadow-md text-xs font-mono pointer-events-none -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(hoveredPoint.x / chartData.width) * 100}%`,
                    top: `${(hoveredPoint.y! / chartData.height) * 100}%`,
                  }}
                >
                  <p className="font-bold text-foreground">
                    {hoveredPoint.obs.value} {hoveredPoint.obs.unit}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(hoveredPoint.obs.timestamp, true)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No telemetry observations recorded for this component and window filter.
            </div>
          )}
        </div>
      ) : (
        /* Tabular Observations View */
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-primary" />
              Tabular Metric Time-Series Observations ({observations.length} records)
            </h4>
            <span className="text-[11px] font-mono text-muted-foreground">Deterministic Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  <th className="py-2.5 px-4">Observation Timestamp</th>
                  <th className="py-2.5 px-4">Component</th>
                  <th className="py-2.5 px-4">Metric</th>
                  <th className="py-2.5 px-4 text-right">Value</th>
                  <th className="py-2.5 px-4">Unit</th>
                  <th className="py-2.5 px-4">Source Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-muted/20">
                    <td className="py-2 px-4 whitespace-nowrap text-foreground">
                      {formatDate(obs.timestamp, true)}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-muted-foreground">
                      {selectedComponent?.name}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-muted-foreground">
                      {selectedMetric.name}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-right font-bold">
                      {obs.isMissing || obs.value === null ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">MISSING</span>
                      ) : (
                        <span className="text-foreground">{obs.value}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-muted-foreground">
                      {obs.unit}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <Badge variant={obs.isMissing ? 'error' : 'info'} size="sm">
                        {obs.sourceStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
