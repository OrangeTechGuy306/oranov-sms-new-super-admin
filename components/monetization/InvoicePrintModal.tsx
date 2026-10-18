'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Invoice, Organization, SubscriptionPlan } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Printer, ShieldAlert } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  organization?: Organization;
  plan?: SubscriptionPlan;
  onClose: () => void;
}

export function InvoicePrintModal({ invoice, organization, plan, onClose }: InvoicePrintModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const balance = Math.max(0, invoice.amountDue - (invoice.amountPaid || 0));

  return (
    <Modal
      isOpen={!!invoice}
      onClose={onClose}
      title={`Demo Invoice: ${invoice.invoiceNumber}`}
      size="lg"
    >
      <div className="space-y-6 text-foreground print:p-0">
        {/* Simulation Watermark Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Simulated Billing Document:</strong> For SaaS Super-Admin demonstration purposes only. Not a legally binding tax invoice.
            </span>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded text-xs font-semibold shadow-2xs cursor-pointer print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>

        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
              EduSuite Platform SaaS Billing
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-1">INVOICE</h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Ref: {invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <Badge status={invoice.status} size="md" />
            <p className="text-xs text-muted-foreground mt-2">
              Issued: <strong className="text-foreground">{formatDate(invoice.issueDate)}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Due Date: <strong className="text-foreground">{formatDate(invoice.dueDate)}</strong>
            </p>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Billed To (Tenant Organization)
            </span>
            <p className="font-bold text-sm text-foreground">{organization?.name || 'School Organization'}</p>
            <p className="text-muted-foreground font-mono">Org Code: {organization?.code || '—'}</p>
            <p className="text-muted-foreground">{organization?.contact?.email || 'billing@school.edu'}</p>
            <p className="text-muted-foreground">{organization?.contact?.city || 'London'}, {organization?.contact?.country || 'United Kingdom'}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Platform Provider
            </span>
            <p className="font-bold text-sm text-foreground">EduSuite Global SaaS Platforms Ltd.</p>
            <p className="text-muted-foreground font-mono">Tax ID: DEMO-GB-992-0012</p>
            <p className="text-muted-foreground">finance@edusuite-saas.internal</p>
            <p className="text-muted-foreground">Global Operations Center, London EC2A</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Quantity / Period</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3">
                  <p className="font-bold text-foreground">
                    {plan ? `${plan.name} Subscription` : 'SaaS Platform Subscription'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Platform hosting, canonical module access, and capacity allocations
                  </p>
                </td>
                <td className="p-3 text-right font-mono text-muted-foreground">1 Cycle</td>
                <td className="p-3 text-right font-mono font-medium">
                  {formatCurrency(invoice.subtotal ?? invoice.amountDue, invoice.currency)}
                </td>
                <td className="p-3 text-right font-mono font-bold text-foreground">
                  {formatCurrency(invoice.subtotal ?? invoice.amountDue, invoice.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="flex justify-end text-xs">
          <div className="w-72 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal ?? invoice.amountDue, invoice.currency)}</span>
            </div>
            {invoice.discountAmount !== undefined && invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Promotional Discount:</span>
                <span className="font-mono">- {formatCurrency(invoice.discountAmount, invoice.currency)}</span>
              </div>
            )}
            {invoice.taxAmount !== undefined && invoice.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Applicable VAT / Tax:</span>
                <span className="font-mono">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
              <span>Invoice Total:</span>
              <span className="font-mono text-base">{formatCurrency(invoice.amountDue, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Recorded Paid Amount:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(invoice.amountPaid || 0, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <span>Remaining Balance:</span>
              <span className={`font-mono text-sm ${balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatCurrency(balance, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Settlement Terms & Simulation Disclosure:</p>
          <p>
            Payment terms: Net 30 from issue date. Electronic bank transfers to virtual account IBAN GB99EDUS000192837482.
          </p>
          <p className="italic">
            {invoice.notes || 'Routine subscription settlement invoice generated by SaaS platform billing scheduler.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
