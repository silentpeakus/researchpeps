import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrCreateDefaultUser } from "@/lib/data";
import { getFlag, runRuleEngine } from "@/lib/rules/engine";
import type { LabResultInput, ProtocolEntry } from "@/lib/rules/types";
import { explainInsights } from "@/lib/llm/explain";
import { deleteLabPanel } from "@/app/actions";

const SEVERITY_STYLES: Record<string, string> = {
  flag: "bg-red-100 text-red-800",
  monitor: "bg-amber-100 text-amber-800",
  info: "bg-blue-100 text-blue-800",
};

const FLAG_STYLES: Record<string, string> = {
  high: "text-red-700 font-medium",
  low: "text-amber-700 font-medium",
  normal: "text-neutral-700",
};

export default async function LabPanelPage(
  props: PageProps<"/labs/[id]">
) {
  const { id } = await props.params;
  const user = await getOrCreateDefaultUser();

  const panel = await prisma.labPanel.findFirst({
    where: { id, userId: user.id },
    include: {
      results: { include: { biomarker: true }, orderBy: { biomarker: { category: "asc" } } },
    },
  });

  if (!panel) notFound();

  const protocolItems = await prisma.protocolItem.findMany({
    where: { userId: user.id, endDate: null },
    include: { compound: true },
  });

  const protocol: ProtocolEntry[] = protocolItems.map((p) => ({
    compoundName: p.compound.name,
    category: p.compound.category,
    doseValue: p.doseValue,
    doseUnit: p.doseUnit,
  }));

  const results: LabResultInput[] = panel.results.map((r) => ({
    code: r.biomarker.code,
    name: r.biomarker.name,
    value: r.value,
    unit: r.biomarker.unit,
    flag: getFlag(
      r.value,
      user.sex === "FEMALE" ? r.biomarker.rangeLowFemale : r.biomarker.rangeLowMale,
      user.sex === "FEMALE" ? r.biomarker.rangeHighFemale : r.biomarker.rangeHighMale
    ),
    rangeLow: user.sex === "FEMALE" ? r.biomarker.rangeLowFemale : r.biomarker.rangeLowMale,
    rangeHigh: user.sex === "FEMALE" ? r.biomarker.rangeHighFemale : r.biomarker.rangeHighMale,
  }));

  const insights = runRuleEngine(results, protocol, user.sex);

  const protocolSummary = protocol
    .map((p) => `${p.compoundName} ${p.doseValue}${p.doseUnit}`)
    .join("; ");

  const narrative = await explainInsights(insights, {
    goal: user.goal,
    sex: user.sex,
    protocolSummary,
    panelDate: new Date(panel.date).toLocaleDateString(),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Bloodwork — {new Date(panel.date).toLocaleDateString()}
          </h1>
          {panel.source && (
            <p className="text-sm text-neutral-600">{panel.source}</p>
          )}
        </div>
        <form action={deleteLabPanel}>
          <input type="hidden" name="id" value={panel.id} />
          <button type="submit" className="text-xs text-red-600 underline">
            delete panel
          </button>
        </form>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-medium">Interpretation</h2>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {narrative}
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Educational information only, generated from a deterministic rule
          set plus your entered protocol — not a diagnosis or medical advice.
        </p>
      </section>

      {insights.length > 0 && (
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-medium">Flagged findings</h2>
          <ul className="mt-3 space-y-3">
            {insights.map((insight) => (
              <li key={insight.id} className="text-sm">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[insight.severity]}`}
                >
                  {insight.severity.toUpperCase()}
                </span>{" "}
                <span className="font-medium">{insight.biomarkerName}</span>
                <p className="mt-1 text-neutral-700">{insight.summary}</p>
                {insight.relatedCompounds.length > 0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Related: {insight.relatedCompounds.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-medium">All values</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="py-1 pr-2 font-normal">Marker</th>
              <th className="py-1 pr-2 font-normal">Value</th>
              <th className="py-1 pr-2 font-normal">Reference range</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.code} className="border-b border-neutral-100">
                <td className="py-1.5 pr-2">{r.name}</td>
                <td className={`py-1.5 pr-2 ${FLAG_STYLES[r.flag ?? "normal"]}`}>
                  {r.value} {r.unit}
                </td>
                <td className="py-1.5 pr-2 text-neutral-500">
                  {r.rangeLow != null && r.rangeHigh != null
                    ? `${r.rangeLow}–${r.rangeHigh} ${r.unit}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
