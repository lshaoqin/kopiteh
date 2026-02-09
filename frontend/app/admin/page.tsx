// app/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminIndexPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore(); 

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace("/admin/auth/login");
      return;
    }

    router.replace("/admin/main/viewanalytics");
  }, [user, isHydrated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Loading...
    </div>
  );
}
