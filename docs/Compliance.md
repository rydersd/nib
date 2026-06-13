# Global Compliance Reference

**Tags:** `governance` · `compliance` · `salesforce` · `accessibility`

Regulatory and compliance concerns to flag in wireframes. Most of these are **not out-of-the-box** on Salesforce — they require custom implementation, add-on licensing, or architecture decisions. This is about what the production system must account for, not what the framework enforces.

> **Agent reference:** [`ref/compliance-global.md`](../ref/compliance-global.md) — every topic with "what's not OOB / cost / wireframe implication" detail.

## Topics covered in `ref/compliance-global.md`

1. **Data Residency & Sovereignty** — Hyperforce region selection vs country-level isolation (China, Russia, Saudi Arabia, Brazil, India)
2. **GDPR / Privacy (EU)** — right to erasure, consent UI, data portability, retention policies
3. **Field-Level Security & PII** — Shield Platform Encryption, encrypted-field report/filter breakage
4. **SOX / Audit Trails** — standard 20-field / 18-month limit vs Shield Field Audit Trail
5. **Industry regulations** — HIPAA (BAA + Shield), PCI-DSS (never store card data), FedRAMP (Government Cloud)
6. **Accessibility (WCAG 2.1 AA)** — base Lightning conforms; custom LWC requires manual work (see [[SLDS-Rules]])
7. **Cookie Consent / CCPA** — no built-in banner, no auto-blocking, "Do Not Sell" must be built
8. **Multi-Language & Locale** — Translation Workbench limits, RTL gaps, 30–40% text-expansion buffer
9. **Record-Level Security** — OWD, sharing rules, territory management (note: irreversible)
10. **Cross-Border Data Transfer** — TIAs, SCCs, PIPL/LGPD/DPDP requirements

## How to use it in wireframes

Each section follows a **What's not OOB → What it costs → Wireframe implication** structure. For each:

- Annotate PII fields in wireframes; flag search/filter breakage from encryption
- Add cookie consent banners and privacy footer links to Experience Cloud pages
- Show retention notices, "Forget Me" flows, "Download My Data" self-service
- Include audit log pages and change history views where SOX applies
- Design region indicators and data-residency flows for global users
- Note whether each feature is OOB, add-on, or custom — reviewers need this for sizing

## Related framework compliance

- **SLDS 2 + WCAG 2.1 AA** in Salesforce surfaces — see [[SLDS-Rules]] §7 for accessibility requirements and [[Surface-Salesforce]] for surface usage
- **Accessibility for every surface** — every page must maintain 4.5:1 text contrast, visible focus rings, keyboard nav, and 44×44px touch targets

---

## Related

- [[SLDS-Rules]] — Salesforce-specific WCAG and component accessibility
- [[Surface-Salesforce]] — SFDC surface with compliance-aware patterns
- [[Review-Agents]] — SFDC UX and dev reviewers that enforce these rules
