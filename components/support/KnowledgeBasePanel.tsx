'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  KnowledgeBaseArticle,
  SupportCategoryKey,
  CreateKbArticleInput,
} from '@/lib/types/support-desk';
import { SUPPORT_CATEGORIES } from '@/lib/support/fixtures';
import {
  BookOpen,
  Search,
  Plus,
  Tag,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  X,
  FileText,
  Globe,
  ThumbsUp,
  Info,
} from 'lucide-react';

export function KnowledgeBasePanel() {
  const { kbArticles, createKbArticle, updateKbArticle, setKbArticleStatus, deleteKbArticle } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Preview Article Modal
  const [previewArticle, setPreviewArticle] = useState<KnowledgeBaseArticle | null>(null);

  // Create Article Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SupportCategoryKey>('general_assistance');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [locale, setLocale] = useState('en-NG');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return kbArticles.filter((art) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = art.title.toLowerCase().includes(query);
        const matchSummary = art.summary.toLowerCase().includes(query);
        const matchContent = art.content.toLowerCase().includes(query);
        const matchTags = art.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchSummary && !matchContent && !matchTags) return false;
      }

      if (categoryFilter !== 'all' && art.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && art.status !== statusFilter) return false;

      return true;
    });
  }, [kbArticles, searchTerm, categoryFilter, statusFilter]);

  // Create Article Submit
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Article title is required.');
      return;
    }
    if (!content.trim()) {
      setFormError('Article content is required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const input: CreateKbArticleInput = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      tags,
      status,
      locale,
    };

    const res = createKbArticle(input);
    if (!res.success) {
      setFormError(res.error || 'Failed to create article');
      return;
    }

    setIsCreateOpen(false);
    setTitle('');
    setSummary('');
    setContent('');
    setTagsInput('');
  };

  // Toggle publish
  const handleTogglePublish = (article: KnowledgeBaseArticle) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    setKbArticleStatus(article.id, newStatus);
    if (previewArticle?.id === article.id) {
      setPreviewArticle({ ...article, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice & Context Header */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <BookOpen className="w-4 h-4" />
          <span>Support Knowledge Base & Assistance Runbooks</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Operational repository of verified help articles, CBT troubleshooting guides, and school setup procedures.
          Articles assist support operators with canned troubleshooting answers and standard operating procedures (SOPs).
        </p>
      </div>

      {/* Top Search, Filter, and Action Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles by title, tag, or content keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New Article
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-border/50 text-xs">
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-border bg-background"
            >
              <option value="all">All Support Categories</option>
              {SUPPORT_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-border bg-background"
            >
              <option value="all">All Publishing States</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl">
            No knowledge base articles match your query.
          </div>
        ) : (
          filteredArticles.map((article) => {
            const cat = SUPPORT_CATEGORIES.find((c) => c.key === article.category);
            return (
              <div
                key={article.id}
                className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                      {cat ? cat.label : article.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        article.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {article.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>

                  <p className="text-xs text-muted-foreground line-clamp-3">{article.summary}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer metadata and actions */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-500" />
                        {article.helpfulCount}
                      </span>
                      <span>•</span>
                      <span>{article.locale}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(article)}
                        className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted font-medium"
                      >
                        {article.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => setPreviewArticle(article)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Read Full Article"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteKbArticle(article.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Read / Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-start justify-between gap-3 bg-muted/20">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {previewArticle.category} • {previewArticle.locale}
                </span>
                <h3 className="font-bold text-base text-foreground">{previewArticle.title}</h3>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-muted-foreground italic">
                {previewArticle.summary}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-line leading-relaxed">
                {previewArticle.content}
              </div>

              {previewArticle.tags.length > 0 && (
                <div className="pt-3 border-t border-border flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px]">Tags:</span>
                  {previewArticle.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border flex items-center justify-between text-xs bg-muted/10">
              <span className="text-muted-foreground">
                Last updated:{' '}
                {new Date(previewArticle.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePublish(previewArticle)}
                  className="px-3 py-1 rounded-lg border border-border hover:bg-muted font-medium text-foreground"
                >
                  {previewArticle.status === 'published' ? 'Switch to Draft' : 'Publish Article'}
                </button>
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Create Support Knowledge Article</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateArticle} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Troubleshooting Offline CBT Sync during Exam Periods"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Summary / Abstract</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief synopsis for quick operator scanning"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                  >
                    {SUPPORT_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Article Content (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Document step-by-step resolution instructions and runbook commands"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="cbt, offline-sync, cache, exams"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Create Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
