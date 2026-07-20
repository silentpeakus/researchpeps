import { prisma } from "./db";

const DEMO_EMAIL = "demo@example.com";

export async function getOrCreateDefaultUser() {
  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: "Demo User" },
  });
}
