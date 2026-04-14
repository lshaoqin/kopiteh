// app/runner/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RunnerIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const isRunnerAuthenticated =
      typeof window !== "undefined" &&
      window.localStorage.getItem("runner-authenticated") === "true";

    if (!isRunnerAuthenticated) {
      router.replace("/runner/auth/login");
      return;
    }

    router.replace("/runner/venue/selectvenue");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Loading...
    </div>
  );
}
