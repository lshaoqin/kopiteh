// app/runner/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRunnerStore } from "@/stores/runner.store";

export default function RunnerIndexPage() {
  const router = useRouter();
  const isAuthenticated = useRunnerStore((state) => state.isAuthenticated);
  const isHydrated = useRunnerStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace("/runner/login");
      return;
    }

    router.replace("/runner/venue/selectvenue");
  }, [isAuthenticated, isHydrated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Loading...
    </div>
  );
}
