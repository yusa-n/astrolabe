import { SignOut } from "@/components/sign-out";
import { getI18n } from "@/locales/server";
import { currentUser } from "@clerk/nextjs/server";

export const metadata = {
  title: "Home",
};

export default async function Page() {
  const user = await currentUser();
  const t = await getI18n();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <p>{t("welcome", { name: user?.emailAddresses[0]?.emailAddress })}</p>

        <SignOut />
      </div>
    </div>
  );
}
