"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem"
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#64748b", maxWidth: "28rem" }}>A critical error occurred. Please try again.</p>
        <button
          onClick={() => reset()}
          style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
