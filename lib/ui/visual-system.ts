export type VisualTone =
  | "dashboard"
  | "brands"
  | "audits"
  | "findings"
  | "recommendations"
  | "experiments"
  | "reports"
  | "exports"
  | "neutral";

type VisualToneConfig = {
  marker: string;
  label: string;
  headerClass: string;
  markerClass: string;
  iconClass: string;
  cardClass: string;
  hoverClass: string;
  accentBorderClass: string;
  textClass: string;
};

export const visualToneConfig: Record<VisualTone, VisualToneConfig> = {
  dashboard: {
    marker: "📊",
    label: "Dashboard",
    headerClass: "border-blue-300/80 bg-blue-100/55",
    markerClass: "border-blue-300 bg-blue-100 text-blue-900",
    iconClass: "border-blue-300 bg-blue-100 text-blue-900",
    cardClass: "border-blue-300/80 bg-blue-50/75",
    hoverClass: "hover:border-blue-400/80 hover:bg-blue-100/65",
    accentBorderClass: "border-s-blue-600",
    textClass: "text-blue-900",
  },
  brands: {
    marker: "🏷️",
    label: "Brands",
    headerClass: "border-indigo-300/80 bg-indigo-100/55",
    markerClass: "border-indigo-300 bg-indigo-100 text-indigo-900",
    iconClass: "border-indigo-300 bg-indigo-100 text-indigo-900",
    cardClass: "border-indigo-300/80 bg-indigo-50/75",
    hoverClass: "hover:border-indigo-400/80 hover:bg-indigo-100/65",
    accentBorderClass: "border-s-indigo-600",
    textClass: "text-indigo-900",
  },
  audits: {
    marker: "🧭",
    label: "Audits",
    headerClass: "border-cyan-300/85 bg-cyan-100/60",
    markerClass: "border-cyan-300 bg-cyan-100 text-cyan-900",
    iconClass: "border-cyan-300 bg-cyan-100 text-cyan-900",
    cardClass: "border-cyan-300/85 bg-cyan-50/80",
    hoverClass: "hover:border-cyan-500/70 hover:bg-cyan-100/65",
    accentBorderClass: "border-s-cyan-600",
    textClass: "text-cyan-900",
  },
  findings: {
    marker: "⚠️",
    label: "Findings",
    headerClass: "border-orange-300/85 bg-orange-100/60",
    markerClass: "border-orange-300 bg-orange-100 text-orange-950",
    iconClass: "border-orange-300 bg-orange-100 text-orange-950",
    cardClass: "border-orange-300/85 bg-orange-50/80",
    hoverClass: "hover:border-orange-500/70 hover:bg-orange-100/65",
    accentBorderClass: "border-s-orange-600",
    textClass: "text-orange-950",
  },
  recommendations: {
    marker: "💡",
    label: "Recommendations",
    headerClass: "border-emerald-300/85 bg-emerald-100/60",
    markerClass: "border-emerald-300 bg-emerald-100 text-emerald-900",
    iconClass: "border-emerald-300 bg-emerald-100 text-emerald-900",
    cardClass: "border-emerald-300/85 bg-emerald-50/80",
    hoverClass: "hover:border-emerald-500/70 hover:bg-emerald-100/65",
    accentBorderClass: "border-s-emerald-600",
    textClass: "text-emerald-900",
  },
  experiments: {
    marker: "🧪",
    label: "Experiments",
    headerClass: "border-purple-300/85 bg-purple-100/60",
    markerClass: "border-purple-300 bg-purple-100 text-purple-900",
    iconClass: "border-purple-300 bg-purple-100 text-purple-900",
    cardClass: "border-purple-300/85 bg-purple-50/80",
    hoverClass: "hover:border-purple-500/70 hover:bg-purple-100/65",
    accentBorderClass: "border-s-purple-600",
    textClass: "text-purple-900",
  },
  reports: {
    marker: "📄",
    label: "Reports",
    headerClass: "border-slate-300 bg-slate-100/75",
    markerClass: "border-slate-300 bg-slate-100 text-slate-900",
    iconClass: "border-slate-300 bg-slate-100 text-slate-900",
    cardClass: "border-slate-300 bg-slate-50/90",
    hoverClass: "hover:border-slate-400 hover:bg-slate-100/75",
    accentBorderClass: "border-s-slate-600",
    textClass: "text-slate-900",
  },
  exports: {
    marker: "⬇️",
    label: "Exports",
    headerClass: "border-sky-300/85 bg-sky-100/60",
    markerClass: "border-sky-300 bg-sky-100 text-sky-900",
    iconClass: "border-sky-300 bg-sky-100 text-sky-900",
    cardClass: "border-sky-300/85 bg-sky-50/80",
    hoverClass: "hover:border-sky-500/70 hover:bg-sky-100/65",
    accentBorderClass: "border-s-sky-600",
    textClass: "text-sky-900",
  },
  neutral: {
    marker: "",
    label: "Neutral",
    headerClass: "border-border/80 bg-card",
    markerClass: "border-border bg-background text-foreground",
    iconClass: "border-border bg-background text-muted-foreground",
    cardClass: "border-border/80 bg-card",
    hoverClass: "hover:border-primary/25 hover:bg-muted/15",
    accentBorderClass: "border-s-border",
    textClass: "text-foreground",
  },
};

export function getVisualTone(tone: VisualTone = "neutral") {
  return visualToneConfig[tone];
}
