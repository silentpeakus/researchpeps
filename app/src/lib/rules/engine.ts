import type { Flag, Insight, LabResultInput, ProtocolEntry, Severity } from "./types";

function byCategory(protocol: ProtocolEntry[], categories: string[]) {
  return protocol.filter((p) => categories.includes(p.category));
}

function byNameIncludes(protocol: ProtocolEntry[], needles: string[]) {
  const lower = needles.map((n) => n.toLowerCase());
  return protocol.filter((p) =>
    lower.some((n) => p.compoundName.toLowerCase().includes(n))
  );
}

function fmt(p: ProtocolEntry) {
  return `${p.compoundName} (${p.doseValue} ${p.doseUnit})`;
}

interface RuleOutcome {
  context: string[];
  relatedCompounds: ProtocolEntry[];
}

interface RuleDef {
  id: string;
  appliesTo: string[];
  severity: Severity;
  evaluate: (
    result: LabResultInput,
    protocol: ProtocolEntry[],
    sex: "MALE" | "FEMALE" | null
  ) => RuleOutcome | null;
}

const INJECTABLE_AAS = ["AAS_INJECTABLE"];
const ANY_ANDROGEN = ["AAS_INJECTABLE", "AAS_ORAL", "SARM"];

const rules: RuleDef[] = [
  {
    id: "hct-injectable-aas",
    appliesTo: ["HCT", "HGB", "RBC"],
    severity: "monitor",
    evaluate: (result, protocol) => {
      if (result.flag !== "high") return null;
      const matches = byCategory(protocol, INJECTABLE_AAS);
      if (matches.length === 0) return null;
      return {
        context: [
          "Injectable anabolic-androgenic steroids, particularly testosterone and nandrolone-class compounds, commonly increase red blood cell production (erythrocytosis) by stimulating erythropoietin activity and bone marrow output.",
          "This is one of the most well-documented lab effects of exogenous androgen use and is a common reason prescribers monitor CBC panels regularly.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "hdl-oral-or-dht",
    appliesTo: ["HDL"],
    severity: "monitor",
    evaluate: (result, protocol) => {
      if (result.flag !== "low") return null;
      const matches = [
        ...byCategory(protocol, ["AAS_ORAL"]),
        ...byNameIncludes(protocol, ["drostanolone"]),
      ];
      if (matches.length === 0) return null;
      return {
        context: [
          "Oral anabolic steroids and DHT-derived compounds (such as drostanolone/Masteron) are well known to suppress HDL cholesterol, sometimes substantially, largely through effects on hepatic lipase activity.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "liver-enzymes-oral-aas",
    appliesTo: ["ALT", "AST", "GGT"],
    severity: "flag",
    evaluate: (result, protocol) => {
      if (result.flag !== "high") return null;
      const matches = byCategory(protocol, ["AAS_ORAL"]);
      if (matches.length === 0) return null;
      return {
        context: [
          "Oral (17-alpha-alkylated) anabolic steroids are metabolized through the liver and are associated with elevated liver enzymes, especially with extended or higher-dose use.",
          "Because liver markers can also be affected by alcohol, other medications, or intense training, this is worth discussing with a healthcare provider rather than attributing to any single cause.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "estradiol-aromatizing",
    appliesTo: ["E2"],
    severity: "monitor",
    evaluate: (result, protocol) => {
      if (result.flag !== "high") return null;
      const matches = byNameIncludes(protocol, [
        "testosterone",
        "boldenone",
        "methandrostenolone",
      ]);
      if (matches.length === 0) return null;
      return {
        context: [
          "Compounds that aromatize into estrogen — most notably testosterone, and to a lesser extent boldenone — can raise estradiol, particularly at higher doses.",
          "Elevated estradiol is sometimes associated with water retention, mood changes, or gynecomastia symptoms, though the lab value alone doesn't determine whether any intervention is needed.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "lh-fsh-suppression",
    appliesTo: ["LH", "FSH"],
    severity: "info",
    evaluate: (result, protocol) => {
      if (result.flag !== "low") return null;
      const matches = byCategory(protocol, ANY_ANDROGEN);
      if (matches.length === 0) return null;
      return {
        context: [
          "Suppressed LH/FSH is an expected physiological response to exogenous testosterone or other anabolic-androgenic compounds, which signal the pituitary to reduce natural hormone production.",
          "This is generally a predictable effect of the current protocol rather than a standalone finding.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "shbg-low",
    appliesTo: ["SHBG"],
    severity: "info",
    evaluate: (result, protocol) => {
      if (result.flag !== "low") return null;
      const matches = [
        ...byCategory(protocol, ["AAS_ORAL"]),
        ...byNameIncludes(protocol, ["drostanolone", "stanozolol"]),
      ];
      if (matches.length === 0) return null;
      return {
        context: [
          "DHT-derived and oral anabolic compounds are associated with reduced SHBG, which increases the free/active fraction of remaining circulating hormones.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "igf1-hgh-context",
    appliesTo: ["IGF1"],
    severity: "info",
    evaluate: (_result, protocol) => {
      const matches = byCategory(protocol, ["HGH"]);
      if (matches.length === 0) return null;
      return {
        context: [
          "IGF-1 is the standard marker used to monitor growth hormone activity. An elevated or high-normal level is an expected and typically intended effect of HGH use rather than an incidental finding.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "glucose-hgh",
    appliesTo: ["GLU", "A1C"],
    severity: "monitor",
    evaluate: (result, protocol) => {
      if (result.flag !== "high") return null;
      const matches = byCategory(protocol, ["HGH"]);
      if (matches.length === 0) return null;
      return {
        context: [
          "Growth hormone can reduce insulin sensitivity, and elevated fasting glucose or HbA1c is a recognized effect worth monitoring, particularly with prolonged or higher-dose use.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "glucose-glp1",
    appliesTo: ["GLU", "A1C"],
    severity: "info",
    evaluate: (result, protocol) => {
      if (result.flag === "high") return null;
      const matches = byNameIncludes(protocol, [
        "retatrutide",
        "semaglutide",
        "tirzepatide",
      ]);
      if (matches.length === 0) return null;
      return {
        context: [
          "GLP-1/GIP receptor agonists are well documented to lower fasting glucose and HbA1c as part of their intended metabolic effect, so a lower or well-controlled result here is consistent with that.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "psa-androgen",
    appliesTo: ["PSA"],
    severity: "flag",
    evaluate: (result, protocol, sex) => {
      if (result.flag !== "high" || sex !== "MALE") return null;
      const matches = byCategory(protocol, ANY_ANDROGEN);
      if (matches.length === 0) return null;
      return {
        context: [
          "Exogenous androgens can influence prostate-specific antigen levels. PSA is a standard marker to monitor for men using testosterone or other androgenic compounds, and any elevation is worth discussing with a healthcare provider promptly.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "creatinine-creatine-supplement",
    appliesTo: ["CREAT"],
    severity: "info",
    evaluate: (result, protocol) => {
      if (result.flag !== "high") return null;
      const matches = byNameIncludes(protocol, ["creatine"]);
      if (matches.length === 0) return null;
      return {
        context: [
          "Creatine supplementation commonly raises serum creatinine as a benign artifact of increased creatine/creatinine turnover in muscle, without necessarily indicating reduced kidney function.",
          "eGFR and, if needed, a cystatin C test can provide more reliable context in this situation.",
        ],
        relatedCompounds: matches,
      };
    },
  },
  {
    id: "testosterone-level-context",
    appliesTo: ["TT", "FT"],
    severity: "info",
    evaluate: (_result, protocol) => {
      const matches = byNameIncludes(protocol, ["testosterone"]);
      if (matches.length === 0) return null;
      return {
        context: [
          "This result reflects your current testosterone protocol. A level above the standard reference range is an expected, often intended, outcome of exogenous testosterone use rather than a spontaneous medical finding.",
        ],
        relatedCompounds: matches,
      };
    },
  },
];

function severityRank(s: Severity) {
  return s === "flag" ? 2 : s === "monitor" ? 1 : 0;
}

function describeResult(r: LabResultInput): string {
  const rangeStr =
    r.rangeLow != null && r.rangeHigh != null
      ? ` (reference range roughly ${r.rangeLow}–${r.rangeHigh} ${r.unit})`
      : "";
  if (r.flag === "high")
    return `${r.name} is ${r.value} ${r.unit}, above the typical reference range${rangeStr}.`;
  if (r.flag === "low")
    return `${r.name} is ${r.value} ${r.unit}, below the typical reference range${rangeStr}.`;
  if (r.flag === "normal")
    return `${r.name} is ${r.value} ${r.unit}, within the typical reference range${rangeStr}.`;
  return `${r.name} is ${r.value} ${r.unit}.`;
}

export function getFlag(value: number, low?: number | null, high?: number | null): Flag {
  if (low == null && high == null) return null;
  if (low != null && value < low) return "low";
  if (high != null && value > high) return "high";
  return "normal";
}

export function runRuleEngine(
  results: LabResultInput[],
  protocol: ProtocolEntry[],
  sex: "MALE" | "FEMALE" | null
): Insight[] {
  const insights: Insight[] = [];

  for (const result of results) {
    let matchedSpecific = false;

    for (const rule of rules) {
      if (!rule.appliesTo.includes(result.code)) continue;
      const outcome = rule.evaluate(result, protocol, sex);
      if (!outcome) continue;
      matchedSpecific = true;
      insights.push({
        id: `${rule.id}:${result.code}`,
        biomarkerCode: result.code,
        biomarkerName: result.name,
        severity: rule.severity,
        summary: describeResult(result),
        context: outcome.context,
        relatedCompounds: outcome.relatedCompounds.map(fmt),
      });
    }

    if (!matchedSpecific && result.flag && result.flag !== "normal") {
      insights.push({
        id: `generic:${result.code}`,
        biomarkerCode: result.code,
        biomarkerName: result.name,
        severity: "flag",
        summary: describeResult(result),
        context: [
          "No specific association with your current protocol is noted in this app's rule set for this finding. It may still be clinically meaningful — discuss it with a healthcare provider or your prescribing physician.",
        ],
        relatedCompounds: [],
      });
    }
  }

  return insights.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}
