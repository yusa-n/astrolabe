import { describe, it, expect } from "bun:test";
import { verifyStripeSignature } from "../src/lib/stripe";

async function hmac(secret: string, data: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const b = new Uint8Array(sig);
  let hex = "";
  for (let i = 0; i < b.length; i++) hex += b[i].toString(16).padStart(2, "0");
  return hex;
}

describe("verifyStripeSignature", () => {
  it("valid signature passes", async () => {
    const secret = "whsec_test";
    const payload = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated" });
    const t = Math.floor(Date.now() / 1000);
    const expected = await hmac(secret, `${t}.${payload}`);
    const header = `t=${t},v1=${expected}`;
    const ok = await verifyStripeSignature(payload, header, secret);
    expect(ok).toBeTrue();
  });

  it("invalid signature fails", async () => {
    const secret = "whsec_test";
    const payload = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated" });
    const t = Math.floor(Date.now() / 1000);
    const header = `t=${t},v1=deadbeef`;
    const ok = await verifyStripeSignature(payload, header, secret);
    expect(ok).toBeFalse();
  });

  it("timestamp outside tolerance fails", async () => {
    const secret = "whsec_test";
    const payload = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated" });
    const t = Math.floor(Date.now() / 1000) - 1000; // older than default 300s
    const expected = await hmac(secret, `${t}.${payload}`);
    const header = `t=${t},v1=${expected}`;
    const ok = await verifyStripeSignature(payload, header, secret);
    expect(ok).toBeFalse();
  });
});
