import { describe, it, expect } from "bun:test";
import { stripeGet, stripePostForm } from "../src/lib/stripe";

describe("stripe http helpers", () => {
  it("stripeGet builds URL with params and headers", async () => {
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedHeaders = Object.fromEntries(new Headers(init?.headers));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as any;

    const res = await stripeGet<any>("sk_test_123", "prices", {
      active: "true",
      "expand[]": ["data.product"],
    });
    expect(res.ok).toBeTrue();
    expect(capturedUrl).toContain("https://api.stripe.com/v1/prices");
    expect(capturedUrl).toContain("active=true");
    expect(capturedUrl).toContain("expand%5B%5D=data.product");
    expect(capturedHeaders["authorization"]).toBe("Bearer sk_test_123");
    expect(capturedHeaders["stripe-version"]).toBeDefined();

    globalThis.fetch = original;
  });

  it("stripePostForm sends x-www-form-urlencoded body", async () => {
    let capturedBody = "";
    let capturedHeaders: Record<string, string> = {};
    const original = globalThis.fetch;
    globalThis.fetch = (async (_input: RequestInfo, init?: RequestInit) => {
      capturedBody = String(init?.body || "");
      capturedHeaders = Object.fromEntries(new Headers(init?.headers));
      return new Response(JSON.stringify({ id: "cs_123", url: "https://checkout.stripe.com" }), { status: 200 });
    }) as any;

    const data = await stripePostForm<any>("sk_test_123", "checkout/sessions", {
      "line_items[0][price]": "price_123",
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: "http://localhost/success",
      cancel_url: "http://localhost/cancel",
    });
    expect(data.id).toBe("cs_123");
    expect(capturedHeaders["content-type"]).toBe("application/x-www-form-urlencoded");
    expect(capturedBody).toContain("line_items%5B0%5D%5Bprice%5D=price_123");
    expect(capturedBody).toContain("mode=subscription");

    globalThis.fetch = original;
  });
});
