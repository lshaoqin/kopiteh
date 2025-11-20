// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function IndexPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return; // Wait for AuthBootstrap + hydration

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(`/${user.role}`); // e.g. /admin, /runner, /ordering
  }, [user, isHydrated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Loading...
    </div>
  );
}
