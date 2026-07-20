import { prisma } from "@/lib/db";
import { createLabPanel } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NewLabPanelPage() {
  const biomarkers = await prisma.biomarker.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped = biomarkers.reduce<Record<string, typeof biomarkers>>(
    (acc, b) => {
      (acc[b.category] ??= []).push(b);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Add bloodwork</h1>
      <p className="text-sm text-neutral-600">
        Enter values from a single lab draw. Leave any field blank to skip
        it.
      </p>

      <form action={createLabPanel} className="space-y-8">
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-4">
          <div>
            <label className="block text-sm font-medium">Draw date</label>
            <input
              type="date"
              name="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Source / lab (optional)
            </label>
            <input
              type="text"
              name="source"
              placeholder="e.g. LabCorp, Quest"
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {Object.entries(grouped).map(([category, items]) => (
          <div
            key={category}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <h2 className="font-medium">{category}</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((b) => (
                <div key={b.code}>
                  <label className="block text-xs font-medium text-neutral-600">
                    {b.name} ({b.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name={`bio_${b.code}`}
                    className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={2}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Save & interpret
        </button>
      </form>
    </div>
  );
}
