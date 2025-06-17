"use server";

import { authActionClient } from "@/actions/safe-action";
import { shareLinkSchema } from "./schema";

export const shareLinkAction = authActionClient
  .schema(shareLinkSchema)
  .metadata({
    name: "share-link",
  })
  .action(async ({ parsedInput: { postId, baseUrl } }) => {
    // Return the direct link without shortening
    return `${baseUrl}/post/${postId}`;
  });
