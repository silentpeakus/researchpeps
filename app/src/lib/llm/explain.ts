import type { Insight } from "../rules/types";

export interface ExplainContext {
  goal: string | null;
  sex: string | null;
  protocolSummary: string;
  panelDate: string;
}

const NO_FINDINGS_MESSAGE =
  "No protocol-related patterns were flagged in this panel by the rule set. That doesn't mean every value is optimal — review each result against its reference range below, and discuss anything you're unsure about with a healthcare provider.";

export async function explainInsights(
  insights: Insight[],
  ctx: ExplainContext
): Promise<string> {
  if (insights.length === 0) return NO_FINDINGS_MESSAGE;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return templateExplain(insights);

  try {
    return await callAnthropic(insights, ctx, apiKey);
  } catch (err) {
    console.error("LLM explanation failed, falling back to template:", err);
    return templateExplain(insights);
  }
}

function templateExplain(insights: Insight[]): string {
  return insights
    .map((i) => {
      const related = i.relatedCompounds.length
        ? ` Related to: ${i.relatedCompounds.join(", ")}.`
        : "";
      return `${i.summary}${related} ${i.context.join(" ")}`;
    })
    .join("\n\n");
}

async function callAnthropic(
  insights: Insight[],
  ctx: ExplainContext,
  apiKey: string
): Promise<string> {
  const factSheet = insights
    .map(
      (i) =>
        `- [${i.severity.toUpperCase()}] ${i.biomarkerName} (${i.biomarkerCode}): ${i.summary} Facts: ${i.context.join(
          " "
        )} Related protocol items: ${i.relatedCompounds.join(", ") || "none"}`
    )
    .join("\n");

  const system = `You are a cautious lab-interpretation writer for an app used by bodybuilders and biohackers who take anabolic steroids, peptides, HGH, and related compounds.

You are given a set of deterministic, pre-computed facts about a user's bloodwork and their current protocol. Rewrite these facts as clear, plain-language explanations grouped by finding.

Rules:
- Do not invent facts, values, or associations beyond what is given in the fact sheet.
- Frame associations as "commonly associated with" or "consistent with", never as definitive causation or diagnosis.
- Do not recommend specific dose changes, or tell the user to start/stop/adjust their protocol.
- Keep each finding to 2-4 sentences.
- End the overall response with one brief reminder that this is educational information, not medical advice, and results should be reviewed with a qualified healthcare provider.`;

  const user = `User goal: ${ctx.goal ?? "not specified"}
Sex: ${ctx.sex ?? "not specified"}
Current protocol: ${ctx.protocolSummary || "none entered"}
Lab panel date: ${ctx.panelDate}

Pre-computed findings:
${factSheet}

Write the explanation now.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content
    ?.map((b) => b.text ?? "")
    .join("")
    .trim();

  return text || templateExplain(insights);
}
