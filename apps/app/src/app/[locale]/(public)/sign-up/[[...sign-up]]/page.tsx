import { SignUp } from "@clerk/nextjs";
import { getI18n } from "@/locales/server";

export default async function SignUpPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getI18n();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary opacity-20 blur-3xl" />
      </div>

      <SignUp
        afterSignUpUrl={`/${locale}`}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "backdrop-blur-xl bg-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/20",
            headerTitle:
              "text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton:
              "bg-white/80 hover:bg-white/90 border-white/20",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
            formFieldInput: "bg-white/50 border-white/20 backdrop-blur-sm",
            footerActionLink: "text-primary hover:text-primary/80",
          },
          layout: {
            socialButtonsPlacement: "bottom",
          },
        }}
      />
    </div>
  );
}