import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { clerkMiddleware } from "@hono/clerk-auth";
import { getTeamByStripeCustomerId, getTeamForUserId, updateTeamSubscription } from "./db/queries";
import { retrieveCheckoutSession, retrieveSubscription, verifyStripeSignature, stripePostForm, stripeGet } from "./lib/stripe";
import { getDb, schema } from './db';
import { eq } from 'drizzle-orm';

type Env = {
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  APP_BASE_URL?: string;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.vercel.app"],
    credentials: true,
  }),
);
app.use("*", clerkMiddleware());

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Example protected route
app.get("/api/user", (c) => {
  const auth = c.get("clerkAuth");
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({
    userId: auth.userId,
    sessionId: auth.sessionId,
  });
});

// Posts routes
app.get("/api/posts", async (c) => {
  // TODO: Implement database fetch
  return c.json([
    { id: 1, title: "First Post", content: "Hello World" },
    { id: 2, title: "Second Post", content: "Hono.js with Cloudflare" },
  ]);
});

app.post("/api/posts", async (c) => {
  const auth = c.get("clerkAuth");
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  // TODO: Implement database insert
  return c.json({ id: 3, ...body, userId: auth.userId });
});

export default app;

// Stripe Webhook (skeleton)
// Note: Implemented with HMAC-SHA256 verification using STRIPE_WEBHOOK_SECRET.
app.post("/api/webhooks/stripe", async (c) => {
  const payload = await c.req.text();
  const sig = c.req.header("stripe-signature");

  // Verify signature
  const ok = await verifyStripeSignature(payload, sig || null, c.env.STRIPE_WEBHOOK_SECRET);
  if (!ok) {
    return c.json({ error: "Webhook signature verification failed." }, 400);
  }

  try {
    const event = JSON.parse(payload) as { type?: string; data?: any };
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data?.object as {
          id: string;
          status: string;
          customer: string;
          items?: { data?: Array<{ price?: { product?: string | { id: string; name?: string } }; plan?: { product?: string; name?: string } }> };
        };
        if (!subscription || !subscription.customer) {
          return c.json({ error: "Invalid subscription payload" }, 400);
        }
        const team = await getTeamByStripeCustomerId(c.env.DB, subscription.customer);
        if (!team) {
          // No-op if team not found; webhook may arrive before checkout completion
          return c.json({ received: true, note: "team not found" });
        }
        const item = subscription.items?.data?.[0];
        const plan = item?.plan;
        const price = item?.price as { product?: string | { id: string; name?: string } } | undefined;
        const productId = typeof price?.product === 'string' ? price?.product : (price?.product as any)?.id ?? (plan?.product as string | undefined);
        const productName = typeof price?.product === 'object' ? (price?.product as any)?.name : (plan?.name as string | undefined);
        await updateTeamSubscription(c.env.DB, team.id, {
          stripeSubscriptionId: event.type === "customer.subscription.deleted" ? null : subscription.id,
          stripeProductId: productId ?? null,
          planName: productName ?? null,
          subscriptionStatus: subscription.status,
        });
        break;
      }
      default:
        // Unhandled types are fine
        break;
    }
    return c.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error", err);
    return c.json({ error: "Webhook handling failed" }, 400);
  }
});

// Stripe Checkout success handler (Stripe REST fetch in Workers)
app.get("/api/stripe/checkout", async (c) => {
  const sessionId = c.req.query("session_id");
  if (!sessionId) {
    return c.redirect("/pricing");
  }
  try {
    const session = await retrieveCheckoutSession(c.env.STRIPE_SECRET_KEY, sessionId);
    const customerId =
      session.customer && typeof session.customer === 'object'
        ? session.customer.id
        : (session.customer as string | undefined);
    if (!customerId) {
      return c.redirect('/pricing');
    }

    const subscriptionId =
      session.subscription && typeof session.subscription === 'object'
        ? session.subscription.id
        : (session.subscription as string | undefined);
    if (!subscriptionId) {
      return c.redirect('/pricing');
    }

    const sub = await retrieveSubscription(c.env.STRIPE_SECRET_KEY, subscriptionId);
    const item = sub.items?.data?.[0];
    const price = item?.price;
    const productId = typeof price?.product === 'string' ? price?.product : (price?.product as any)?.id;
    const productName = typeof price?.product === 'object' ? (price?.product as any)?.name : undefined;

    // Map back to the user's team via client_reference_id (should be user id)
    const userId = session.client_reference_id || undefined;
    if (!userId) {
      return c.redirect('/pricing');
    }

    const team = await getTeamForUserId(c.env.DB, userId);
    if (!team) {
      // No team found for user -> redirect gracefully
      return c.redirect('/dashboard');
    }

    await updateTeamSubscription(c.env.DB, team.id, {
      stripeSubscriptionId: sub.id,
      stripeProductId: productId ?? null,
      planName: productName ?? null,
      subscriptionStatus: sub.status,
    });

    // Also persist stripeCustomerId on team if not set
    // Note: D1 update convenience via raw SQL since we don't have a dedicated query for this small case.
    await c.env.DB.prepare(
      'update teams set stripe_customer_id = ?, updated_at = ? where id = ? and (stripe_customer_id is null or stripe_customer_id = "")',
    )
      .bind(customerId, Math.floor(Date.now() / 1000), team.id)
      .run();

    return c.redirect('/dashboard');
  } catch (e) {
    console.error('Stripe checkout finalize error', e);
    return c.redirect('/error');
  }
});

// Create Stripe Checkout Session (authenticated)
app.post('/api/stripe/checkout/sessions', async (c) => {
  const auth = c.get('clerkAuth');
  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

  // Accept either JSON or form body with priceId
  let priceId: string | undefined;
  const ct = c.req.header('content-type') || '';
  if (ct.includes('application/json')) {
    const b = await c.req.json().catch(() => ({}));
    priceId = b?.priceId;
  } else {
    const b = await c.req.parseBody();
    priceId = (b?.priceId as string) || undefined;
  }
  if (!priceId) return c.json({ error: 'priceId is required' }, 400);

  // Map Clerk user to local user id (users.id), and team
  const db = getDb(c.env.DB);
  const user = await db.select().from(schema.users).where(eq(schema.users.clerkId, auth.userId)).limit(1);
  if (user.length === 0) return c.json({ error: 'User not found' }, 404);
  const localUserId = user[0].id;
  const team = await getTeamForUserId(c.env.DB, localUserId);

  const reqOrigin = new URL(c.req.url).origin;
  const appBase = c.env.APP_BASE_URL || c.req.header('origin') || reqOrigin;
  const successUrl = `${appBase}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appBase}/pricing`;

  const form: Record<string, string | string[]> = {
    'payment_method_types[]': 'card',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: localUserId,
    allow_promotion_codes: 'true',
    'subscription_data[trial_period_days]': '14',
  };
  if (team?.stripeCustomerId) form['customer'] = team.stripeCustomerId;

  try {
    const session = await stripePostForm<{ url: string }>(c.env.STRIPE_SECRET_KEY, 'checkout/sessions', form);
    return c.json({ url: session.url });
  } catch (e) {
    console.error('Create checkout session error', e);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// Create Stripe Billing Portal Session
app.post('/api/stripe/billing-portal/sessions', async (c) => {
  const auth = c.get('clerkAuth');
  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);
  const db = getDb(c.env.DB);
  const user = await db.select().from(schema.users).where(eq(schema.users.clerkId, auth.userId)).limit(1);
  if (user.length === 0) return c.json({ error: 'User not found' }, 404);
  const team = await getTeamForUserId(c.env.DB, user[0].id);
  if (!team?.stripeCustomerId) return c.json({ error: 'No Stripe customer for team' }, 400);

  const appBase = c.env.APP_BASE_URL || c.req.header('origin') || new URL(c.req.url).origin;
  const returnUrl = `${appBase}/dashboard`;
  try {
    const session = await stripePostForm<{ url: string }>(
      c.env.STRIPE_SECRET_KEY,
      'billing_portal/sessions',
      {
        customer: team.stripeCustomerId,
        return_url: returnUrl,
      },
    );
    return c.json({ url: session.url });
  } catch (e) {
    console.error('Create billing portal session error', e);
    return c.json({ error: 'Failed to create portal session' }, 500);
  }
});

// Stripe products (active)
app.get('/api/stripe/products', async (c) => {
  try {
    const data = await stripeGet<any>(c.env.STRIPE_SECRET_KEY, 'products', {
      active: 'true',
      'expand[]': ['data.default_price'],
      limit: '100',
    });
    const products = (data.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      defaultPriceId: typeof p.default_price === 'string' ? p.default_price : p.default_price?.id,
    }));
    return c.json(products);
  } catch (e) {
    console.error('List products error', e);
    return c.json({ error: 'Failed to list products' }, 500);
  }
});

// Stripe prices (active, recurring)
app.get('/api/stripe/prices', async (c) => {
  try {
    const data = await stripeGet<any>(c.env.STRIPE_SECRET_KEY, 'prices', {
      active: 'true',
      type: 'recurring',
      'expand[]': ['data.product'],
      limit: '100',
    });
    const prices = (data.data || []).map((price: any) => ({
      id: price.id,
      productId: typeof price.product === 'string' ? price.product : price.product.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      trialPeriodDays: price.recurring?.trial_period_days,
    }));
    return c.json(prices);
  } catch (e) {
    console.error('List prices error', e);
    return c.json({ error: 'Failed to list prices' }, 500);
  }
});
