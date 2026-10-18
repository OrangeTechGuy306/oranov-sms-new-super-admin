'use client';

import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  disclaimer?: string;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'primary',
  disclaimer = 'Development Note: This action updates client-side mock records. Real production enforcement requires backend authorization and tenant provisioning.',
  isLoading = false,
  isConfirmDisabled = false,
}: ConfirmDialogProps) {
  const variantIcons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />,
    primary: <Info className="w-6 h-6 text-primary shrink-0" />,
  };

  const confirmBtnStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-800',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-800',
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {variantIcons[variant]}
          <span>{title}</span>
        </div>
      }
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground/80 hover:bg-muted transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading || isConfirmDisabled}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50',
              confirmBtnStyles[variant]
            )}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-muted-foreground">
        <div>{description}</div>

        {disclaimer && (
          <div className="p-3 bg-muted/60 border border-border rounded-lg text-xs text-muted-foreground/90 flex gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p>{disclaimer}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
