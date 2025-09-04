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
    "/[locale]/sign-in(.*)",
    "/[locale]/sign-up(.*)",
    "/en/sign-in(.*)",
    "/en/sign-up(.*)",
    "/fr/sign-in(.*)",
    "/fr/sign-up(.*)",
  ];
  const isPublicRoute = publicRoutes.some((route) => {
    const regex = new RegExp(`^${route.replace(/\[locale\]/, "(en|fr)").replace(/\(.*\)/, ".*")}$`);
    return regex.test(req.nextUrl.pathname);
  });

  // Handle users who aren't authenticated on protected routes
  if (!auth().userId && !isPublicRoute) {
    // Extract locale from pathname
    const pathParts = req.nextUrl.pathname.split('/');
    const locale = ['en', 'fr'].includes(pathParts[1]) ? pathParts[1] : 'en';
    
    const signInUrl = new URL(`/${locale}/sign-in`, req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
