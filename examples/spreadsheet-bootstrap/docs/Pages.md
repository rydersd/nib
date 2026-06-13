<!-- nib:auto source=data/sections.js -->

# Pages

8 pages.

### Program Map

- **Program Map** `program` · surface: blueprint · template: `blueprint-dashboard` · persona: [[Persona-leadership]] · renders [[Blueprint-program]] 
  Bird's-eye view of the partner channel program
- **Deal Registration** `deal-reg-flow` · surface: blueprint · persona: [[Persona-partner-rep]] · renders [[Blueprint-deal-reg]] 
  Deal registration sub-blueprint
- **Onboarding** `onboarding-flow` · surface: blueprint · persona: [[Persona-partner-admin]] · renders [[Blueprint-onboarding]] 
  Partner onboarding sub-blueprint

### Partner Portal

- **Partner Portal** `partner-portal` · surface: salesforce 
  Partner-facing experiences
- **Rep Home** `rep-home` · surface: salesforce · template: `compose-record` · persona: [[Persona-partner-rep]] 
  Sales rep landing dashboard
- **Pipeline** `rep-pipeline` · surface: salesforce · template: `blueprint-dashboard` · persona: [[Persona-partner-rep]] 
  Deal pipeline view

### Internal Tools

- **Internal Tools** `internal` · surface: internal 
  PSM and Deal Desk views
- **PSM Queue** `psm-queue` · surface: salesforce · template: `blueprint-dashboard` · persona: [[Persona-psm]] 
  Pending review queue for PSMs


> Edit the workbook `pages` tab to change. `npx nib-sync` refreshes this page.
