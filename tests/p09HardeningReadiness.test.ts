import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { platformStore } from '../lib/data/platform-store';
import { isPlatformDevControlsEnabled } from '../lib/auth/platformAuthConfig';

const DASHBOARD_ROOT = process.cwd();

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(DASHBOARD_ROOT, relPath), 'utf8');
}

function collectTsxFiles(dirRel: string): string[] {
  const dirAbs = path.join(DASHBOARD_ROOT, dirRel);
  if (!fs.existsSync(dirAbs)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsxFiles(rel));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(rel);
    }
  }
  return results;
}

describe('Phase P0-9: Super Admin Final Hardening, RBAC, A11y & Release Readiness', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('1. Maker-Checker Change Governance & Authenticated Actor Attribution', () => {
    test('enforces dual-control anti-self-approval and approval prerequisite before applied_locally', () => {
      const proposer = {
        id: 'usr_proposer_01',
        name: 'Amina Bello',
        role: 'platform_admin' as const,
      };
      const renamedSelf = {
        id: 'usr_proposer_01',
        name: 'Amina B. Renamed',
        role: 'platform_admin' as const,
      };
      const checker = {
        id: 'usr_checker_02',
        name: 'Chidi Okafor',
        role: 'super_admin' as const,
      };

      const created = platformStore.createChangeProposal(
        {
          title: 'Harden CBT Lockdown Flag',
          description: 'Promote strict CBT tab lock configuration',
          reason: 'Prevent client bypass during high-stakes examinations',
          scope: 'feature_flag',
          targetEntity: 'FeatureFlag',
          targetId: 'feat.cbt.instant_scoring',
          diff: [
            {
              field: 'enabled',
              oldValue: false,
              newValue: true,
              previousValue: false,
              proposedValue: true,
            },
          ],
        },
        proposer
      );

      assert.equal(created.success, true);
      assert.ok(created.proposal);
      assert.equal(created.proposal.author.id, proposer.id);
      assert.equal(created.proposal.author.name, proposer.name);

      const proposalId = created.proposal.id;

      // Move to pending_review
      const pendingRes = platformStore.transitionProposalStatus(
        proposalId,
        'pending_review',
        'Ready for independent review',
        proposer
      );
      assert.equal(pendingRes.success, true);

      // Cannot apply_locally prior to approval
      const prematureApply = platformStore.transitionProposalStatus(
        proposalId,
        'applied_locally',
        'Trying to skip approval',
        checker
      );
      assert.equal(prematureApply.success, false);
      assert.match(prematureApply.error || '', /approved/i);

      // Same user (both by exact object and by same ID with renamed display name) cannot self-approve
      const selfApprove = platformStore.transitionProposalStatus(
        proposalId,
        'approved',
        'Self approval attempt',
        proposer
      );
      assert.equal(selfApprove.success, false);
      assert.match(selfApprove.error || '', /Self-approval is prohibited/i);

      const sameIdSelfApprove = platformStore.transitionProposalStatus(
        proposalId,
        'approved',
        'Same ID self approval attempt',
        renamedSelf
      );
      assert.equal(sameIdSelfApprove.success, false);
      assert.match(sameIdSelfApprove.error || '', /Self-approval is prohibited/i);

      // Second independent administrator can approve, then apply
      const approved = platformStore.transitionProposalStatus(
        proposalId,
        'approved',
        'Dual-control check satisfied',
        checker
      );
      assert.equal(approved.success, true);
      assert.equal(approved.proposal?.status, 'approved');
      assert.equal(approved.proposal?.reviewer?.id, checker.id);
      assert.equal(approved.proposal?.reviewer?.name, checker.name);

      const applied = platformStore.transitionProposalStatus(
        proposalId,
        'applied_locally',
        'Applied after independent approval',
        checker
      );
      assert.equal(applied.success, true);
      assert.equal(applied.proposal?.status, 'applied_locally');
    });

    test('resolves authenticated actor object cleanly for rollout plans, version restores, and config imports', () => {
      const customActor = {
        id: 'usr_security_09',
        name: 'Tunde Adeyemi',
        role: 'security_admin' as const,
      };

      const rolloutRes = platformStore.applyRolloutPlan(
        {
          flagKey: 'feat.cbt.instant_scoring',
          strategy: 'percentage_rollout',
          targetPercentage: 25,
          notes: 'Quarter canary verification',
        },
        customActor
      );
      assert.equal(rolloutRes.success, true);
      const rolloutAudit = platformStore.getAuditEvents()[0];
      assert.equal(rolloutAudit.actor.id, customActor.id);
      assert.equal(rolloutAudit.actor.name, customActor.name);

      const versions = platformStore.getConfigVersions();
      assert.ok(versions.length > 0);
      const restoreRes = platformStore.restoreConfigVersion(versions[0].id, customActor);
      assert.equal(restoreRes.success, true);
      const restoreAudit = platformStore.getAuditEvents()[0];
      assert.equal(restoreAudit.actor.id, customActor.id);
      assert.equal(restoreAudit.actor.name, customActor.name);

      const importPkg = {
        schemaVersion: '1.0.0' as const,
        exportedAt: new Date().toISOString(),
        exportedBy: customActor.name,
        exportScope: 'flags_only' as const,
        isDemonstrationData: true as const,
        flags: [
          {
            id: 'flag_p09_audit_01',
            key: 'feat.p09.smoke_test_flag',
            name: 'P09 Smoke Flag',
            description: 'Simulated verification flag',
            category: 'examinations_cbt' as const,
            lifecycle: 'draft' as const,
            defaultValue: false,
            enabled: false,
            scope: 'global' as const,
            environment: 'development' as const,
            rolloutStrategy: 'all_tenants' as const,
            risk: 'standard' as const,
          },
        ],
      };
      const importRes = platformStore.importConfiguration(importPkg, customActor);
      assert.equal(importRes.success, true);
      const importAudit = platformStore.getAuditEvents()[0];
      assert.equal(importAudit.actor.id, customActor.id);
      assert.equal(importAudit.actor.name, customActor.name);
    });
  });

  describe('2. Production Dev-Control Gating, RBAC Action Guards & No Impersonation', () => {
    test('disables platform dev reset controls in production mode even when mock flag is set', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      assert.equal(isPlatformDevControlsEnabled(), false);
    });

    test('PlatformStoreContext enforces guardPerm and authenticated actor precedence across sensitive actions', () => {
      const ctxSrc = readSource('components/providers/PlatformStoreContext.tsx');
      assert.ok(ctxSrc.includes('isPlatformDevControlsEnabled'));
      assert.ok(ctxSrc.includes('authenticatedActorIdentity'));
      assert.ok(ctxSrc.includes('authenticatedActorName'));

      const guardedActions = [
        "guardPerm('organizations.lifecycle.manage'",
        "guardPerm('system.features.toggle'",
        "guardPerm('platform.settings.update'",
        "guardPerm('system.maintenance.manage'",
        "guardPerm('communications.notices.manage'",
        "guardPerm('support.tickets.manage'",
        "guardPerm('audit.governance.manage'",
      ];
      for (const expected of guardedActions) {
        assert.ok(ctxSrc.includes(expected), `Expected ${expected} inside PlatformStoreContext.tsx`);
      }

      // Reset fixtures restricted behind dev controls + maintenance permission
      assert.ok(ctxSrc.includes('if (!isPlatformDevControlsEnabled())'));
      assert.ok(ctxSrc.includes('Fixture resets are disabled outside development mode.'));

      // Toast notifications declare assertive/polite live semantics and dismiss aria-label
      assert.ok(ctxSrc.includes('aria-label="Platform notifications"'));
      assert.ok(ctxSrc.includes('aria-label="Dismiss notification"'));
    });

    test('GlobalSettingsPanel and DataGovernance page gate dev fixture reset buttons safely', () => {
      const globalSettingsSrc = readSource('components/platform-config/GlobalSettingsPanel.tsx');
      const dataGovPageSrc = readSource('app/data-governance/page.tsx');

      assert.ok(globalSettingsSrc.includes('isPlatformDevControlsEnabled()'));
      assert.ok(dataGovPageSrc.includes('isPlatformDevControlsEnabled()'));

      const noFreehandOperatorFiles = [
        'components/audit/SecurityEventsWorkspace.tsx',
        'components/audit/EvidenceRemediationWorkspace.tsx',
        'components/audit/DataRetentionPolicyWorkspace.tsx',
        'components/audit/ComplianceControlInventory.tsx',
        'components/system-health/MaintenanceWindowsWorkspace.tsx',
        'components/platform-config/GlobalSettingsPanel.tsx',
      ];
      for (const file of noFreehandOperatorFiles) {
        const src = readSource(file);
        assert.equal(
          src.includes("'Alexander Sterling'") || src.includes('"Alexander Sterling"'),
          false,
          `${file} must not hardcode fallback actor Alexander Sterling`
        );
        assert.equal(
          src.includes("'Elena Rostova'") || src.includes('"Elena Rostova"'),
          false,
          `${file} must not hardcode fallback actor Elena Rostova`
        );
        assert.equal(
          src.includes('Super-Admin Lead (Current)'),
          false,
          `${file} must not hardcode Super-Admin Lead (Current)`
        );
      }
    });
  });

  describe('3. Super Admin Error Boundary, WCAG 2.2 AA Primitives & Overlay Integrity', () => {
    test('UI core primitives avoid interactive TR anti-patterns, nav tablists, and leak-prone error UI', () => {
      const dataTableSrc = readSource('components/ui/DataTable.tsx');
      const tabsSrc = readSource('components/ui/Tabs.tsx');
      const errorSrc = readSource('app/error.tsx');
      const cssSrc = readSource('app/globals.css');

      assert.equal(dataTableSrc.includes('role="button"'), false, 'DataTable must not place role="button" on tr');
      assert.ok(dataTableSrc.includes('scope="col"'));
      assert.ok(dataTableSrc.includes('tabIndex={0}'));

      assert.equal(tabsSrc.includes('<nav'), false, 'Tabs must not put role="tablist" on <nav>');
      assert.ok(tabsSrc.includes('role="tablist"'));

      assert.ok(errorSrc.includes("process.env.NODE_ENV === 'production'"));
      assert.ok(cssSrc.includes(':focus-visible'));
      assert.ok(cssSrc.includes('prefers-reduced-motion: reduce'));
    });

    test('shell layout provides skip link, main landmark, and accessible dialog semantics', () => {
      const appShellSrc = readSource('components/layout/AppShell.tsx');
      const sidebarSrc = readSource('components/layout/Sidebar.tsx');
      const topBarSrc = readSource('components/layout/TopBar.tsx');
      const modalSrc = readSource('components/ui/Modal.tsx');

      assert.ok(appShellSrc.includes('#main-content'));
      assert.ok(appShellSrc.includes('id="main-content"'));
      assert.ok(sidebarSrc.includes('<nav'));
      assert.ok(sidebarSrc.includes('aria-current'));
      assert.ok(topBarSrc.includes('aria-expanded'));
      assert.ok(modalSrc.includes('role="dialog"'));
      assert.ok(modalSrc.includes('aria-modal="true"'));
    });

    test('all Super Admin custom fixed inset-0 overlays have dialog ARIA and zero unlabeled X buttons', () => {
      const allTsx = [...collectTsxFiles('app'), ...collectTsxFiles('components')];
      const overlayMisses: string[] = [];
      const unlabeledXButtons: string[] = [];

      for (const file of allTsx) {
        const text = readSource(file);
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          if (
            line.includes('fixed inset-0') &&
            !line.includes('pointer-events-none') &&
            !file.includes('PlatformStoreContext.tsx')
          ) {
            const win = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 12)).join('\n');
            if (
              !win.includes('role="dialog"') &&
              !win.includes('aria-hidden') &&
              !file.endsWith('Modal.tsx')
            ) {
              overlayMisses.push(`${file}:${i + 1}`);
            }
          }
        }

        const btnRegex = /<(?:button|Button)\b([^>]*)>([\s\S]*?)<\/(?:button|Button)>/g;
        let match: RegExpExecArray | null;
        while ((match = btnRegex.exec(text)) !== null) {
          const [, attrs, inner] = match;
          const visibleText = inner.replace(/<[^>]+>/g, '').trim();
          if ((inner.includes('<X') || visibleText === '✕') && !attrs.includes('aria-label')) {
            if (!visibleText || visibleText === '✕') {
              const lineNum = text.slice(0, match.index).split('\n').length;
              unlabeledXButtons.push(`${file}:${lineNum}`);
            }
          }
        }
      }

      assert.deepEqual(overlayMisses, [], `Missing dialog ARIA on overlays: ${overlayMisses.join(', ')}`);
      assert.deepEqual(unlabeledXButtons, [], `Unlabeled icon-only close buttons: ${unlabeledXButtons.join(', ')}`);
    });
  });
});
