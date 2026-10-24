import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required; seed only a disposable development database.");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ids = {
  user: "demo-user-internal-consultant",
  brand: "demo-brand-saudi-ecommerce",
  template: "pmcas-mvp-template-v1",
  audit: "demo-audit-saudi-ecommerce",
  dataImport: "demo-import-funnel-snapshot",
};

const sectionDefinitions = [
  {
    id: "section-measurement-data",
    sectionKey: "MEASUREMENT_DATA_AUDIT",
    name: "Measurement & Data Audit",
    description: "Checks tracking accuracy, naming consistency, UTMs, and revenue visibility.",
    weight: 1.2,
    sortOrder: 1,
    criteria: [
      {
        id: "criteria-tracking-foundation",
        title: "Conversion tracking foundation",
        description: "Core conversion events are present and mapped to business outcomes.",
        scoringGuidance: "0 means no reliable tracking; 5 means complete event and revenue coverage.",
        evidenceRequired: true,
        ruleKey: "measurement.tracking_foundation",
      },
      {
        id: "criteria-event-naming",
        title: "Event naming consistency",
        description: "Events use clear, consistent names across ad platforms and analytics tools.",
        scoringGuidance: "Score lower when naming drift makes reporting difficult.",
        evidenceRequired: true,
        ruleKey: "measurement.event_naming",
      },
      {
        id: "criteria-utm-discipline",
        title: "UTM discipline",
        description: "Campaign links use consistent source, medium, campaign, and content values.",
        scoringGuidance: "Score higher when UTMs are documented and consistently applied.",
        evidenceRequired: false,
        ruleKey: "measurement.utm_discipline",
      },
    ],
  },
  {
    id: "section-funnel-leakage",
    sectionKey: "FUNNEL_LEAKAGE_AUDIT",
    name: "Funnel Leakage Audit",
    description: "Reviews conversion flow, drop-off points, and friction between steps.",
    weight: 1.2,
    sortOrder: 2,
    criteria: [
      {
        id: "criteria-landing-page-cvr",
        title: "Landing page conversion rate",
        description: "Landing pages convert qualified traffic into product or checkout intent.",
        scoringGuidance: "Score lower when landing pages attract traffic but weakly progress users.",
        evidenceRequired: true,
        ruleKey: "funnel.landing_page_cvr",
      },
      {
        id: "criteria-cart-checkout-leakage",
        title: "Add-to-cart to checkout leakage",
        description: "The brand understands and manages drop-off between cart and checkout.",
        scoringGuidance: "Score lower when users add items but do not proceed to checkout.",
        evidenceRequired: true,
        ruleKey: "funnel.cart_checkout_leakage",
      },
      {
        id: "criteria-checkout-completion",
        title: "Checkout completion",
        description: "Checkout flow supports clear payment, shipping, trust, and support signals.",
        scoringGuidance: "Score higher when checkout completion is measured and friction is reduced.",
        evidenceRequired: true,
        ruleKey: "funnel.checkout_completion",
      },
    ],
  },
  {
    id: "section-customer-market-research",
    sectionKey: "CUSTOMER_MARKET_RESEARCH",
    name: "Customer & Market Research",
    description: "Captures customer objections, motivation, competitive context, and demand signals.",
    weight: 1,
    sortOrder: 3,
    criteria: [
      {
        id: "criteria-objection-research",
        title: "Customer objection research",
        description: "Common customer objections are collected from sales, support, reviews, and ads.",
        scoringGuidance: "Score lower when decisions rely mostly on assumptions.",
        evidenceRequired: true,
        ruleKey: "research.customer_objections",
      },
      {
        id: "criteria-review-mining",
        title: "Review and comment mining",
        description: "The team reviews customer comments to understand language, hesitation, and triggers.",
        scoringGuidance: "Score higher when research is recent and translated into actions.",
        evidenceRequired: false,
        ruleKey: "research.review_mining",
      },
      {
        id: "criteria-competitor-insights",
        title: "Competitor insight tracking",
        description: "Competitor offers, pricing, hooks, and trust signals are reviewed regularly.",
        scoringGuidance: "Score lower when competitor context is anecdotal or outdated.",
        evidenceRequired: false,
        ruleKey: "research.competitor_insights",
      },
    ],
  },
  {
    id: "section-offer-pricing-messaging",
    sectionKey: "OFFER_PRICING_MESSAGING",
    name: "Offer, Pricing & Messaging Analysis",
    description: "Evaluates offer clarity, price perception, proof, urgency, and objection handling.",
    weight: 1.2,
    sortOrder: 4,
    criteria: [
      {
        id: "criteria-offer-clarity",
        title: "Offer clarity",
        description: "The main offer is easy to understand and compelling within seconds.",
        scoringGuidance: "Score lower when users must infer the bundle, value, or next step.",
        evidenceRequired: true,
        ruleKey: "offer.offer_clarity",
      },
      {
        id: "criteria-price-objections",
        title: "Price objection handling",
        description: "Messaging addresses price, value, alternatives, and trust before checkout.",
        scoringGuidance: "Score lower when price objections are visible but not handled.",
        evidenceRequired: true,
        ruleKey: "offer.price_objections",
      },
      {
        id: "criteria-proof-and-trust",
        title: "Proof and trust signals",
        description: "Product pages include credible reviews, guarantees, delivery, and payment clarity.",
        scoringGuidance: "Score higher when proof directly supports the buying decision.",
        evidenceRequired: true,
        ruleKey: "offer.proof_trust",
      },
    ],
  },
  {
    id: "section-brand-positioning",
    sectionKey: "BRAND_POSITIONING",
    name: "Brand Positioning Analysis",
    description: "Checks differentiation, category narrative, audience specificity, and message consistency.",
    weight: 0.9,
    sortOrder: 5,
    criteria: [
      {
        id: "criteria-differentiation",
        title: "Differentiation",
        description: "The brand has a clear reason to choose it over common alternatives.",
        scoringGuidance: "Score lower when the brand relies on generic quality claims.",
        evidenceRequired: false,
        ruleKey: "positioning.differentiation",
      },
      {
        id: "criteria-audience-specificity",
        title: "Audience specificity",
        description: "Messaging clearly identifies who the product is best for.",
        scoringGuidance: "Score higher when audience fit is specific and commercially useful.",
        evidenceRequired: false,
        ruleKey: "positioning.audience_specificity",
      },
      {
        id: "criteria-message-consistency",
        title: "Message consistency",
        description: "Ads, landing pages, product pages, and checkout reinforce the same promise.",
        scoringGuidance: "Score lower when paid traffic sees one promise and the site says another.",
        evidenceRequired: true,
        ruleKey: "positioning.message_consistency",
      },
    ],
  },
  {
    id: "section-channel-expansion",
    sectionKey: "CHANNEL_EXPANSION",
    name: "Channel Expansion & Growth Opportunities",
    description: "Reviews acquisition concentration, retention, CRM, and new growth levers.",
    weight: 1,
    sortOrder: 6,
    criteria: [
      {
        id: "criteria-channel-concentration",
        title: "Channel concentration risk",
        description: "Revenue is not overly dependent on one paid acquisition channel.",
        scoringGuidance: "Score lower when spend and revenue rely heavily on one channel.",
        evidenceRequired: true,
        ruleKey: "growth.channel_concentration",
      },
      {
        id: "criteria-winback-campaigns",
        title: "Winback campaigns",
        description: "Dormant customers and cart abandoners receive structured winback campaigns.",
        scoringGuidance: "Score lower when CRM is not used to recover existing demand.",
        evidenceRequired: true,
        ruleKey: "growth.winback_campaigns",
      },
      {
        id: "criteria-retention-levers",
        title: "Retention levers",
        description: "The brand has repeat purchase, replenishment, loyalty, or lifecycle actions.",
        scoringGuidance: "Score higher when retention is measurable and actively improved.",
        evidenceRequired: false,
        ruleKey: "growth.retention_levers",
      },
    ],
  },
  {
    id: "section-team-workflow",
    sectionKey: "TEAM_WORKFLOW_ALIGNMENT",
    name: "Team Workflow & Internal Alignment",
    description: "Assesses ownership, response times, handoffs, cadence, and operational bottlenecks.",
    weight: 0.9,
    sortOrder: 7,
    criteria: [
      {
        id: "criteria-experiment-ownership",
        title: "Experiment ownership",
        description: "Every priority action has an owner and expected decision date.",
        scoringGuidance: "Score lower when tests are discussed but not owned.",
        evidenceRequired: false,
        ruleKey: "workflow.experiment_ownership",
      },
      {
        id: "criteria-whatsapp-response-sla",
        title: "WhatsApp response SLA",
        description: "Inbound WhatsApp questions receive timely responses during buying windows.",
        scoringGuidance: "Score lower when lead or checkout questions wait too long.",
        evidenceRequired: true,
        ruleKey: "workflow.whatsapp_response_sla",
      },
      {
        id: "criteria-feedback-loop",
        title: "Feedback loop",
        description: "Sales, support, media buying, and site teams share blockers and learnings.",
        scoringGuidance: "Score higher when feedback is structured and acted on weekly.",
        evidenceRequired: false,
        ruleKey: "workflow.feedback_loop",
      },
    ],
  },
  {
    id: "section-experimentation-roadmap",
    sectionKey: "EXPERIMENTATION_ROADMAP",
    name: "Experimentation Roadmap",
    description: "Organizes test backlog, prioritization, metrics, outcomes, and next actions.",
    weight: 1,
    sortOrder: 8,
    criteria: [
      {
        id: "criteria-backlog-quality",
        title: "Backlog quality",
        description: "The experiment backlog connects observed problems to hypotheses and metrics.",
        scoringGuidance: "Score lower when ideas are not tied to evidence or business impact.",
        evidenceRequired: false,
        ruleKey: "roadmap.backlog_quality",
      },
      {
        id: "criteria-prioritization-model",
        title: "Prioritization model",
        description: "Experiments use a simple, editable impact, confidence, and effort model.",
        scoringGuidance: "Score higher when the team can defend what gets tested first.",
        evidenceRequired: false,
        ruleKey: "roadmap.prioritization_model",
      },
      {
        id: "criteria-learning-capture",
        title: "Learning capture",
        description: "Completed experiments capture results, learning, and next action.",
        scoringGuidance: "Score lower when tests end without documented learning.",
        evidenceRequired: false,
        ruleKey: "roadmap.learning_capture",
      },
    ],
  },
];

const responses = [
  {
    id: "response-tracking-foundation",
    criteriaId: "criteria-tracking-foundation",
    score0To5: 1,
    normalizedScore: 20,
    riskLevel: "CRITICAL_GAP",
    confidence: "LOW",
    notes: "Meta pixel fires purchases inconsistently and GA4 revenue does not match backend order totals.",
    responseData: { observedGap: "Purchase event under-counting", estimatedVariancePercent: 34 },
  },
  {
    id: "response-event-naming",
    criteriaId: "criteria-event-naming",
    score0To5: 2,
    normalizedScore: 40,
    riskLevel: "RISK_AREA",
    confidence: "MEDIUM",
    notes: "Event names differ between Meta, GA4, and the Shopify export.",
    responseData: { inconsistentEvents: ["AddToCart", "add_to_cart", "cart_add"] },
  },
  {
    id: "response-cart-checkout-leakage",
    criteriaId: "criteria-cart-checkout-leakage",
    score0To5: 1,
    normalizedScore: 20,
    riskLevel: "CRITICAL_GAP",
    confidence: "HIGH",
    notes: "A large share of users add products to cart but do not start checkout.",
    responseData: { addToCartRatePercent: 11.8, checkoutStartRatePercent: 3.3 },
  },
  {
    id: "response-checkout-completion",
    criteriaId: "criteria-checkout-completion",
    score0To5: 2,
    normalizedScore: 40,
    riskLevel: "RISK_AREA",
    confidence: "HIGH",
    notes: "Cash-on-delivery and shipping reassurance are not visible until late checkout.",
    responseData: { checkoutCompletionRatePercent: 28 },
  },
  {
    id: "response-objection-research",
    criteriaId: "criteria-objection-research",
    score0To5: 2,
    normalizedScore: 40,
    riskLevel: "RISK_AREA",
    confidence: "MEDIUM",
    notes: "Price and delivery questions appear repeatedly in comments, but no structured objection log exists.",
    responseData: { topObjections: ["price", "delivery timing", "product material quality"] },
  },
  {
    id: "response-offer-clarity",
    criteriaId: "criteria-offer-clarity",
    score0To5: 2,
    normalizedScore: 40,
    riskLevel: "RISK_AREA",
    confidence: "MEDIUM",
    notes: "Bundle value is not clear above the fold and discount framing changes between ad and PDP.",
    responseData: { issue: "bundle value unclear" },
  },
  {
    id: "response-price-objections",
    criteriaId: "criteria-price-objections",
    score0To5: 1,
    normalizedScore: 20,
    riskLevel: "CRITICAL_GAP",
    confidence: "MEDIUM",
    notes: "Comments show repeated price concerns without financing, bundle value, or comparison support.",
    responseData: { objectionCountSample: 37 },
  },
  {
    id: "response-differentiation",
    criteriaId: "criteria-differentiation",
    score0To5: 3,
    normalizedScore: 60,
    riskLevel: "NEEDS_IMPROVEMENT",
    confidence: "MEDIUM",
    notes: "The brand has Saudi design cues, but the value proposition still reads close to generic home goods.",
    responseData: { positioningGap: "generic quality claims" },
  },
  {
    id: "response-channel-concentration",
    criteriaId: "criteria-channel-concentration",
    score0To5: 2,
    normalizedScore: 40,
    riskLevel: "RISK_AREA",
    confidence: "HIGH",
    notes: "Meta produces most attributed acquisition revenue.",
    responseData: { metaRevenueSharePercent: 72 },
  },
  {
    id: "response-winback-campaigns",
    criteriaId: "criteria-winback-campaigns",
    score0To5: 1,
    normalizedScore: 20,
    riskLevel: "CRITICAL_GAP",
    confidence: "MEDIUM",
    notes: "No dedicated winback flow exists for dormant buyers or abandoned carts.",
    responseData: { flowsFound: ["welcome", "order confirmation"] },
  },
  {
    id: "response-whatsapp-response-sla",
    criteriaId: "criteria-whatsapp-response-sla",
    score0To5: 1,
    normalizedScore: 20,
    riskLevel: "CRITICAL_GAP",
    confidence: "HIGH",
    notes: "WhatsApp pre-purchase questions often wait more than three hours during campaign peaks.",
    responseData: { medianResponseMinutes: 187 },
  },
  {
    id: "response-prioritization-model",
    criteriaId: "criteria-prioritization-model",
    score0To5: 2,
    normalizedScore: 40,
    riskLevel: "RISK_AREA",
    confidence: "MEDIUM",
    notes: "The team has ideas but no consistent ICE or impact-confidence-effort scoring.",
    responseData: { currentProcess: "ad hoc weekly discussion" },
  },
];

const findings = [
  {
    id: "finding-tracking-gaps",
    auditResponseId: "response-tracking-foundation",
    sectionKey: "MEASUREMENT_DATA_AUDIT",
    title: "Purchase tracking is not reliable enough for scaling decisions",
    description:
      "Paid media optimization is using incomplete purchase and revenue signals, making budget allocation less trustworthy.",
    evidence: "Meta purchase events under-count compared with backend orders, and GA4 revenue does not reconcile cleanly.",
    severity: "CRITICAL",
    confidence: "LOW",
    businessImpact: "Scaling decisions may reward campaigns that appear efficient but are missing revenue context.",
    relatedMetricName: "Purchase event variance",
    relatedMetricValue: new Prisma.Decimal("34"),
    status: "DRAFT",
  },
  {
    id: "finding-checkout-leakage",
    auditResponseId: "response-cart-checkout-leakage",
    sectionKey: "FUNNEL_LEAKAGE_AUDIT",
    title: "Cart-to-checkout drop-off is the largest visible funnel leak",
    description:
      "Users show product intent by adding to cart, but many do not progress to checkout start or completion.",
    evidence: "Add-to-cart rate is 11.8%, checkout-start rate is 3.3%, and checkout completion is 28%.",
    severity: "HIGH",
    confidence: "HIGH",
    businessImpact: "Fixing this leak can improve revenue without requiring more traffic spend.",
    relatedMetricName: "Checkout completion rate",
    relatedMetricValue: new Prisma.Decimal("28"),
    status: "ACCEPTED",
  },
  {
    id: "finding-price-objections",
    auditResponseId: "response-price-objections",
    sectionKey: "OFFER_PRICING_MESSAGING",
    title: "Price objections are visible but not handled in the offer",
    description:
      "Prospects ask whether the bundle is worth the price, but the product page does not clearly defend value.",
    evidence: "Recent ad comments and WhatsApp logs include repeated questions about price, material quality, and delivery.",
    severity: "HIGH",
    confidence: "MEDIUM",
    businessImpact: "Unanswered objections can reduce checkout intent and increase support load.",
    relatedMetricName: "Price objection sample count",
    relatedMetricValue: new Prisma.Decimal("37"),
    status: "DRAFT",
  },
  {
    id: "finding-offer-clarity",
    auditResponseId: "response-offer-clarity",
    sectionKey: "OFFER_PRICING_MESSAGING",
    title: "The main bundle offer is not clear enough above the fold",
    description:
      "Ad promise, product page headline, and bundle contents do not reinforce the same purchase reason.",
    evidence: "The discount is shown in ads, but the product page leads with generic product copy.",
    severity: "MEDIUM",
    confidence: "MEDIUM",
    businessImpact: "Weak offer clarity can make paid traffic compare on price instead of value.",
    relatedMetricName: "Landing page conversion rate",
    relatedMetricValue: new Prisma.Decimal("1.8"),
    status: "EDITED",
  },
  {
    id: "finding-missing-winback",
    auditResponseId: "response-winback-campaigns",
    sectionKey: "CHANNEL_EXPANSION",
    title: "Winback campaigns are missing for dormant customers and cart abandoners",
    description:
      "The brand is paying to acquire demand but has limited CRM recovery for users who already showed intent.",
    evidence: "Only welcome and order confirmation flows were found in the CRM export.",
    severity: "HIGH",
    confidence: "MEDIUM",
    businessImpact: "Revenue recovery is left on the table, especially during promotion windows.",
    relatedMetricName: "Dormant customer segment",
    relatedMetricValue: new Prisma.Decimal("4200"),
    status: "DRAFT",
  },
  {
    id: "finding-whatsapp-sla",
    auditResponseId: "response-whatsapp-response-sla",
    sectionKey: "TEAM_WORKFLOW_ALIGNMENT",
    title: "Slow WhatsApp response SLA is creating buying friction",
    description:
      "Pre-purchase questions are not answered quickly enough during high-intent campaign windows.",
    evidence: "Median WhatsApp response time from the sample is 187 minutes.",
    severity: "CRITICAL",
    confidence: "HIGH",
    businessImpact: "Delayed answers can turn warm buyers into abandoned carts or competitor purchases.",
    relatedMetricName: "Median WhatsApp response time",
    relatedMetricValue: new Prisma.Decimal("187"),
    status: "ACCEPTED",
  },
];

const recommendations = [
  {
    id: "recommendation-fix-tracking",
    findingId: "finding-tracking-gaps",
    title: "Create a tracking QA checklist and reconcile purchase events weekly",
    rationale:
      "The consultant needs trustworthy purchase and revenue signals before increasing spend.",
    expectedImpact: "More reliable budget allocation and clearer campaign-level learning.",
    effort: 4,
    priority: "CRITICAL",
    suggestedOwner: "TRACKING_SPECIALIST",
    confidence: "MEDIUM",
    status: "DRAFT",
  },
  {
    id: "recommendation-checkout-friction",
    findingId: "finding-checkout-leakage",
    title: "Audit cart and checkout friction around payment, shipping, and trust",
    rationale:
      "The largest visible leak occurs after cart intent, so checkout reassurance should be tested before buying more traffic.",
    expectedImpact: "Higher checkout-start and completion rates from existing traffic.",
    effort: 3,
    priority: "HIGH",
    suggestedOwner: "CRO_SPECIALIST",
    confidence: "HIGH",
    status: "ACCEPTED",
  },
  {
    id: "recommendation-offer-clarity",
    findingId: "finding-offer-clarity",
    title: "Rewrite the hero and bundle module around value, savings, and delivery reassurance",
    rationale:
      "The page should answer what is included, why it is worth the price, and how fast it arrives.",
    expectedImpact: "Improved landing page conversion and fewer value-related questions.",
    effort: 3,
    priority: "HIGH",
    suggestedOwner: "COPYWRITER",
    confidence: "MEDIUM",
    status: "DRAFT",
  },
  {
    id: "recommendation-winback",
    findingId: "finding-missing-winback",
    title: "Launch segmented cart abandonment and dormant buyer winback flows",
    rationale:
      "The brand can recover demand from people who already showed intent without depending only on paid acquisition.",
    expectedImpact: "Incremental CRM revenue and lower blended acquisition pressure.",
    effort: 4,
    priority: "HIGH",
    suggestedOwner: "CRM_SPECIALIST",
    confidence: "MEDIUM",
    status: "DRAFT",
  },
  {
    id: "recommendation-whatsapp-sla",
    findingId: "finding-whatsapp-sla",
    title: "Set a 15-minute WhatsApp SLA during paid traffic peak hours",
    rationale:
      "Fast answers can remove objections while shoppers are still in the buying moment.",
    expectedImpact: "Lower cart abandonment from unanswered support and payment questions.",
    effort: 2,
    priority: "CRITICAL",
    suggestedOwner: "CUSTOMER_SUPPORT",
    confidence: "HIGH",
    status: "IN_PROGRESS",
  },
];

const experiments = [
  {
    id: "experiment-checkout-trust-module",
    recommendationId: "recommendation-checkout-friction",
    funnelStage: "Checkout",
    problemObserved: "Users add products to cart but do not start or complete checkout.",
    evidence: "Checkout completion is 28% and shipping/payment reassurance appears late.",
    hypothesis:
      "If payment, shipping, returns, and WhatsApp support are clarified before checkout, more users will complete checkout.",
    proposedChange: "Add a cart-level trust module with delivery ETA, COD clarity, returns, and WhatsApp help.",
    primaryMetric: "Checkout completion rate",
    secondaryMetric: "Checkout-start rate",
    impact: 5,
    confidenceScore: 4,
    ease: 3,
    effort: 3,
    priorityScore: 6,
    owner: "CRO_SPECIALIST",
    status: "PLANNED",
    deadline: new Date("2026-06-15T12:00:00.000Z"),
  },
  {
    id: "experiment-offer-hero-clarity",
    recommendationId: "recommendation-offer-clarity",
    funnelStage: "Product page",
    problemObserved: "The bundle value is unclear above the fold.",
    evidence: "Price objections are frequent and the ad promise is not reinforced on the product page.",
    hypothesis:
      "If the hero explains bundle contents, savings, and delivery reassurance, landing page conversion will improve.",
    proposedChange: "Test a value-led hero with bundle image, savings breakdown, reviews, and delivery promise.",
    primaryMetric: "Product page conversion rate",
    secondaryMetric: "Add-to-cart rate",
    impact: 4,
    confidenceScore: 3,
    ease: 4,
    effort: 3,
    priorityScore: 4,
    owner: "COPYWRITER",
    status: "BACKLOG",
    deadline: new Date("2026-06-30T12:00:00.000Z"),
  },
  {
    id: "experiment-winback-flow",
    recommendationId: "recommendation-winback",
    funnelStage: "CRM",
    problemObserved: "Dormant buyers and cart abandoners are not receiving structured winback messages.",
    evidence: "CRM export shows welcome and order confirmation flows only.",
    hypothesis:
      "If dormant buyers and abandoners receive segmented winback offers, CRM revenue will increase.",
    proposedChange: "Launch 3-message WhatsApp/email winback sequence segmented by last purchase and cart value.",
    primaryMetric: "CRM recovered revenue",
    secondaryMetric: "Repeat purchase rate",
    impact: 4,
    confidenceScore: 3,
    ease: 3,
    effort: 4,
    priorityScore: 3,
    owner: "CRM_SPECIALIST",
    status: "BACKLOG",
    deadline: new Date("2026-07-15T12:00:00.000Z"),
  },
  {
    id: "experiment-whatsapp-sla-routing",
    recommendationId: "recommendation-whatsapp-sla",
    funnelStage: "Support",
    problemObserved: "Pre-purchase WhatsApp questions wait too long during paid traffic peaks.",
    evidence: "Median response time in the sample is 187 minutes.",
    hypothesis:
      "If peak-hour WhatsApp routing keeps response time under 15 minutes, more warm shoppers will complete orders.",
    proposedChange: "Assign peak-hour coverage, quick replies, and escalation rules for payment and delivery questions.",
    primaryMetric: "Median WhatsApp response time",
    secondaryMetric: "Assisted conversion rate",
    impact: 5,
    confidenceScore: 4,
    ease: 4,
    effort: 2,
    priorityScore: 7,
    owner: "CUSTOMER_SUPPORT",
    status: "RUNNING",
    deadline: new Date("2026-06-10T12:00:00.000Z"),
  },
];

const evidenceItems = [
  {
    id: "evidence-purchase-event-variance",
    auditResponseId: "response-tracking-foundation",
    findingId: "finding-tracking-gaps",
    title: "Purchase event variance",
    description: "Backend orders exceed tracked Meta purchase events in the sampled period.",
    source: "Backend orders vs Meta Events Manager sample",
    metricName: "Purchase event variance",
    metricValue: new Prisma.Decimal("34"),
  },
  {
    id: "evidence-checkout-leakage",
    auditResponseId: "response-cart-checkout-leakage",
    findingId: "finding-checkout-leakage",
    recommendationId: "recommendation-checkout-friction",
    experimentId: "experiment-checkout-trust-module",
    title: "Cart-to-checkout funnel snapshot",
    description: "Add-to-cart rate is materially higher than checkout-start and checkout completion.",
    source: "Imported funnel CSV",
    metricName: "Checkout completion rate",
    metricValue: new Prisma.Decimal("28"),
  },
  {
    id: "evidence-price-objections",
    auditResponseId: "response-price-objections",
    findingId: "finding-price-objections",
    title: "Price objection sample",
    description: "Customer comments repeatedly ask why the bundle costs more than alternatives.",
    source: "Ad comments and WhatsApp transcript sample",
    metricName: "Price objection sample count",
    metricValue: new Prisma.Decimal("37"),
  },
  {
    id: "evidence-offer-clarity",
    auditResponseId: "response-offer-clarity",
    findingId: "finding-offer-clarity",
    recommendationId: "recommendation-offer-clarity",
    experimentId: "experiment-offer-hero-clarity",
    title: "Offer mismatch between ad and product page",
    description: "The ad leads with bundle savings, while the product page leads with generic product copy.",
    source: "Consultant landing page review",
  },
  {
    id: "evidence-crm-flow-gap",
    auditResponseId: "response-winback-campaigns",
    findingId: "finding-missing-winback",
    recommendationId: "recommendation-winback",
    experimentId: "experiment-winback-flow",
    title: "CRM flow export",
    description: "Only welcome and order confirmation flows were found.",
    source: "CRM flow export",
    metricName: "Dormant customer segment",
    metricValue: new Prisma.Decimal("4200"),
  },
  {
    id: "evidence-whatsapp-sla",
    auditResponseId: "response-whatsapp-response-sla",
    findingId: "finding-whatsapp-sla",
    recommendationId: "recommendation-whatsapp-sla",
    experimentId: "experiment-whatsapp-sla-routing",
    title: "WhatsApp response time sample",
    description: "Median response time is 187 minutes across sampled pre-purchase conversations.",
    source: "WhatsApp Business export",
    metricName: "Median response time",
    metricValue: new Prisma.Decimal("187"),
  },
];

async function cleanDemoData() {
  const criteriaIds = sectionDefinitions.flatMap((section) =>
    section.criteria.map((criteria) => criteria.id),
  );
  const sectionIds = sectionDefinitions.map((section) => section.id);

  await prisma.export.deleteMany({ where: { auditId: ids.audit } });
  await prisma.evidenceItem.deleteMany({ where: { auditId: ids.audit } });
  await prisma.experiment.deleteMany({ where: { auditId: ids.audit } });
  await prisma.recommendation.deleteMany({ where: { auditId: ids.audit } });
  await prisma.finding.deleteMany({ where: { auditId: ids.audit } });
  await prisma.auditResponse.deleteMany({ where: { auditId: ids.audit } });
  await prisma.audit.deleteMany({ where: { id: ids.audit } });
  await prisma.importedRow.deleteMany({ where: { dataImportId: ids.dataImport } });
  await prisma.dataImport.deleteMany({ where: { id: ids.dataImport } });
  await prisma.brandMetric.deleteMany({ where: { brandId: ids.brand } });
  await prisma.brand.deleteMany({ where: { id: ids.brand } });
  await prisma.auditCriteria.deleteMany({ where: { id: { in: criteriaIds } } });
  await prisma.auditSection.deleteMany({ where: { id: { in: sectionIds } } });
  await prisma.auditTemplate.deleteMany({ where: { id: ids.template } });
  await prisma.user.deleteMany({ where: { id: ids.user } });
}

async function seed() {
  await cleanDemoData();

  await prisma.user.create({
    data: {
      id: ids.user,
      name: "Demo PMCAS Consultant",
      email: "consultant@pmcas.local",
    },
  });

  await prisma.brand.create({
    data: {
      id: ids.brand,
      name: "Najd Home Essentials",
      industry: "Home and lifestyle e-commerce",
      website: "https://najd-home.example",
      market: "Saudi Arabia",
      businessModel: "ECOMMERCE",
      monthlyAdSpend: new Prisma.Decimal("85000"),
      monthlyRevenue: new Prisma.Decimal("310000"),
      averageOrderValue: new Prisma.Decimal("245"),
      mainChannels: ["Meta Ads", "Google Search", "TikTok Ads", "WhatsApp"],
      mainGoal: "Improve conversion efficiency before increasing paid media spend.",
      notes:
        "Saudi e-commerce demo brand with tracking gaps, checkout leakage, price objections, weak offer clarity, missing winback campaigns, and slow WhatsApp response SLA.",
      metrics: {
        create: [
          {
            name: "Landing page conversion rate",
            value: new Prisma.Decimal("1.8"),
            unit: "percent",
            source: "GA4",
            date: new Date("2026-05-01T00:00:00.000Z"),
            notes: "Sample month before audit.",
          },
          {
            name: "Add-to-cart rate",
            value: new Prisma.Decimal("11.8"),
            unit: "percent",
            source: "Shopify export",
            date: new Date("2026-05-01T00:00:00.000Z"),
          },
          {
            name: "Checkout completion rate",
            value: new Prisma.Decimal("28"),
            unit: "percent",
            source: "Shopify export",
            date: new Date("2026-05-01T00:00:00.000Z"),
          },
          {
            name: "Median WhatsApp response time",
            value: new Prisma.Decimal("187"),
            unit: "minutes",
            source: "WhatsApp Business export",
            date: new Date("2026-05-01T00:00:00.000Z"),
          },
        ],
      },
      dataImports: {
        create: {
          id: ids.dataImport,
          fileName: "najd-home-funnel-snapshot.csv",
          fileType: "csv",
          source: "manual CSV upload",
          rowCount: 4,
          notes: "Demo funnel and CRM snapshot for seed data.",
          importedRows: {
            create: [
              {
                rowIndex: 1,
                rawData: {
                  stage: "Landing page",
                  visitors: 120000,
                  conversionRate: "1.8%",
                },
                normalizedData: {
                  stage: "landing_page",
                  visitors: 120000,
                  conversionRatePercent: 1.8,
                },
              },
              {
                rowIndex: 2,
                rawData: {
                  stage: "Add to cart",
                  users: 14160,
                  rate: "11.8%",
                },
                normalizedData: {
                  stage: "add_to_cart",
                  users: 14160,
                  ratePercent: 11.8,
                },
              },
              {
                rowIndex: 3,
                rawData: {
                  stage: "Checkout start",
                  users: 3960,
                  rate: "3.3%",
                },
                normalizedData: {
                  stage: "checkout_start",
                  users: 3960,
                  ratePercent: 3.3,
                },
              },
              {
                rowIndex: 4,
                rawData: {
                  stage: "CRM flows",
                  activeFlows: "welcome, order confirmation",
                  dormantCustomers: 4200,
                },
                normalizedData: {
                  stage: "crm",
                  activeFlows: ["welcome", "order_confirmation"],
                  dormantCustomers: 4200,
                },
              },
            ],
          },
        },
      },
    },
  });

  await prisma.auditTemplate.create({
    data: {
      id: ids.template,
      name: "PMCAS MVP Audit Template",
      version: "1.0.0",
      description:
        "The first practical PMCAS audit framework for structured consulting, evidence, criteria scoring, draft findings, recommendations, and experiments.",
      isActive: true,
      sections: {
        create: sectionDefinitions.map((section) => ({
          id: section.id,
          sectionKey: section.sectionKey,
          name: section.name,
          description: section.description,
          weight: section.weight,
          sortOrder: section.sortOrder,
          criteria: {
            create: section.criteria.map((criteria, index) => ({
              id: criteria.id,
              title: criteria.title,
              description: criteria.description,
              weight: 1,
              scoringGuidance: criteria.scoringGuidance,
              evidenceRequired: criteria.evidenceRequired,
              ruleKey: criteria.ruleKey,
              sortOrder: index + 1,
            })),
          },
        })),
      },
    },
  });

  await prisma.audit.create({
    data: {
      id: ids.audit,
      brandId: ids.brand,
      templateId: ids.template,
      title: "May 2026 PMCAS Conversion Audit",
      auditDate: new Date("2026-05-05T10:00:00.000Z"),
      overallScore: 43,
      overallRisk: "RISK_AREA",
      overallConfidence: "MEDIUM",
      scalingReadiness:
        "Not ready to scale until measurement reliability, checkout leakage, offer clarity, CRM recovery, and WhatsApp SLA are improved.",
      summary:
        "Najd Home Essentials has active demand and meaningful paid traffic, but conversion reliability is constrained by tracking gaps, checkout friction, unresolved price objections, missing winback flows, and slow WhatsApp response times.",
    },
  });

  await prisma.auditResponse.createMany({
    data: responses.map((response) => ({
      ...response,
      auditId: ids.audit,
    })),
  });

  await prisma.finding.createMany({
    data: findings.map((finding) => ({
      ...finding,
      auditId: ids.audit,
    })),
  });

  await prisma.recommendation.createMany({
    data: recommendations.map((recommendation) => ({
      ...recommendation,
      auditId: ids.audit,
    })),
  });

  await prisma.experiment.createMany({
    data: experiments.map((experiment) => ({
      ...experiment,
      auditId: ids.audit,
    })),
  });

  await prisma.evidenceItem.createMany({
    data: evidenceItems.map((evidenceItem) => ({
      ...evidenceItem,
      auditId: ids.audit,
    })),
  });

  await prisma.export.create({
    data: {
      auditId: ids.audit,
      exportType: "AUDIT_SUMMARY",
      fileName: "najd-home-pmcas-audit-summary.csv",
      rowCount: 12,
      notes: "Demo export history row for Google Sheets-compatible audit summary output.",
    },
  });
}

seed()
  .then(async () => {
    console.log("PMCAS demo seed data created.");
  })
  .catch(async (error) => {
    if (error?.code === "ECONNREFUSED") {
      console.error(
        "Could not connect to PostgreSQL. Set DATABASE_URL and start the database before running the PMCAS seed.",
      );
    }
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
