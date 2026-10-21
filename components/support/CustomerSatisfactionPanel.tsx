'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { CustomerSatisfactionRecord } from '@/lib/types/support-desk';
import { exportCsatToCsv } from '@/lib/support/exporter';
import {
  Star,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  MessageSquare,
  ShieldAlert,
  Search,
  Check,
  User,
  ExternalLink,
} from 'lucide-react';

export function CustomerSatisfactionPanel() {
  const {
    csatRecords,
    organizations,
    supportTickets,
    reviewCsatRecord,
  } = usePlatformStore();

  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Rating metrics
  const validRecords = csatRecords.filter((r) => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  const totalResponses = validRecords.length;

  const averageRating =
    totalResponses > 0
      ? Math.round((validRecords.reduce((sum, r) => sum + r.rating, 0) / totalResponses) * 10) / 10
      : null;

  const satisfiedCount = validRecords.filter((r) => r.rating >= 4).length;
  const satisfactionRate = totalResponses > 0 ? Math.round((satisfiedCount / totalResponses) * 100) : null;

  // Star distribution breakdown
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    validRecords.forEach((r) => {
      const star = r.rating as 1 | 2 | 3 | 4 | 5;
      if (counts[star] !== undefined) counts[star] += 1;
    });
    return counts;
  }, [validRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return csatRecords.filter((r) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const org = organizations.find((o) => o.id === r.organizationId);
        const matchComment = r.comment?.toLowerCase().includes(query);
        const matchOrg = org ? org.name.toLowerCase().includes(query) : false;
        if (!matchComment && !matchOrg) return false;
      }

      if (ratingFilter !== 'all') {
        if (ratingFilter === 'positive' && r.rating < 4) return false;
        if (ratingFilter === 'neutral' && r.rating !== 3) return false;
        if (ratingFilter === 'negative' && r.rating > 2) return false;
        if (['1', '2', '3', '4', '5'].includes(ratingFilter) && r.rating !== Number(ratingFilter)) {
          return false;
        }
      }

      if (orgFilter !== 'all' && r.organizationId !== orgFilter) return false;
      if (reviewFilter === 'reviewed' && !r.reviewed) return false;
      if (reviewFilter === 'pending' && r.reviewed) return false;

      return true;
    }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [csatRecords, searchTerm, ratingFilter, orgFilter, reviewFilter, organizations]);

  // Export CSV
  const handleExportCsv = () => {
    const csv = exportCsatToCsv(filteredRecords, organizations);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customer-satisfaction-csat-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render Stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Customer Satisfaction (CSAT) Governance</h3>
            <p className="text-muted-foreground">
              Direct survey ratings submitted by school administrators and teachers upon ticket resolution.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-medium shrink-0 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSAT CSV
        </button>
      </div>

      {/* Metrics & Histogram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall CSAT Card */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Average Satisfaction Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {averageRating !== null ? averageRating.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-muted-foreground">/ 5.0 rating</span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            {renderStars(Math.round(averageRating || 0))}
            <span className="text-[11px] text-muted-foreground ml-1">({totalResponses} total surveys)</span>
          </div>
        </div>

        {/* Positive CSAT Rate */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Positive Experience Rate (4+ Stars)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {satisfactionRate !== null ? `${satisfactionRate}%` : '--'}
            </span>
            <span className="text-xs text-muted-foreground">satisfied schools</span>
          </div>

          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${satisfactionRate || 0}%` }}
            />
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Rating Distribution
          </span>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-[11px]">
                <span className="w-12 font-medium text-muted-foreground flex items-center gap-0.5">
                  {star} <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                </span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feedback comment or school name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
          >
            <option value="all">All Ratings</option>
            <option value="positive">Positive (4-5 Stars)</option>
            <option value="neutral">Neutral (3 Stars)</option>
            <option value="negative">Negative (1-2 Stars)</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="2">2 Stars Only</option>
            <option value="1">1 Star Only</option>
          </select>
        </div>

        <div>
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
          >
            <option value="all">All Review States</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Feedback Feed / Table */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
            No feedback responses match the selected filters.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const org = organizations.find((o) => o.id === record.organizationId);
            const ticket = supportTickets.find((t) => t.id === record.ticketId);

            return (
              <div
                key={record.id}
                className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {renderStars(record.rating)}
                      <span className="font-bold text-xs text-foreground">
                        {record.rating} out of 5 stars
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {org && <span className="font-medium text-foreground">{org.name}</span>}
                      {ticket && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-primary">{ticket.ticketNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        record.reviewed
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {record.reviewed ? 'Reviewed' : 'Pending Review'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(record.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {record.comment && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-foreground leading-relaxed italic">
                    &ldquo;{record.comment}&rdquo;
                  </div>
                )}

                {record.reviewerNotes && (
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-primary">
                    Operator Review Note: {record.reviewerNotes}
                  </div>
                )}

                {/* Review action button */}
                {!record.reviewed && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50 text-xs">
                    <button
                      onClick={() => reviewCsatRecord(record.id, 'Reviewed and verified in customer success log.')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-muted font-medium text-foreground transition-colors"
                    >
                      <Check className="w-3 h-3 text-emerald-500" /> Mark as Reviewed
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
