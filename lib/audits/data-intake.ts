export type IntakeRequirement = "Required" | "Optional";
export type IntakePriority = "Critical" | "High" | "Medium";
export type IntakeStaticStatus = "Starter item" | "Mapped" | "Delivery check";
export type IntakeMappingStatus = "Mapped" | "Mapping Gap" | "Starter Item";
export type PMCASDestination =
  | "Brand Profile"
  | "Audit Criteria Response"
  | "Finding Evidence"
  | "Recommendation Input"
  | "Experiment Input"
  | "Audit Summary Context"
  | "Client Report Context"
  | "Export Reference"
  | "Delivery Notes";

export type DataIntakeChecklistItem = {
  title: string;
  description: string;
  source: string;
  accessNeeded: string;
  requirement: IntakeRequirement;
  priority: IntakePriority;
  pmcasSection: string;
  pmcasDestination: string;
  suggestedUse: string;
  status: IntakeStaticStatus;
};

export type DataIntakeChecklistGroup = {
  title: string;
  description: string;
  items: DataIntakeChecklistItem[];
};

export type DataIntakeGroupStats = {
  totalItems: number;
  requiredItems: number;
  criticalItems: number;
  mappedItems: number;
  mappingGaps: number;
  starterItems: number;
};

export const dataIntakeChecklistGroups: DataIntakeChecklistGroup[] = [
  {
    title: "Business Context",
    description: "Baseline commercial and positioning context needed before interpreting audit data.",
    items: [
      {
        title: "Brand website URL",
        description: "Primary website or storefront URL used for paid traffic and conversion review.",
        source: "Client website, storefront, or brand profile",
        accessNeeded: "Public website access",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Brand Positioning Analysis",
        pmcasDestination: "Brand Profile",
        suggestedUse: "Anchor the audit to the live customer journey and product context.",
        status: "Mapped",
      },
      {
        title: "Product/category overview",
        description: "Core product categories, hero products, and category economics.",
        source: "Client briefing, catalog, ecommerce backend, website",
        accessNeeded: "Client-provided context",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Offer, Pricing & Messaging Analysis",
        pmcasDestination: "Brand Profile and Audit Criteria evidence",
        suggestedUse: "Support offer, pricing, merchandising, and conversion diagnosis.",
        status: "Mapped",
      },
      {
        title: "Target market",
        description: "Primary geography, audience segments, buyer profile, and language considerations.",
        source: "Client briefing, ad account targeting, CRM notes",
        accessNeeded: "Client-provided context",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Customer & Market Research",
        pmcasDestination: "Brand Profile and Audit Criteria evidence",
        suggestedUse: "Validate whether messaging and channels match the intended buyer.",
        status: "Mapped",
      },
      {
        title: "Current offers",
        description: "Active discounts, bundles, payment plans, shipping offers, and guarantee terms.",
        source: "Website, campaign landing pages, client briefing",
        accessNeeded: "Public website and current offer notes",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Offer, Pricing & Messaging Analysis",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Identify offer strength, friction, and missing conversion hooks.",
        status: "Mapped",
      },
      {
        title: "AOV / price range",
        description: "Average order value and typical purchase price range for audit interpretation.",
        source: "Shopify/backend reports, finance snapshot, brand metrics",
        accessNeeded: "Read-only metric snapshot",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Funnel Leakage Audit",
        pmcasDestination: "Brand Metrics and Audit Criteria evidence",
        suggestedUse: "Contextualize CPA, ROAS, conversion rate, and offer recommendations.",
        status: "Mapped",
      },
      {
        title: "Main competitors",
        description: "Direct competitors, aspirational competitors, and category alternatives.",
        source: "Client briefing, market research, search results",
        accessNeeded: "Public research and client notes",
        requirement: "Optional",
        priority: "Medium",
        pmcasSection: "Brand Positioning Analysis",
        pmcasDestination: "Audit Criteria evidence and Recommendations",
        suggestedUse: "Compare positioning, offer clarity, trust signals, and creative direction.",
        status: "Starter item",
      },
    ],
  },
  {
    title: "Paid Media",
    description: "Platform performance context needed to connect acquisition quality with funnel outcomes.",
    items: [
      {
        title: "Meta Ads performance export or screenshots",
        description: "Campaign, ad set, and ad performance for the audit period.",
        source: "Meta Ads Manager",
        accessNeeded: "Read-only export or screenshots",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Channel Expansion & Growth Opportunities",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Assess channel dependency, spend concentration, creative fatigue, and conversion quality.",
        status: "Mapped",
      },
      {
        title: "Google Ads performance export or screenshots",
        description: "Search, Shopping, Performance Max, or YouTube performance where applicable.",
        source: "Google Ads",
        accessNeeded: "Read-only export or screenshots",
        requirement: "Optional",
        priority: "High",
        pmcasSection: "Channel Expansion & Growth Opportunities",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Compare intent capture, paid search coverage, and channel diversification.",
        status: "Starter item",
      },
      {
        title: "TikTok/Snapchat performance if applicable",
        description: "Performance snapshots for secondary or emerging acquisition channels.",
        source: "TikTok Ads, Snapchat Ads, other paid platforms",
        accessNeeded: "Read-only export or screenshots",
        requirement: "Optional",
        priority: "Medium",
        pmcasSection: "Channel Expansion & Growth Opportunities",
        pmcasDestination: "Audit Criteria evidence and Recommendations",
        suggestedUse: "Identify expansion opportunities or underperforming test channels.",
        status: "Starter item",
      },
      {
        title: "Best/worst campaigns",
        description: "Named campaigns with strongest and weakest performance over the audit period.",
        source: "Ad platform exports, client media notes",
        accessNeeded: "Campaign-level performance snapshot",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Funnel Leakage Audit",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Connect campaign intent and audience quality to funnel behavior.",
        status: "Mapped",
      },
      {
        title: "Best/worst creatives",
        description: "Creative examples with strongest and weakest hook, CTR, CVR, or CPA performance.",
        source: "Ad platform creative view, media buyer notes",
        accessNeeded: "Creative screenshots or links",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Offer, Pricing & Messaging Analysis",
        pmcasDestination: "Audit Criteria evidence, Findings, and Experiments",
        suggestedUse: "Support messaging findings and experiment ideas for new creative tests.",
        status: "Mapped",
      },
      {
        title: "Spend, revenue, purchases, ROAS, CPP/CPA, CTR, CPC, CPM, frequency",
        description: "Core paid media KPI snapshot for each active acquisition channel.",
        source: "Ad platform exports and backend revenue comparison",
        accessNeeded: "Metric export or client-provided KPI table",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Brand Metrics, Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Check measurement reliability, funnel economics, and scaling constraints.",
        status: "Mapped",
      },
    ],
  },
  {
    title: "Website & Funnel",
    description: "Conversion journey review inputs for landing pages, product pages, cart, and checkout.",
    items: [
      {
        title: "Landing page review",
        description: "Primary paid traffic landing pages and above-the-fold messaging.",
        source: "Website and campaign links",
        accessNeeded: "Public website access",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Funnel Leakage Audit",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Identify message match gaps, weak proof, unclear CTA, or speed/friction issues.",
        status: "Mapped",
      },
      {
        title: "Product page review",
        description: "Key product detail pages, product media, pricing, benefits, and trust content.",
        source: "Website/storefront",
        accessNeeded: "Public website access",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Offer, Pricing & Messaging Analysis",
        pmcasDestination: "Audit Criteria evidence, Findings, Recommendations, and Experiments",
        suggestedUse: "Find conversion blockers and prioritize product page tests.",
        status: "Mapped",
      },
      {
        title: "Cart flow review",
        description: "Cart drawer/page flow, shipping thresholds, upsells, and friction points.",
        source: "Website/storefront",
        accessNeeded: "Public website access or test order path",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Funnel Leakage Audit",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Assess cart abandonment drivers and missing reassurance.",
        status: "Mapped",
      },
      {
        title: "Checkout flow review",
        description: "Checkout steps, required fields, payment methods, errors, and completion friction.",
        source: "Website checkout",
        accessNeeded: "Test order path or screen share",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Funnel Leakage Audit",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Identify checkout friction that may suppress purchase completion.",
        status: "Mapped",
      },
      {
        title: "Payment methods",
        description: "Available payment options, installment support, cash on delivery, and local methods.",
        source: "Checkout, client briefing, payment provider settings",
        accessNeeded: "Public checkout or client confirmation",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Offer, Pricing & Messaging Analysis",
        pmcasDestination: "Audit Criteria evidence and Recommendations",
        suggestedUse: "Evaluate payment trust and affordability constraints.",
        status: "Mapped",
      },
      {
        title: "Delivery/return policy",
        description: "Shipping times, return windows, exchange policy, warranty, and guarantee clarity.",
        source: "Website policy pages and customer support notes",
        accessNeeded: "Public website access",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Customer & Market Research",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Connect objections and conversion concerns to trust/reassurance gaps.",
        status: "Mapped",
      },
      {
        title: "Reviews and trust signals",
        description: "Reviews, UGC, certifications, guarantees, social proof, and credibility cues.",
        source: "Website, review apps, social channels",
        accessNeeded: "Public review and website access",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Brand Positioning Analysis",
        pmcasDestination: "Audit Criteria evidence, Findings, and Experiments",
        suggestedUse: "Assess proof strength and identify trust-building tests.",
        status: "Mapped",
      },
    ],
  },
  {
    title: "Tracking & Measurement",
    description: "Measurement reliability inputs that determine how much confidence to place in performance signals.",
    items: [
      {
        title: "Meta Pixel status",
        description: "Pixel installation, event health, domain setup, and event match quality where available.",
        source: "Meta Events Manager",
        accessNeeded: "Read-only screenshots or screen share",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Validate whether Meta reporting can support reliable optimization decisions.",
        status: "Mapped",
      },
      {
        title: "CAPI status",
        description: "Conversions API setup, deduplication, event coverage, and match quality.",
        source: "Meta Events Manager, GTM server-side, ecommerce app",
        accessNeeded: "Read-only screenshots or implementation notes",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Identify tracking gaps that block reliable scaling decisions.",
        status: "Mapped",
      },
      {
        title: "GA4 status",
        description: "GA4 installation, ecommerce events, purchase tracking, and traffic attribution basics.",
        source: "GA4 property",
        accessNeeded: "Read-only screenshots or screen share",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Cross-check platform performance against independent analytics.",
        status: "Mapped",
      },
      {
        title: "GTM setup",
        description: "GTM container setup, triggers, tags, ecommerce data layer, and version history.",
        source: "Google Tag Manager",
        accessNeeded: "Read-only container access or screenshots",
        requirement: "Optional",
        priority: "High",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence and Recommendations",
        suggestedUse: "Understand implementation quality and diagnose missing or duplicate events.",
        status: "Starter item",
      },
      {
        title: "Purchase event reliability",
        description: "Purchase event volume compared across Meta, GA4, and backend/orders.",
        source: "Meta, GA4, ecommerce backend",
        accessNeeded: "Performance snapshots for matching dates",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Determine whether purchase signals are complete enough for optimization.",
        status: "Mapped",
      },
      {
        title: "Platform revenue vs backend revenue comparison",
        description: "Revenue totals by platform versus the source-of-truth backend for the same period.",
        source: "Ad platforms, GA4, Shopify/backend/ERP",
        accessNeeded: "Metric export or screenshot comparison",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Expose attribution gaps, tracking discrepancies, and reporting confidence limits.",
        status: "Mapped",
      },
      {
        title: "Duplicate/missing event issues",
        description: "Known duplicate events, missing purchases, or checkout tracking inconsistencies.",
        source: "Events Manager diagnostics, GA4 debug, developer notes",
        accessNeeded: "Diagnostics screenshots or implementation notes",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "Measurement & Data Audit",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Document measurement risk and decide whether tracking remediation is a priority.",
        status: "Mapped",
      },
    ],
  },
  {
    title: "Customer Support & Objections",
    description: "Qualitative voice-of-customer inputs that explain hesitation, confusion, and buying objections.",
    items: [
      {
        title: "Common WhatsApp/DM objections",
        description: "Repeated sales questions, objections, or confusion from chat and direct messages.",
        source: "WhatsApp, Instagram DMs, sales chat, CRM",
        accessNeeded: "Anonymized examples or support summary",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Customer & Market Research",
        pmcasDestination: "Audit Criteria evidence, Findings, Recommendations, and Experiments",
        suggestedUse: "Turn real objections into messaging, FAQ, and creative test opportunities.",
        status: "Mapped",
      },
      {
        title: "Response time",
        description: "Typical first response time and follow-up process for customer inquiries.",
        source: "Support dashboard, WhatsApp Business, CRM, team notes",
        accessNeeded: "Support performance summary",
        requirement: "Optional",
        priority: "Medium",
        pmcasSection: "Team Workflow & Internal Alignment",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Assess whether sales/support operations are slowing conversion.",
        status: "Starter item",
      },
      {
        title: "Repeated questions",
        description: "Questions that repeatedly appear before purchase decisions.",
        source: "Support transcripts, sales notes, comments",
        accessNeeded: "Anonymized examples or summary",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Customer & Market Research",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Identify missing page content, unclear offers, and objection-handling gaps.",
        status: "Mapped",
      },
      {
        title: "Delivery/payment concerns",
        description: "Questions or objections about delivery timing, payment options, COD, trust, or fees.",
        source: "Support chats, checkout feedback, sales notes",
        accessNeeded: "Anonymized examples or summary",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Offer, Pricing & Messaging Analysis",
        pmcasDestination: "Audit Criteria evidence, Findings, and Recommendations",
        suggestedUse: "Support checkout, offer, and reassurance recommendations.",
        status: "Mapped",
      },
      {
        title: "Refund/return reasons",
        description: "Main reasons customers request refunds, returns, exchanges, or cancellations.",
        source: "Support logs, ecommerce backend, operations notes",
        accessNeeded: "Aggregated reason summary",
        requirement: "Optional",
        priority: "Medium",
        pmcasSection: "Customer & Market Research",
        pmcasDestination: "Audit Criteria evidence and Findings",
        suggestedUse: "Identify expectation gaps and product detail improvements.",
        status: "Starter item",
      },
    ],
  },
  {
    title: "PMCAS Entry Mapping",
    description: "Internal steps for turning collected data into structured PMCAS audit records.",
    items: [
      {
        title: "Brand Profile data entered",
        description: "Business context, market, website, goals, channels, and core financial metrics are captured.",
        source: "Brand profile form",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "All sections",
        pmcasDestination: "Brand Profile",
        suggestedUse: "Create the baseline context used throughout the audit.",
        status: "Mapped",
      },
      {
        title: "Audit Criteria evidence entered",
        description: "Evidence and notes are added to criteria responses before scoring conclusions are relied on.",
        source: "Audit Workspace",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "Critical",
        pmcasSection: "All sections",
        pmcasDestination: "Audit Criteria evidence",
        suggestedUse: "Ensure scores remain explainable and tied to collected inputs.",
        status: "Mapped",
      },
      {
        title: "Findings created from confirmed issues",
        description: "Manual findings are added only after issues are confirmed with evidence or consultant judgment.",
        source: "Audit Workspace findings group",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Workflow",
        pmcasDestination: "Findings",
        suggestedUse: "Convert audit observations into clear problems or opportunities.",
        status: "Mapped",
      },
      {
        title: "Recommendations created from findings",
        description: "Recommendations are linked to findings and describe practical next actions.",
        source: "Audit Workspace recommendations group",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Workflow",
        pmcasDestination: "Recommendations",
        suggestedUse: "Turn confirmed issues into consultant-controlled action items.",
        status: "Mapped",
      },
      {
        title: "Experiments created from recommendations",
        description: "Experiments are linked to recommendations when a test or operational action should be prioritized.",
        source: "Audit Workspace experiments group",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Optional",
        priority: "Medium",
        pmcasSection: "Experimentation Roadmap",
        pmcasDestination: "Experiments",
        suggestedUse: "Build a practical testing roadmap from approved recommendations.",
        status: "Mapped",
      },
      {
        title: "Report reviewed before delivery",
        description: "Audit Summary and Client Report are checked before exporting or presenting to the client.",
        source: "Audit Summary and Client Report",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Delivery",
        pmcasDestination: "Audit Summary and Client Report",
        suggestedUse: "Confirm that report output matches current audit data and consultant judgment.",
        status: "Delivery check",
      },
    ],
  },
  {
    title: "Delivery Notes",
    description: "Final consultant delivery checks before using exports or presenting the report.",
    items: [
      {
        title: "Client report reviewed",
        description: "Client-ready report is reviewed for clarity, unsupported claims, and delivery readiness.",
        source: "Client Report",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Delivery",
        pmcasDestination: "Client Report",
        suggestedUse: "Prepare the report narrative before client discussion.",
        status: "Delivery check",
      },
      {
        title: "Full Audit Workbook exported",
        description: "Formatted workbook is downloaded as the default professional output.",
        source: "Export Center",
        accessNeeded: "PMCAS export center",
        requirement: "Required",
        priority: "High",
        pmcasSection: "Delivery",
        pmcasDestination: "Exports",
        suggestedUse: "Provide structured supporting data for review or handoff.",
        status: "Delivery check",
      },
      {
        title: "Key talking points prepared",
        description: "Main risks, priorities, and next actions are prepared for the consultant delivery conversation.",
        source: "Audit Summary, Client Report, consultant notes",
        accessNeeded: "PMCAS internal workspace",
        requirement: "Required",
        priority: "Medium",
        pmcasSection: "Delivery",
        pmcasDestination: "Client Report and Recommendations",
        suggestedUse: "Make the client conversation focused and action-oriented.",
        status: "Delivery check",
      },
      {
        title: "Client feedback captured after delivery",
        description: "Client reactions, constraints, approvals, and next-step decisions are captured after presentation.",
        source: "Delivery notes, meeting notes, consultant follow-up",
        accessNeeded: "Consultant notes",
        requirement: "Optional",
        priority: "Medium",
        pmcasSection: "Team Workflow & Internal Alignment",
        pmcasDestination: "Recommendations and Experiments",
        suggestedUse: "Keep future prioritization aligned with client constraints and feedback.",
        status: "Delivery check",
      },
    ],
  },
];

export function getDataIntakeStats(groups = dataIntakeChecklistGroups) {
  const items = groups.flatMap((group) => group.items);
  const requiredItems = items.filter((item) => item.requirement === "Required");
  const criticalItems = items.filter((item) => item.priority === "Critical");
  const mappedItems = items.filter((item) => getItemMappingStatus(item) === "Mapped");
  const mappingGaps = items.filter((item) => getItemMappingStatus(item) === "Mapping Gap");
  const starterItems = items.filter((item) => getItemMappingStatus(item) === "Starter Item");
  const criteriaMappedItems = items.filter((item) =>
    getItemDestinations(item).includes("Audit Criteria Response"),
  );
  const workflowMappedItems = items.filter((item) =>
    ["Finding Evidence", "Recommendation Input", "Experiment Input"].some((destination) =>
      getItemDestinations(item).includes(destination as PMCASDestination),
    ),
  );
  const deliveryMappedItems = items.filter((item) =>
    getItemDestinations(item).includes("Delivery Notes"),
  );

  return {
    totalItems: items.length,
    requiredItems: requiredItems.length,
    criticalItems: criticalItems.length,
    mappedItems: mappedItems.length,
    mappingGaps: mappingGaps.length,
    starterItems: starterItems.length,
    criteriaMappedItems: criteriaMappedItems.length,
    workflowMappedItems: workflowMappedItems.length,
    deliveryMappedItems: deliveryMappedItems.length,
    readinessState: "Starter checklist ready",
  };
}

export function getDataIntakeGroupStats(group: DataIntakeChecklistGroup): DataIntakeGroupStats {
  const mappedItems = group.items.filter((item) => getItemMappingStatus(item) === "Mapped");
  const mappingGaps = group.items.filter((item) => getItemMappingStatus(item) === "Mapping Gap");
  const starterItems = group.items.filter((item) => getItemMappingStatus(item) === "Starter Item");

  return {
    totalItems: group.items.length,
    requiredItems: group.items.filter((item) => item.requirement === "Required").length,
    criticalItems: group.items.filter((item) => item.priority === "Critical").length,
    mappedItems: mappedItems.length,
    mappingGaps: mappingGaps.length,
    starterItems: starterItems.length,
  };
}

export function getItemMappingStatus(item: DataIntakeChecklistItem): IntakeMappingStatus {
  if (item.status === "Starter item") {
    return "Starter Item";
  }

  return getItemDestinations(item).length > 0 ? "Mapped" : "Mapping Gap";
}

export function getItemDestinations(item: DataIntakeChecklistItem): PMCASDestination[] {
  const destinationText = item.pmcasDestination.toLowerCase();
  const destinations = new Set<PMCASDestination>();

  if (destinationText.includes("brand profile") || destinationText.includes("brand metrics")) {
    destinations.add("Brand Profile");
  }

  if (destinationText.includes("criteria")) {
    destinations.add("Audit Criteria Response");
  }

  if (destinationText.includes("finding")) {
    destinations.add("Finding Evidence");
  }

  if (destinationText.includes("recommendation")) {
    destinations.add("Recommendation Input");
  }

  if (destinationText.includes("experiment")) {
    destinations.add("Experiment Input");
  }

  if (destinationText.includes("audit summary")) {
    destinations.add("Audit Summary Context");
  }

  if (destinationText.includes("client report")) {
    destinations.add("Client Report Context");
  }

  if (destinationText.includes("export")) {
    destinations.add("Export Reference");
  }

  if (destinationText.includes("delivery")) {
    destinations.add("Delivery Notes");
  }

  return Array.from(destinations);
}
