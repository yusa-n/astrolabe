import { eq } from "drizzle-orm";
import { getDb } from "../index";
import { type Team, teams } from "../schema";

export async function getTeamByStripeCustomerId(
  d1: D1Database,
  customerId: string,
) {
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
