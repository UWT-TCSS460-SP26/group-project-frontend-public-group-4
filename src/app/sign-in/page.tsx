"use client";

import { Suspense, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const handleSignIn = useCallback(() => {
    signIn("auth2", { callbackUrl });
  }, [callbackUrl]);

  if (status === "authenticated") {
    router.replace(callbackUrl);
    return null;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Sign In
      </h1>
      <p
        className="text-center max-w-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Sign in with your TCSS IAM account to access your profile and
        personalized features.
      </p>
      <button
        onClick={handleSignIn}
        className="rounded-md bg-amber-400 px-6 py-2.5 font-medium text-black hover:bg-amber-300 transition-colors"
      >
        Sign in with TCSS IAM
      </button>
      <Link
        href="/"
        className="text-sm no-underline transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--foreground)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        Back to home
      </Link>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
