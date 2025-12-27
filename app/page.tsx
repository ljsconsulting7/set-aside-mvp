"use client";

import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 12 }}>
        Set-Aside Calculator (MVP)
      </h1>

      <p style={{ fontSize: 18, opacity: 0.85, marginBottom: 24 }}>
        Pay once. Get instant access to the set-aside number you should reserve
        from each payout.
      </p>

      <button
        onClick={startCheckout}
        disabled={loading}
        style={{
          padding: "14px 18px",
          fontSize: 16,
          borderRadius: 10,
          border: "1px solid #333",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending you to checkout..." : "Pay $49 — Get Access"}
      </button>

      {error && (
        <p style={{ marginTop: 16, color: "crimson" }}>
          Error: {error}
        </p>
      )}

      <p style={{ marginTop: 24, fontSize: 14, opacity: 0.7 }}>
        Test mode: You’ll use Stripe test card numbers for now.
      </p>
    </main>
  );
}
