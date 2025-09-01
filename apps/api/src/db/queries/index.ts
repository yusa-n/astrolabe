import { eq } from "drizzle-orm";
import { getDb } from "../index";
import { teamMembers, teams } from "../schema";
export * from "./users";
export * from "./stripe";

export async function getTeamForUserId(d1: D1Database, userId: string) {
  const db = getDb(d1);
  const result = await db
    .select({ teamId: teamMembers.teamId, team: teams })
    .from(teamMembers)
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0].team : null;
}
