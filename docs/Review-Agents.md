# Review Agents

**Tags:** `reference` · `agents` · `salesforce` · `review`

Specialized Claude Code agents that review Nib wireframes against Salesforce standards — SLDS compliance (UX) and OOB feasibility (Dev).

> **Agent references:**
> - [`ref/agent-install.md`](../ref/agent-install.md) — installation
> - [`ref/agent-sfdc-ux.md`](../ref/agent-sfdc-ux.md) — SLDS/WCAG reviewer
> - [`ref/agent-sfdc-dev.md`](../ref/agent-sfdc-dev.md) — OOB feasibility reviewer

## The two agents

| Agent | Role | Checks |
|---|---|---|
| `sfdc-ux-reviewer` | SLDS compliance + Lightning UI conventions | Component mapping, state patterns, WCAG 2.1 AA contrast, SLDS spacing scale, mobile responsiveness, form layout, modal patterns, table patterns, state coverage |
| `sfdc-dev-reviewer` | OOB feasibility + custom-dev flagging | App Builder components, Flow vs LWC, governor limits, data model patterns, bulk operations, security model, Reactive Screen Actions (Spring '25) |

## Install locally

```bash
mkdir -p ~/.claude/agents
cp ref/agent-sfdc-ux.md  ~/.claude/agents/sfdc-ux-reviewer.md
cp ref/agent-sfdc-dev.md ~/.claude/agents/sfdc-dev-reviewer.md
```

Optional pipeline skill (sequential UX → Dev review):

```bash
mkdir -p ~/.claude/skills/sfdc-review-pipeline
cp ref/sfdc-review-pipeline-SKILL.md ~/.claude/skills/sfdc-review-pipeline/SKILL.md
```

## Invoke

Individual agents:

```
"Run the sfdc-ux-reviewer agent against home.html and results.html"
"Run the sfdc-dev-reviewer agent against the what-if simulation design notes"
```

Full pipeline:

```
/sfdc-review home.html results.html detail.html ...
```

## Output format

Both agents produce a findings table:

| # | Page | Issue | SLDS Pattern / Recommendation | Severity / Effort |
|---|---|---|---|---|

- **UX severity** — High (must fix) / Medium (should fix) / Low (nice to have)
- **Dev effort** — Low (config only) / Medium (minor Apex/LWC) / High (significant custom dev)

## Source of truth

Agent definitions live in `ref/` so they version with the framework. Re-run the install commands to sync after framework updates.

---

## Related

- [[SLDS-Rules]] — the ruleset both agents enforce
- [[Surface-Salesforce]] — the surface they review
- [[Compliance]] — broader regulatory concerns the dev reviewer also flags
- [[For-Agents]] — general agent-consumable design
- [[Confidence-Levels]] — `data-wf-confidence="partial"` signals custom-LWC scope
