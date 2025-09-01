"use client";

import { Button } from "@astrolabe/ui/button";
import { Icons } from "@astrolabe/ui/icons";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SignOut() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="font-mono gap-2 flex items-center"
    >
      <Icons.SignOut className="size-4" />
      <span>Sign out</span>
    </Button>
  );
}
