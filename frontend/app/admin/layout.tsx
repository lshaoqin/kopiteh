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

  const isPublicAuthRoute = pathname.startsWith("/admin/auth");
  const isAdminRoot = pathname === "/admin";
  const isMainRoute = pathname.startsWith("/admin/main");

  if (!user) {
    if (!isPublicAuthRoute) {
      router.replace("/admin/auth/login");
    }
    return;
  }

  if (user) {
    if (isPublicAuthRoute || isAdminRoot || isMainRoute) {
      router.replace("/admin/main/home");
      return;
    }
  }
}, [user, isHydrated, pathname, router]);


  return <AuthContext>{children}</AuthContext>;
}
