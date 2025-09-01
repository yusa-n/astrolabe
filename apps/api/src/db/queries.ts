import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { teamMembers, teams, type Team } from "./schema";

export async function getTeamByStripeCustomerId(d1: D1Database, customerId: string) {
  const db = getDb(d1);
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);
  return result.length > 0 ? (result[0] as Team) : null;
}

export async function updateTeamSubscription(
  d1: D1Database,
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  },
) {
  const db = getDb(d1);
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

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
