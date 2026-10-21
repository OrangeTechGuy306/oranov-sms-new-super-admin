'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CommunicationTemplate, TemplateVersionEntry } from '@/lib/types/communications';
import { formatDate } from '@/lib/utils/formatters';
import { GitCommit, RotateCcw } from 'lucide-react';

interface TemplateVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CommunicationTemplate | null;
  versionHistory: TemplateVersionEntry[];
  onRestoreVersion: (versionId: string) => void;
}

interface TemplateVersionHistoryContentProps {
  versionHistory: TemplateVersionEntry[];
  onRestoreVersion: (versionId: string) => void;
  onClose: () => void;
}

function TemplateVersionHistoryContent({
  versionHistory,
  onRestoreVersion,
  onClose,
}: TemplateVersionHistoryContentProps) {
  // Selected version for inspection
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versionHistory[0]?.id || ''
  );

  const selectedVersion = versionHistory.find((v) => v.id === selectedVersionId) || versionHistory[0];

  return (
    <div className="space-y-5">
      {/* Version List & Comparison Split View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Version Selector Sidebar */}
          <div className="space-y-2 border-r border-border pr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Version Timeline ({versionHistory.length})
            </span>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
              {versionHistory.map((ver) => {
                const isSelected = ver.id === selectedVersion?.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersionId(ver.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground font-medium'
                        : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground">{ver.versionNumber}</span>
                      {ver.isCurrent ? (
                        <Badge variant="success">Current</Badge>
                      ) : (
                        <Badge variant="neutral">{ver.status}</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                      {ver.changeSummary}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 block mt-1">
                      {formatDate(ver.createdAt)} • {ver.author}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Version Detail & Diff Pane */}
          <div className="md:col-span-2 space-y-4">
            {selectedVersion ? (
              <div className="space-y-4">
                {/* Version Metadata Header */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <GitCommit className="w-4 h-4 text-primary" />
                      Snapshot Details ({selectedVersion.versionNumber})
                    </span>
                    {selectedVersion.isCurrent && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Active Production Version
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-[11.5px]">
                    <strong>Summary:</strong> {selectedVersion.changeSummary}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>Author: <strong>{selectedVersion.author}</strong></span>
                    <span>•</span>
                    <span>Created: <strong>{formatDate(selectedVersion.createdAt)}</strong></span>
                    {selectedVersion.approvalNotes && (
                      <>
                        <span>•</span>
                        <span>Approval: <em>{selectedVersion.approvalNotes}</em></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Subject snapshot if applicable */}
                {selectedVersion.subject && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-muted-foreground block text-[11px]">
                      Historical Subject Line:
                    </span>
                    <div className="p-2.5 rounded-lg border border-border bg-background font-mono text-xs">
                      {selectedVersion.subject}
                    </div>
                  </div>
                )}

                {/* Body snapshot */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-muted-foreground block text-[11px]">
                    Historical Template Content:
                  </span>
                  <div className="p-3 rounded-lg border border-border bg-background font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                    {selectedVersion.body}
                  </div>
                </div>

                {/* Actions: Restore into Draft */}
                {!selectedVersion.isCurrent && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5 text-xs">
                    <div>
                      <span className="font-semibold text-foreground block">
                        Restore this snapshot?
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Restores subject and body into a new working draft without overwriting audit history.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onRestoreVersion(selectedVersion.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore to Draft
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                Select a version from the timeline to view details.
              </div>
            )}
          </div>
        </div>

        {/* Dialog Close */}
        <div className="flex items-center justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            Close Version History
          </button>
        </div>
      </div>
  );
}

export function TemplateVersionHistoryModal({
  isOpen,
  onClose,
  template,
  versionHistory,
  onRestoreVersion,
}: TemplateVersionHistoryModalProps) {
  if (!isOpen || !template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Version History: ${template.name}`}
      description="Inspect version snapshots, point-in-time changes, and restore prior content into a new draft."
      size="xl"
    >
      <TemplateVersionHistoryContent
        key={template.id}
        versionHistory={versionHistory}
        onRestoreVersion={onRestoreVersion}
        onClose={onClose}
      />
    </Modal>
  );
}
