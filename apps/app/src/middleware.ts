import { clerkMiddleware } from "@clerk/nextjs/server";
import { createI18nMiddleware } from "next-international/middleware";
import { NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

export default clerkMiddleware((auth, req) => {
  // Apply I18n middleware first
  const i18nResponse = I18nMiddleware(req);
  if (i18nResponse) {
    return i18nResponse;
  }

  // Check if the route is public
  const publicRoutes = [
    "/",
    "/api/webhooks(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ];
  const isPublicRoute = publicRoutes.some((route) => {
    const regex = new RegExp(`^${route.replace(/\(.*\)/, ".*")}$`);
    return regex.test(req.nextUrl.pathname);
  });

  // Handle users who aren't authenticated on protected routes
  if (!auth().userId && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
