// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { AuthContext } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    const isAuthRoute = pathname.startsWith("/admin/auth");
    const isAdminRoot = pathname === "/admin" || pathname === "/admin/";
    const isMainRoot = pathname === "/admin/main" || pathname === "/admin/main/";

    if (!user) {
      if (!isAuthRoute) {
        router.replace("/admin/auth/login");
      }
      return;
    }

    if (isAuthRoute || isAdminRoot || isMainRoot) {
      router.replace("/admin/main/home");
      return;
    }

  }, [user, isHydrated, pathname, router]);

  return <AuthContext>{children}</AuthContext>;
}
