import { Button } from "@astrolabe/ui/button";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Login",
};

export default function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center size-96 gap-4">
        <Image src="/logo.png" alt="logo" width={350} height={350} />
        <Link href={`/${locale}/sign-in`}>
          <Button variant="outline" className="font-mono">
            Sign in with Clerk
          </Button>
        </Link>
      </div>
    </div>
  );
}
