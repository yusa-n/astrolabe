// Seed Stripe with sample products and prices (Base/Plus) similar to saas-starter
// Usage: STRIPE_SECRET_KEY=sk_test_... bun run scripts/stripe-seed.ts

import { stripePostForm } from "../src/lib/stripe";

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error("STRIPE_SECRET_KEY is required");
  process.exit(1);
}

async function main() {
  console.log("Creating Stripe products and prices...");

  // Base
  const base = await stripePostForm<{ id: string }>(SECRET, "products", {
    name: "Base",
    description: "Base subscription plan",
    active: "true",
  });
  const basePrice = await stripePostForm<{ id: string }>(SECRET, "prices", {
    product: base.id,
    unit_amount: "800", // $8
    currency: "usd",
    "recurring[interval]": "month",
    "recurring[trial_period_days]": "7",
  });

  // Plus
  const plus = await stripePostForm<{ id: string }>(SECRET, "products", {
    name: "Plus",
    description: "Plus subscription plan",
    active: "true",
  });
  const plusPrice = await stripePostForm<{ id: string }>(SECRET, "prices", {
    product: plus.id,
    unit_amount: "1200", // $12
    currency: "usd",
    "recurring[interval]": "month",
    "recurring[trial_period_days]": "7",
  });

  console.log("Done. Created:");
  console.log("- Product Base:", base.id, ", Price:", basePrice.id);
  console.log("- Product Plus:", plus.id, ", Price:", plusPrice.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
