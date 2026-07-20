import Link from "next/link";
import { prisma } from "@/lib/db";
import { getOrCreateDefaultUser } from "@/lib/data";

export const dynamic = "force-dynamic";

const GOAL_LABELS: Record<string, string> = {
  TRT_OPTIMIZATION: "TRT Optimization",
  BODYBUILDING: "Bodybuilding",
  LONGEVITY: "Longevity",
  WEIGHT_LOSS: "Weight Loss",
  PERFORMANCE: "Performance",
  GENERAL_HEALTH: "General Health",
};

export default async function DashboardPage() {
  const user = await getOrCreateDefaultUser();

  const [protocolItems, labPanels] = await Promise.all([
    prisma.protocolItem.findMany({
      where: { userId: user.id, endDate: null },
      include: { compound: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.labPanel.findMany({
      where: { userId: user.id },
      include: { _count: { select: { results: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {user.name || "Demo User"}
          {user.goal ? ` · ${GOAL_LABELS[user.goal] ?? user.goal}` : ""}
          {" · "}
          <Link href="/profile" className="underline">
            edit profile
          </Link>
        </p>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Current protocol</h2>
          <Link href="/protocol" className="text-sm underline">
            manage
          </Link>
        </div>
        {protocolItems.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            No protocol entered yet. Add what you&apos;re taking so bloodwork
            can be interpreted in context.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {protocolItems.map((item) => (
              <li
                key={item.id}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm"
              >
                {item.compound.name} · {item.doseValue} {item.doseUnit}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Bloodwork history</h2>
          <Link
            href="/labs/new"
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
          >
            + Add bloodwork
          </Link>
        </div>
        {labPanels.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No lab panels yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200">
            {labPanels.map((panel) => (
              <li key={panel.id} className="py-2">
                <Link
                  href={`/labs/${panel.id}`}
                  className="flex items-center justify-between text-sm hover:underline"
                >
                  <span>
                    {new Date(panel.date).toLocaleDateString()}
                    {panel.source ? ` · ${panel.source}` : ""}
                  </span>
                  <span className="text-neutral-500">
                    {panel._count.results} values
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
