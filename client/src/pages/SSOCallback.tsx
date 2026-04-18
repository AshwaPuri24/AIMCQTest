import { useEffect, useState } from "react";

export default function SSOCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get("ticket");

    if (!ticket) {
      setError("No SSO ticket found in URL. Please log in again via GradPlacifyr.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/sso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "SSO verification failed.");
        }

        // Hard-navigate to the root so every piece of client state
        // (React Query cache, auth hook, Router) is re-initialised
        // from the freshly-issued session cookie. Using setLocation
        // here raced with useAuth's refetch and caused the
        // GradPlacifyrRedirect catch-all to fire before the
        // authenticated render landed (Bug 1).
        window.location.replace("/");
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during sign-in.");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-destructive text-lg font-semibold">Sign-in Failed</p>
        <p className="text-muted-foreground max-w-md text-sm">{error}</p>
        <a
          href={import.meta.env.VITE_GRADPLACIFYR_LOGIN_URL}
          className="text-primary underline text-sm"
        >
          Return to GradPlacifyr to try again
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground text-sm">Verifying your session…</p>
    </div>
  );
}
