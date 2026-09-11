import { getDb, hashPassword } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function seedUsers() {
  const db = await getDb();
  if (!db) return;

  const demoAccounts = [
    // Consumers / Volunteers
    {
      openId: "cred_marcus_participant",
      username: "marcus_volunteer",
      passwordHash: hashPassword("volunteer123"),
      name: "Marcus Davis",
      email: "marcus.davis92@example.com",
      loginMethod: "credentials",
      role: "user" as const,
    },
    {
      openId: "cred_chloe_student",
      username: "chloe_student",
      passwordHash: hashPassword("student123"),
      name: "Chloe Martinez",
      email: "chloe.m.student@example.edu",
      loginMethod: "credentials",
      role: "user" as const,
    },
    {
      openId: "cred_robert_patient",
      username: "robert_patient",
      passwordHash: hashPassword("patient123"),
      name: "Robert Chen",
      email: "robert.chen.t2d@example.org",
      loginMethod: "credentials",
      role: "user" as const,
    },

    // Institutional Principal Investigators & Coordinators
    {
      openId: "cred_coordinator_sarah",
      username: "coordinator_sarah",
      passwordHash: hashPassword("researcher123"),
      name: "Sarah Lindquist, CRC",
      email: "sarah.lindquist@triangleresearch.org",
      loginMethod: "credentials",
      role: "researcher" as const,
    },
    {
      openId: "cred_pi_whitman",
      username: "pi_whitman",
      passwordHash: hashPassword("whitman123"),
      name: "Dr. H. Whitman, MD",
      email: "whitman@triangleaging.org",
      loginMethod: "credentials",
      role: "researcher" as const,
    },
    {
      openId: "cred_pi_vance",
      username: "pi_vance",
      passwordHash: hashPassword("vance123"),
      name: "Dr. Elena Vance, MD",
      email: "elena.vance@apexpharma.com",
      loginMethod: "credentials",
      role: "researcher" as const,
    },
    {
      openId: "cred_pi_aris",
      username: "pi_aris",
      passwordHash: hashPassword("aris123"),
      name: "Dr. Rachel Aris, MD, PhD",
      email: "rachel.aris@trianglehospital.org",
      loginMethod: "credentials",
      role: "researcher" as const,
    },
    {
      openId: "cred_pi_sterling",
      username: "pi_sterling",
      passwordHash: hashPassword("sterling123"),
      name: "Dr. Marcus Sterling, PhD",
      email: "m.sterling@biovanguard.org",
      loginMethod: "credentials",
      role: "researcher" as const,
    },
    {
      openId: "cred_pi_thorne",
      username: "pi_thorne",
      passwordHash: hashPassword("thorne123"),
      name: "Dr. Julian Thorne, PhD",
      email: "jthorne@carolinaneuro.org",
      loginMethod: "credentials",
      role: "researcher" as const,
    },
  ];

  for (const acc of demoAccounts) {
    const existing = await db.select().from(users).where(eq(users.username, acc.username)).limit(1);
    if (existing.length === 0) {
      await db.insert(users).values(acc);
      console.log(`Seeded account: ${acc.username}`);
    }
  }
}
