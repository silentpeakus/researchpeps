import { getOrCreateDefaultUser } from "@/lib/data";
import { updateProfile } from "@/app/actions";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function ProfilePage() {
  const user = await getOrCreateDefaultUser();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={user.name ?? ""}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Date of birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={toDateInputValue(user.dateOfBirth)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Sex</label>
            <select
              name="sex"
              defaultValue={user.sex ?? ""}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              name="heightCm"
              defaultValue={user.heightCm ?? ""}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              name="weightKg"
              defaultValue={user.weightKg ?? ""}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Primary goal</label>
          <select
            name="goal"
            defaultValue={user.goal ?? ""}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            <option value="TRT_OPTIMIZATION">TRT Optimization</option>
            <option value="BODYBUILDING">Bodybuilding</option>
            <option value="LONGEVITY">Longevity</option>
            <option value="WEIGHT_LOSS">Weight Loss</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="GENERAL_HEALTH">General Health</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}
