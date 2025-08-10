import { eq } from "drizzle-orm";
import type { Db } from "../index";
import { users, type NewUser } from "../schema";

export async function getUserByClerkId(db: Db, clerkId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .get();
  return result;
}

export async function createUser(db: Db, userData: NewUser) {
  const result = await db.insert(users).values(userData).returning().get();
  return result;
}

export async function ensureUserExists(
  db: Db,
  clerkId: string,
  userData: Omit<NewUser, "id" | "clerkId">,
) {
  const existingUser = await getUserByClerkId(db, clerkId);
  if (existingUser) {
    return existingUser;
  }

  const id = crypto.randomUUID();
  return createUser(db, {
    id,
    clerkId,
    ...userData,
  });
}