import { stripe } from "../../lib/stripe";
import { signAccessToken } from "../../lib/token";
import Redirector from "./Redirector";

export default async function SuccessPage(props: any) {
  const sp = await props.searchParams; // Next 16 safe
  const session_id = sp?.session_id as string | undefined;

  if (!session_id) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12, color: "#111" }}>
          Missing session
        </h1>
        <p style={{ color: "#222" }}>
          We didn’t receive a Stripe session ID. Please go back and try again.
        </p>
      </main>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12, color: "#111" }}>
          Payment not complete
        </h1>
        <p style={{ color: "#222" }}>
          We found your checkout session, but it hasn’t been marked as paid yet.
          If you just completed payment, refresh in a moment.
        </p>
      </main>
    );
  }

  const token = await signAccessToken({ sessionId: session.id, paid: true });
  const nextUrl = `/form?token=${encodeURIComponent(token)}`;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 20px",
        color: "#111",
      }}
    >
      <h1 style={{ fontSize: 34, lineHeight: 1.15, marginBottom: 10 }}>
        Payment confirmed
      </h1>

      <p style={{ marginBottom: 18, color: "#222" }}>
        You’re all set.
      </p>

      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px solid #d9d9d9",
          background: "#ffffff",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 10, color: "#111" }}>
          Your set-aside number is ready
        </h2>

        <p style={{ marginBottom: 10, color: "#222" }}>
          You’re about to see the percentage that defines what portion of each
          payout is reserved for taxes.
        </p>

        <p style={{ margin: 0, color: "#222" }}>
          This number removes the need to guess what’s safe to spend — and gives
          you a rule you can apply consistently.
        </p>
      </div>

      <Redirector to={nextUrl} delayMs={1500} />
    </main>
  );
}
