# Salesforce Global Compliance & Regulatory Reference

> ⚠️ **Deprecated.** Edit [`docs/Compliance.md`](../docs/Compliance.md) instead. This file will be removed in a future release.

> For agents building Salesforce wireframes. Flags compliance and regulatory concerns that are **not out-of-the-box** and require custom implementation. This is about what the wireframe should account for in the actual Salesforce implementation — not framework compliance.

Each section: **What's not OOB** → **What it costs** → **Wireframe implication**.

---

## 1. Data Residency & Sovereignty

**What's not OOB:**
- Hyperforce provides regional hosting but does NOT provide country-level data isolation within a single org
- Countries requiring in-country data storage (China, Russia, Saudi Arabia, Brazil, India) may need separate orgs or third-party data residency solutions
- No built-in mechanism to prevent specific records from replicating to a region

**What it costs:** Hyperforce region selection is included, but multi-org strategies or third-party residency brokers add significant architecture and licensing costs.

**Wireframe implication:** If the product serves global users, design should account for:
- Data residency indicators on records (e.g., "Stored in: EU-Frankfurt")
- Region-specific user flows (e.g., Chinese users routed to a different experience)
- Region selector or org-routing logic on login screens

---

## 2. GDPR / Privacy (EU)

**What's not OOB:**
- No automated right-to-erasure across all objects — custom Apex required to cascade deletes across related records, files, and external systems
- No built-in consent management UI — you must design consent capture and preference management flows
- No data portability export endpoint for data subjects (Article 20)
- No retention policy enforcement — custom scheduled Apex jobs needed to purge records after retention periods
- Individual Rights Management (add-on) covers some but not all requirements

**What it costs:** Individual Rights Management is a paid add-on. Custom Apex for cascading erasure and retention enforcement is custom dev.

**Wireframe implication:**
- Cookie consent banners on Experience Cloud sites
- Privacy preference center (consent types, granular opt-in/out)
- Data export self-service ("Download My Data" button)
- Retention notices on records approaching expiry
- "Forget Me" request flow with status tracking

---

## 3. Field-Level Security & PII

**What's not OOB:**
- Standard encryption is AES-128, custom fields only, 175-character cap
- Shield Platform Encryption (paid add-on) needed for AES-256, standard field encryption, deterministic encryption, and BYOK (Bring Your Own Key)
- Encrypted fields **break**: reports (can't filter/group), formula fields (can't reference), SOQL WHERE clauses (can't filter), and auto-complete lookups

**What it costs:** Shield Platform Encryption is a significant add-on cost. Custom dev to work around broken reports/filters.

**Wireframe implication:**
- Mark PII fields in wireframes (name, email, SSN, DOB, etc.)
- Note which fields need encryption and flag downstream constraints
- If a search/filter/report uses an encrypted field, annotate that it won't work OOB — design alternative lookup flows
- Consider masking patterns for PII display (e.g., `***-**-1234`)

---

## 4. SOX / Audit Trails

**What's not OOB:**
- Standard field history tracking: limited to **20 fields per object**, **18 months** retention
- Field Audit Trail (Shield add-on): up to 60 fields per object, **10 years** retention
- Setup Audit Trail: **180 days only** — no long-term admin change tracking OOB
- No built-in tamper-proof audit log export

**What it costs:** Field Audit Trail requires Shield. Long-term Setup Audit Trail archival requires custom integration or third-party tool.

**Wireframe implication:**
- Audit log pages showing field-level change history
- Change history views on record detail pages
- Approval process visibility (who approved what, when)
- If SOX-relevant, flag that 20-field limit may be insufficient — prioritize which fields to track

---

## 5. Industry-Specific Regulations

### HIPAA (Healthcare)
- BAA (Business Associate Agreement) must be **individually negotiated** with Salesforce
- Shield Platform Encryption is effectively required
- Not all Salesforce products are covered under the BAA
- No built-in PHI access logging beyond standard field history

### PCI-DSS (Payments)
- Salesforce is **NOT PCI-certified** — do not store card data in Salesforce
- Must tokenize payment data via third-party (Stripe, Braintree, etc.)
- Keep Salesforce entirely out of PCI scope

### FedRAMP (Government)
- Requires separate **Government Cloud** edition
- Standard commercial Salesforce does not meet FedRAMP requirements
- Government Cloud has feature parity gaps with commercial

**Wireframe implication:**
- Flag if product touches health data → note BAA and Shield requirements
- Flag if product touches payment data → design tokenized payment flows, never show raw card numbers
- Flag if product serves government clients → note Government Cloud constraints

---

## 6. Accessibility (WCAG 2.1 AA)

**What's not OOB:**
- Base Lightning components conform to WCAG 2.1 AA
- Custom LWC, Visualforce pages, and third-party components need **manual accessibility work**
- No automated accessibility testing built into the platform
- Lightning's keyboard navigation has known gaps in complex components (trees, kanban boards)

**What it costs:** Manual testing, remediation dev time, potential third-party testing tools.

**Wireframe implication:** Already covered by `surface-salesforce-rules.md` — cross-reference that doc for specific component-level accessibility requirements.

---

## 7. Cookie Consent & ePrivacy / CCPA

**What's not OOB:**
- No built-in cookie consent banner for Experience Cloud sites
- No automatic cookie blocking before consent (required by ePrivacy Directive)
- CCPA "Do Not Sell My Personal Information" link must be manually built
- No consent state persistence or integration with CMP (Consent Management Platform) OOB

**What it costs:** Third-party CMP integration (OneTrust, Cookiebot, etc.) or custom LWC development.

**Wireframe implication:**
- Cookie consent banner/modal on all Experience Cloud pages
- Privacy footer links: "Privacy Policy", "Cookie Settings", "Do Not Sell My Info" (CCPA)
- Opt-out flows for marketing communications
- Consent state indicator (what the user has consented to)

---

## 8. Multi-Language & Locale

**What's not OOB:**
- Translation Workbench: manual translation only — no machine translation, not all UI elements translatable (e.g., some Lightning component labels, validation error messages)
- RTL (right-to-left) support has significant limitations in Lightning — many components don't flip correctly
- Platform-only languages have **zero** pre-translated UI strings
- Custom labels have a limit; complex apps may hit it

**What it costs:** Professional translation services, custom RTL CSS overrides, potential third-party translation management.

**Wireframe implication:**
- Translation-ready layouts: account for **30-40% text expansion** (English → German/French)
- RTL testing notes on any layout with horizontal flow
- Locale-specific formatting callouts (date formats, number separators, currency symbols)
- Flag any hardcoded strings in wireframe annotations

---

## 9. Record-Level Security & Sharing

**What's not OOB:**
- OWD (Organization-Wide Defaults), role hierarchy, sharing rules, and territory management all require **manual configuration** per object
- Territory Management is **irreversible** once enabled — cannot be turned off
- Manual sharing rules have limits (300 per object for criteria-based)
- Implicit sharing (parent-child) can create unexpected access patterns

**What it costs:** Architecture and configuration time. Territory Management is included but permanent.

**Wireframe implication:**
- "Who sees what" annotations on data views and list pages
- Role-based visibility notes (e.g., "Sales reps see own accounts only; managers see team accounts")
- If territory-based access is needed, flag the irreversibility risk
- Consider "shared with" indicators on record detail pages

---

## 10. Cross-Border Data Transfer

**What's not OOB:**
- Customers must conduct **Transfer Impact Assessments** (TIAs) for data moving between jurisdictions
- Standard Contractual Clauses (SCCs) are Salesforce's default mechanism but may not suffice for all countries
- Country-specific requirements go beyond SCCs:
  - **China PIPL:** Requires security assessment for outbound transfers, potential data localization
  - **Brazil LGPD:** Requires proof of adequate protection in receiving country
  - **India DPDP:** Restricts transfers to countries without adequate protection (whitelist pending)

**What it costs:** Legal review, potential separate orgs for data localization, compliance consulting.

**Wireframe implication:**
- Data flow diagrams showing where data moves between regions
- Transfer mechanism notes on integrations (e.g., "EU → US transfer via SCCs")
- If China/Brazil/India users are in scope, flag potential data localization requirements

---

## Quick Reference Table

| Concern | OOB? | Add-on / Custom Required | Design Impact |
|---------|------|--------------------------|---------------|
| Data Residency | Partial (Hyperforce regions) | Multi-org or third-party for country-level | Region indicators, routing flows |
| GDPR Right to Erasure | No | Custom Apex | "Forget Me" flow, status tracking |
| GDPR Consent Management | No | Custom UI or third-party | Preference center, consent capture |
| GDPR Data Portability | No | Custom Apex | "Download My Data" self-service |
| GDPR Retention Policies | No | Custom scheduled jobs | Retention notices, purge workflows |
| PII Encryption (AES-256) | No | Shield Platform Encryption | Annotate PII fields, flag search/filter limits |
| Audit Trail (>20 fields) | No | Shield Field Audit Trail | Audit log pages, change history views |
| Audit Trail (>18 months) | No | Shield Field Audit Trail | Long-term history access |
| Setup Audit (>180 days) | No | Custom archival | Admin change history |
| HIPAA Compliance | No | BAA + Shield | PHI flagging, access logging |
| PCI-DSS | No (not certified) | Third-party tokenization | Tokenized payment flows |
| FedRAMP | No | Government Cloud edition | Feature parity gap notes |
| Accessibility (custom) | Partial | Manual testing + remediation | See `surface-salesforce-rules.md` |
| Cookie Consent | No | Third-party CMP or custom LWC | Consent banner, privacy footer |
| CCPA Do Not Sell | No | Custom development | Opt-out link and flow |
| Multi-Language | Partial (manual) | Translation services | Text expansion layouts, locale formatting |
| RTL Support | Partial (limited) | Custom CSS overrides | RTL testing annotations |
| Record-Level Security | Config required | Architecture time | "Who sees what" annotations |
| Territory Management | OOB but irreversible | — | Flag irreversibility risk |
| Cross-Border Transfer | No (legal burden) | Legal review, potential multi-org | Data flow diagrams, transfer notes |
