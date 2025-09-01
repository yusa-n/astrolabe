import { createCustomerPortalSession } from "@/actions/stripe";

export default function DashboardPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <form action={createCustomerPortalSession}>
        <button
          type="submit"
          className="bg-black text-white rounded-md py-2 px-4"
        >
          Manage Subscription
        </button>
      </form>
    </main>
  );
}
