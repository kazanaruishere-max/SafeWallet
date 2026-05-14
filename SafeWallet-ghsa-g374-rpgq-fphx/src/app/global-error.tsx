"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
          <h2>Terjadi Kesalahan Tidak Terduga</h2>
          <p>Tim SafeWallet telah mencatat kesalahan ini dan akan segera memperbaikinya.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              backgroundColor: "#F2A971",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
