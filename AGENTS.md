# PMCAS Agent Guide

## Product Identity

**Product name:** PMCAS — Performance Marketing & Conversion Audit System

**Purpose:** PMCAS is a structured consulting operating system for performance media buyers and marketing managers. It turns messy client data, observations, and judgment into a repeatable audit workflow with evidence-backed findings, recommendations, and an experimentation backlog.

**Target user:** Internal consultant, performance media buyer, or marketing manager.

## Product Philosophy

- PMCAS is not an AI marketing analyst in the MVP.
- PMCAS is a decision-support system where the consultant stays in control.
- Prioritize structured judgment, repeatable workflow, evidence, and exportable outputs.
- Start with rule-based scoring, indicators, and draft findings.
- Add AI features only after the data model and audit workflow are stable.
- Treat scores as directional signals, not absolute truth. Always pair scores with confidence levels.

## Core Workflow

1. Create a brand/client profile.
2. Add business context and available metrics.
3. Import data from CSV/Excel or enter data manually.
4. Start an audit.
5. Complete the 8 audit sections using criteria/checks.
6. Add evidence and notes.
7. Generate section scores, confidence levels, findings, and recommendations.
8. Let the consultant accept, edit, or dismiss draft findings.
9. Convert recommendations into experiments.
10. Export findings, recommendations, experiments, section scores, and summaries.

## Audit Sections

1. Measurement & Data Audit
2. Funnel Leakage Audit
3. Customer & Market Research
4. Offer, Pricing & Messaging Analysis
5. Brand Positioning Analysis
6. Channel Expansion & Growth Opportunities
7. Team Workflow & Internal Alignment
8. Experimentation Roadmap

## Technical Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Prisma
- PostgreSQL
- CSV/Excel import
- CSV export compatible with Google Sheets

## Architecture Rules

- Use a flexible audit model:
  `Section -> Criteria -> Responses -> Evidence -> Findings -> Recommendations -> Experiments`
- Store imported data flexibly at first, using raw JSON rows where useful.
- Avoid over-normalizing every marketing metric in the MVP.
- Keep scoring logic separate from UI components.
- Keep recommendation and finding rules separate from UI components.
- Use reusable TypeScript utilities for scoring, risk levels, confidence levels, prioritization, and recommendation rules.
- Prefer explicit domain types for audit entities, scores, confidence, findings, recommendations, and experiments.
- Keep data import logic isolated from audit scoring logic.
- Preserve a clear distinction between consultant-entered judgment and generated draft outputs.

## Suggested Data Model

Core entities should support this shape:

- `Brand`: client/brand profile and business context.
- `BrandMetric`: flexible manual KPI entries.
- `DataImport`: uploaded CSV/Excel metadata.
- `ImportedRow`: raw imported row data stored as JSON.
- `AuditTemplate`: versioned audit framework.
- `AuditSection`: one of the 8 framework sections.
- `AuditCriteria`: scoring checks inside each section.
- `Audit`: one audit instance for a brand.
- `AuditResponse`: score, notes, confidence, and response data for each criterion.
- `EvidenceItem`: evidence linked to responses, findings, recommendations, or experiments.
- `Finding`: problem or opportunity discovered during the audit.
- `Recommendation`: suggested action tied to a finding.
- `Experiment`: prioritized test or operational action derived from a recommendation.
- `Export`: export history and metadata.

## Scoring Rules

Audit criteria use a 0 to 5 score:

- `0`: not present / major issue
- `1`: very weak
- `2`: weak
- `3`: acceptable
- `4`: strong
- `5`: excellent

Normalize section scores to `0-100`.

Overall audit score should be a weighted average of section scores.

Risk levels:

- `80-100`: Strong
- `60-79`: Needs improvement
- `40-59`: Risk area
- `0-39`: Critical gap

Scoring logic must be explainable, editable, and testable. Do not hardcode scoring behavior inside UI components.

## Confidence Rules

Each section, finding, and recommendation should support a confidence level:

- `Low`: mostly assumptions
- `Medium`: some evidence
- `High`: clear data or documented proof

Confidence should be shown alongside scores and recommendations so the consultant can distinguish evidence-backed conclusions from informed hypotheses.

## Finding Rules

Rule-based findings should be generated as drafts.

The consultant must be able to:

- accept draft findings
- edit draft findings
- dismiss draft findings

Findings must include:

- title
- description
- evidence
- severity
- confidence
- business impact
- related metric if available
- status

Finding rules should be implemented outside UI components and should produce editable draft outputs.

## Recommendation Rules

Recommendations must be tied to findings and include:

- title
- rationale
- expected impact
- effort
- priority
- suggested owner
- optional experiment link

Recommendations should support consultant editing before they are treated as final.

## Experiment Rules

Experiments should include:

- problem observed
- evidence
- hypothesis
- proposed change
- primary metric
- secondary metric
- impact
- confidence
- effort
- priority score
- owner
- status
- result
- learning
- next action

Use a simple editable prioritization model first:

- ICE: Impact, Confidence, Ease
- Or: `Priority = Impact + Confidence - Effort`

Do not over-engineer experiment prioritization in the MVP.

## Rule-Based MVP Logic

Good first rule-based checks include:

- Missing or unclear conversion tracking creates a Measurement & Data Audit finding.
- Low landing page conversion rate creates a Funnel Leakage Audit finding.
- High add-to-cart rate with low checkout completion creates a checkout friction finding.
- Missing objection research creates a Customer & Market Research finding.
- Weak or unclear offer differentiation creates an Offer, Pricing & Messaging finding.
- No clear positioning or category narrative creates a Brand Positioning finding.
- Over-reliance on one acquisition channel creates a Channel Expansion finding.
- Missing experiment owner, status, or cadence creates a Team Workflow or Experimentation Roadmap finding.

Generated findings are drafts. The consultant decides what becomes final.

## AI Boundaries

Do not add AI recommendations in the MVP.

AI can be considered later for:

- summarizing audit notes
- drafting findings from evidence
- clustering customer objections
- suggesting experiments
- rewriting positioning or offer messaging
- generating client-facing report copy

AI should assist the consultant. It should not own scoring or final judgment.

## UI Rules

- Use a clean internal SaaS interface.
- Use shadcn/ui components.
- Use Recharts for focused visualizations such as section scores, funnel leakage, and experiment priority.
- Support Arabic and RTL layout.
- Keep the codebase in English.
- UI labels may support Arabic.
- Every table should have a clear empty state.
- Every audit section should display:
  - score
  - risk level
  - confidence level
  - findings
  - recommendations
  - evidence
  - suggested owner
  - priority
- Keep screens useful for repeated consulting work. Avoid marketing-style landing pages for the internal app.
- Use clear status badges for draft, accepted, dismissed, in progress, completed, and exported states.

## Export Rules

The MVP export format should be CSV compatible with Google Sheets.

Exportable data:

- audit summary
- section scores
- findings
- recommendations
- experiments
- 30/60/90 priorities if available

Exports should use stable column names and should not require users to clean data manually before using it in Google Sheets.

## Do Not Rules

- Do not add AI recommendations in the MVP.
- Do not add direct Meta, Google Ads, GA4, or Shopify integrations in the MVP.
- Do not add a client portal in the MVP.
- Do not build complex attribution modeling in the MVP.
- Do not hardcode scoring logic inside UI components.
- Do not treat scores as absolute truth without confidence levels.
- Do not over-normalize imported marketing data before real usage patterns are clear.
- Do not replace consultant judgment with generated outputs.

## Implementation Guidance For Future Agents

- Read existing code and patterns before making changes.
- Keep MVP features simple, useful, and consultant-controlled.
- Prefer small, well-named modules over broad abstractions.
- Add tests around scoring, risk levels, confidence handling, prioritization, and rule-based draft generation.
- Keep UI components focused on rendering and interaction. Domain logic belongs in reusable utilities or service modules.
- Preserve export compatibility whenever changing audit, finding, recommendation, or experiment fields.
- When adding new audit rules, make the rule output explainable and editable.
- When adding new data import behavior, keep raw imported rows available for traceability.
