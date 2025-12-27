"use client";

import { useEffect } from "react";

export default function Redirector({
  to,
  delayMs = 1500,
}: {
  to: string;
  delayMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = to;
    }, delayMs);

    return () => clearTimeout(t);
  }, [to, delayMs]);

  return (
    <p style={{ marginTop: 18, fontSize: 13, color: "#333" }}>
      Redirecting you now…
    </p>
  );
}
