import { env } from "@/env.mjs";
import { createCheckoutSession } from "@/actions/stripe";

type Product = { id: string; name: string; description?: string | null; defaultPriceId?: string | null };
type Price = { id: string; productId: string; unitAmount: number; currency: string; interval?: string; trialPeriodDays?: number };

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${env.API_URL}/api/stripe/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getPrices(): Promise<Price[]> {
  const res = await fetch(`${env.API_URL}/api/stripe/prices`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export const revalidate = 3600;

export default async function PricingPage() {
  const [products, prices] = await Promise.all([getProducts(), getPrices()]);
  const basePlan = products.find((p) => p.name === "Base");
  const plusPlan = products.find((p) => p.name === "Plus");
  const basePrice = prices.find((pr) => pr.productId === basePlan?.id);
  const plusPrice = prices.find((pr) => pr.productId === plusPlan?.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
      <PricingCard
        name={basePlan?.name || "Base"}
        price={basePrice?.unitAmount || 800}
        interval={basePrice?.interval || "month"}
        trialDays={basePrice?.trialPeriodDays || 7}
        features={["Unlimited Usage", "Unlimited Workspace Members", "Email Support"]}
        priceId={basePrice?.id}
      />
      <PricingCard
        name={plusPlan?.name || "Plus"}
        price={plusPrice?.unitAmount || 1200}
        interval={plusPrice?.interval || "month"}
        trialDays={plusPrice?.trialPeriodDays || 7}
        features={["Everything in Base, and:", "Early Access to New Features", "24/7 Support + Slack Access"]}
        priceId={plusPrice?.id}
      />
    </main>
  );
}

function PricingCard({ name, price, interval, trialDays, features, priceId }: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">with {trialDays} day free trial</p>
      <p className="text-4xl font-medium mb-6">
        ${price / 100} <span className="text-base font-normal text-gray-600">/ {interval}</span>
      </p>
      <ul className="mb-6 space-y-2">
        {features.map((f) => (
          <li key={f} className="text-sm text-gray-700">• {f}</li>
        ))}
      </ul>
      <form action={createCheckoutSession}>
        <input type="hidden" name="priceId" value={priceId || ""} />
        <button
          type="submit"
          disabled={!priceId}
          className="w-full bg-black text-white rounded-md py-2 disabled:opacity-50"
        >
          {priceId ? "Subscribe" : "Unavailable"}
        </button>
      </form>
    </div>
  );
}

