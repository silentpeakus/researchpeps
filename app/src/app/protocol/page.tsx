import { prisma } from "@/lib/db";
import { getOrCreateDefaultUser } from "@/lib/data";
import { addProtocolItem, deleteProtocolItem } from "@/app/actions";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  AAS_INJECTABLE: "Injectable AAS",
  AAS_ORAL: "Oral AAS",
  PEPTIDE: "Peptide",
  HGH: "HGH",
  SARM: "SARM",
  SUPPLEMENT: "Supplement",
  MEDICATION: "Medication",
  OTHER: "Other",
};

export default async function ProtocolPage() {
  const user = await getOrCreateDefaultUser();

  const [protocolItems, compounds] = await Promise.all([
    prisma.protocolItem.findMany({
      where: { userId: user.id, endDate: null },
      include: { compound: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.compound.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  const grouped = compounds.reduce<Record<string, typeof compounds>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Current protocol</h1>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-medium">Active items</h2>
        {protocolItems.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Nothing entered yet — add what you&apos;re currently taking below.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200">
            {protocolItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{item.compound.name}</span>{" "}
                  <span className="text-neutral-600">
                    {item.doseValue} {item.doseUnit}
                    {item.frequency ? ` · ${item.frequency}` : ""}
                    {item.route ? ` · ${item.route}` : ""}
                  </span>
                </div>
                <form action={deleteProtocolItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 underline"
                  >
                    remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-medium">Add protocol item</h2>
        <form action={addProtocolItem} className="mt-3 space-y-4">
          <div>
            <label className="block text-sm font-medium">Compound</label>
            <select
              name="compoundId"
              required
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {Object.entries(grouped).map(([category, items]) => (
                <optgroup key={category} label={CATEGORY_LABELS[category] ?? category}>
                  {items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (default: {c.defaultUnit})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Dose</label>
              <input
                type="number"
                step="0.01"
                name="doseValue"
                required
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Unit</label>
              <input
                type="text"
                name="doseUnit"
                placeholder="e.g. mg/week"
                required
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Frequency</label>
              <input
                type="text"
                name="frequency"
                placeholder="e.g. weekly, EOD"
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Route</label>
              <input
                type="text"
                name="route"
                placeholder="e.g. IM, SubQ, oral"
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <input
              type="text"
              name="notes"
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Add to protocol
          </button>
        </form>
      </section>
    </div>
  );
}
