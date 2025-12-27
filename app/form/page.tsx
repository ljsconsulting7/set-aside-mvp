import Link from "next/link";
import { verifyAccessToken } from "../../lib/token";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default async function FormPage(props: any) {
  const sp = await props.searchParams; // ✅ Next 16 safe
  const token = sp?.token as string | undefined;

  if (!token) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Access required</h1>
        <p>You need a valid access token to use the calculator.</p>
        <p style={{ marginTop: 16 }}>
          <Link href="/" style={{ textDecoration: "underline" }}>
            Go back to checkout
          </Link>
        </p>
      </main>
    );
  }

  try {
    await verifyAccessToken(token);
  } catch {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Invalid/expired link</h1>
        <p>Your access link is invalid or expired. Please purchase again.</p>
        <p style={{ marginTop: 16 }}>
          <Link href="/" style={{ textDecoration: "underline" }}>
            Go back to checkout
          </Link>
        </p>
      </main>
    );
  }

  // Ugly MVP: ONE terrifying question -> ONE number
  // Terrifying question: "How much of every payout must I set aside so taxes don't wreck me?"
  // Inputs (simple + fast): monthly income, state (rough), risk buffer
  const monthlyIncome = Number(sp?.monthlyIncome || "");
  const state = (sp?.state || "").toString();
  const bufferPct = Number(sp?.bufferPct || "10");

  const hasInputs =
    Number.isFinite(monthlyIncome) && monthlyIncome > 0 && state.length > 0;

  // Heuristic set-aside estimate (defensible enough for MVP; we will refine later)
  // Base effective tax rate depends on state bucket + self-employment overhead.
  const stateBucketRates: Record<string, number> = {
    "no-state-tax": 0.24, // e.g., FL, TX, TN etc (rough)
    "low": 0.27,
    "medium": 0.30,
    "high": 0.33, // e.g., CA, NY, NJ etc (rough)
  };

  const baseRate = stateBucketRates[state] ?? 0.30;
  const bufferRate = clamp((bufferPct || 0) / 100, 0, 0.25);

  const setAsideRate = clamp(baseRate + bufferRate, 0.15, 0.60);
  const monthlySetAside = hasInputs ? monthlyIncome * setAsideRate : 0;
  const per1k = hasInputs ? setAsideRate * 1000 : 0;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 34, lineHeight: 1.15, marginBottom: 10 }}>
        Set-Aside Calculator (Ugly MVP)
      </h1>

      <p style={{ opacity: 0.85, marginBottom: 24 }}>
        Answer three questions. Get one number: how much to set aside from every
        payout so taxes don’t ambush you.
      </p>

      <form
        method="GET"
        action="/form"
        style={{
          padding: 16,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        {/* keep token on submit */}
        <input type="hidden" name="token" value={token} />

        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Your average monthly 1099 income (before taxes)
        </label>
        <input
          name="monthlyIncome"
          inputMode="decimal"
          placeholder="Example: 8000"
          defaultValue={sp?.monthlyIncome ?? ""}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            marginBottom: 18,
          }}
        />

        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Your state tax vibe (rough)
        </label>
        <select
          name="state"
          defaultValue={state || ""}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            marginBottom: 18,
          }}
        >
          <option value="" disabled>
            Choose one
          </option>
          <option value="no-state-tax">No state income tax</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Safety buffer (extra % you want on top)
        </label>
        <input
          name="bufferPct"
          inputMode="numeric"
          placeholder="Example: 10"
          defaultValue={sp?.bufferPct ?? "10"}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            marginBottom: 18,
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #333",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Get my set-aside number
        </button>
      </form>

      {!hasInputs ? (
        <p style={{ opacity: 0.75 }}>
          Fill the fields above and submit to see your number.
        </p>
      ) : (
        <section
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #e5e5e5",
          }}
        >
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Your set-aside number</h2>

          <p style={{ fontSize: 18, marginBottom: 10 }}>
            Set aside <strong>{Math.round(setAsideRate * 100)}%</strong> of every
            payout.
          </p>

          <ul style={{ lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
            <li>
              That’s <strong>${monthlySetAside.toFixed(0)}</strong> per month (based
              on your monthly income estimate).
            </li>
            <li>
              For every <strong>$1,000</strong> you get paid, set aside{" "}
              <strong>${per1k.toFixed(0)}</strong>.
            </li>
          </ul>

          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
            MVP disclaimer: this is a fast heuristic for planning, not tax advice.
            Next iteration will add filing status, deductions, quarterly estimates,
            and state-specific rates.
          </p>
        </section>
      )}
    </main>
  );
}
