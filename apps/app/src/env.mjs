import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform((v) => (v ? `https://${v}` : undefined)),
    PORT: z.coerce.number().default(3000),
  },
  server: {
    CLERK_SECRET_KEY: z.string().optional().default(""),
    OPENPANEL_SECRET_KEY: z.string().optional().default(""),
    RESEND_API_KEY: z.string().optional().default(""),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
    UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
    API_URL: z.string().optional().default("http://localhost:8787"),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional().default(""),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional().default("/sign-in"),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional().default("/sign-up"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional().default("/"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional().default("/"),
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: z.string().optional().default(""),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID:
      process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    OPENPANEL_SECRET_KEY: process.env.OPENPANEL_SECRET_KEY,
    PORT: process.env.PORT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    API_URL: process.env.API_URL,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
