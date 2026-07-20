"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Goal, Sex } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOrCreateDefaultUser } from "@/lib/data";

export async function updateProfile(formData: FormData) {
  const user = await getOrCreateDefaultUser();

  const name = String(formData.get("name") || "") || null;
  const dobRaw = String(formData.get("dateOfBirth") || "");
  const sexRaw = String(formData.get("sex") || "");
  const heightRaw = String(formData.get("heightCm") || "");
  const weightRaw = String(formData.get("weightKg") || "");
  const goalRaw = String(formData.get("goal") || "");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      dateOfBirth: dobRaw ? new Date(dobRaw) : null,
      sex: sexRaw ? (sexRaw as Sex) : null,
      heightCm: heightRaw ? Number(heightRaw) : null,
      weightKg: weightRaw ? Number(weightRaw) : null,
      goal: goalRaw ? (goalRaw as Goal) : null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  redirect("/profile");
}

export async function addProtocolItem(formData: FormData) {
  const user = await getOrCreateDefaultUser();

  const compoundId = String(formData.get("compoundId") || "");
  const doseValue = Number(formData.get("doseValue") || 0);
  const doseUnit = String(formData.get("doseUnit") || "");
  const frequency = String(formData.get("frequency") || "") || null;
  const route = String(formData.get("route") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  if (compoundId && doseValue && doseUnit) {
    await prisma.protocolItem.create({
      data: {
        userId: user.id,
        compoundId,
        doseValue,
        doseUnit,
        frequency,
        route,
        notes,
        startDate: new Date(),
      },
    });
  }

  revalidatePath("/protocol");
  revalidatePath("/");
  redirect("/protocol");
}

export async function deleteProtocolItem(formData: FormData) {
  const user = await getOrCreateDefaultUser();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.protocolItem.deleteMany({ where: { id, userId: user.id } });
  }
  revalidatePath("/protocol");
  revalidatePath("/");
  redirect("/protocol");
}

export async function createLabPanel(formData: FormData) {
  const user = await getOrCreateDefaultUser();

  const dateRaw = String(formData.get("date") || "");
  const source = String(formData.get("source") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  const biomarkers = await prisma.biomarker.findMany();

  const resultsToCreate: { biomarkerId: string; value: number }[] = [];
  for (const b of biomarkers) {
    const raw = formData.get(`bio_${b.code}`);
    if (raw == null || raw === "") continue;
    const value = Number(raw);
    if (Number.isNaN(value)) continue;
    resultsToCreate.push({ biomarkerId: b.id, value });
  }

  const panel = await prisma.labPanel.create({
    data: {
      userId: user.id,
      date: dateRaw ? new Date(dateRaw) : new Date(),
      source,
      notes,
      results: { create: resultsToCreate },
    },
  });

  revalidatePath("/");
  redirect(`/labs/${panel.id}`);
}

export async function deleteLabPanel(formData: FormData) {
  const user = await getOrCreateDefaultUser();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.labPanel.deleteMany({ where: { id, userId: user.id } });
  }
  revalidatePath("/");
  redirect("/");
}
