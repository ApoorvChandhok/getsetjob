"use server";

import { db } from "@/db";
import { linkedinBotProfiles, linkedinBotSkills, linkedinBotExclusions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getLinkedinProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [profile] = await db.select().from(linkedinBotProfiles).where(eq(linkedinBotProfiles.userId, session.user.id));
  const skills = await db.select().from(linkedinBotSkills).where(eq(linkedinBotSkills.userId, session.user.id));
  const exclusions = await db.select().from(linkedinBotExclusions).where(eq(linkedinBotExclusions.userId, session.user.id));

  return { profile: profile || null, skills, exclusions };
}

export async function updateLinkedinProfile(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [existing] = await db.select().from(linkedinBotProfiles).where(eq(linkedinBotProfiles.userId, session.user.id));

  if (existing) {
    await db.update(linkedinBotProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(linkedinBotProfiles.userId, session.user.id));
  } else {
    await db.insert(linkedinBotProfiles).values({
      userId: session.user.id,
      ...data,
    });
  }
}

export async function saveLinkedinSkills(skills: { skillName: string; yearsExperience: number }[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(linkedinBotSkills).where(eq(linkedinBotSkills.userId, session.user.id));

  if (skills.length > 0) {
    const records = skills.map((s) => ({ ...s, userId: session.user.id! }));
    await db.insert(linkedinBotSkills).values(records);
  }
}

export async function saveLinkedinExclusions(exclusions: { exclusionType: string; value: string }[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(linkedinBotExclusions).where(eq(linkedinBotExclusions.userId, session.user.id));

  if (exclusions.length > 0) {
    const records = exclusions.map((e) => ({ ...e, userId: session.user.id! }));
    await db.insert(linkedinBotExclusions).values(records);
  }
}
