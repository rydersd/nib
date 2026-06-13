#!/usr/bin/env node
/**
 * Generates examples/spreadsheet-bootstrap/example.xlsx — a worked example
 * that exercises every Nib workbook tab type. Re-run after editing this
 * script to refresh the workbook.
 *
 *   node examples/spreadsheet-bootstrap/build-example-workbook.js
 */

const path = require('path');
const xlsx = require('xlsx');

const tabs = {};

// ── meta ───────────────────────────────────────────────────────────────────
tabs.meta = [
  ['key', 'value'],
  ['title', 'Acme Partner Channel Program'],
  ['theme', 'Nib'],
  ['defaultSurface', 'salesforce'],
  ['feedbackEndpoint', '/api/feedback'],
  ['emailRecipient', 'design-team@example.com'],
  ['portalHeader', 'true'],
  ['search', 'true'],
  ['changelog', 'false'],
];

// ── pages ──────────────────────────────────────────────────────────────────
tabs.pages = [
  ['id', 'label', 'parent', 'surface', 'template', 'icon', 'summary', 'personaId', 'storyIds', 'blueprintId'],
  // Section roots (no parent)
  ['program', 'Program Map', '', 'blueprint', 'blueprint-dashboard', 'map', 'Bird\'s-eye view of the partner channel program', 'leadership', '', 'program'],
  ['partner-portal', 'Partner Portal', '', 'salesforce', '', 'building', 'Partner-facing experiences', '', '', ''],
  ['internal', 'Internal Tools', '', 'internal', '', 'tool', 'PSM and Deal Desk views', '', '', ''],
  // Nested pages
  ['deal-reg-flow', 'Deal Registration', 'program', 'blueprint', '', 'flow', 'Deal registration sub-blueprint', 'partner-rep', 'sr-1', 'deal-reg'],
  ['onboarding-flow', 'Onboarding', 'program', 'blueprint', '', 'flow', 'Partner onboarding sub-blueprint', 'partner-admin', '', 'onboarding'],
  ['rep-home', 'Rep Home', 'partner-portal', 'salesforce', 'compose-record', 'home', 'Sales rep landing dashboard', 'partner-rep', 'sr-1', ''],
  ['rep-pipeline', 'Pipeline', 'partner-portal', 'salesforce', 'blueprint-dashboard', 'list', 'Deal pipeline view', 'partner-rep', '', ''],
  ['psm-queue', 'PSM Queue', 'internal', 'salesforce', 'blueprint-dashboard', 'inbox', 'Pending review queue for PSMs', 'psm', '', ''],
];

// ── tokens ─────────────────────────────────────────────────────────────────
tabs.tokens = [
  ['name', 'value'],
  ['--wf-accent', '#3d6daa'],
  ['--wf-ink', '#1e2a3a'],
  ['custom-brand', '#8b3553'],
];

// ── personas ───────────────────────────────────────────────────────────────
tabs.personas = [
  ['id', 'label', 'role', 'org', 'initials', 'color', 'summary', 'jtbd', 'pains', 'goals'],
  ['leadership', 'Sarah Chen', 'VP Partner Sales', 'Acme', 'SC', '#6b5b8a',
    'Sponsors the channel program; needs program-level visibility',
    'See program health at a glance; Identify bottlenecks',
    'Too many dashboards; Reports lag a week',
    'Quarterly review confidence; Faster decisions'],
  ['psm', 'Marcus Chen', 'Partner Success Manager', 'Acme', 'MC', '#3d6daa',
    'Manages 5–15 partners; runs deal review and QBRs',
    'Triage incoming deals; Approve MDF;Resolve conflicts',
    'Manual conflict checks;Email-driven status',
    'Same-day deal turnaround;Clear SLA visibility'],
  ['partner-rep', 'Steve Rogers', 'Sales Rep', 'CloudBridge', 'SR', '#4a7a9b',
    'Registers deals through the partner portal',
    'Register a new deal;Track deal status',
    'Form is too long;No status updates',
    'Submit in <2 min;Get clear status'],
  ['partner-admin', 'Jordan Reeves', 'Sales Ops Manager', 'CloudBridge', 'JR', '#5b8db8',
    'Configures the portal and manages user access',
    'Onboard new reps;Set program goals',
    'Setup is opaque;No bulk import',
    'Self-serve onboarding;CSV import'],
];

// ── stories ────────────────────────────────────────────────────────────────
tabs.stories = [
  ['id', 'title', 'kind', 'personaId', 'summary', 'status', 'pageIds', 'criteria'],
  ['sr-1', 'Quick deal registration', 'jtbd', 'partner-rep',
    'Rep can register a new deal in under 2 minutes',
    'in-progress', 'rep-home;deal-reg-flow',
    'Form fits on one screen;Auto-fills account from D&B;Confirmation in <5s'],
  ['ld-1', 'Program health dashboard', 'design', 'leadership',
    'Leadership sees program health without drilling into Salesforce',
    'in-progress', 'program',
    'Top-line metrics on first paint;Drill-down to sub-blueprints;Refresh every 15min'],
  ['psm-1', 'Same-day deal triage', 'design', 'psm',
    'PSM can triage all incoming deals same day',
    'draft', 'psm-queue',
    'Bulk approve/reject;Auto-flag conflicts;SLA timer per deal'],
];

// ── flow: program (root blueprint, drills into children) ───────────────────
tabs.program = [
  ['meta:title', 'Partner Channel Program — End-to-End'],
  ['meta:phases', 'recruit, onboard, enable, transact, retain'],
  ['meta:lanes',
    'sentiment:signal',
    'partner-future:future:partner',
    'portal-future:future:portal',
    'internal-future:future:internal'],
  ['meta:summary', 'How Acme acquires, enables, and retains channel partners across five lifecycle phases.'],
  ['meta:whatChanges', 'Self-serve onboarding replaces email back-and-forth; AI deal triage cuts PSM cycle time; QBR data flows from Salesforce automatically.'],
  ['meta:ownerPersonaId', 'leadership'],
  ['meta:status', 'review'],
  [],
  ['id', 'phase', 'lane', 'label', 'summary', 'status', 'sentimentEmoji', 'sentimentLabel', 'predecessors', 'childBlueprintId'],
  // Sentiment row
  ['s-recruit', 'recruit', 'sentiment', '', 'Excited but unsure what they\'re signing up for', 'draft', '😊', 'Excited', '', ''],
  ['s-onboard', 'onboard', 'sentiment', '', 'Frustrated with paperwork', 'draft', '😟', 'Frustrated', '', ''],
  ['s-enable', 'enable', 'sentiment', '', 'Engaged when training lands', 'draft', '🙂', 'Engaged', '', ''],
  ['s-transact', 'transact', 'sentiment', '', 'Anxious about deal status', 'draft', '😰', 'Anxious', '', ''],
  ['s-retain', 'retain', 'sentiment', '', 'Confident in the relationship', 'draft', '😀', 'Confident', '', ''],
  // Partner lane
  ['p-recruit', 'recruit', 'partner-future', 'Self-discover program', 'Prospect lands on program landing page', 'draft', '', '', '', ''],
  ['p-onboard', 'onboard', 'partner-future', 'Apply', 'Submit application + agreement', 'draft', '', '', 'p-recruit', 'onboarding'],
  ['p-enable', 'enable', 'partner-future', 'Get certified', 'Complete required training', 'draft', '', '', 'p-onboard', ''],
  ['p-transact', 'transact', 'partner-future', 'Register deals', 'Submit deal registrations', 'draft', '', '', 'p-enable', 'deal-reg'],
  ['p-retain', 'retain', 'partner-future', 'QBR / renewal', 'Quarterly business review and tier renewal', 'draft', '', '', 'p-transact', ''],
  // Portal lane
  ['portal-recruit', 'recruit', 'portal-future', 'Marketing site', 'Public site explains the program', 'draft', '', '', '', ''],
  ['portal-onboard', 'onboard', 'portal-future', 'Onboarding wizard', 'Guided multi-step application', 'draft', '', '', 'portal-recruit', 'onboarding'],
  ['portal-enable', 'enable', 'portal-future', 'Training portal', 'Cert tracker + LMS sync', 'draft', '', '', 'portal-onboard', ''],
  ['portal-transact', 'transact', 'portal-future', 'Rep portal', 'Deal pipeline + MDF', 'draft', '', '', 'portal-enable', 'deal-reg'],
  ['portal-retain', 'retain', 'portal-future', 'PM portal', 'Program manager hub', 'draft', '', '', 'portal-transact', ''],
  // Internal lane
  ['int-recruit', 'recruit', 'internal-future', 'Targeting list', 'Sales ops curates target accounts', 'draft', '', '', '', ''],
  ['int-onboard', 'onboard', 'internal-future', 'PSM review', 'Application review + countersign', 'draft', '', '', 'int-recruit', 'onboarding'],
  ['int-enable', 'enable', 'internal-future', 'Training ops', 'LMS admin + content', 'draft', '', '', 'int-onboard', ''],
  ['int-transact', 'transact', 'internal-future', 'Deal Desk', 'Deal triage + approval', 'draft', '', '', 'int-enable', 'deal-reg'],
  ['int-retain', 'retain', 'internal-future', 'PSM ops', 'QBR + tier governance', 'draft', '', '', 'int-transact', ''],
];

// ── flow: deal-reg (child of program) ──────────────────────────────────────
tabs['deal-reg'] = [
  ['meta:title', 'Deal Registration — Detail'],
  ['meta:phases', 'initiate, capture, submit, review, decide'],
  ['meta:lanes',
    'sent:signal',
    'rep-current:current:rep',
    'rep-future:future:rep',
    'sys-current:current:system',
    'sys-future:future:system',
    'psm-current:current:psm',
    'psm-future:future:psm'],
  ['meta:parent', 'program'],
  ['meta:summary', 'Partner reps register deals in <2min; Deal Desk triages with AI assist.'],
  ['meta:whatChanges', 'Single-page form replaces multi-step wizard; D&B auto-fill; AI conflict pre-screen before PSM sees it.'],
  ['meta:ownerPersonaId', 'partner-rep'],
  ['meta:status', 'draft'],
  [],
  ['id', 'phase', 'lane', 'label', 'summary', 'status', 'sentimentEmoji', 'sentimentLabel', 'predecessors'],
  ['ds-i', 'initiate', 'sent', '', 'Hopeful — has a real deal', 'draft', '😊', 'Hopeful', ''],
  ['ds-c', 'capture', 'sent', '', 'Tedious — too many fields', 'draft', '😩', 'Tedious', ''],
  ['ds-s', 'submit', 'sent', '', 'Anxious — did it work?', 'draft', '😰', 'Anxious', ''],
  ['ds-r', 'review', 'sent', '', 'Waiting — radio silence', 'draft', '😶', 'Waiting', ''],
  ['ds-d', 'decide', 'sent', '', 'Relieved or upset depending', 'draft', '🙃', 'Mixed', ''],
  // Current rep lane
  ['rc-init', 'initiate', 'rep-current', 'Open form', 'Navigate to multi-step wizard', 'live', '', '', ''],
  ['rc-cap', 'capture', 'rep-current', 'Fill 4 pages', 'Account, contacts, opportunity, terms', 'live', '', '', 'rc-init'],
  ['rc-sub', 'submit', 'rep-current', 'Submit', 'Click submit; wait for confirmation', 'live', '', '', 'rc-cap'],
  // Future rep lane
  ['rf-init', 'initiate', 'rep-future', 'Open form', 'One-click from rep home', 'draft', '', '', ''],
  ['rf-cap', 'capture', 'rep-future', 'Single-page form', 'Auto-filled from D&B + CRM', 'draft', '', '', 'rf-init'],
  ['rf-sub', 'submit', 'rep-future', 'Submit', 'Inline validation + instant confirmation', 'draft', '', '', 'rf-cap'],
  // Current system lane
  ['sc-rec', 'submit', 'sys-current', 'Create record', 'Salesforce DealReg__c row', 'live', '', '', 'rc-sub'],
  ['sc-route', 'review', 'sys-current', 'Route to PSM', 'Round-robin assignment', 'live', '', '', 'sc-rec'],
  // Future system lane
  ['sf-rec', 'submit', 'sys-future', 'Create record', 'Same record + AI conflict pre-screen', 'draft', '', '', 'rf-sub'],
  ['sf-route', 'review', 'sys-future', 'Smart route', 'AI suggests reviewer + flags conflicts', 'draft', '', '', 'sf-rec'],
  // Current PSM lane
  ['pc-rev', 'review', 'psm-current', 'Manual review', 'Open record, check conflicts manually', 'live', '', '', 'sc-route'],
  ['pc-dec', 'decide', 'psm-current', 'Approve/Reject', 'Update status, email rep', 'live', '', '', 'pc-rev'],
  // Future PSM lane
  ['pf-rev', 'review', 'psm-future', 'Triage queue', 'AI-flagged conflicts highlighted', 'draft', '', '', 'sf-route'],
  ['pf-dec', 'decide', 'psm-future', 'Bulk approve', 'Approve clear deals in bulk', 'draft', '', '', 'pf-rev'],
];

// ── flow: onboarding (child of program) ────────────────────────────────────
tabs.onboarding = [
  ['meta:title', 'Partner Onboarding — Detail'],
  ['meta:phases', 'apply, review, agreement, provision, activate'],
  ['meta:lanes',
    'sent:signal',
    'partner-future:future:partner',
    'portal-future:future:portal',
    'psm-future:future:psm'],
  ['meta:parent', 'program'],
  ['meta:summary', 'Self-serve onboarding from application to active portal access in <5 days.'],
  ['meta:whatChanges', 'D&B auto-lookup replaces manual eligibility; PSM countersigns digitally; portal auto-provisions on agreement.'],
  ['meta:ownerPersonaId', 'partner-admin'],
  ['meta:status', 'draft'],
  [],
  ['id', 'phase', 'lane', 'label', 'summary', 'status', 'sentimentEmoji', 'sentimentLabel', 'predecessors'],
  ['os-a', 'apply', 'sent', '', 'Excited but cautious', 'draft', '😊', 'Excited', ''],
  ['os-r', 'review', 'sent', '', 'Eager to start', 'draft', '🤞', 'Eager', ''],
  ['os-ag', 'agreement', 'sent', '', 'Trusting the process', 'draft', '🙂', 'Trusting', ''],
  ['os-p', 'provision', 'sent', '', 'Almost there', 'draft', '🤩', 'Almost', ''],
  ['os-act', 'activate', 'sent', '', 'In and ready', 'draft', '🎉', 'Ready', ''],
  ['oa-app', 'apply', 'partner-future', 'Apply online', 'Single page application', 'draft', '', '', ''],
  ['op-app', 'apply', 'portal-future', 'D&B autofill', 'Auto-populate company details', 'draft', '', '', 'oa-app'],
  ['op-rev', 'review', 'portal-future', 'Eligibility check', 'System pre-screens', 'draft', '', '', 'op-app'],
  ['oP-rev', 'review', 'psm-future', 'PSM countersign', 'PSM reviews and signs', 'draft', '', '', 'op-rev'],
  ['op-ag', 'agreement', 'portal-future', 'DocuSign', 'Click-to-sign program agreement', 'draft', '', '', 'oP-rev'],
  ['op-prov', 'provision', 'portal-future', 'Auto-provision', 'Create org, users, defaults', 'draft', '', '', 'op-ag'],
  ['oa-act', 'activate', 'partner-future', 'Login', 'First login + welcome tour', 'draft', '', '', 'op-prov'],
];

// ── _initiatives registry ──────────────────────────────────────────────────
tabs._initiatives = [
  ['id', 'title', 'status', 'owner', 'summary'],
  ['ai-deal-triage', 'AI deal triage', 'discovery', 'psm', 'Use Agentforce to pre-screen deal conflicts'],
  ['self-serve-onboarding', 'Self-serve onboarding', 'in-progress', 'partner-admin', 'D&B integration + auto-provision'],
  ['cert-lms-sync', 'Cert/LMS sync', 'planned', 'leadership', 'SumTotal → Salesforce nightly'],
];

// ── Build workbook ─────────────────────────────────────────────────────────
function build() {
  const wb = xlsx.utils.book_new();
  for (const [name, rows] of Object.entries(tabs)) {
    const ws = xlsx.utils.aoa_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, name);
  }
  const out = path.join(__dirname, 'example.xlsx');
  xlsx.writeFile(wb, out);
  console.log(`Wrote ${out}`);
  console.log(`  ${Object.keys(tabs).length} tabs: ${Object.keys(tabs).join(', ')}`);
}

build();
