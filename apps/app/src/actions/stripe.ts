"use server";

import { env } from "@/env.mjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createCheckoutSession(formData: FormData) {
  const priceId = String(formData.get("priceId") || "");
  if (!priceId) {
    throw new Error("priceId is required");
  }
  const { getToken } = auth();
  const token = await getToken();
  const res = await fetch(`${env.API_URL}/api/stripe/checkout/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ priceId }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to create checkout session");
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("No checkout URL returned");
  redirect(data.url);
}

export async function createCustomerPortalSession() {
  const { getToken } = auth();
  const token = await getToken();
  const res = await fetch(`${env.API_URL}/api/stripe/billing-portal/sessions`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to create portal session");
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("No portal URL returned");
  redirect(data.url);
}
