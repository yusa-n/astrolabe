"use server";

import { authActionClient } from "@/actions/safe-action";
import { updateUserSchema } from "./schema";

export const updateUserAction = authActionClient
  .schema(updateUserSchema)
  .metadata({
    name: "update-user",
  })
  .action(async ({ parsedInput: input, ctx: { userId } }) => {
    // TODO: Implement user update with new backend
    console.log("Updating user:", userId, input);

    return { success: true };
  });
